"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useMedia } from "@/components/MediaContext";
import type {
  RecommendedMediaItem,
  TasteSummary,
} from "@/app/api/tmdb/recommendations/route";
import {
  Wand2,
  Filter,
  Tag,
  RefreshCw,
  Sparkles,
  Star,
  Film,
  Tv,
  Check,
  Plus,
  Trophy,
  ChevronDown,
  ChevronUp,
  Search,
  Zap,
  X,
  Flame,
} from "lucide-react";

interface StarterLandmark {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  year: string;
  posterPath: string;
  genreEmoji: string;
}

const TARGET_RATINGS = 25;
const MIN_RATINGS_FOR_RECS = 10;

const STARTER_LANDMARKS: StarterLandmark[] = [
  { tmdbId: 27205, mediaType: "movie", title: "Inception", year: "2010", posterPath: "/t5WUY5ZSxwVIVExaMZmmIj88BKA.jpg", genreEmoji: "🚀" },
  { tmdbId: 155, mediaType: "movie", title: "The Dark Knight", year: "2008", posterPath: "/z1DfRQf2CgnROyhVZ6ch8FbWt71.jpg", genreEmoji: "💥" },
  { tmdbId: 157336, mediaType: "movie", title: "Interstellar", year: "2014", posterPath: "/hHdhfkkzt0Mwec33Ux177Z7CO8w.jpg", genreEmoji: "🌌" },
  { tmdbId: 680, mediaType: "movie", title: "Pulp Fiction", year: "1994", posterPath: "/hOg9USqmQmglmr5kGvpyg1XkhqN.jpg", genreEmoji: "🕶️" },
  { tmdbId: 13, mediaType: "movie", title: "Forrest Gump", year: "1994", posterPath: "/zUWRCzac72YuO9k5kEWSe0aGbs7.jpg", genreEmoji: "🏃" },
  { tmdbId: 120, mediaType: "movie", title: "Der Herr der Ringe: Die Gefährten", year: "2001", posterPath: "/k6lw7hhaMDzJ170bfZfBbnipxcW.jpg", genreEmoji: "🧙‍♂️" },
  { tmdbId: 550, mediaType: "movie", title: "Fight Club", year: "1999", posterPath: "/5sLBZtBzmL9Xd5MdGyqymgM9kPY.jpg", genreEmoji: "👊" },
  { tmdbId: 98, mediaType: "movie", title: "Gladiator", year: "2000", posterPath: "/32wJunadteAxUkXnbQ1lHjjp5pa.jpg", genreEmoji: "⚔️" },
  { tmdbId: 603, mediaType: "movie", title: "Matrix", year: "1999", posterPath: "/iVmDLujHcV1zaMnaahKWn4TcCS6.jpg", genreEmoji: "🕶️" },
  { tmdbId: 597, mediaType: "movie", title: "Titanic", year: "1997", posterPath: "/MlnPG3oxhfmuiDwcoeElQWui9m.jpg", genreEmoji: "🚢" },
  { tmdbId: 8587, mediaType: "movie", title: "Der König der Löwen", year: "1994", posterPath: "/2yiOlsfujLV3uiMd0VbbT8QBHFX.jpg", genreEmoji: "🦁" },
  { tmdbId: 808, mediaType: "movie", title: "Shrek", year: "2001", posterPath: "/tpRAuDh3V7TOMepHlwGsXSgmqlA.jpg", genreEmoji: "🟢" },
  { tmdbId: 299534, mediaType: "movie", title: "Avengers: Endgame", year: "2019", posterPath: "/ibO8Pj0aA1nwj3Q9FMpMcYZkdCA.jpg", genreEmoji: "⚡" },
  { tmdbId: 872585, mediaType: "movie", title: "Oppenheimer", year: "2023", posterPath: "/9AiHV08v8RyyuHcO5wuTaTXBxfe.jpg", genreEmoji: "⚛️" },
  { tmdbId: 68718, mediaType: "movie", title: "Django Unchained", year: "2012", posterPath: "/yK0qrQhi3BbOXvTNOBWHgpcbckZ.jpg", genreEmoji: "🤠" },
  { tmdbId: 106646, mediaType: "movie", title: "The Wolf of Wall Street", year: "2013", posterPath: "/uuLLAJ9JEJd4o0F9fnJhV1weisr.jpg", genreEmoji: "📈" },
  { tmdbId: 1396, mediaType: "tv", title: "Breaking Bad", year: "2008", posterPath: "/anFx9aTOOYqgS3v7x3R84Kz67ly.jpg", genreEmoji: "🧪" },
  { tmdbId: 1399, mediaType: "tv", title: "Game of Thrones", year: "2011", posterPath: "/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg", genreEmoji: "🐉" },
  { tmdbId: 66732, mediaType: "tv", title: "Stranger Things", year: "2016", posterPath: "/uOOtwVbSr4QDjAGIifLDwpb2Pdl.jpg", genreEmoji: "🚲" },
  { tmdbId: 1668, mediaType: "tv", title: "Friends", year: "1994", posterPath: "/2koX1xLkpTQM4IZebYvKysFW1Nh.jpg", genreEmoji: "☕" },
  { tmdbId: 2316, mediaType: "tv", title: "The Office", year: "2005", posterPath: "/7DJKHzAi83BmQrWLrYYOqcoKfhR.jpg", genreEmoji: "📄" },
  { tmdbId: 48891, mediaType: "tv", title: "Brooklyn Nine-Nine", year: "2013", posterPath: "/mpjlDzVjp7oyHUe2LaF9ltKe6f1.jpg", genreEmoji: "🍩" },
  { tmdbId: 1421, mediaType: "tv", title: "Modern Family", year: "2009", posterPath: "/k5Qg5rgPoKdh3yTJJrLtyoyYGwC.jpg", genreEmoji: "🏡" },
  { tmdbId: 1418, mediaType: "tv", title: "The Big Bang Theory", year: "2007", posterPath: "/euKFiO5M125rpngFRBbSW83beeI.jpg", genreEmoji: "🔬" },
  { tmdbId: 97546, mediaType: "tv", title: "Ted Lasso", year: "2020", posterPath: "/uRHsiw1wLxPHFXkkv4Ix1s0O6f4.jpg", genreEmoji: "⚽" },
  { tmdbId: 438631, mediaType: "movie", title: "Dune", year: "2021", posterPath: "/34Hr4bEzF30jd6sEvI4HihEUEI8.jpg", genreEmoji: "🏜️" },
  { tmdbId: 496243, mediaType: "movie", title: "Parasite", year: "2019", posterPath: "/hoqe3leVhHBgboB6G1bv1kB8K4p.jpg", genreEmoji: "🎭" },
  { tmdbId: 324857, mediaType: "movie", title: "Spider-Man: A New Universe", year: "2018", posterPath: "/vOpV6HrtAkNQxCWAgtU4NmQ1KPe.jpg", genreEmoji: "🕷️" },
  { tmdbId: 671, mediaType: "movie", title: "Harry Potter und der Stein der Weisen", year: "2001", posterPath: "/nKspzM3rVJASkT4CvZvuj9KDT7l.jpg", genreEmoji: "⚡" },
];

