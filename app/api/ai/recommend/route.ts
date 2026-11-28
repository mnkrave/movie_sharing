import { NextResponse } from "next/server";
import { requireUserSession } from "@/lib/auth";
import { isSamePerson } from "@/lib/auth-match";
import {
  normalizeProviderKey,
  resolveCollectionEntry,
  resolveItemGenres,
  POPULAR_SUBSCRIPTIONS,
} from "@/lib/tmdb";

// Allow up to 60 seconds execution time on Vercel for complex AI reasoning & TMDB lookups
export const maxDuration = 60;

const TMDB_API_KEY = process.env.TMDB_API_KEY || "";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

// Ordered by availability, low latency and throughput (fastest, most reliable first)
const GEMINI_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash-lite",
  "gemini-3.5-flash",
  "gemini-3.6-flash",
  "gemini-flash-lite-latest",
  "gemini-3.8-flash",
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
  seriesNote?: string;
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

export function deduplicateParticipants(rawNames: string[]): string[] {
  const result: string[] = [];
  for (const raw of rawNames) {
    const trimmed = (raw || "").trim();
    if (!trimmed) continue;
    const existingIdx = result.findIndex((existing) => isSamePerson(existing, trimmed));
    if (existingIdx === -1) {
      result.push(trimmed);
    } else {
      // Keep the longer / fuller name (e.g. "Lukas Reinle" instead of "Lukas")
      if (trimmed.length > result[existingIdx].length) {
        result[existingIdx] = trimmed;
      }
    }
  }
  return result;
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
        signal: AbortSignal.timeout(9000), // Max 9s per model to prevent gateway timeouts
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
        // If 429 (rate limit) or 503 (high demand), short pause to prevent rapid rate exhaustion
        if (res.status === 429) {
          console.warn(`[Gemini API] 429 Quota/RateLimit on ${model}: ${errMsg}`);
          await new Promise((r) => setTimeout(r, 600));
        } else if (res.status === 503) {
          console.warn(`[Gemini API] 503 High Demand on ${model}: ${errMsg}`);
          await new Promise((r) => setTimeout(r, 300));
        }
      }
    } catch (err: any) {
      lastError = `${model}: ${err?.message || "Error"}`;
    }
  }

  if (
    lastError.includes("429") ||
    lastError.includes("RESOURCE_EXHAUSTED") ||
    lastError.includes("Quota") ||
    lastError.includes("rate limit")
  ) {
    throw new Error(
      "Das Gemini API-Anfragelimit wurde kurzzeitig erreicht (429 Too Many Requests). Bitte warte ca. 30 bis 60 Sekunden, bevor du eine neue Anfrage startest."
    );
  }

  if (
    lastError.includes("503") ||
    lastError.includes("high demand") ||
    lastError.includes("overloaded")
  ) {
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
  checkIsWatchedFn: (
    title: string,
    origTitle?: string,
    tmdbId?: number,
    mediaType?: "movie" | "tv"
  ) => boolean
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
    const fetchDetailsWithProviders = async (id: number) => {
      const detailUrl = `${TMDB_BASE_URL}/${searchType}/${id}?api_key=${TMDB_API_KEY}&language=de-DE&append_to_response=watch/providers`;
      const dRes = await fetch(detailUrl, { next: { revalidate: 43200 } });
      return dRes.ok ? await dRes.json() : null;
    };

    let detailData = (await fetchDetailsWithProviders(foundRaw.id)) || foundRaw;
    let seriesNote: string | undefined = undefined;

    // Sequential movie series check: if Gemini picked Part 2/3/4 and Part 1 is unwatched, swap to Part 1!
    if (searchType === "movie" && detailData.belongs_to_collection?.id) {
      const colRes = await resolveCollectionEntry({
        collectionId: detailData.belongs_to_collection.id,
        currentMovieId: detailData.id,
        isWatched: (movieId, title, origTitle) =>
          checkIsWatchedFn(title || "", origTitle, movieId, "movie"),
      });

      if (colRes?.action === "swap") {
        const part1Details = await fetchDetailsWithProviders(colRes.targetMovieId);
        if (part1Details) {
          detailData = part1Details;
          seriesNote = colRes.seriesNote;
        }
      } else if (colRes?.action === "note") {
        seriesNote = colRes.seriesNote;
      }
    }

    const runtime =
      searchType === "movie"
        ? detailData.runtime || pick.estimatedRuntime || 110
        : detailData.episode_run_time?.[0] || pick.estimatedRuntime || 45;

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
      seriesNote,
      perPersonReasons: Array.isArray(pick.perPersonReasons) ? pick.perPersonReasons : [],
      availableProvidersDE,
    };
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireUserSession();
    if (!auth) {
      return NextResponse.json(
        { error: "Bitte logge dich ein, um den KI-Filmberater zu nutzen." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const userPrompt: string = String(body.prompt || "").trim();
    if (!userPrompt) {
      return NextResponse.json({ error: "Bitte gib eine Anfrage ein." }, { status: 400 });
    }
    if (userPrompt.length > 600) {
      return NextResponse.json(
        { error: "Deine Anfrage ist zu lang (maximal 600 Zeichen)." },
        { status: 400 }
      );
    }

    const currentUserName: string = String(
      auth.userName || body.currentUserName || "Kino-Fan"
    )
      .trim()
      .slice(0, 80);
    const currentUserId: string = String(auth.userId || "").trim();
    const explicitParticipants: string[] = Array.isArray(body.explicitParticipants)
      ? body.explicitParticipants.slice(0, 20).map((p: any) => String(p).slice(0, 80))
      : [];
    const friendGroups: { id: string; name: string; emoji: string; memberNames: string[] }[] =
      Array.isArray(body.friendGroups) ? body.friendGroups.slice(0, 30) : [];
    const allMediaStatuses: any[] = Array.isArray(body.mediaStatuses)
      ? body.mediaStatuses.slice(0, 2500)
      : [];
    const allFriends: any[] = Array.isArray(body.friends) ? body.friends.slice(0, 100) : [];
    const mySubscriptions: string[] = Array.isArray(body.userSubscriptions)
      ? body.userSubscriptions.slice(0, 25)
      : [];
    const callerWatchedTmdbIds: number[] = Array.isArray(body.userWatchedTmdbIds)
      ? body.userWatchedTmdbIds.slice(0, 2000)
      : [];
    const callerWatchedKeys: string[] = Array.isArray(body.userWatchedKeys)
      ? body.userWatchedKeys.slice(0, 2000)
      : [];
    const callerWatchedTitles: string[] = Array.isArray(body.userWatchedTitles)
      ? body.userWatchedTitles.slice(0, 2000)
      : [];

    // 1. Pre-detect mentioned groups or friends in natural language or /match syntax
    const lowerPrompt = userPrompt.toLowerCase();
    let detectedGroupName: string | null = null;
    const rawParticipantList: string[] = [currentUserName, ...explicitParticipants];

    for (const grp of friendGroups) {
      const grpClean = grp.name.toLowerCase();
      const grpSpaced = grpClean.replace(/[-_]/g, " ");
      if (lowerPrompt.includes(grpClean) || lowerPrompt.includes(grpSpaced)) {
        detectedGroupName = `${grp.emoji} ${grp.name}`;
        rawParticipantList.push(...grp.memberNames);
      }
    }

    for (const f of allFriends) {
      if (f.name && lowerPrompt.includes(f.name.toLowerCase())) {
        rawParticipantList.push(f.name);
      }
    }

    // Deduplicate participants cleanly (e.g. "Lukas" and "Lukas Reinle" are merged into "Lukas Reinle")
    const participants = deduplicateParticipants(rawParticipantList);

    // 2. Build per-participant taste profiles & collect already-watched titles with robust matching
    const allWatchedTitlesList = new Set<string>(callerWatchedTitles);
    const watchedNormalizedTitles = new Set<string>(
      callerWatchedTitles.map(normalizeTitle).filter(Boolean)
    );
    const watchedTmdbKeys = new Set<string>(callerWatchedKeys);
    const watchedLegacyTmdbIds = new Set<string>(
      callerWatchedKeys.length === 0 ? callerWatchedTmdbIds.map(String) : []
    );

    const watchlistCounts = new Map<string, string[]>(); // title -> who has it on watchlist
    const combinedSubsSet = new Set<string>(mySubscriptions);

    // Helper to check if a status entry belongs to the current user or one of the active participants
    const isStatusForParticipant = (m: any, pName?: string) => {
      const mUserId = (m.userId || "").toLowerCase().trim();
      const mUserName = (m.userName || "").trim();

      if (pName) {
        if (isSamePerson(mUserName, pName)) return true;
        if (mUserId && (mUserId === pName.toLowerCase() || pName.toLowerCase().includes(mUserId))) return true;
        return false;
      }

      // Check current user
      if (currentUserId && mUserId === currentUserId.toLowerCase()) return true;
      if (isSamePerson(mUserName, currentUserName)) return true;

      // Check against any participant
      for (const p of participants) {
        if (isSamePerson(mUserName, p)) return true;
        if (mUserId && mUserId === p.toLowerCase()) return true;
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
          if (m.mediaType) {
            watchedTmdbKeys.add(`${m.mediaType}_${m.tmdbId}`);
          } else {
            watchedLegacyTmdbIds.add(String(m.tmdbId));
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
        const friendObj = allFriends.find((f) => isSamePerson(f.name, pName));
        if (friendObj?.subscriptions) {
          friendObj.subscriptions.forEach((s: string) => combinedSubsSet.add(s));
        }

        const pStatuses = allMediaStatuses.filter((m) => isStatusForParticipant(m, pName));
        const watched = pStatuses.filter((m) => m.status === "WATCHED");

        const sortByRatingDesc = (a: any, b: any) => (b.rating ?? -1) - (a.rating ?? -1);
        const formatRated = (w: any) => `${w.title} (${w.rating}★)`;

        // Separate rated vs unrated and Movie vs TV, keeping ALL rated items sorted by rating!
        const watchedMovies = watched.filter((w) => w.mediaType === "movie").sort(sortByRatingDesc);
        const watchedTv = watched.filter((w) => w.mediaType === "tv").sort(sortByRatingDesc);

        const ratedMovies = watchedMovies.filter((w) => typeof w.rating === "number" && w.rating > 0);
        const ratedTv = watchedTv.filter((w) => typeof w.rating === "number" && w.rating > 0);
        const unratedWatched = watched.filter((w) => typeof w.rating !== "number" || w.rating <= 0);

        const lovedMovies = ratedMovies.filter((w) => w.rating >= 8).map(formatRated);
        const solidMovies = ratedMovies.filter((w) => w.rating >= 6 && w.rating <= 7).map(formatRated);
        const dislikedMovies = ratedMovies.filter((w) => w.rating <= 5).map(formatRated);

        const lovedTv = ratedTv.filter((w) => w.rating >= 8).map(formatRated);
        const solidTv = ratedTv.filter((w) => w.rating >= 6 && w.rating <= 7).map(formatRated);
        const dislikedTv = ratedTv.filter((w) => w.rating <= 5).map(formatRated);

        const allRatedValues = [...ratedMovies, ...ratedTv].map((w) => w.rating as number);
        const avgPersonalRating =
          allRatedValues.length > 0
            ? (allRatedValues.reduce((a, b) => a + b, 0) / allRatedValues.length).toFixed(1)
            : null;

        const watchlist = pStatuses
          .filter((m) => m.status === "WATCHLIST")
          .map((w) => {
            const list = watchlistCounts.get(w.title) || [];
            if (!list.includes(pName)) list.push(pName);
            watchlistCounts.set(w.title, list);
            return w.title;
          });

        const profileLines = [
          `- Person "${pName}" (${allRatedValues.length} bewertete Titel${
            avgPersonalRating ? `, Ø ${avgPersonalRating}★` : ""
          }):`,
        ];

        if (isSeriesRequest || isSitcomOrComedy) {
          profileLines.push(
            `  • Alle Top-Serien (8-10★): ${
              lovedTv.length > 0 ? lovedTv.join(", ") : "Noch keine Serien >=8★"
            }`
          );
          if (solidTv.length > 0) {
            profileLines.push(`  • Solide Serien (6-7★): ${solidTv.join(", ")}`);
          }
          profileLines.push(
            `  • Alle Top-Filme (8-10★): ${
              lovedMovies.length > 0 ? lovedMovies.join(", ") : "Keine"
            }`
          );
          if (solidMovies.length > 0) {
            profileLines.push(`  • Solide Filme (6-7★): ${solidMovies.join(", ")}`);
          }
        } else {
          profileLines.push(
            `  • Alle Top-Filme (8-10★): ${
              lovedMovies.length > 0 ? lovedMovies.join(", ") : "Noch keine Filme >=8★"
            }`
          );
          if (solidMovies.length > 0) {
            profileLines.push(`  • Solide Filme (6-7★): ${solidMovies.join(", ")}`);
          }
          if (lovedTv.length > 0) {
            profileLines.push(`  • Alle Top-Serien (8-10★): ${lovedTv.join(", ")}`);
          }
          if (solidTv.length > 0) {
            profileLines.push(`  • Solide Serien (6-7★): ${solidTv.join(", ")}`);
          }
        }

        const allDisliked = [...dislikedMovies, ...dislikedTv];
        profileLines.push(
          `  • Abneigungen/No-Gos (<=5★): ${allDisliked.length > 0 ? allDisliked.join(", ") : "Keine"}`
        );
        if (unratedWatched.length > 0) {
          profileLines.push(
            `  • Gesehen ohne Note: ${unratedWatched.map((u) => u.title).join(", ")}`
          );
        }
        profileLines.push(
          `  • Auf der Watchlist (${watchlist.length}): ${
            watchlist.length > 0 ? watchlist.slice(0, 25).join(", ") : "Keine"
          }`
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

    const watchedForbiddenList = Array.from(allWatchedTitlesList).slice(0, 800);

    // 3. Construct prompt for Gemini
    const fullPrompt = `Du bist "CineBot", der hochintelligente KI-Filmberater von CineCircle.
Analysiere den Wunsch des Nutzers sowie ALLE bewerteten Filme & Serien jedes Teilnehmers und finde die 10 bis 12 besten Vorschläge (Filme oder Serien), damit nach strengem Ausschluss bereits gesehener Titel, Laufzeit-Checks und deutschem Abo-Check mindestens 6 absolut passende Treffer übrig bleiben!

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
6. FILMREIHEN-LOGIK (AUFBAUENDE SEQUELS): Wenn eine aufeinander aufbauende Filmreihe (z. B. Dune, Herr der Ringe, Harry Potter, John Wick, The Dark Knight, Spider-Verse) gut passt, aber Teil 1 (bzw. ein Vorgängerteil) noch NICHT gesehen wurde, empfehle NICHT Teil 2/3/4, sondern direkt den 1. Teil (bzw. den ersten noch ungesehenen Teil) und erwähne im "groupPitch", dass die ganze Filmreihe spannend für die Gruppe sein könnte!

Antworte AUSSCHLIESSLICH im folgenden JSON-Format mit 10 bis 12 Picks:
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

    const returnedParticipants =
      Array.isArray(aiResponse.parsedIntent?.detectedParticipants) &&
      aiResponse.parsedIntent.detectedParticipants.length > 0
        ? aiResponse.parsedIntent.detectedParticipants
        : participants;
    const finalCleanParticipants = deduplicateParticipants(returnedParticipants);

    const parsedIntent: AiParsedIntent = {
      detectedGroupName:
        aiResponse.parsedIntent?.detectedGroupName || detectedGroupName || null,
      detectedParticipants: finalCleanParticipants,
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
    const checkIsWatched = (
      title: string,
      origTitle?: string,
      tmdbId?: number,
      mediaType?: "movie" | "tv"
    ) => {
      if (tmdbId) {
        if (mediaType && watchedTmdbKeys.has(`${mediaType}_${tmdbId}`)) return true;
        if (watchedLegacyTmdbIds.has(String(tmdbId))) return true;
      }
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
          lookupTmdbAndEnrich(p, Array.from(combinedSubsSet), checkIsWatched)
        )
      )
    ).filter(Boolean) as AiRecommendedPick[];

    // 5. Final strict safety filter: ensure NO enriched item matches a watched TMDB ID or title, and deduplicate
    const seenKeys = new Set<string>();
    const dedupedPicks: AiRecommendedPick[] = [];

    for (const p of enrichedPicks) {
      const key = `${p.mediaType}_${p.id}`;
      if (seenKeys.has(key)) continue;
      if (checkIsWatched(p.title, p.originalTitle, p.id, p.mediaType)) continue;

      seenKeys.add(key);
      dedupedPicks.push(p);
    }

    let finalPicks = dedupedPicks;

    // Respect requested mediaType ("movie" | "tv") when specified
    if (parsedIntent.mediaType === "movie" || parsedIntent.mediaType === "tv") {
      const matchingType = finalPicks.filter((p) => p.mediaType === parsedIntent.mediaType);
      if (matchingType.length >= 3) {
        finalPicks = matchingType;
      }
    }

    // Prioritize items respecting maxRuntimeMinutes (only fall back to longer movies if < 3 remain)
    if (parsedIntent.maxRuntimeMinutes) {
      const withinLimit = finalPicks.filter(
        (p) =>
          p.mediaType !== "movie" ||
          !p.runtimeMinutes ||
          p.runtimeMinutes <= (parsedIntent.maxRuntimeMinutes as number) + 10
      );
      if (withinLimit.length >= 3) {
        finalPicks = withinLimit;
      }
    }

    // Prioritize picks actually streamable on the participants' DE subscriptions
    if (combinedSubsSet.size > 0) {
      finalPicks = [...finalPicks].sort((a, b) => {
        const aSub = a.availableProvidersDE.some((prov) => prov.isMySub) ? 1 : 0;
        const bSub = b.availableProvidersDE.some((prov) => prov.isMySub) ? 1 : 0;
        if (bSub !== aSub) return bSub - aSub;
        return b.matchScore - a.matchScore;
      });
    }

    finalPicks = finalPicks.slice(0, 6);

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
