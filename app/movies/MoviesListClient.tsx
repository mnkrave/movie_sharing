"use client";

import React, { useState, useMemo } from "react";
import { MediaItem } from "@/lib/tmdb";
import { MediaCard } from "@/components/MediaCard";
import { Search, Filter, X } from "lucide-react";

interface MoviesListClientProps {
  initialMovies: MediaItem[];
}

export function MoviesListClient({ initialMovies }: MoviesListClientProps) {
  const [query, setQuery] = useState("");
  const [selectedDecade, setSelectedDecade] = useState<string>("ALL");
  const [visibleCount, setVisibleCount] = useState(30);

  const filteredMovies = useMemo(() => {
    return initialMovies.filter((movie) => {
      // Search filter
      if (query.trim()) {
        const q = query.toLowerCase();
        const matchesTitle = movie.title.toLowerCase().includes(q);
        const matchesOrig = movie.originalTitle?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesOrig) return false;
      }

      // Decade filter
      if (selectedDecade !== "ALL" && movie.releaseYear) {
        const year = parseInt(movie.releaseYear, 10);
        if (selectedDecade === "2020s" && year < 2020) return false;
        if (selectedDecade === "2010s" && (year < 2010 || year >= 2020)) return false;
        if (selectedDecade === "2000s" && (year < 2000 || year >= 2010)) return false;
        if (selectedDecade === "1990s" && (year < 1990 || year >= 2000)) return false;
        if (selectedDecade === "classic" && year >= 1990) return false;
      }

      return true;
    });
  }, [initialMovies, query, selectedDecade]);

  const displayedMovies = filteredMovies.slice(0, visibleCount);

  return (
    <div className="space-y-6">
      {/* Controls: Search & Decade Filter */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        {/* Search inside list */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="In dieser Liste suchen (z. B. Pate, Batman, Pulp)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-8 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
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

        {/* Decade Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 md:pb-0">
          {[
            { key: "ALL", label: "Alle Jahre" },
            { key: "2020s", label: "2020er" },
            { key: "2010s", label: "2010er" },
            { key: "2000s", label: "2000er" },
            { key: "1990s", label: "1990er" },
            { key: "classic", label: "Klassiker" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedDecade(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedDecade === tab.key
                  ? "bg-sky-500 text-black shadow-md shadow-sky-500/20 font-bold"
                  : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Counter */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Zeige {displayedMovies.length} von {filteredMovies.length} Filmen
        </span>
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setSelectedDecade("ALL");
            }}
            className="text-sky-400 hover:underline"
          >
            Filter zurücksetzen
          </button>
        )}
      </div>

      {/* Grid */}
      {displayedMovies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {displayedMovies.map((movie) => (
            <MediaCard key={movie.id} item={movie} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-slate-900/30 border border-slate-800 text-slate-400">
          Keine Filme gefunden, die zu deinen Such- oder Filterkriterien passen.
        </div>
      )}

      {/* Load More Button */}
      {visibleCount < filteredMovies.length && (
        <div className="flex justify-center pt-8">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + 30)}
            className="px-8 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs border border-slate-700 transition shadow-lg hover:border-sky-400"
          >
            Weitere Filme laden (+30)
          </button>
        </div>
      )}
    </div>
  );
}