export function AlgorithmRecommendations() {
  const { data: session } = useSession();
  const {
    communityData,
    userSubscriptions,
    openMediaModal,
    openRatingModal,
    updateMediaStatus,
    openSearch,
  } = useMedia();

  const [recItems, setRecItems] = useState<RecommendedMediaItem[]>([]);
  const [tasteSummary, setTasteSummary] = useState<TasteSummary | null>(null);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [recMediaType, setRecMediaType] = useState<"ALL" | "movie" | "tv">("ALL");
  const [recOnlyMySubs, setRecOnlyMySubs] = useState(true);
  const [recExcludeWatchlist, setRecExcludeWatchlist] = useState(false);
  const [recRefreshCounter, setRecRefreshCounter] = useState(0);
  const [skippedLandmarkIds, setSkippedLandmarkIds] = useState<number[]>([]);
  const [showMoreQuickRatings, setShowMoreQuickRatings] = useState<boolean>(false);

  const myUserId = (session?.user as any)?.id || "user_lukas";

  // Filter user's media statuses
  const myStatuses = useMemo(() => {
    return communityData.mediaStatuses.filter(
      (m) => m.userId === myUserId || (session?.user?.name && m.userName === session.user.name)
    );
  }, [communityData.mediaStatuses, myUserId, session?.user?.name]);

  const watchedItems = useMemo(
    () => myStatuses.filter((m) => m.status === "WATCHED"),
    [myStatuses]
  );

  const watchlistItems = useMemo(
    () => myStatuses.filter((m) => m.status === "WATCHLIST"),
    [myStatuses]
  );

  const watchedTmdbIds = useMemo(() => {
    return new Set(watchedItems.map((w) => w.tmdbId));
  }, [watchedItems]);

  const availableLandmarks = useMemo(() => {
    return STARTER_LANDMARKS.filter(
      (lm) => !watchedTmdbIds.has(lm.tmdbId) && !skippedLandmarkIds.includes(lm.tmdbId)
    );
  }, [watchedTmdbIds, skippedLandmarkIds]);

  const handleQuickRate = async (item: StarterLandmark, rating: number) => {
    await updateMediaStatus({
      tmdbId: item.tmdbId,
      mediaType: item.mediaType,
      title: item.title,
      posterPath: item.posterPath,
      releaseYear: item.year,
      status: "WATCHED",
      rating,
    });
  };

  const handleSkipLandmark = (tmdbId: number) => {
    setSkippedLandmarkIds((prev) => [...prev, tmdbId]);
  };

  useEffect(() => {
    if (watchedItems.length < MIN_RATINGS_FOR_RECS) {
      setRecItems([]);
      setLoadingRecs(false);
      return;
    }
    let isMounted = true;
    setLoadingRecs(true);

    fetch("/api/tmdb/recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        watchedItems: watchedItems.map((m) => ({
          tmdbId: m.tmdbId,
          mediaType: m.mediaType,
          rating: m.rating,
          title: m.title,
        })),
        userSubscriptions,
        mediaTypeFilter: recMediaType,
        onlyMySubscriptions: recOnlyMySubs,
        excludeWatchlist: recExcludeWatchlist,
        refreshCounter: recRefreshCounter,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.recommendations) {
          setRecItems(data.recommendations);
        }
        if (data.tasteSummary) {
          setTasteSummary(data.tasteSummary);
        }
      })
      .catch((err) => {
        console.error("Failed to load recommendations:", err);
      })
      .finally(() => {
        if (isMounted) setLoadingRecs(false);
      });

    return () => {
      isMounted = false;
    };
  }, [
    watchedItems,
    userSubscriptions,
    recMediaType,
    recOnlyMySubs,
    recExcludeWatchlist,
    recRefreshCounter,
  ]);

  if (watchedItems.length < MIN_RATINGS_FOR_RECS) {
    const needed = MIN_RATINGS_FOR_RECS - watchedItems.length;
    const progressPercent = Math.round((watchedItems.length / TARGET_RATINGS) * 100);

    return (
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0c1424] via-slate-900 to-[#070b14] border border-amber-500/30 shadow-2xl space-y-6">
        {/* Setup Header */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Geschmacks-Setup für deinen Algorithmus</span>
            </div>
            <span className="text-xs font-extrabold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
              {watchedItems.length} / {TARGET_RATINGS} bewertet (Mind. {MIN_RATINGS_FOR_RECS} für erste Tipps)
            </span>
          </div>

          <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
            Noch {needed} {needed === 1 ? "Bewertung" : "Bewertungen"} bis zu deinen ersten Empfehlungen!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Damit der Algorithmus deinen Geschmack versteht und nicht einseitig wird (wie z. B. nur Batman-Filme vorschlägt), benötigt er mindestens {MIN_RATINGS_FOR_RECS} Bewertungen aus verschiedenen Genres (optimal sind {TARGET_RATINGS} für das volle Profi-Profil).
          </p>

          {/* Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs font-semibold text-slate-400">
              <span>Fortschritt zur Freischaltung</span>
              <span className="text-amber-400 font-bold">{progressPercent}% ({watchedItems.length}/{TARGET_RATINGS})</span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                style={{ width: `${Math.max(4, progressPercent)}%` }}
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-300 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Quick Rate Deck */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Schnellbewertung: Kennst du diese bekannten Meilensteine? (1-Klick)</span>
            </h3>
            <button
              type="button"
              onClick={openSearch}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold underline flex items-center gap-1"
            >
              <Search className="w-3 h-3" />
              <span>Andere Filme suchen</span>
            </button>
          </div>

          {availableLandmarks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {availableLandmarks.slice(0, 8).map((lm) => (
                <div
                  key={`${lm.mediaType}-${lm.tmdbId}`}
                  className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 flex gap-3 items-center group hover:border-slate-700 transition relative overflow-hidden"
                >
                  <div className="w-14 h-20 rounded-xl overflow-hidden bg-slate-900 flex-shrink-0 relative shadow">
                    <Image
                      src={`https://image.tmdb.org/t/p/w185${lm.posterPath}`}
                      alt={lm.title}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">
                        {lm.mediaType === "tv" ? "TV Serie" : "Film"} • {lm.year}
                      </span>
                      <button
                        onClick={() => handleSkipLandmark(lm.tmdbId)}
                        title="Nicht gesehen / Überspringen"
                        className="text-slate-500 hover:text-slate-300 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="text-xs font-bold text-white truncate" title={lm.title}>
                      {lm.genreEmoji} {lm.title}
                    </h4>

                    {/* Quick 1-Click Rating Buttons */}
                    <div className="flex items-center gap-1 pt-0.5">
                      <button
                        onClick={() => handleQuickRate(lm, 10)}
                        title="10★ Meisterwerk"
                        className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 hover:text-black border border-emerald-500/40 text-emerald-300 text-[10px] font-extrabold transition"
                      >
                        10★
                      </button>
                      <button
                        onClick={() => handleQuickRate(lm, 8)}
                        title="8★ Sehr gut"
                        className="px-2 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 hover:text-black border border-cyan-500/40 text-cyan-300 text-[10px] font-extrabold transition"
                      >
                        8★
                      </button>
                      <button
                        onClick={() => handleQuickRate(lm, 6)}
                        title="6★ Ganz gut"
                        className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 hover:text-black border border-amber-500/40 text-amber-300 text-[10px] font-extrabold transition"
                      >
                        6★
                      </button>
                      <button
                        onClick={() => handleQuickRate(lm, 4)}
                        title="4★ Schlecht"
                        className="px-1.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500 hover:text-white border border-rose-500/30 text-rose-300 text-[10px] font-extrabold transition"
                      >
                        👎
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center rounded-2xl bg-slate-950/40 border border-slate-800 text-slate-400 text-xs">
              Alle Starter-Vorschläge bewertet oder übersprungen. Nutze die Suche, um weitere Titel hinzuzufügen!
            </div>
          )}
        </div>

        {/* Action Button: Search */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={openSearch}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition shadow-lg hover:scale-102"
          >
            <Search className="w-4 h-4" />
            <span>Eigene Lieblingsfilme & Serien suchen ({watchedItems.length}/{TARGET_RATINGS})</span>
          </button>
        </div>
      </div>
    );
  }

  const isPrecisionActive = watchedItems.length >= TARGET_RATINGS;
  const progressPercent = Math.min(100, Math.round((watchedItems.length / TARGET_RATINGS) * 100));

  return (
    <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-950/30 via-slate-900 to-[#0b1220] border border-emerald-500/30 shadow-2xl space-y-6">
      {/* Precision Level Banner (if between 10 and 24 ratings) */}
      {!isPrecisionActive && (
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>Basis-Modus aktiv ({watchedItems.length} / {TARGET_RATINGS} bewertet • {progressPercent}%)</span>
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Noch <strong>{TARGET_RATINGS - watchedItems.length} Titel</strong> bis zum vollen <strong>Profi-Profil</strong> mit maximaler Treffsicherheit & Kombi-Matches.
            </p>
          </div>

          {availableLandmarks.length > 0 && (
            <button
              type="button"
              onClick={() => setShowMoreQuickRatings(!showMoreQuickRatings)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 text-xs font-bold transition self-start md:self-auto"
            >
              <span>{showMoreQuickRatings ? "Schnellbewertung schließen" : "+ Schnell weitere Titel bewerten"}</span>
              {showMoreQuickRatings ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      )}

      {/* Optional Expanded Quick Rater Deck */}
      {!isPrecisionActive && showMoreQuickRatings && availableLandmarks.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 animate-in fade-in">
          <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
            <span>Klicke auf deine Bewertung (10★ / 8★ / 6★ / 👎):</span>
            <span className="text-slate-500 text-[11px]">{availableLandmarks.length} Vorschläge verfügbar</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {availableLandmarks.slice(0, 8).map((lm) => (
              <div
                key={`${lm.mediaType}-${lm.tmdbId}`}
                className="bg-slate-900/70 border border-slate-800 rounded-xl p-2.5 flex gap-2.5 items-center group"
              >
                <div className="w-12 h-16 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0 relative shadow">
                  <Image
                    src={`https://image.tmdb.org/t/p/w185${lm.posterPath}`}
                    alt={lm.title}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase truncate">
                      {lm.mediaType === "tv" ? "TV" : "Film"} • {lm.year}
                    </span>
                    <button
                      onClick={() => handleSkipLandmark(lm.tmdbId)}
                      title="Überspringen"
                      className="text-slate-500 hover:text-slate-300 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <h5 className="text-xs font-bold text-white truncate">{lm.genreEmoji} {lm.title}</h5>
                  <div className="flex items-center gap-1 pt-0.5">
                    <button
                      onClick={() => handleQuickRate(lm, 10)}
                      className="px-1.5 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500 hover:text-black text-emerald-300 text-[10px] font-bold"
                    >
                      10★
                    </button>
                    <button
                      onClick={() => handleQuickRate(lm, 8)}
                      className="px-1.5 py-0.5 rounded bg-cyan-500/20 hover:bg-cyan-500 hover:text-black text-cyan-300 text-[10px] font-bold"
                    >
                      8★
                    </button>
                    <button
                      onClick={() => handleQuickRate(lm, 6)}
                      className="px-1.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500 hover:text-black text-amber-300 text-[10px] font-bold"
                    >
                      6★
                    </button>
                    <button
                      onClick={() => handleQuickRate(lm, 4)}
                      className="px-1 py-0.5 rounded bg-rose-500/15 hover:bg-rose-500 text-rose-300 text-[10px]"
                    >
                      👎
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            {isPrecisionActive ? (
              <>
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>🔥 Vollständiges Profi-Profil aktiv ({watchedItems.length} Titel)</span>
              </>
            ) : (
              <>
                <Wand2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Persönlicher Empfehlungs-Algorithmus</span>
              </>
            )}
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
            Maßgeschneidert für deinen Geschmack & deine Abos
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
            Berechnet aus deinen <strong>{watchedItems.length} gesehenen Titeln</strong>, deinen Bewertungen, TMDB-Themen-Keywords und deinen{" "}
            <strong>{userSubscriptions.length} Streaming-Abos</strong> in Deutschland.
          </p>
        </div>

        {/* Controls: MediaType, OnlyMySubs, ExcludeWatchlist, Refresh */}
        <div className="flex flex-wrap items-center gap-2 self-start">
          {/* Media Type Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/90 border border-slate-800">
            <button
              type="button"
              onClick={() => setRecMediaType("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                recMediaType === "ALL"
                  ? "bg-emerald-500 text-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Alle
            </button>
            <button
              type="button"
              onClick={() => setRecMediaType("movie")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                recMediaType === "movie"
                  ? "bg-emerald-500 text-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🎬 Filme
            </button>
            <button
              type="button"
              onClick={() => setRecMediaType("tv")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                recMediaType === "tv"
                  ? "bg-emerald-500 text-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              📺 Serien
            </button>
          </div>

          {/* Only My Subscriptions Toggle */}
          <button
            type="button"
            onClick={() => setRecOnlyMySubs(!recOnlyMySubs)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
              recOnlyMySubs
                ? "bg-amber-500/15 border-amber-500/50 text-amber-300"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Nur meine Abos</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                recOnlyMySubs ? "bg-amber-400 text-black" : "bg-slate-800 text-slate-400"
              }`}
            >
              {recOnlyMySubs ? "AN" : "AUS"}
            </span>
          </button>

          {/* Exclude Watchlist Toggle */}
          <button
            type="button"
            onClick={() => setRecExcludeWatchlist(!recExcludeWatchlist)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
              recExcludeWatchlist
                ? "bg-sky-500/20 border-sky-500/40 text-sky-300"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {recExcludeWatchlist ? "Watchlist ausgeblendet ✓" : "Inkl. Watchlist"}
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => setRecRefreshCounter((c) => c + 1)}
            disabled={loadingRecs}
            title="Empfehlungen neu berechnen"
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loadingRecs ? "animate-spin text-emerald-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Detected Taste Vector & Keywords Bar */}
      {tasteSummary && (tasteSummary.topGenres.length > 0 || tasteSummary.topKeywords.length > 0) && (
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1 mr-1">
            <Tag className="w-3.5 h-3.5" />
            <span>Erkanntes Geschmacks-Profil:</span>
          </span>
          {tasteSummary.topGenres.slice(0, 4).map((g) => (
            <span
              key={g.id}
              className="px-2.5 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold"
            >
              {g.emoji} {g.name}
            </span>
          ))}
          {tasteSummary.topKeywords.slice(0, 6).map((kw) => (
            <span
              key={kw.id}
              className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-[11px] font-medium"
            >
              #{kw.name}
            </span>
          ))}
        </div>
      )}

      {/* Recommendations Grid */}
      {loadingRecs ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] rounded-2xl bg-slate-900/80 border border-slate-800 animate-pulse"
            />
          ))}
        </div>
      ) : recItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {recItems.slice(0, 18).map((item) => {
            const myProviders = item.availableProvidersDE.filter((p) => p.isMySub);
            const displayProviders =
              myProviders.length > 0 ? myProviders : item.availableProvidersDE.slice(0, 2);
            const isOnWatchlist = watchlistItems.some(
              (w) => w.tmdbId === item.id && w.mediaType === item.mediaType
            );

            return (
              <div
                key={`${item.mediaType}_${item.id}`}
                onClick={() =>
                  openMediaModal({
                    id: item.id,
                    mediaType: item.mediaType,
                    title: item.title,
                    posterPath: item.posterPath,
                    genreIds: item.genreIds,
                  })
                }
                className="group cursor-pointer rounded-2xl bg-slate-950/80 border border-slate-800/90 hover:border-emerald-500/50 overflow-hidden flex flex-col justify-between transition duration-300 hover:-translate-y-1.5 shadow-lg"
              >
                <div>
                  {/* Poster */}
                  <div className="relative aspect-[2/3] w-full bg-slate-900 overflow-hidden">
                    {item.posterPath ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w500${item.posterPath}`}
                        alt={item.title}
                        fill
                        sizes="220px"
                        className="object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <Film className="w-8 h-8" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                    {/* Match Score Badge Top-Left */}
                    <div
                      className={`absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg font-black text-xs shadow-lg flex items-center gap-1 ${
                        item.isComboMatch
                          ? "bg-gradient-to-r from-amber-400 via-rose-500 to-purple-500 text-white shadow-rose-500/25 ring-1 ring-white/30"
                          : "bg-emerald-500 text-black"
                      }`}
                    >
                      <Sparkles className="w-3 h-3 fill-current" />
                      <span>{item.isComboMatch ? `🔥 ${item.matchScore}% Kombi` : `${item.matchScore}% Match`}</span>
                    </div>

                    {/* TMDB Rating Top-Right */}
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md border border-slate-700 text-amber-400 font-bold text-xs flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{item.voteAverage}</span>
                    </div>

                    {/* Streaming Providers Bottom Overlay */}
                    {displayProviders.length > 0 && (
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center gap-1.5 flex-wrap">
                        {displayProviders.slice(0, 3).map((p) => (
                          <div
                            key={p.providerId}
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold backdrop-blur-md border ${
                              p.isMySub
                                ? "bg-amber-500/90 text-black border-amber-300"
                                : "bg-black/75 text-slate-200 border-slate-700"
                            }`}
                          >
                            {p.logoPath && (
                              <Image
                                src={`https://image.tmdb.org/t/p/w45${p.logoPath}`}
                                alt={p.providerName}
                                width={14}
                                height={14}
                                className="rounded-xs"
                              />
                            )}
                            <span className="truncate max-w-[85px]">{p.providerName}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Info & Personal Match Reasons */}
                  <div className="p-3 space-y-2">
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold">
                        <span>{item.mediaType === "tv" ? "📺 Serie" : "🎬 Film"}</span>
                        <span>{item.releaseYear}</span>
                      </div>
                      <h4 className="text-xs font-extrabold text-white line-clamp-1 group-hover:text-emerald-400 transition mt-0.5">
                        {item.title}
                      </h4>
                    </div>

                    {/* Explainable Reason */}
                    {item.reasons.length > 0 && (
                      <p
                        className={`text-[11px] leading-snug line-clamp-2 rounded-lg p-1.5 border ${
                          item.isComboMatch
                            ? "bg-amber-950/40 border-amber-500/40 text-amber-200 font-semibold"
                            : "bg-emerald-950/40 border-emerald-500/20 text-emerald-300/90"
                        }`}
                      >
                        {item.reasons[0]}
                      </p>
                    )}

                    {/* Genres */}
                    {item.genres.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.genres.slice(0, 2).map((g) => (
                          <span
                            key={g.id}
                            className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 truncate max-w-full"
                          >
                            {g.emoji} {g.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Action Footer Buttons */}
                <div className="px-3 pb-3 pt-1 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openRatingModal({
                        tmdbId: item.id,
                        mediaType: item.mediaType,
                        title: item.title,
                        posterPath: item.posterPath,
                        releaseYear: item.releaseYear,
                        isWatched: false,
                      });
                    }}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-slate-900 hover:bg-emerald-500 hover:text-black text-slate-300 text-[11px] font-bold border border-slate-800 transition"
                  >
                    <Check className="w-3 h-3" />
                    <span>Gesehen?</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateMediaStatus({
                        tmdbId: item.id,
                        mediaType: item.mediaType,
                        title: item.title,
                        posterPath: item.posterPath,
                        releaseYear: item.releaseYear,
                        status: isOnWatchlist ? "NONE" : "WATCHLIST",
                      });
                    }}
                    title={isOnWatchlist ? "Von Merkliste entfernen" : "Auf Merkliste setzen"}
                    className={`p-1.5 rounded-lg border transition ${
                      isOnWatchlist
                        ? "bg-emerald-500 text-black border-emerald-400 shadow-sm shadow-emerald-500/20"
                        : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800"
                    }`}
                  >
                    {isOnWatchlist ? (
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-slate-950/50 border border-slate-800 text-center space-y-3">
          <p className="text-xs text-slate-400">
            Keine passenden Empfehlungen mit dem aktuellen Abo-Filter gefunden.
          </p>
          {recOnlyMySubs && (
            <button
              type="button"
              onClick={() => setRecOnlyMySubs(false)}
              className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-bold"
            >
              Alle Anbieter anzeigen (auch außerhalb meiner Abos)
            </button>
          )}
        </div>
      )}
    </section>
  );
}
