"use client";

import React, { useState, useMemo } from "react";
import { MediaItem } from "@/lib/tmdb";
import { MediaCard } from "@/components/MediaCard";
import { Search, X } from "lucide-react";

interface TvListClientProps {
  initialSeries: MediaItem[];
}

export function TvListClient({ initialSeries }: TvListClientProps) {
  const [query, setQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<number | "ALL">("ALL");
  const [visibleCount, setVisibleCount] = useState(30);

  const TV_GENRES = [
    { id: "ALL", label: "Alle Genres" },
    { id: 18, label: "🎭 Drama" },
    { id: 10759, label: "💥 Action & Abenteuer" },
    { id: 35, label: "😂 Comedy" },
    { id: 10765, label: "🚀 Sci-Fi & Fantasy" },
    { id: 80, label: "🕵️ Krimi" },
    { id: 9648, label: "🔍 Mystery" },
    { id: 16, label: "✨ Animation" },
  ];

  const filteredSeries = useMemo(() => {
    return initialSeries.filter((series) => {
      if (query.trim()) {
        const q = query.toLowerCase();
        const matchesTitle = series.title.toLowerCase().includes(q);
        const matchesOrig = series.originalTitle?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesOrig) return false;
      }

      if (selectedGenre !== "ALL") {
        if (!series.genreIds || !series.genreIds.includes(selectedGenre as number)) {
          return false;
        }
      }

      return true;
    });
  }, [initialSeries, query, selectedGenre]);

  const displayedSeries = filteredSeries.slice(0, visibleCount);

  return (
    <div className="space-y-6">
      {/* Controls: Search & Genre Filter */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="In den Top-Serien suchen (z. B. Breaking Bad, Arcane)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-8 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="text-xs text-slate-400">
            Zeige {displayedSeries.length} von {filteredSeries.length} Top-Serien
          </div>
        </div>

        {/* Genre Pill Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1 border-t border-slate-800/60">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mr-1 flex-shrink-0">
            Genre:
          </span>
          {TV_GENRES.map((g) => (
            <button
              key={String(g.id)}
              onClick={() => setSelectedGenre(g.id as any)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedGenre === g.id
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold"
                  : "bg-slate-950/60 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {displayedSeries.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {displayedSeries.map((series) => (
            <MediaCard key={series.id} item={series} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-slate-900/30 border border-slate-800 text-slate-400">
          Keine Serien gefunden, die zu deiner Suche &quot;{query}&quot; passen.
        </div>
      )}

      {/* Load More Button */}
      {visibleCount < filteredSeries.length && (
        <div className="flex justify-center pt-8">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + 30)}
            className="px-8 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs border border-slate-700 transition shadow-lg hover:border-cyan-400"
          >
            Weitere Serien laden (+30)
          </button>
        </div>
      )}
    </div>
  );
}
