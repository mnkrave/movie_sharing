import { NextResponse } from "next/server";
import { normalizeProviderKey, resolveItemGenres, POPULAR_SUBSCRIPTIONS } from "@/lib/tmdb";

const TMDB_API_KEY = process.env.TMDB_API_KEY || "92dc1c6b15658b43e4c7a71b45addf36";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

// Cascade: Try gemini-3.8-flash first as requested, with automatic instant fallback across modern Flash pools
const GEMINI_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3-flash-preview",
  "gemini-flash-lite-latest",
];

export interface AiPersonReason {
  personName: string;
  reason: string;
}

export interface AiRecommendedPick {
  id: number;
  mediaType: "movie" | "tv";
  title: string;
  originalTitle?: string;
  releaseYear: string;
  posterPath: string | null;
  backdropPath: string | null;
  voteAverage: number;
  runtimeMinutes?: number;
  genres: { id: number; name: string; emoji: string }[];
  genreIds: number[];
  matchScore: number;
  groupPitch: string;
  perPersonReasons: AiPersonReason[];
  availableProvidersDE: {
    providerId: number;
    providerName: string;
    logoPath: string;
    isMySub: boolean;
  }[];
}

export interface AiParsedIntent {
  detectedGroupName: string | null;
  detectedParticipants: string[];
  mood: string;
  maxRuntimeMinutes: number | null;
  mediaType: "movie" | "tv" | "ALL";
  excludedElements: string[];
}

function normalizeTitle(t: string): string {
  return (t || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

async function callGeminiWithFallback(systemAndUserPrompt: string): Promise<{
  data: any;
  usedModel: string;
}> {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY fehlt in den Umgebungsvariablen (bitte in .env bzw. Vercel als GEMINI_API_KEY hinterlegen)."
    );
  }
  let lastError = "";

  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: systemAndUserPrompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json",
          },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        const parsed = JSON.parse(rawText);
        return { data: parsed, usedModel: model };
      } else {
        const errJson = await res.json().catch(() => null);
        const errMsg = errJson?.error?.message || `HTTP ${res.status}`;
        lastError = `${model}: ${errMsg}`;
        // If 503 (temporary high demand spike), give a tiny 300ms pause before trying next capacity pool
        if (res.status === 503) {
          await new Promise((r) => setTimeout(r, 300));
        }
      }
    } catch (err: any) {
      lastError = `${model}: ${err?.message || "Error"}`;
    }
  }

  if (lastError.includes("503") || lastError.includes("high demand") || lastError.includes("overloaded")) {
    throw new Error(
      "Die Google Gemini Server erleben aktuell eine kurzzeitige Lastspitze (503 Service Unavailable). Bitte versuche es in wenigen Sekunden erneut."
    );
  }

  throw new Error(`Alle Gemini-Modelle nicht erreichbar (${lastError})`);
}

