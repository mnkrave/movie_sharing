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
} from "lucide-react";

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

  useEffect(() => {
    if (watchedItems.length === 0) return;
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

  if (watchedItems.length === 0) {
    return (
      <div className="p-12 rounded-3xl bg-slate-900/50 border border-slate-800 text-center space-y-4">
        <Wand2 className="w-12 h-12 text-emerald-400 mx-auto opacity-80" />
        <h2 className="text-xl font-bold text-white">
          Noch keine Geschmacks-Daten vorhanden
        </h2>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Markiere ein paar Filme oder Serien als gesehen, damit der Empfehlungs-Algorithmus deine Vorlieben analysieren und mit deinen Streaming-Abos abgleichen kann.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={openSearch}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition"
          >
            Filme suchen & bewerten
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-950/30 via-slate-900 to-[#0b1220] border border-emerald-500/30 shadow-2xl space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Wand2 className="w-3.5 h-3.5" />
            <span>Persönlicher Empfehlungs-Algorithmus</span>
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
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-emerald-500 text-black font-black text-xs shadow-lg flex items-center gap-1">
                      <Sparkles className="w-3 h-3 fill-black" />
                      <span>{item.matchScore}% Match</span>
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
                      <p className="text-[11px] text-emerald-300/90 leading-snug line-clamp-2 bg-emerald-950/40 border border-emerald-500/20 rounded-lg p-1.5">
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
