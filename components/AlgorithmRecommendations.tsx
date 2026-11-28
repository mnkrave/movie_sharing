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
  const [expandedReasonIds, setExpandedReasonIds] = useState<Set<number>>(new Set());

  const toggleExpandReason = (id: number) => {
    setExpandedReasonIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

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
        watchlistIds: watchlistItems.map((m) => ({
          tmdbId: m.tmdbId,
          mediaType: m.mediaType,
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
    watchlistItems,
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
      <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-xs space-y-6">
        {/* Setup Header */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-text">
              Geschmacks-Setup für deinen Algorithmus
            </span>
            <span className="text-xs font-bold text-primary-text bg-primary-soft px-3 py-1 rounded-lg border border-primary/30">
              {watchedItems.length} / {TARGET_RATINGS} bewertet (Mind. {MIN_RATINGS_FOR_RECS} für erste Tipps)
            </span>
          </div>

          <h2 className="text-xl sm:text-3xl font-black text-foreground tracking-tight">
            Noch {needed} {needed === 1 ? "Bewertung" : "Bewertungen"} bis zu deinen ersten Empfehlungen!
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Damit der Algorithmus deinen Geschmack versteht, benötigt er mindestens {MIN_RATINGS_FOR_RECS} Bewertungen aus verschiedenen Genres (optimal sind {TARGET_RATINGS} für das volle Profil).
          </p>

          {/* Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs font-semibold text-muted-foreground">
              <span>Fortschritt zur Freischaltung</span>
              <span className="text-primary-text font-bold">{progressPercent}% ({watchedItems.length}/{TARGET_RATINGS})</span>
            </div>
            <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden border border-border">
              <div
                style={{ width: `${Math.max(4, progressPercent)}%` }}
                className="h-full bg-primary rounded-full transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* Quick Rate Deck */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary-text" />
              <span>Schnellbewertung bekannter Titel</span>
            </h3>
            <button
              type="button"
              onClick={openSearch}
              className="text-xs text-primary-text hover:underline font-bold flex items-center gap-1 cursor-pointer"
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
                  className="bg-background/60 border border-border rounded-xl p-3 flex gap-3 items-center group hover:border-border-strong transition relative overflow-hidden"
                >
                  <div
                    onClick={() =>
                      openRatingModal({
                        tmdbId: lm.tmdbId,
                        mediaType: lm.mediaType,
                        title: lm.title,
                        posterPath: lm.posterPath,
                        releaseYear: lm.year,
                      })
                    }
                    className="w-14 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative shadow cursor-pointer hover:opacity-90 transition"
                    title="Klicken für komplette Punkteauswahl (1-10)"
                  >
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
                      <span className="text-[10px] text-muted-foreground font-semibold uppercase">
                        {lm.mediaType === "tv" ? "Serie" : "Film"} · {lm.year}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSkipLandmark(lm.tmdbId)}
                        title="Überspringen"
                        className="text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4
                      onClick={() =>
                        openRatingModal({
                          tmdbId: lm.tmdbId,
                          mediaType: lm.mediaType,
                          title: lm.title,
                          posterPath: lm.posterPath,
                          releaseYear: lm.year,
                        })
                      }
                      className="text-xs font-bold text-foreground truncate cursor-pointer hover:text-primary-text transition"
                    >
                      {lm.title}
                    </h4>

                    <div className="flex items-center gap-1 pt-0.5 flex-wrap">
                      {[10, 8, 6].map((score) => (
                        <button
                          key={score}
                          type="button"
                          onClick={() => handleQuickRate(lm, score)}
                          className="px-2 py-1 rounded-md bg-muted hover:bg-primary hover:text-primary-foreground border border-border text-foreground text-[10px] font-bold transition cursor-pointer"
                        >
                          {score}★
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() =>
                          openRatingModal({
                            tmdbId: lm.tmdbId,
                            mediaType: lm.mediaType,
                            title: lm.title,
                            posterPath: lm.posterPath,
                            releaseYear: lm.year,
                          })
                        }
                        className="px-2 py-1 rounded-md bg-primary-soft text-primary-text border border-primary/30 text-[10px] font-bold transition cursor-pointer"
                      >
                        1–10
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center rounded-xl bg-muted/50 border border-border text-muted-foreground text-xs">
              Alle Starter-Vorschläge bewertet oder übersprungen. Nutze die Suche, um weitere Titel hinzuzufügen.
            </div>
          )}
        </div>

        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={openSearch}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs transition shadow-sm cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Eigene Titel suchen ({watchedItems.length}/{TARGET_RATINGS})</span>
          </button>
        </div>
      </div>
    );
  }

  const isPrecisionActive = watchedItems.length >= TARGET_RATINGS;
  const progressPercent = Math.min(100, Math.round((watchedItems.length / TARGET_RATINGS) * 100));

  return (
    <section className="p-5 sm:p-8 rounded-2xl bg-card border border-border shadow-xs space-y-6">
      {!isPrecisionActive && (
        <div className="p-4 rounded-xl bg-muted/60 border border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-bold text-primary-text">
              Basis-Modus ({watchedItems.length} / {TARGET_RATINGS} bewertet · {progressPercent}%)
            </span>
            <p className="text-xs text-muted-foreground">
              Noch <strong className="text-foreground">{TARGET_RATINGS - watchedItems.length} Titel</strong> bis zum vollständigen Profil mit maximaler Treffsicherheit.
            </p>
          </div>

          {availableLandmarks.length > 0 && (
            <button
              type="button"
              onClick={() => setShowMoreQuickRatings(!showMoreQuickRatings)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card hover:bg-muted text-foreground border border-border text-xs font-semibold transition self-start md:self-auto cursor-pointer"
            >
              <span>{showMoreQuickRatings ? "Schnellbewertung schließen" : "Weitere Titel bewerten"}</span>
              {showMoreQuickRatings ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      )}

      {!isPrecisionActive && showMoreQuickRatings && availableLandmarks.length > 0 && (
        <div className="p-4 rounded-xl bg-background/60 border border-border space-y-3 animate-in fade-in">
          <div className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
            <span>Schnell bewerten:</span>
            <span>{availableLandmarks.length} Vorschläge verfügbar</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {availableLandmarks.slice(0, 8).map((lm) => (
              <div
                key={`${lm.mediaType}-${lm.tmdbId}`}
                className="bg-card border border-border rounded-xl p-2.5 flex gap-2.5 items-center"
              >
                <div
                  onClick={() =>
                    openRatingModal({
                      tmdbId: lm.tmdbId,
                      mediaType: lm.mediaType,
                      title: lm.title,
                      posterPath: lm.posterPath,
                      releaseYear: lm.year,
                    })
                  }
                  className="w-12 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative cursor-pointer"
                >
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
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase">
                      {lm.mediaType === "tv" ? "Serie" : "Film"} · {lm.year}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSkipLandmark(lm.tmdbId)}
                      className="text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <h5 className="text-xs font-bold text-foreground truncate">{lm.title}</h5>
                  <div className="flex items-center gap-1 pt-0.5 flex-wrap">
                    {[10, 8, 6].map((score) => (
                      <button
                        key={score}
                        type="button"
                        onClick={() => handleQuickRate(lm, score)}
                        className="px-1.5 py-0.5 rounded bg-muted hover:bg-primary hover:text-primary-foreground text-foreground text-[10px] font-bold cursor-pointer"
                      >
                        {score}★
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-primary-text">
            {isPrecisionActive
              ? `Vollständiges Geschmacks-Profil (${watchedItems.length} Titel)`
              : "Persönlicher Empfehlungs-Algorithmus"}
          </p>
          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            Maßgeschneidert für deinen Geschmack & deine Abos
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl">
            Berechnet aus deinen <strong className="text-foreground">{watchedItems.length} gesehenen Titeln</strong>, Bewertungen und{" "}
            <strong className="text-foreground">{userSubscriptions.length} Streaming-Abos</strong>.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted border border-border">
            {(
              [
                { key: "ALL", label: "Alle" },
                { key: "movie", label: "Filme" },
                { key: "tv", label: "Serien" },
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setRecMediaType(t.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  recMediaType === t.key
                    ? "bg-card text-foreground shadow-xs border border-border"
                    : "text-muted-foreground hover:text-foreground border border-transparent"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setRecOnlyMySubs(!recOnlyMySubs)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
              recOnlyMySubs
                ? "bg-primary-soft border-primary/40 text-primary-text"
                : "bg-background border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Nur meine Abos</span>
          </button>

          <button
            type="button"
            onClick={() => setRecExcludeWatchlist(!recExcludeWatchlist)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
              recExcludeWatchlist
                ? "bg-primary-soft border-primary/40 text-primary-text"
                : "bg-background border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {recExcludeWatchlist ? "Watchlist ausgeblendet" : "Inkl. Watchlist"}
          </button>

          <button
            type="button"
            onClick={() => setRecRefreshCounter((c) => c + 1)}
            disabled={loadingRecs}
            title="Empfehlungen neu berechnen"
            className="p-2 rounded-xl bg-background border border-border text-muted-foreground hover:text-foreground transition disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loadingRecs ? "animate-spin text-primary-text" : ""}`} />
          </button>
        </div>
      </div>

      {/* Detected Taste Vector */}
      {tasteSummary && (tasteSummary.topGenres.length > 0 || tasteSummary.topKeywords.length > 0) && (
        <div className="p-3.5 rounded-xl bg-muted/50 border border-border flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary-text flex items-center gap-1 mr-1">
            <Tag className="w-3.5 h-3.5" />
            <span>Geschmacks-Profil:</span>
          </span>
          {tasteSummary.topGenres.slice(0, 4).map((g) => (
            <span
              key={g.id}
              className="px-2.5 py-0.5 rounded-md bg-card border border-border text-foreground text-xs font-semibold"
            >
              {g.name}
            </span>
          ))}
          {tasteSummary.topKeywords.slice(0, 5).map((kw) => (
            <span
              key={kw.id}
              className="px-2 py-0.5 rounded-md bg-card border border-border text-muted-foreground text-[11px] font-medium"
            >
              #{kw.name}
            </span>
          ))}
          {tasteSummary.favoriteDirectors?.slice(0, 2).map((dir) => (
            <span
              key={`dir_${dir}`}
              className="px-2 py-0.5 rounded-md bg-primary-soft border border-primary/30 text-primary-text text-[11px] font-semibold"
            >
              Regie: {dir}
            </span>
          ))}
          {tasteSummary.favoriteActors?.slice(0, 2).map((actor) => (
            <span
              key={`act_${actor}`}
              className="px-2 py-0.5 rounded-md bg-card border border-border text-foreground text-[11px] font-medium"
            >
              {actor}
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
              className="aspect-[2/3] rounded-2xl bg-muted border border-border animate-pulse"
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
                className="group cursor-pointer rounded-2xl bg-background/60 border border-border hover:border-primary/50 overflow-hidden flex flex-col justify-between transition duration-300 shadow-xs"
              >
                <div>
                  <div className="relative aspect-[2/3] w-full bg-muted overflow-hidden">
                    {item.posterPath ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w500${item.posterPath}`}
                        alt={item.title}
                        fill
                        sizes="220px"
                        className="object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Film className="w-8 h-8" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[11px] shadow">
                      {item.matchScore}% Match
                    </div>

                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-amber-400 font-bold text-[11px] flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{item.voteAverage}</span>
                    </div>

                    {displayProviders.length > 0 && (
                      <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1 flex-wrap">
                        {displayProviders.slice(0, 2).map((p) => (
                          <div
                            key={p.providerId}
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold backdrop-blur-md ${
                              p.isMySub
                                ? "bg-amber-500/95 text-slate-950"
                                : "bg-black/75 text-slate-200"
                            }`}
                          >
                            <span className="truncate max-w-[80px]">{p.providerName}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-3 space-y-2">
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase font-semibold">
                        <span>{item.mediaType === "tv" ? "Serie" : "Film"}</span>
                        <span>{item.releaseYear}</span>
                      </div>
                      <h4 className="text-xs font-bold text-foreground line-clamp-1 group-hover:text-primary-text transition mt-0.5">
                        {item.title}
                      </h4>
                    </div>

                    {item.seriesNote && (
                      <div className="text-[10px] leading-snug rounded-lg px-2 py-1 bg-primary-soft text-primary-text font-medium">
                        {item.seriesNote}
                      </div>
                    )}

                    {item.reasons.length > 0 && (() => {
                      const isExpanded = expandedReasonIds.has(item.id);
                      return (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpandReason(item.id);
                          }}
                          className="text-[11px] leading-snug rounded-lg p-2 bg-muted/70 border border-border text-foreground/85 cursor-pointer select-none"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <p className={isExpanded ? "font-medium" : "line-clamp-2"}>
                              {item.reasons[0]}
                            </p>
                            <span className="text-muted-foreground flex-shrink-0 mt-0.5">
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </span>
                          </div>

                          {isExpanded && (
                            <div className="mt-2 pt-2 border-t border-border space-y-1">
                              {item.reasons.slice(1).map((r, i) => (
                                <p key={i} className="text-[10px] text-muted-foreground">
                                  • {r}
                                </p>
                              ))}
                              {item.seedTitles && item.seedTitles.length > 0 && (
                                <div className="pt-1 flex flex-wrap gap-1">
                                  {item.seedTitles.map((st, i) => (
                                    <span
                                      key={i}
                                      className="px-1.5 py-0.5 rounded bg-card border border-border text-[10px] text-primary-text font-medium"
                                    >
                                      ✓ {st}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>

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
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-card hover:bg-primary hover:text-primary-foreground text-foreground text-[11px] font-semibold border border-border transition cursor-pointer"
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
                    className={`p-1.5 rounded-lg border transition cursor-pointer ${
                      isOnWatchlist
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card hover:bg-muted text-muted-foreground hover:text-foreground border-border"
                    }`}
                  >
                    {isOnWatchlist ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 rounded-xl bg-muted/40 border border-border text-center space-y-3">
          <p className="text-xs text-muted-foreground">
            Keine passenden Empfehlungen mit dem aktuellen Abo-Filter gefunden.
          </p>
          {recOnlyMySubs && (
            <button
              type="button"
              onClick={() => setRecOnlyMySubs(false)}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold cursor-pointer"
            >
              Alle Anbieter anzeigen
            </button>
          )}
        </div>
      )}
    </section>
  );
}
