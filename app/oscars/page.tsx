"use client";

import React, { useState, useMemo } from "react";
import { getOscarWinnersList } from "@/lib/tmdb";
import { MediaCard } from "@/components/MediaCard";
import { useMedia } from "@/components/MediaContext";
import { useSession } from "next-auth/react";
import {
  Trophy,
  Star,
  Search,
  CheckCircle2,
  Bookmark,
  Sparkles,
  ArrowUpDown,
  Filter,
  Check,
  RotateCcw,
  Eye,
  Award,
} from "lucide-react";

type DecadeKey =
  | "ALL"
  | "2020s"
  | "2010s"
  | "2000s"
  | "1990s"
  | "1980s"
  | "1970s"
  | "1960s"
  | "classic";

type StatusFilter = "ALL" | "WATCHED" | "UNSEEN" | "WATCHLIST";

type SortOption = "ceremony_desc" | "ceremony_asc" | "oscars_desc" | "rating_desc";

const DECADE_TABS: { key: DecadeKey; label: string; count: number }[] = [
  { key: "ALL", label: "Alle", count: 97 },
  { key: "2020s", label: "2020er", count: 6 },
  { key: "2010s", label: "2010er", count: 10 },
  { key: "2000s", label: "2000er", count: 10 },
  { key: "1990s", label: "1990er", count: 10 },
  { key: "1980s", label: "1980er", count: 10 },
  { key: "1970s", label: "1970er", count: 10 },
  { key: "1960s", label: "1960er", count: 10 },
  { key: "classic", label: "Klassiker (<1960)", count: 31 },
];

