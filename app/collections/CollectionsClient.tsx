"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { CollectionUniverse } from "@/lib/collections";
import { useMedia } from "@/components/MediaContext";
import { useSession } from "next-auth/react";
import {
  Layers,
  Sparkles,
  Film,
  Search,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

interface CollectionsClientProps {
  collections: CollectionUniverse[];
}

export function CollectionsClient({ collections }: CollectionsClientProps) {
  const { communityData } = useMedia();
  const { data: session } = useSession();

  const [selectedCategory, setSelectedCategory] = useState<"all" | "franchise" | "director">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Set of watched tmdbIds by the current user
  const myWatchedIds = useMemo(() => {
    const set = new Set<number>();
    const myId = (session?.user as any)?.id;
    const myName = session?.user?.name;

    communityData.mediaStatuses.forEach((m) => {
      if (m.status === "WATCHED") {
        if ((myId && m.userId === myId) || (myName && m.userName === myName)) {
          set.add(m.tmdbId);
        }
      }
    });
    return set;
  }, [communityData.mediaStatuses, session]);

  // Overall stats
  const overallStats = useMemo(() => {
    const allUniqueMovieIds = new Set<number>();
    collections.forEach((c) => c.movies.forEach((m) => allUniqueMovieIds.add(m.id)));

    let watchedTotal = 0;
    allUniqueMovieIds.forEach((id) => {
      if (myWatchedIds.has(id)) watchedTotal++;
    });

    const percent = allUniqueMovieIds.size > 0 ? Math.round((watchedTotal / allUniqueMovieIds.size) * 100) : 0;
    return {
      totalMovies: allUniqueMovieIds.size,
      watchedMovies: watchedTotal,
      percent,
    };
  }, [collections, myWatchedIds]);

  // Filtered collections
  const filteredCollections = useMemo(() => {
    return collections.filter((col) => {
      if (selectedCategory !== "all" && col.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = col.name.toLowerCase().includes(query);
        const matchesDesc = col.description.toLowerCase().includes(query);
        const matchesMovie = col.movies.some((m) => m.title.toLowerCase().includes(query));
        return matchesName || matchesDesc || matchesMovie;
      }
      return true;
    });
  }, [collections, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 pb-20">
      {/* Hero Header */}
      <div className="relative border-b border-slate-800/80 bg-gradient-to-b from-[#0f172a]/60 via-[#0a0f1d] to-[#07090e] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-3">
                <Layers className="w-3.5 h-3.5" />
                <span>Kino-Universen & Meisterwerke</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                Kollektionen & Universen
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-2xl">
                Tauche ein in die größten Film-Sagas wie Star Wars, Indiana Jones oder Marvel,
                sowie die legendären Werkschauen von Steven Spielberg, Christopher Nolan & mehr.
              </p>
            </div>

            {/* Total progress banner */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex-shrink-0 min-w-[280px]">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  Dein Gesamt-Fortschritt
                </span>
                <span className="font-extrabold text-amber-400 font-mono text-sm">
                  {overallStats.percent}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-700 shadow-sm"
                  style={{ width: `${Math.min(100, Math.max(0, overallStats.percent))}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 font-medium">
                <span>{overallStats.watchedMovies} von {overallStats.totalMovies} Filmen gesehen</span>
                <span>{collections.length} Kollektionen</span>
              </div>
            </div>
          </div>

          {/* Filter Tabs and Search */}
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-2xl border border-slate-800 overflow-x-auto">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedCategory === "all"
                    ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                ✨ Alle ({collections.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory("franchise")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedCategory === "franchise"
                    ? "bg-purple-500 text-white shadow-md shadow-purple-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                🪐 Filmreihen & Universen ({collections.filter((c) => c.category === "franchise").length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory("director")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedCategory === "director"
                    ? "bg-sky-500 text-black shadow-md shadow-sky-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                🎬 Regisseure & Schöpfer ({collections.filter((c) => c.category === "director").length})
              </button>
            </div>

            {/* Live Search */}
            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Kollektion oder Film suchen..."
                className="w-full bg-slate-900/90 border border-slate-800 focus:border-amber-400 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Collections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {filteredCollections.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 text-slate-400">
            <p className="text-base font-semibold text-white">Keine Kollektion gefunden</p>
            <p className="text-xs text-slate-500 mt-1">
              Versuche es mit einem anderen Suchbegriff oder wechsle die Kategorie.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCollections.map((col) => {
              const totalInCol = col.movies.length;
              const watchedInCol = col.movies.filter((m) => myWatchedIds.has(m.id)).length;
              const percentInCol = totalInCol > 0 ? Math.round((watchedInCol / totalInCol) * 100) : 0;
              const isComplete = percentInCol === 100;

              return (
                <Link
                  key={col.id}
                  href={`/collections/${col.id}`}
                  className="group relative flex flex-col rounded-3xl overflow-hidden bg-slate-900/70 border border-slate-800/80 hover:border-amber-500/40 transition duration-300 hover:-translate-y-1 shadow-lg hover:shadow-2xl"
                >
                  {/* Backdrop Header */}
                  <div className="relative h-48 w-full bg-slate-950 overflow-hidden">
                    {col.backdropPath ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w780${col.backdropPath}`}
                        alt={col.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-600">
                        <Film className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-black/30" />

                    {/* Category Badge */}
                    <div className="absolute top-3.5 left-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md border ${
                          col.category === "franchise"
                            ? "bg-purple-950/70 border-purple-500/40 text-purple-300"
                            : "bg-sky-950/70 border-sky-500/40 text-sky-300"
                        }`}
                      >
                        {col.category === "franchise" ? "🪐 Universum" : "🎬 Regisseur"}
                      </span>
                    </div>

                    {/* Movie Count Badge */}
                    <div className="absolute top-3.5 right-3.5 bg-black/60 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full text-[11px] font-bold text-white">
                      {totalInCol} Filme
                    </div>

                    {/* Collection Title over Backdrop */}
                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="text-xl font-black text-white tracking-tight group-hover:text-amber-400 transition leading-snug">
                        {col.name}
                      </h3>
                      <p className="text-xs text-slate-300 font-medium truncate mt-0.5">
                        {col.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {col.description}
                    </p>

                    {/* Movie Poster Previews */}
                    <div className="flex items-center gap-2 pt-1">
                      {col.movies.slice(0, 5).map((m) => (
                        <div
                          key={m.id}
                          className="w-10 h-14 rounded-lg overflow-hidden bg-slate-800 border border-slate-700/60 relative flex-shrink-0 shadow"
                        >
                          {m.posterPath ? (
                            <Image
                              src={`https://image.tmdb.org/t/p/w154${m.posterPath}`}
                              alt={m.title}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-800" />
                          )}
                          {myWatchedIds.has(m.id) && (
                            <div className="absolute inset-0 bg-emerald-500/40 flex items-center justify-center">
                              <CheckCircle2 className="w-3.5 h-3.5 text-white fill-emerald-500" />
                            </div>
                          )}
                        </div>
                      ))}
                      {col.movies.length > 5 && (
                        <div className="w-8 h-14 rounded-lg bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-[11px] font-bold text-slate-400">
                          +{col.movies.length - 5}
                        </div>
                      )}
                    </div>

                    {/* Live Progress Bar */}
                    <div className="pt-2 border-t border-slate-800/80">
                      <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                        <span className="text-slate-300 flex items-center gap-1.5">
                          {isComplete ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          )}
                          <span className={isComplete ? "text-emerald-400 font-bold" : "text-slate-300"}>
                            {isComplete ? "Abgeschlossen! 🏆" : `${watchedInCol} von ${totalInCol} gesehen`}
                          </span>
                        </span>
                        <span
                          className={`font-mono font-bold text-xs ${
                            isComplete ? "text-emerald-400" : percentInCol > 0 ? "text-amber-400" : "text-slate-500"
                          }`}
                        >
                          {percentInCol}%
                        </span>
                      </div>

                      {/* Bar */}
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/40">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isComplete
                              ? "bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-sm shadow-emerald-500/40"
                              : percentInCol > 0
                              ? "bg-gradient-to-r from-amber-500 to-amber-400"
                              : "bg-transparent"
                          }`}
                          style={{ width: `${percentInCol}%` }}
                        />
                      </div>
                    </div>

                    {/* View Details Link */}
                    <div className="flex items-center justify-between pt-1 text-xs font-semibold text-slate-400 group-hover:text-amber-400 transition">
                      <span>Kollektion ansehen</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
