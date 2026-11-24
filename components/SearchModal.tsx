"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { MediaItem, PersonSearchResult, formatGermanReleaseDate } from "@/lib/tmdb";
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
  User,
} from "lucide-react";
import Image from "next/image";
import { BottomSheetDialog } from "./BottomSheetDialog";

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
  const [persons, setPersons] = useState<PersonSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
      setPersons([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setPersons([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
        setPersons(data.persons || []);
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
    <BottomSheetDialog
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel="Schnellsuche"
      mobilePosition="top"
      showHandle={false}
      maxWidthClass="max-w-2xl"
      panelClassName="bg-[#0e1320] border border-slate-800 max-h-[88dvh] sm:max-h-[82dvh]"
    >
      {/* Search Bar Row with Quick Input & Extended Search Button on Right */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          inputRef.current?.blur();
        }}
        className="flex items-center gap-1.5 sm:gap-2.5 p-2.5 sm:p-3.5 border-b border-slate-800/80 bg-slate-900/60"
      >
        <Search className="w-5 h-5 text-amber-400 flex-shrink-0 ml-1 sm:ml-0" />
        <input
          ref={inputRef}
          type="search"
          enterKeyHint="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filme, Serien oder Stars suchen..."
          aria-label="Filme, Serien oder Schauspieler suchen"
          className="w-full min-w-0 flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none text-sm sm:text-base"
        />
        {loading && <Loader2 className="w-5 h-5 text-amber-400 animate-spin flex-shrink-0" />}
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Suchfeld leeren"
            className="min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center p-2 sm:p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Prominent Extended Search Button on the Right */}
        <Link
          href={query.trim() ? `/search?q=${encodeURIComponent(query)}` : "/search"}
          onClick={onClose}
          className="flex items-center gap-1.5 min-h-[40px] sm:min-h-0 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition hover:scale-102 flex-shrink-0 shadow-sm"
          title="Zur vollständigen Extended Search Seite mit Regie-, Cast- & Länderfiltern"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
          <span className="sm:hidden">Filter</span>
          <span className="hidden sm:inline">Extended Search</span>
          <ChevronRight className="w-3.5 h-3.5 text-amber-400/80 hidden sm:inline" />
        </Link>

        <button
          type="button"
          onClick={onClose}
          aria-label="Suche schließen"
          className="min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center p-2 sm:p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition flex-shrink-0"
          title="Schließen"
        >
          <X className="w-4 h-4" />
        </button>
      </form>

        {/* Results List */}
        <div className="overflow-y-auto overscroll-contain p-3 divide-y divide-slate-800/50 flex-1">
          {/* Person / Actor Results */}
          {persons.length > 0 && (
            <div className="pb-3 mb-2">
              <div className="flex items-center gap-1.5 px-1 py-1 text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Schauspieler:innen & Filmschaffende</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {persons.map((person) => (
                  <Link
                    key={person.id}
                    href={`/person/${person.id}`}
                    onClick={onClose}
                    className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/70 hover:bg-slate-800 border border-slate-800/80 hover:border-amber-500/40 transition group shadow-sm"
                  >
                    <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-800 flex-shrink-0 relative border border-amber-500/30 group-hover:border-amber-400 group-hover:ring-2 group-hover:ring-amber-400/20 transition-all">
                      {person.profilePath ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w185${person.profilePath}`}
                          alt={person.name}
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                          <User className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white group-hover:text-amber-400 transition truncate">
                          {person.name}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition" />
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        {person.knownFor || (person.department === "Directing" ? "Regisseur:in" : "Schauspieler:in")}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

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
            !loading && persons.length === 0 && (
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
    </BottomSheetDialog>
  );
}
