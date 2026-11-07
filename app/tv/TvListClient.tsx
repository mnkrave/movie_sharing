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
  const [visibleCount, setVisibleCount] = useState(30);

  const filteredSeries = useMemo(() => {
    return initialSeries.filter((series) => {
      if (query.trim()) {
        const q = query.toLowerCase();
        const matchesTitle = series.title.toLowerCase().includes(q);
        const matchesOrig = series.originalTitle?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesOrig) return false;
      }
      return true;
    });
  }, [initialSeries, query]);

  const displayedSeries = filteredSeries.slice(0, visibleCount);

  return (
    <div className="space-y-6">
      {/* Controls: Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
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
