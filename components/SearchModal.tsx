"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { MediaItem, formatGermanReleaseDate } from "@/lib/tmdb";
import {
  Search,
  X,
  Star,
  Film,
  Tv,
  Loader2,
  Award,
  SlidersHorizontal,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia: (item: MediaItem) => void;
  initialMode?: "quick" | "extended";
}

export function SearchModal({
  isOpen,
  onClose,
  onSelectMedia,
}: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#0e1320] border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[82vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Row with Quick Input & Extended Search Button on Right */}
        <div className="flex items-center gap-2.5 p-3.5 border-b border-slate-800/80 bg-slate-900/60">
          <Search className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filme oder Serien suchen (z. B. Inception, Shrek 5, Dune)..."
            className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none text-sm sm:text-base"
          />
          {loading && <Loader2 className="w-5 h-5 text-amber-400 animate-spin flex-shrink-0" />}
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Prominent Extended Search Button on the Right */}
          <Link
            href={query.trim() ? `/search?q=${encodeURIComponent(query)}` : "/search"}
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition hover:scale-102 flex-shrink-0 shadow-sm"
            title="Zur vollständigen Extended Search Seite mit Regie-, Cast- & Länderfiltern"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Extended Search</span>
            <ChevronRight className="w-3.5 h-3.5 text-amber-400/80" />
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition flex-shrink-0"
            title="Schließen"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-3 divide-y divide-slate-800/50 flex-1">
          {results.length > 0 ? (
            results.map((item) => (
              <button
                key={`${item.mediaType}-${item.id}`}
                onClick={() => {
                  onSelectMedia(item);
                  onClose();
                }}
                className="w-full flex items-center gap-4 p-2.5 rounded-xl text-left hover:bg-slate-800/60 transition group"
              >
                <div className="w-12 h-16 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0 relative">
                  {item.posterPath ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w154${item.posterPath}`}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition"
                      sizes="48px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <Film className="w-5 h-5" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-white font-medium truncate group-hover:text-amber-400 transition">
                      {item.title}
                    </h4>
                    {item.oscarInfo && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30 flex-shrink-0">
                        <Award className="w-3 h-3 text-amber-400" />
                        Oscar
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5 mt-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-mono">
                      {item.mediaType === "tv" ? (
                        <>
                          <Tv className="w-3 h-3 text-cyan-400" /> Serie
                        </>
                      ) : (
                        <>
                          <Film className="w-3 h-3 text-amber-400" /> Film
                        </>
                      )}
                    </span>

                    {item.isUpcoming ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/30">
                        <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                        <span>
                          {item.releaseDate
                            ? `Erscheint: ${formatGermanReleaseDate(item.releaseDate)}`
                            : "Upcoming"}
                        </span>
                      </span>
                    ) : (
                      <>
                        {item.releaseYear && <span>{item.releaseYear}</span>}
                        {item.voteAverage > 0 && (
                          <span className="flex items-center gap-1 text-amber-400 font-semibold">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {item.voteAverage}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </button>
            ))
          ) : query.trim() ? (
            !loading && (
              <div className="p-8 text-center text-slate-500 text-sm">
                Keine Ergebnisse für &quot;{query}&quot; gefunden.
                <div className="mt-3">
                  <Link
                    href={`/search?q=${encodeURIComponent(query)}`}
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-bold underline"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>In der Extended Search weitersuchen →</span>
                  </Link>
                </div>
              </div>
            )
          ) : (
            <div className="p-8 text-center text-slate-400 text-sm space-y-4">
              <p className="text-slate-400 max-w-md mx-auto">
                Tippe den Namen eines Films oder einer Serie ein, um direkt Bewertungen,
                Streaming-Abos und Freunde-Tipps zu sehen.
              </p>
              <div className="pt-2">
                <Link
                  href="/search"
                  onClick={onClose}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-amber-500/50 text-amber-300 text-xs font-bold shadow-sm transition hover:scale-102"
                >
                  <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                  <span>Oder gehe zur Extended Search (Regie, Cast, Länder & Genre-Filter)</span>
                  <ChevronRight className="w-4 h-4 text-amber-400" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