export default function OscarsPage() {
  const { data: session } = useSession();
  const { communityData } = useMedia();

  const [selectedDecade, setSelectedDecade] = useState<DecadeKey>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("ceremony_desc");

  const myUserId = (session?.user as any)?.id || "user_lukas";
  const myName = session?.user?.name;

  // Map of current user's media statuses for movies
  const userStatusMap = useMemo(() => {
    const map = new Map<number, { status: "WATCHED" | "WATCHLIST"; rating?: number | null }>();
    if (!communityData?.mediaStatuses) return map;
    for (const m of communityData.mediaStatuses) {
      if (
        m.mediaType === "movie" &&
        (m.userId === myUserId || (myName && m.userName === myName))
      ) {
        map.set(m.tmdbId, { status: m.status, rating: m.rating });
      }
    }
    return map;
  }, [communityData?.mediaStatuses, myUserId, myName]);

  const allWinners = useMemo(() => getOscarWinnersList(), []);
  const totalWinners = allWinners.length;

  const watchedCount = useMemo(() => {
    return allWinners.filter((item) => userStatusMap.get(item.id)?.status === "WATCHED").length;
  }, [allWinners, userStatusMap]);

  const watchlistCount = useMemo(() => {
    return allWinners.filter((item) => userStatusMap.get(item.id)?.status === "WATCHLIST").length;
  }, [allWinners, userStatusMap]);

  const completionPercent = totalWinners > 0 ? Math.round((watchedCount / totalWinners) * 100) : 0;

  // Milestone badge title
  const milestoneBadge = useMemo(() => {
    if (watchedCount === 0) return { label: "Oscar-Neuling", emoji: "🎬", color: "text-slate-400" };
    if (watchedCount < 15) return { label: "Filmfan", emoji: "🍿", color: "text-amber-400" };
    if (watchedCount < 35) return { label: "Kino-Kenner", emoji: "📽️", color: "text-amber-300" };
    if (watchedCount < 60) return { label: "Cineast", emoji: "🏆", color: "text-amber-200" };
    if (watchedCount < 97) return { label: "Oscar-Experte", emoji: "🌟", color: "text-yellow-300" };
    return { label: "Oscar-Legende (Alle gesehen!)", emoji: "👑", color: "text-yellow-400" };
  }, [watchedCount]);

  // Filtered & sorted winners
  const filteredWinners = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = allWinners.filter((item) => {
      const oscar = item.oscarInfo;
      const year = oscar?.ceremonyYear ?? parseInt(item.releaseYear || "0", 10);

      // Decade filter
      if (selectedDecade === "2020s" && year < 2020) return false;
      if (selectedDecade === "2010s" && (year < 2010 || year >= 2020)) return false;
      if (selectedDecade === "2000s" && (year < 2000 || year >= 2010)) return false;
      if (selectedDecade === "1990s" && (year < 1990 || year >= 2000)) return false;
      if (selectedDecade === "1980s" && (year < 1980 || year >= 1990)) return false;
      if (selectedDecade === "1970s" && (year < 1970 || year >= 1980)) return false;
      if (selectedDecade === "1960s" && (year < 1960 || year >= 1970)) return false;
      if (selectedDecade === "classic" && year >= 1960) return false;

      // Status filter
      const userStatus = userStatusMap.get(item.id)?.status;
      if (statusFilter === "WATCHED" && userStatus !== "WATCHED") return false;
      if (statusFilter === "WATCHLIST" && userStatus !== "WATCHLIST") return false;
      if (statusFilter === "UNSEEN" && userStatus === "WATCHED") return false;

      // Search query filter (title, director, category highlight)
      if (query) {
        const matchesTitle = item.title?.toLowerCase().includes(query);
        const matchesDirector = oscar?.director?.toLowerCase().includes(query);
        const matchesCategory = oscar?.categoryHighlight?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDirector && !matchesCategory) return false;
      }

      return true;
    });

    // Sorting
    return filtered.sort((a, b) => {
      const yearA = a.oscarInfo?.ceremonyYear ?? 0;
      const yearB = b.oscarInfo?.ceremonyYear ?? 0;
      const oscarsA = a.oscarInfo?.oscarsWon ?? 0;
      const oscarsB = b.oscarInfo?.oscarsWon ?? 0;
      const nomsA = a.oscarInfo?.nominations ?? 0;
      const nomsB = b.oscarInfo?.nominations ?? 0;
      const voteA = a.voteAverage ?? 0;
      const voteB = b.voteAverage ?? 0;

      if (sortBy === "ceremony_desc") return yearB - yearA;
      if (sortBy === "ceremony_asc") return yearA - yearB;
      if (sortBy === "oscars_desc") {
        if (oscarsB !== oscarsA) return oscarsB - oscarsA;
        return nomsB - nomsA;
      }
      if (sortBy === "rating_desc") return voteB - voteA;
      return 0;
    });
  }, [allWinners, selectedDecade, statusFilter, searchQuery, sortBy, userStatusMap]);

  const hasActiveFilters =
    selectedDecade !== "ALL" || statusFilter !== "ALL" || searchQuery.trim().length > 0;

  const resetFilters = () => {
    setSelectedDecade("ALL");
    setStatusFilter("ALL");
    setSearchQuery("");
    setSortBy("ceremony_desc");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-amber-950/50 via-slate-900/90 to-[#0c101c] border border-amber-500/30 relative overflow-hidden shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40 uppercase tracking-wider">
              <Trophy className="w-4 h-4 text-amber-400" />
              Academy Awards – Bester Film (1929 – 2025)
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Alle 97 Oscar-Gewinner
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Jedes Meisterwerk, das je als „Bester Film“ prämiert wurde. Verfolge deinen
              Fortschritt, filtere nach Jahrzehnten und finde per Klick heraus, wo du sie direkt
              streamen kannst!
            </p>
          </div>

          {/* Progress Tracker Card */}
          <div className="w-full lg:w-80 p-5 rounded-2xl bg-black/40 border border-amber-500/30 backdrop-blur-md space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{milestoneBadge.emoji}</span>
                <span className={`text-xs font-bold uppercase tracking-wider ${milestoneBadge.color}`}>
                  {milestoneBadge.label}
                </span>
              </div>
              <span className="text-sm font-black text-white">{completionPercent}%</span>
            </div>

            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 rounded-full transition-all duration-700 ease-out shadow-sm shadow-amber-400/50"
                style={{ width: `${Math.max(completionPercent, 2)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-0.5">
              <span>
                <strong className="text-amber-300 font-semibold">{watchedCount}</strong> von{" "}
                {totalWinners} Filmen gesehen
              </span>
              {watchlistCount > 0 && (
                <span className="text-[11px] text-slate-400">
                  <span className="text-blue-400 font-medium">{watchlistCount}</span> auf Liste
                </span>
              )}
            </div>

            {totalWinners - watchedCount > 0 && (
              <button
                onClick={() => setStatusFilter("UNSEEN")}
                className="w-full text-center text-[11px] font-semibold text-amber-400/90 hover:text-amber-300 hover:underline pt-1 transition"
              >
                Noch {totalWinners - watchedCount} ungesehene Filme anzeigen →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="space-y-4">
        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Film, Regie oder Stichwort suchen..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/70 transition shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Status Quick Filters */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
              <button
                onClick={() => setStatusFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  statusFilter === "ALL"
                    ? "bg-amber-500 text-black font-bold shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Alle
              </button>
              <button
                onClick={() => setStatusFilter("WATCHED")}
                className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 transition ${
                  statusFilter === "WATCHED"
                    ? "bg-emerald-500 text-black font-bold shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                Gesehen ({watchedCount})
              </button>
              <button
                onClick={() => setStatusFilter("UNSEEN")}
                className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 transition ${
                  statusFilter === "UNSEEN"
                    ? "bg-amber-500 text-black font-bold shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Ungesehen ({totalWinners - watchedCount})
              </button>
              <button
                onClick={() => setStatusFilter("WATCHLIST")}
                className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 transition ${
                  statusFilter === "WATCHLIST"
                    ? "bg-blue-500 text-white font-bold shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                Merkliste ({watchlistCount})
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Sortieren nach"
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-amber-500/70 cursor-pointer transition appearance-none pr-8"
              >
                <option value="ceremony_desc">Neueste Oscars</option>
                <option value="ceremony_asc">Älteste Oscars</option>
                <option value="oscars_desc">Meiste Oscars</option>
                <option value="rating_desc">Beste TMDB-Bewertung</option>
              </select>
              <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Decade Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-1">
          {DECADE_TABS.map((tab) => {
            const isActive = selectedDecade === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setSelectedDecade(tab.key)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                  isActive
                    ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                    : "bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                    isActive ? "bg-black/20 text-black" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-900/60 border border-dashed border-slate-700 flex items-center gap-1 shrink-0 ml-auto transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Filter zurücksetzen
            </button>
          )}
        </div>
      </div>

      {/* Grid Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Zeige <strong className="text-white font-semibold">{filteredWinners.length}</strong> von{" "}
          {totalWinners} Oscar-Gewinnern
        </span>
      </div>

      {/* Empty State */}
      {filteredWinners.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800/80 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500">
            <Trophy className="w-7 h-7 text-slate-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Keine Oscar-Gewinner gefunden</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Für deine aktuelle Filter- und Suchkombination gibt es keine Treffer.
            </p>
          </div>
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Alle Filter zurücksetzen
          </button>
        </div>
      ) : (
        /* Winners Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filteredWinners.map((item, idx) => {
            const userStatus = userStatusMap.get(item.id);
            const isWatched = userStatus?.status === "WATCHED";
            const isWatchlist = userStatus?.status === "WATCHLIST";

            return (
              <div key={item.id} className="flex flex-col group">
                <MediaCard item={item} priority={idx < 5} />
                {item.oscarInfo && (
                  <div className="mt-2 p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80 text-[11px] space-y-1.5 hover:border-amber-500/30 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-400 font-bold">
                        <Trophy className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>Oscar {item.oscarInfo.ceremonyYear}</span>
                      </div>
                      <span className="text-amber-300 font-semibold text-[10px] bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        {item.oscarInfo.oscarsWon} Oscars
                      </span>
                    </div>

                    <p className="text-slate-300 text-[11px] line-clamp-1 font-medium">
                      {item.oscarInfo.categoryHighlight}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5 border-t border-slate-800/60">
                      <span className="line-clamp-1">Regie: {item.oscarInfo.director}</span>
                      {isWatched ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-0.5 shrink-0 ml-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          {userStatus?.rating ? `${userStatus.rating}★` : "Gesehen"}
                        </span>
                      ) : isWatchlist ? (
                        <span className="text-blue-400 font-medium flex items-center gap-0.5 shrink-0 ml-1">
                          <Bookmark className="w-3 h-3 text-blue-400" />
                          Merkliste
                        </span>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
