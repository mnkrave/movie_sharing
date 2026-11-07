"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { CollectionUniverse, CollectionMovie } from "@/lib/collections";
import { useMedia } from "@/components/MediaContext";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Star,
  Check,
  Plus,
  CheckCircle2,
  Trophy,
  Sparkles,
  Film,
  Calendar,
  Layers,
  Clock,
} from "lucide-react";

interface CollectionDetailClientProps {
  collection: CollectionUniverse;
}

export function CollectionDetailClient({ collection }: CollectionDetailClientProps) {
  const { data: session } = useSession();
  const { communityData, updateMediaStatus, openMediaModal, openRatingModal } = useMedia();

  const [filterMode, setFilterMode] = useState<"all" | "unwatched" | "watched">("all");
  const [sortBy, setSortBy] = useState<"year_asc" | "rating_desc">("year_asc");

  // Map of watched movies by current user
  const myWatchedMap = useMemo(() => {
    const map = new Map<number, { rating?: number | null }>();
    const myId = (session?.user as any)?.id;
    const myName = session?.user?.name;

    communityData.mediaStatuses.forEach((m) => {
      if (m.status === "WATCHED") {
        if ((myId && m.userId === myId) || (myName && m.userName === myName)) {
          map.set(m.tmdbId, { rating: m.rating });
        }
      }
    });
    return map;
  }, [communityData.mediaStatuses, session]);

  // Set of watchlist movies by current user
  const myWatchlistSet = useMemo(() => {
    const set = new Set<number>();
    const myId = (session?.user as any)?.id;
    const myName = session?.user?.name;

    communityData.mediaStatuses.forEach((m) => {
      if (m.status === "WATCHLIST") {
        if ((myId && m.userId === myId) || (myName && m.userName === myName)) {
          set.add(m.tmdbId);
        }
      }
    });
    return set;
  }, [communityData.mediaStatuses, session]);

  // Progress stats
  const totalCount = collection.movies.length;
  const watchedCount = collection.movies.filter((m) => myWatchedMap.has(m.id)).length;
  const remainingCount = totalCount - watchedCount;
  const percent = totalCount > 0 ? Math.round((watchedCount / totalCount) * 100) : 0;
  const isComplete = percent === 100;

  // Sorted and filtered movies
  const displayedMovies = useMemo(() => {
    let list = [...collection.movies];

    if (filterMode === "unwatched") {
      list = list.filter((m) => !myWatchedMap.has(m.id));
    } else if (filterMode === "watched") {
      list = list.filter((m) => myWatchedMap.has(m.id));
    }

    if (sortBy === "year_asc") {
      list.sort((a, b) => (parseInt(a.releaseYear) || 0) - (parseInt(b.releaseYear) || 0));
    } else if (sortBy === "rating_desc") {
      list.sort((a, b) => b.voteAverage - a.voteAverage);
    }

    return list;
  }, [collection.movies, filterMode, sortBy, myWatchedMap]);

  const handleToggleWatched = (movie: CollectionMovie, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session) {
      alert("Bitte logge dich ein, um Filme als gesehen zu markieren!");
      return;
    }
    const watchedInfo = myWatchedMap.get(movie.id);
    openRatingModal({
      tmdbId: movie.id,
      mediaType: "movie",
      title: movie.title,
      posterPath: movie.posterPath,
      releaseYear: movie.releaseYear,
      currentRating: watchedInfo?.rating,
      isWatched: !!watchedInfo,
    });
  };

  const handleToggleWatchlist = async (movie: CollectionMovie, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session) {
      alert("Bitte logge dich ein, um Filme auf deiner Watchlist zu speichern!");
      return;
    }
    const isOnWatchlist = myWatchlistSet.has(movie.id);
    await updateMediaStatus({
      tmdbId: movie.id,
      mediaType: "movie",
      title: movie.title,
      posterPath: movie.posterPath,
      releaseYear: movie.releaseYear,
      status: isOnWatchlist ? "NONE" : "WATCHLIST",
    });
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 pb-24">
      {/* Hero Header with Backdrop */}
      <div className="relative border-b border-slate-800/80 bg-slate-950 overflow-hidden">
        {collection.backdropPath && (
          <div className="absolute inset-0 z-0">
            <Image
              src={`https://image.tmdb.org/t/p/w1280${collection.backdropPath}`}
              alt={collection.name}
              fill
              priority
              className="object-cover opacity-25 filter blur-xs"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/80 to-transparent" />
          </div>
        )}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10">
          {/* Back link */}
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition mb-6 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Zurück zu allen Kollektionen</span>
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md border ${
                    collection.category === "franchise"
                      ? "bg-purple-950/70 border-purple-500/40 text-purple-300"
                      : "bg-sky-950/70 border-sky-500/40 text-sky-300"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  {collection.category === "franchise" ? "Universum / Filmreihe" : "Regisseur-Sammlung"}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-bold text-slate-300">{totalCount} Filme</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                {collection.name}
              </h1>
              <p className="mt-2 text-base text-amber-400/90 font-medium italic">
                &quot;{collection.tagline}&quot;
              </p>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed max-w-2xl">
                {collection.description}
              </p>
            </div>

            {/* Giant Progress Card */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800/90 shadow-2xl backdrop-blur-xl flex-shrink-0 lg:w-96">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {isComplete ? (
                    <Trophy className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Sparkles className="w-5 h-5 text-amber-400" />
                  )}
                  <h3 className="text-sm font-bold text-white">Dein Fortschritt</h3>
                </div>
                <span
                  className={`text-2xl font-black font-mono ${
                    isComplete ? "text-emerald-400" : percent > 0 ? "text-amber-400" : "text-slate-500"
                  }`}
                >
                  {percent}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60 shadow-inner">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isComplete
                      ? "bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-300 shadow-lg shadow-emerald-500/50"
                      : percent > 0
                      ? "bg-gradient-to-r from-amber-500 to-amber-300 shadow-md shadow-amber-500/30"
                      : "bg-transparent"
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              {/* Sub stats */}
              <div className="flex items-center justify-between text-xs text-slate-300 mt-3 pt-3 border-t border-slate-800/80 font-medium">
                <span>
                  <strong className="text-white">{watchedCount}</strong> von {totalCount} gesehen
                </span>
                <span>
                  {isComplete ? (
                    <span className="text-emerald-400 font-bold">100% komplett! 🏆</span>
                  ) : (
                    <span>Noch <strong>{remainingCount}</strong> übrig</span>
                  )}
                </span>
              </div>

              {/* Motivation quote */}
              <p className="text-[11px] text-slate-400 mt-2.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60 leading-tight">
                {isComplete
                  ? "Meisterleistung! Du hast jeden einzelnen Film dieser Kollektion gesehen."
                  : watchedCount > 0
                  ? `Stark! Dir fehlen nur noch ${remainingCount} Filme bis zur Komplettierung.`
                  : "Du hast noch keinen Film dieser Kollektion als gesehen markiert."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Sorting Toolbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-2 rounded-2xl bg-slate-900/60 border border-slate-800">
          {/* Status Filter */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setFilterMode("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                filterMode === "all"
                  ? "bg-amber-500 text-black shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Alle ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("unwatched")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                filterMode === "unwatched"
                  ? "bg-amber-500 text-black shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              ⏳ Ungesehen ({remainingCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("watched")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                filterMode === "watched"
                  ? "bg-emerald-500 text-black shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              ✓ Gesehen ({watchedCount})
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 pr-2">
            <span className="text-xs text-slate-400">Sortieren:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
            >
              <option value="year_asc">Chronologisch (Erscheinungsjahr)</option>
              <option value="rating_desc">Höchstbewertet (TMDB / IMDb)</option>
            </select>
          </div>
        </div>

        {/* Movies Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 mt-6">
          {displayedMovies.map((movie, idx) => {
            const watchedData = myWatchedMap.get(movie.id);
            const isWatched = myWatchedMap.has(movie.id);
            const isOnWatchlist = myWatchlistSet.has(movie.id);

            return (
              <div
                key={movie.id}
                onClick={() =>
                  openMediaModal({
                    id: movie.id,
                    mediaType: "movie",
                    title: movie.title,
                    posterPath: movie.posterPath,
                  })
                }
                className="group relative cursor-pointer flex flex-col rounded-2xl overflow-hidden bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/40 hover:-translate-y-1.5 transition duration-300 shadow-md hover:shadow-2xl"
              >
                {/* Poster Container */}
                <div className="relative aspect-[2/3] w-full bg-slate-950 overflow-hidden">
                  {movie.posterPath ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                      alt={movie.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      className="object-cover group-hover:scale-105 transition duration-500 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-slate-600">
                      <Film className="w-8 h-8 mb-2" />
                      <span className="text-xs">{movie.title}</span>
                    </div>
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition" />

                  {/* Chronological order index */}
                  <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 text-[10px] font-black text-amber-400 font-mono">
                    #{idx + 1}
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 text-[10px] font-bold text-amber-300">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{movie.voteAverage}</span>
                  </div>

                  {/* Watched / Watchlist Status Tag */}
                  {isWatched && (
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-emerald-500/90 backdrop-blur-md text-black font-bold text-xs py-1 px-2 rounded-lg flex items-center justify-center gap-1.5 shadow-lg">
                      <Check className="w-3.5 h-3.5" />
                      <span>Gesehen {watchedData?.rating ? `(${watchedData.rating}/10)` : "✓"}</span>
                    </div>
                  )}

                  {!isWatched && isOnWatchlist && (
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-sky-500/90 backdrop-blur-md text-black font-bold text-xs py-1 px-2 rounded-lg flex items-center justify-center gap-1.5 shadow-lg">
                      <Plus className="w-3.5 h-3.5" />
                      <span>Auf Watchlist</span>
                    </div>
                  )}
                </div>

                {/* Metadata & Quick Action Bar */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-400 transition line-clamp-1 leading-snug">
                      {movie.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{movie.releaseYear}</p>
                  </div>

                  {/* Quick Action buttons */}
                  <div className="flex items-center gap-1 mt-3 pt-2 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={(e) => handleToggleWatched(movie, e)}
                      title={isWatched ? "Als ungesehen markieren" : "Als gesehen markieren"}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition ${
                        isWatched
                          ? "bg-emerald-500 text-black shadow-sm"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                      }`}
                    >
                      <Check className="w-3 h-3" />
                      <span>{isWatched ? "Gesehen" : "Gesehen?"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleToggleWatchlist(movie, e)}
                      title={isOnWatchlist ? "Von Watchlist entfernen" : "Auf Watchlist setzen"}
                      className={`py-1 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition ${
                        isOnWatchlist
                          ? "bg-sky-500 text-black"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