async function lookupTmdbAndEnrich(
  pick: {
    title: string;
    originalTitle?: string;
    releaseYear?: string;
    mediaType?: "movie" | "tv";
    estimatedRuntime?: number;
    matchScore?: number;
    groupPitch?: string;
    perPersonReasons?: AiPersonReason[];
  },
  combinedSubscriptions: string[],
  maxRuntimeMinutes: number | null
): Promise<AiRecommendedPick | null> {
  const searchType: "movie" | "tv" = pick.mediaType === "tv" ? "tv" : "movie";
  const queries = [pick.title, pick.originalTitle].filter(Boolean) as string[];

  let foundRaw: any = null;
  for (const q of queries) {
    try {
      const searchUrl = `${TMDB_BASE_URL}/search/${searchType}?api_key=${TMDB_API_KEY}&language=de-DE&query=${encodeURIComponent(
        q
      )}`;
      const res = await fetch(searchUrl, { next: { revalidate: 86400 } });
      if (res.ok) {
        const sData = await res.json();
        const results: any[] = sData.results || [];
        if (results.length > 0) {
          if (pick.releaseYear) {
            const yearMatch = results.find((r) =>
              (r.release_date || r.first_air_date || "").startsWith(String(pick.releaseYear))
            );
            foundRaw = yearMatch || results[0];
          } else {
            foundRaw = results[0];
          }
          break;
        }
      }
    } catch {
      // continue
    }
  }

  if (!foundRaw) return null;

  // Fetch exact details + DE watch providers
  try {
    const detailUrl = `${TMDB_BASE_URL}/${searchType}/${foundRaw.id}?api_key=${TMDB_API_KEY}&language=de-DE&append_to_response=watch/providers`;
    const dRes = await fetch(detailUrl, { next: { revalidate: 43200 } });
    const detailData = dRes.ok ? await dRes.json() : foundRaw;

    const runtime =
      searchType === "movie"
        ? detailData.runtime || pick.estimatedRuntime || 110
        : detailData.episode_run_time?.[0] || pick.estimatedRuntime || 45;

    // If user strictly requested maxRuntimeMinutes on a movie, allow small tolerance (+8 min)
    if (
      maxRuntimeMinutes &&
      searchType === "movie" &&
      runtime > maxRuntimeMinutes + 10
    ) {
      // Keep it if needed, or note runtime
    }

    const deProvidersRaw = detailData["watch/providers"]?.results?.DE;
    const flatrateAndFree = [
      ...(deProvidersRaw?.flatrate || []),
      ...(deProvidersRaw?.free || []),
    ];

    const seenNames = new Set<string>();
    const availableProvidersDE = flatrateAndFree
      .map((p: any) => {
        const norm = normalizeProviderKey(p.provider_name);
        return {
          providerId: p.provider_id,
          providerName: norm.displayName || p.provider_name,
          logoPath: p.logo_path,
          isMySub: combinedSubscriptions.includes(norm.key),
        };
      })
      .filter((p: any) => {
        if (seenNames.has(p.providerName)) return false;
        seenNames.add(p.providerName);
        return true;
      });

    const genreIds: number[] =
      (detailData.genres || []).map((g: any) => g.id) || foundRaw.genre_ids || [];
    const dateStr = detailData.release_date || detailData.first_air_date || "";

    return {
      id: detailData.id,
      mediaType: searchType,
      title: detailData.title || detailData.name || pick.title,
      originalTitle: detailData.original_title || detailData.original_name,
      releaseYear: dateStr ? dateStr.slice(0, 4) : String(pick.releaseYear || ""),
      posterPath: detailData.poster_path || foundRaw.poster_path || null,
      backdropPath: detailData.backdrop_path || foundRaw.backdrop_path || null,
      voteAverage: detailData.vote_average
        ? Math.round(detailData.vote_average * 10) / 10
        : 7.5,
      runtimeMinutes: runtime,
      genreIds,
      genres: resolveItemGenres(searchType, genreIds, detailData.genres),
      matchScore: Math.min(99, Math.max(75, pick.matchScore || 94)),
      groupPitch: pick.groupPitch || "Perfekter Treffer für euren Filmabend!",
      perPersonReasons: Array.isArray(pick.perPersonReasons) ? pick.perPersonReasons : [],
      availableProvidersDE,
    };
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userPrompt: string = (body.prompt || "").trim();
    const currentUserName: string = (body.currentUserName || "Lukas").trim();
    const currentUserId: string = (body.currentUserId || "").trim();
    const explicitParticipants: string[] = body.explicitParticipants || [];
    const friendGroups: { id: string; name: string; emoji: string; memberNames: string[] }[] =
      body.friendGroups || [];
    const allMediaStatuses: any[] = body.mediaStatuses || [];
    const allFriends: any[] = body.friends || [];
    const mySubscriptions: string[] = body.userSubscriptions || [];
    const callerWatchedTmdbIds: number[] = body.userWatchedTmdbIds || [];
    const callerWatchedTitles: string[] = body.userWatchedTitles || [];

    if (!userPrompt) {
      return NextResponse.json({ error: "Bitte gib eine Anfrage ein." }, { status: 400 });
    }

    // 1. Pre-detect mentioned groups or friends in natural language or /match syntax
    const lowerPrompt = userPrompt.toLowerCase();
    let detectedGroupName: string | null = null;
    const participantSet = new Set<string>([currentUserName, ...explicitParticipants]);

    for (const grp of friendGroups) {
      const grpClean = grp.name.toLowerCase();
      const grpSpaced = grpClean.replace(/[-_]/g, " ");
      if (lowerPrompt.includes(grpClean) || lowerPrompt.includes(grpSpaced)) {
        detectedGroupName = `${grp.emoji} ${grp.name}`;
        grp.memberNames.forEach((m) => participantSet.add(m));
      }
    }

    for (const f of allFriends) {
      if (f.name && lowerPrompt.includes(f.name.toLowerCase())) {
        participantSet.add(f.name);
      }
    }

    const participants = Array.from(participantSet);

    // 2. Build per-participant taste profiles & collect already-watched titles with robust matching
    const allWatchedTitlesList = new Set<string>(callerWatchedTitles);
    const watchedNormalizedTitles = new Set<string>(
      callerWatchedTitles.map(normalizeTitle).filter(Boolean)
    );
    const watchedTmdbIds = new Set<string>(callerWatchedTmdbIds.map(String));

    const watchlistCounts = new Map<string, string[]>(); // title -> who has it on watchlist
    const combinedSubsSet = new Set<string>(mySubscriptions);

    // Helper to check if a status entry belongs to the current user or one of the active participants
    const isStatusForParticipant = (m: any, pName?: string) => {
      const mUserId = (m.userId || "").toLowerCase().trim();
      const mUserName = (m.userName || "").toLowerCase().trim();

      if (pName) {
        const pClean = pName.toLowerCase().trim();
        if (mUserName === pClean) return true;
        if (mUserName && (mUserName.startsWith(pClean) || pClean.startsWith(mUserName))) return true;
        if (mUserId && (mUserId === pClean || pClean.includes(mUserId))) return true;
        return false;
      }

      // Check current user
      if (currentUserId && mUserId === currentUserId.toLowerCase()) return true;
      const myUserClean = currentUserName.toLowerCase();
      if (myUserClean && (mUserName === myUserClean || mUserName.startsWith(myUserClean) || myUserClean.startsWith(mUserName))) {
        return true;
      }

      // Check against any participant
      for (const p of participants) {
        const pClean = p.toLowerCase().trim();
        if (mUserName === pClean || mUserName.startsWith(pClean) || pClean.startsWith(mUserName)) {
          return true;
        }
        if (mUserId && mUserId === pClean) return true;
      }
      return false;
    };

    // Index all watched movies for participants & current user into blacklist sets
    allMediaStatuses.forEach((m) => {
      if (m.status === "WATCHED" && isStatusForParticipant(m)) {
        if (m.title) {
          allWatchedTitlesList.add(m.title);
          const norm = normalizeTitle(m.title);
          if (norm) watchedNormalizedTitles.add(norm);
        }
        if (m.tmdbId) {
          watchedTmdbIds.add(String(m.tmdbId));
          if (m.mediaType) {
            watchedTmdbIds.add(`${m.mediaType}_${m.tmdbId}`);
          }
        }
      }
    });

    // Detect if user prompt targets a specific genre or format
    const isSitcomOrComedy = /(sitcom|comedy|komödie|lustig|humor|witzig|lachen|gute laune|feel good|albern)/i.test(userPrompt);
    const isSeriesRequest = /(serie|serien|staffel|folgen|sitcom|episodes)/i.test(userPrompt);
    const isHorror = /(horror|grusel|schock|spuk|angst|creepy|slasher|zombie)/i.test(userPrompt);
    const isSciFi = /(sci-fi|science fiction|weltall|zukunft|cyberpunk|dystopie|raumschiff|aliens)/i.test(userPrompt);
    const isAction = /(action|ballern|adrenalin|kampfsport|explosion|stunt|superheld)/i.test(userPrompt);
    const isThriller = /(thriller|krimi|spannung|mindfuck|twist|mord|detektiv|psycho|rätsel)/i.test(userPrompt);
    const isAnimeAnimation = /(anime|animation|trickfilm|zeichentrick|pixar|ghibli|disney)/i.test(userPrompt);

    const detectedGenreFocus = isSitcomOrComedy
      ? "Sitcom & Komödie"
      : isHorror
      ? "Horror & Grusel"
      : isSciFi
      ? "Sci-Fi & Weltall"
      : isAction
      ? "Action & Adrenalin"
      : isThriller
      ? "Thriller & Spannung"
      : isAnimeAnimation
      ? "Anime & Animation"
      : null;

    const participantProfilesText = participants
      .map((pName) => {
        const friendObj = allFriends.find(
          (f) =>
            f.name?.toLowerCase() === pName.toLowerCase() ||
            pName.toLowerCase().startsWith(f.name?.toLowerCase() || "___")
        );
        if (friendObj?.subscriptions) {
          friendObj.subscriptions.forEach((s: string) => combinedSubsSet.add(s));
        }

        const pStatuses = allMediaStatuses.filter((m) => isStatusForParticipant(m, pName));
        const watched = pStatuses.filter((m) => m.status === "WATCHED");

        // Separate TV Series and Movies
        const watchedTv = watched.filter((w) => w.mediaType === "tv");
        const watchedMovies = watched.filter((w) => w.mediaType === "movie");

        const lovedTv = watchedTv
          .filter((w) => (w.rating || 8) >= 8)
          .slice(0, 12)
          .map((w) => `${w.title} (${w.rating || 8}/10★)`);

        const lovedMovies = watchedMovies
          .filter((w) => (w.rating || 8) >= 8)
          .slice(0, 15)
          .map((w) => `${w.title} (${w.rating || 8}/10★)`);

        const disliked = watched
          .filter((w) => typeof w.rating === "number" && w.rating <= 5)
          .map((w) => `${w.title} (${w.rating}/10★)`);

        const watchlist = pStatuses
          .filter((m) => m.status === "WATCHLIST")
          .map((w) => {
            const list = watchlistCounts.get(w.title) || [];
            if (!list.includes(pName)) list.push(pName);
            watchlistCounts.set(w.title, list);
            return w.title;
          });

        let profileLines = [`- Person "${pName}":`];
        if (isSeriesRequest || isSitcomOrComedy) {
          profileLines.push(
            `  • Lieblings-Serien & TV-Shows (8-10★): ${
              lovedTv.length > 0 ? lovedTv.join(", ") : "Noch keine Serien bewertet"
            }`
          );
          profileLines.push(
            `  • Lieblings-Filme (8-10★): ${
              lovedMovies.length > 0 ? lovedMovies.slice(0, 8).join(", ") : "Keine"
            }`
          );
        } else {
          profileLines.push(
            `  • Lieblingsfilme (8-10★): ${
              lovedMovies.length > 0 ? lovedMovies.join(", ") : "Mag packende Filme"
            }`
          );
          if (lovedTv.length > 0) {
            profileLines.push(`  • Lieblings-Serien (8-10★): ${lovedTv.slice(0, 6).join(", ")}`);
          }
        }

        profileLines.push(
          `  • Abneigungen/No-Gos (<=5★): ${disliked.length > 0 ? disliked.join(", ") : "Keine"}`
        );
        profileLines.push(
          `  • Auf der Watchlist: ${watchlist.length > 0 ? watchlist.slice(0, 8).join(", ") : "Keine"}`
        );

        return profileLines.join("\n");
      })
      .join("\n\n");

    // Shared watchlist overlaps
    const sharedWatchlist = Array.from(watchlistCounts.entries())
      .filter(([, names]) => names.length >= 2)
      .map(([title, names]) => `${title} (auf Watchlist von ${names.join(" & ")})`);

    const readableSubs = Array.from(combinedSubsSet)
      .map((key) => POPULAR_SUBSCRIPTIONS.find((s) => s.key === key)?.label || key)
      .join(", ");

    const watchedForbiddenList = Array.from(allWatchedTitlesList).slice(0, 250);

    // 3. Construct prompt for Gemini
    const fullPrompt = `Du bist "CineBot", der hochintelligente KI-Filmberater von CineCircle.
Analysiere den Wunsch des Nutzers und finde die 8 bis 10 besten Vorschläge (Filme oder Serien), damit nach strengem Ausschluss bereits gesehener Titel mindestens 6 absolut neue Treffer übrig bleiben!

NUTZER-EINGABE:
"${userPrompt}"
${detectedGenreFocus ? `\nERKANNTES SPEZIFISCHES THEMA / GENRE: ${detectedGenreFocus}` : ""}

ERKANNTE TEILNEHMER HEUTE ABEND (${participants.length}):
${participants.join(", ")}${detectedGroupName ? ` (Gruppe: ${detectedGroupName})` : ""}

GESCHMACKS-PROFILE DER TEILNEHMER:
${participantProfilesText}

GEMEINSAME WATCHLIST-TREFFER:
${sharedWatchlist.length > 0 ? sharedWatchlist.join(", ") : "Keine direkten Überschneidungen"}

VERFÜGBARE STREAMING-ABOS IN DEUTSCHLAND:
${readableSubs || "Netflix, Amazon Prime Video, Disney+"}

STRENGSTENS VERBOTEN - BEREITS GESEHENE TITEL (${allWatchedTitlesList.size} Titel):
Folgende Filme/Serien haben der Nutzer oder die Teilnehmer BEREITS GESEHEN. Du darfst KEINEN EINZIGEN dieser Titel empfehlen (auch keine direkten Prequels/Sequels falls bereits gesehen):
${watchedForbiddenList.length > 0 ? watchedForbiddenList.join(", ") : "Keine registriert"}

WICHTIGE REGELN & GENRE-FOKUS:
1. ABSOLUTE AUSSCHLUSS-REGEL: Schlage NIEMALS einen Film oder eine Serie vor, der in der Liste "STRENGSTENS VERBOTEN - BEREITS GESEHENE TITEL" steht!
2. GENRE-SPEZIFISCHE AUSWERTUNG: Falls der Nutzer nach einem bestimmten Genre oder Format fragt (z. B. Sitcom, Komödie, Horror, Sci-Fi oder Anime):
   - Analysiere vor allem die bisherigen Lieblingswerke der Teilnehmer aus GENAU DIESEM BEREICH (z.B. bei einer Sitcom-Anfrage die bisherigen Sitcoms & Serien der Teilnehmer, nicht ihre ernsten Thriller oder Actionfilme)!
   - Leite daraus den bevorzugten Humor-, Ton- oder Subgenre-Stil ab (z.B. sympathische Ensemble-Sitcoms wie Modern Family vs. bissiger Mockumentary/Workplace-Humor vs. schwarzer Humor).
   - Schlage Treffer vor, die diesen Stil perfekt treffen, statt generische Zufallstitel zu wählen.
3. Wenn ein Zeitlimit wie "maximal 120 Minuten" genannt wurde, schlage NUR Filme vor, deren echte Laufzeit <= 120 Minuten beträgt!
4. Bevorzuge Filme/Serien, die in Deutschland auf den genannten Streaming-Abos (${readableSubs}) verfügbar sind.
5. Gib für JEDEN Vorschlag in "perPersonReasons" für JEDEN Teilnehmer (${participants.join(", ")}) einen kurzen, sympathischen Satz auf Deutsch an, warum genau diese Person den Film feiern wird!

Antworte AUSSCHLIESSLICH im folgenden JSON-Format mit 8 bis 10 Picks:
{
  "parsedIntent": {
    "detectedGroupName": ${detectedGroupName ? `"${detectedGroupName}"` : "null"},
    "detectedParticipants": ${JSON.stringify(participants)},
    "mood": "Kurze Beschreibung der gewünschten Stimmung (z.B. Sehr lustig & kurzweilig)",
    "maxRuntimeMinutes": null_oder_Zahl_falls_genannt,
    "mediaType": "movie" | "tv" | "ALL",
    "excludedElements": ["Liste ausgeschlossener Dinge falls genannt"]
  },
  "aiSummary": "Deine sympathische, direkte Antwort an die Gruppe (2-3 Sätze auf Deutsch), wie du ihren Geschmack und ihre Vorgaben kombiniert hast.",
  "picks": [
    {
      "title": "Deutscher Filmtitel",
      "originalTitle": "Englischer Originaltitel für TMDB-Suche",
      "releaseYear": "Erscheinungsjahr (4-stellig)",
      "mediaType": "movie",
      "estimatedRuntime": 105,
      "matchScore": 97,
      "groupPitch": "Warum dieser Film für den heutigen Abend ein Volltreffer ist",
      "perPersonReasons": [
        { "personName": "Name", "reason": "Warum es dieser Person gefällt" }
      ]
    }
  ]
}
`;

    const { data: aiResponse, usedModel } = await callGeminiWithFallback(fullPrompt);

    const parsedIntent: AiParsedIntent = {
      detectedGroupName:
        aiResponse.parsedIntent?.detectedGroupName || detectedGroupName || null,
      detectedParticipants:
        aiResponse.parsedIntent?.detectedParticipants || participants,
      mood: aiResponse.parsedIntent?.mood || "Maßgeschneiderte Auswahl",
      maxRuntimeMinutes:
        typeof aiResponse.parsedIntent?.maxRuntimeMinutes === "number"
          ? aiResponse.parsedIntent.maxRuntimeMinutes
          : null,
      mediaType: aiResponse.parsedIntent?.mediaType || "ALL",
      excludedElements: aiResponse.parsedIntent?.excludedElements || [],
    };

    const rawPicks: any[] = Array.isArray(aiResponse.picks) ? aiResponse.picks : [];

    // Check function to verify if an item was already watched by user or participants
    const checkIsWatched = (title: string, origTitle?: string, tmdbId?: number) => {
      if (tmdbId && watchedTmdbIds.has(String(tmdbId))) return true;
      const n1 = normalizeTitle(title);
      const n2 = origTitle ? normalizeTitle(origTitle) : "";
      if (n1 && watchedNormalizedTitles.has(n1)) return true;
      if (n2 && watchedNormalizedTitles.has(n2)) return true;
      for (const w of watchedNormalizedTitles) {
        if (w.length >= 5 && (n1 === w || n2 === w)) return true;
      }
      return false;
    };

    // Filter out raw picks that match already-watched titles right away
    const filteredRawPicks = rawPicks.filter(
      (p) => !checkIsWatched(p.title, p.originalTitle)
    );

    // 4. Enrich remaining AI picks with live TMDB data & DE Watch Providers in parallel
    const enrichedPicks = (
      await Promise.all(
        filteredRawPicks.map((p) =>
          lookupTmdbAndEnrich(
            p,
            Array.from(combinedSubsSet),
            parsedIntent.maxRuntimeMinutes
          )
        )
      )
    ).filter(Boolean) as AiRecommendedPick[];

    // 5. Final strict safety filter: ensure NO enriched item matches a watched TMDB ID or title, and deduplicate
    const seenTmdbIds = new Set<number>();
    const finalPicks: AiRecommendedPick[] = [];

    for (const p of enrichedPicks) {
      if (seenTmdbIds.has(p.id)) continue;
      if (checkIsWatched(p.title, p.originalTitle, p.id)) continue;

      seenTmdbIds.add(p.id);
      finalPicks.push(p);

      if (finalPicks.length >= 6) break;
    }

    return NextResponse.json({
      usedModel,
      parsedIntent,
      aiSummary:
        aiResponse.aiSummary ||
        `Hier sind die besten Empfehlungen für ${participants.join(" & ")}!`,
      picks: finalPicks,
    });
  } catch (err: any) {
    console.error("AI Recommendation route error:", err);
    return NextResponse.json(
      {
        error:
          err?.message ||
          "Der KI-Filmberater konnte gerade keine Antwort generieren. Bitte versuche es erneut.",
      },
      { status: 500 }
    );
  }
}
