"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
  RotateCcw,
  Sparkles,
  ChevronRight,
  Filter,
  Check,
} from "lucide-react";
import Image from "next/image";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia: (item: MediaItem) => void;
  initialMode?: "quick" | "extended";
}

const EXTENDED_GENRES = [
  { id: null, label: "Alle Genres", emoji: "✨" },
  { id: 28, label: "Action", emoji: "💥" },
  { id: 878, label: "Sci-Fi", emoji: "🚀" },
  { id: 53, label: "Thriller", emoji: "😱" },
  { id: 35, label: "Komödie", emoji: "😂" },
  { id: 18, label: "Drama", emoji: "🎭" },
  { id: 80, label: "Krimi", emoji: "🕵️" },
  { id: 12, label: "Abenteuer", emoji: "🗺️" },
  { id: 14, label: "Fantasy", emoji: "🧙‍♂️" },
  { id: 16, label: "Animation", emoji: "✨" },
  { id: 27, label: "Horror", emoji: "🩸" },
  { id: 99, label: "Doku", emoji: "🎥" },
  { id: 10749, label: "Romantik", emoji: "❤️" },
  { id: 36, label: "Historie", emoji: "📜" },
  { id: 10752, label: "Kriegsfilm", emoji: "🪖" },
];

const COUNTRIES = [
  { code: "ALL", label: "Alle Länder", flag: "🌍" },
  { code: "US", label: "USA", flag: "🇺🇸" },
  { code: "DE", label: "Deutschland", flag: "🇩🇪" },
  { code: "GB", label: "Großbritannien", flag: "🇬🇧" },
  { code: "JP", label: "Japan", flag: "🇯🇵" },
  { code: "KR", label: "Südkorea", flag: "🇰🇷" },
  { code: "FR", label: "Frankreich", flag: "🇫🇷" },
  { code: "ES", label: "Spanien", flag: "🇪🇸" },
  { code: "IT", label: "Italien", flag: "🇮🇹" },
  { code: "CA", label: "Kanada", flag: "🇨🇦" },
  { code: "AU", label: "Australien", flag: "🇦🇺" },
  { code: "DK", label: "Dänemark", flag: "🇩🇰" },
  { code: "SE", label: "Schweden", flag: "🇸🇪" },
];

const POPULAR_DIRECTORS = [
  "Christopher Nolan",
  "Quentin Tarantino",
  "Martin Scorsese",
  "Steven Spielberg",
  "David Fincher",
  "Denis Villeneuve",
  "James Cameron",
  "Ridley Scott",
  "Wes Anderson",
  "Hayao Miyazaki",
];

const POPULAR_ACTORS = [
  "Leonardo DiCaprio",
  "Cillian Murphy",
  "Brad Pitt",
  "Christian Bale",
  "Tom Hardy",
  "Margot Robbie",
  "Ryan Gosling",
  "Keanu Reeves",
  "Robert De Niro",
  "Tom Hanks",
];

const ERAS = [
  { id: "all", label: "Alle Jahre" },
  { id: "new", label: "✨ 2024–2026" },
  { id: "2020s", label: "2020er" },
  { id: "2010s", label: "2010er" },
  { id: "2000s", label: "2000er" },
  { id: "1990s", label: "90er" },
  { id: "classics", label: "🎞️ Klassiker (<1990)" },
];

const RATINGS = [
  { value: 0, label: "Alle" },
  { value: 7.0, label: "★ 7.0+" },
  { value: 7.5, label: "★ 7.5+" },
  { value: 8.0, label: "★ 8.0+" },
  { value: 8.5, label: "★ 8.5+" },
];

export function SearchModal({
  isOpen,
  onClose,
  onSelectMedia,
  initialMode = "quick",
}: SearchModalProps) {
  const [searchMode, setSearchMode] = useState<"quick" | "extended">(initialMode);

  // Quick Search State
  const [query, setQuery] = useState("");
  const [quickResults, setQuickResults] = useState<MediaItem[]>([]);
  const [quickLoading, setQuickLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Extended Search State
  const [extMediaType, setExtMediaType] = useState<"all" | "movie" | "tv">("all");
  const [extGenreId, setExtGenreId] = useState<number | null>(null);
  const [extDirector, setExtDirector] = useState("");
  const [extActor, setExtActor] = useState("");
  const [extCountry, setExtCountry] = useState("ALL");
  const [extMinRating, setExtMinRating] = useState<number>(0);
  const [extEra, setExtEra] = useState<string>("all");
  const [extSortBy, setExtSortBy] = useState<
    "popularity.desc" | "vote_average.desc" | "primary_release_date.desc"
  >("popularity.desc");
  const [extQuery, setExtQuery] = useState("");

  const [extendedResults, setExtendedResults] = useState<MediaItem[]>([]);
  const [extendedLoading, setExtendedLoading] = useState(false);

  // Reset or initialize on open
  useEffect(() => {
    if (isOpen) {
      setSearchMode(initialMode || "quick");
      if ((initialMode || "quick") === "quick") {
        setTimeout(() => inputRef.current?.focus(), 60);
      }
    } else {
      setQuery("");
      setQuickResults([]);
    }
  }, [isOpen, initialMode]);

  // Quick search debounce
  useEffect(() => {
    if (searchMode !== "quick") return;

    if (!query.trim()) {
      setQuickResults([]);
      setQuickLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setQuickLoading(true);
      try {
        const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setQuickResults(data.results || []);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setQuickLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query, searchMode]);

  // Extended search fetch function
  const fetchExtendedResults = useCallback(async () => {
    setExtendedLoading(true);
    try {
      const params = new URLSearchParams();
      if (extMediaType !== "all") params.set("mediaType", extMediaType);
      if (extGenreId !== null) params.set("genreId", String(extGenreId));
      if (extDirector.trim()) params.set("director", extDirector.trim());
      if (extActor.trim()) params.set("actor", extActor.trim());
      if (extCountry !== "ALL") params.set("country", extCountry);
      if (extMinRating > 0) params.set("minRating", String(extMinRating));
      if (extEra !== "all") params.set("era", extEra);
      if (extSortBy) params.set("sortBy", extSortBy);
      if (extQuery.trim()) params.set("query", extQuery.trim());

      const res = await fetch(`/api/tmdb/discover?${params.toString()}`);
      const data = await res.json();
      setExtendedResults(data.results || []);
    } catch (err) {
      console.error("Extended discover error:", err);
    } finally {
      setExtendedLoading(false);
    }
  }, [
    extMediaType,
    extGenreId,
    extDirector,
    extActor,
    extCountry,
    extMinRating,
    extEra,
    extSortBy,
    extQuery,
  ]);

  // Trigger extended discover on changes
  useEffect(() => {
    if (searchMode !== "extended" || !isOpen) return;

    const timer = setTimeout(() => {
      fetchExtendedResults();
    }, 320);

    return () => clearTimeout(timer);
  }, [
    searchMode,
    isOpen,
    extMediaType,
    extGenreId,
    extDirector,
    extActor,
    extCountry,
    extMinRating,
    extEra,
    extSortBy,
    extQuery,
    fetchExtendedResults,
  ]);

  // Check if any extended filter is actively modified
  const activeFilterCount =
    (extMediaType !== "all" ? 1 : 0) +
    (extGenreId !== null ? 1 : 0) +
    (extDirector.trim() ? 1 : 0) +
    (extActor.trim() ? 1 : 0) +
    (extCountry !== "ALL" ? 1 : 0) +
    (extMinRating > 0 ? 1 : 0) +
    (extEra !== "all" ? 1 : 0) +
    (extQuery.trim() ? 1 : 0);

  const resetExtendedFilters = () => {
    setExtMediaType("all");
    setExtGenreId(null);
    setExtDirector("");
    setExtActor("");
    setExtCountry("ALL");
    setExtMinRating(0);
    setExtEra("all");
    setExtSortBy("popularity.desc");
    setExtQuery("");
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-14 p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className={`bg-[#0d121f] border border-slate-800 rounded-2xl w-full shadow-2xl overflow-hidden flex flex-col transition-all duration-200 ${
          searchMode === "extended" ? "max-w-4xl max-h-[92vh]" : "max-w-2xl max-h-[82vh]"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar with Mode Switcher & Close Button */}
        <div className="flex items-center justify-between px-3.5 py-3 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/70 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setSearchMode("quick");
                setTimeout(() => inputRef.current?.focus(), 60);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                searchMode === "quick"
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Schnelle Suche</span>
            </button>

            <button
              type="button"
              onClick={() => setSearchMode("extended")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                searchMode === "extended"
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-sm"
                  : "text-amber-400 hover:text-amber-300 hover:bg-slate-800/50"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Extended Search</span>
              {activeFilterCount > 0 && (
                <span className="ml-1 w-4 h-4 rounded-full bg-slate-950 text-amber-300 text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {searchMode === "quick" && (
              <button
                type="button"
                onClick={() => setSearchMode("extended")}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition"
              >
                <span>Extended Search</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Schließen (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ----------------- MODE 1: QUICK SEARCH ----------------- */}
        {searchMode === "quick" && (
          <>
            <div className="flex items-center gap-3 p-3.5 border-b border-slate-800/80 bg-slate-900/40">
              <Search className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filme oder Serien suchen (z. B. Inception, Breaking Bad, Dune)..."
                className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none text-base"
              />
              {quickLoading && (
                <Loader2 className="w-5 h-5 text-amber-400 animate-spin flex-shrink-0" />
              )}
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Prominent Quick Shortcut Button on the Right */}
              <button
                type="button"
                onClick={() => setSearchMode("extended")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-semibold transition hover:scale-102 flex-shrink-0 shadow-sm"
                title="Erweiterte Suche nach Regie, Schauspielern, Land & Genre"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Extended Search</span>
                <ChevronRight className="w-3.5 h-3.5 text-amber-400/80" />
              </button>
            </div>

            <div className="overflow-y-auto p-3 divide-y divide-slate-800/50 flex-1">
              {quickResults.length > 0 ? (
                quickResults.map((item) => (
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
                !quickLoading && (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    Keine Ergebnisse für &quot;{query}&quot; gefunden.
                    <div className="mt-3">
                      <button
                        onClick={() => {
                          setExtQuery(query);
                          setSearchMode("extended");
                        }}
                        className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium underline"
                      >
                        In der Extended Search weitersuchen →
                      </button>
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
                    <button
                      onClick={() => setSearchMode("extended")}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-amber-500/50 text-amber-300 text-xs font-semibold shadow-sm transition hover:scale-102"
                    >
                      <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                      <span>Oder nutze die Extended Search mit Regie-, Schauspieler- & Länderfiltern</span>
                      <ChevronRight className="w-4 h-4 text-amber-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ----------------- MODE 2: EXTENDED SEARCH ----------------- */}
        {searchMode === "extended" && (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Filter Control Section */}
            <div className="p-4 bg-slate-900/40 border-b border-slate-800/80 space-y-3.5 overflow-y-auto max-h-[48vh] scrollbar-thin">
              {/* Row 1: Format Toggle, Sortier-Optionen, Reset Button */}
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                {/* Format Pills */}
                <div className="flex items-center gap-1 p-0.5 bg-slate-950/80 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setExtMediaType("all")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      extMediaType === "all"
                        ? "bg-amber-500 text-slate-950 shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Alle Formate
                  </button>
                  <button
                    type="button"
                    onClick={() => setExtMediaType("movie")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      extMediaType === "movie"
                        ? "bg-amber-500 text-slate-950 shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Nur Filme</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setExtMediaType("tv")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      extMediaType === "tv"
                        ? "bg-cyan-500 text-slate-950 shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Tv className="w-3.5 h-3.5" />
                    <span>Nur Serien</span>
                  </button>
                </div>

                {/* Sort Option Pills & Reset */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setExtSortBy("popularity.desc")}
                      className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                        extSortBy === "popularity.desc"
                          ? "bg-slate-800 text-amber-300 font-semibold"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      🔥 Beliebt
                    </button>
                    <button
                      type="button"
                      onClick={() => setExtSortBy("vote_average.desc")}
                      className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                        extSortBy === "vote_average.desc"
                          ? "bg-slate-800 text-amber-300 font-semibold"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      ⭐ Beste
                    </button>
                    <button
                      type="button"
                      onClick={() => setExtSortBy("primary_release_date.desc")}
                      className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                        extSortBy === "primary_release_date.desc"
                          ? "bg-slate-800 text-amber-300 font-semibold"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      📅 Neueste
                    </button>
                  </div>

                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={resetExtendedFilters}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition"
                      title="Alle Filter zurücksetzen"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset ({activeFilterCount})</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Row 2: Optional Title / Keyword Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={extQuery}
                  onChange={(e) => setExtQuery(e.target.value)}
                  placeholder="Optional: Nach Titel oder Stichwort filtern..."
                  className="w-full pl-9 pr-8 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                />
                {extQuery && (
                  <button
                    type="button"
                    onClick={() => setExtQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Row 3: Regie (Director) Filter + Quick Chips */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    🎬 Regie (Director)
                  </span>
                  {extDirector && (
                    <button
                      type="button"
                      onClick={() => setExtDirector("")}
                      className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1"
                    >
                      <span>Löschen</span>
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={extDirector}
                    onChange={(e) => setExtDirector(e.target.value)}
                    placeholder="Regisseur eingeben (z. B. Christopher Nolan, Tarantino, Scorsese)..."
                    className="flex-1 px-3 py-1.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                {/* Popular Director Chips */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {POPULAR_DIRECTORS.map((name) => {
                    const isSelected =
                      extDirector.toLowerCase().trim() === name.toLowerCase().trim();
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setExtDirector(isSelected ? "" : name)}
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition ${
                          isSelected
                            ? "bg-amber-500 text-slate-950 font-bold"
                            : "bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:border-slate-700"
                        }`}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 4: Schauspieler:in (Cast) Filter + Quick Chips */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                  <span className="flex items-center gap-1.5 text-cyan-400">
                    🎭 Schauspieler:in (Cast)
                  </span>
                  {extActor && (
                    <button
                      type="button"
                      onClick={() => setExtActor("")}
                      className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1"
                    >
                      <span>Löschen</span>
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={extActor}
                    onChange={(e) => setExtActor(e.target.value)}
                    placeholder="Schauspieler:in eingeben (z. B. Leonardo DiCaprio, Cillian Murphy)..."
                    className="flex-1 px-3 py-1.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                {/* Popular Actor Chips */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {POPULAR_ACTORS.map((name) => {
                    const isSelected =
                      extActor.toLowerCase().trim() === name.toLowerCase().trim();
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setExtActor(isSelected ? "" : name)}
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition ${
                          isSelected
                            ? "bg-cyan-500 text-slate-950 font-bold"
                            : "bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:border-slate-700"
                        }`}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 5: Herkunftsland (Country) */}
              <div className="space-y-1.5">
                <div className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                  <span>🌍 Herkunftsland</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {COUNTRIES.map((c) => {
                    const isSelected = extCountry === c.code;
                    return (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => setExtCountry(c.code)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                          isSelected
                            ? "bg-amber-500 text-slate-950 font-bold"
                            : "bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:border-slate-700"
                        }`}
                      >
                        <span>{c.flag}</span>
                        <span>{c.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 6: Kategorien & Genres */}
              <div className="space-y-1.5">
                <div className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                  <span>🏷️ Genre & Kategorie</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {EXTENDED_GENRES.map((g) => {
                    const isSelected = extGenreId === g.id;
                    return (
                      <button
                        key={g.label}
                        type="button"
                        onClick={() => setExtGenreId(g.id)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                          isSelected
                            ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold"
                            : "bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:border-slate-700"
                        }`}
                      >
                        <span>{g.emoji}</span>
                        <span>{g.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 7: Mindestbewertung & Ära (Grid 2-spaltig) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Mindestbewertung */}
                <div className="space-y-1.5">
                  <span className="text-xs text-slate-300 font-semibold block">
                    ⭐ Mindestbewertung
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {RATINGS.map((r) => {
                      const isSelected = extMinRating === r.value;
                      return (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => setExtMinRating(r.value)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                            isSelected
                              ? "bg-amber-400 text-slate-950 font-bold"
                              : "bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:border-slate-700"
                          }`}
                        >
                          {r.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Zeitraum / Ära */}
                <div className="space-y-1.5">
                  <span className="text-xs text-slate-300 font-semibold block">
                    📅 Erscheinungsjahr
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {ERAS.map((era) => {
                      const isSelected = extEra === era.id;
                      return (
                        <button
                          key={era.id}
                          type="button"
                          onClick={() => setExtEra(era.id)}
                          className={`px-2 py-1 rounded-lg text-xs font-medium transition ${
                            isSelected
                              ? "bg-amber-400 text-slate-950 font-bold"
                              : "bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:border-slate-700"
                          }`}
                        >
                          {era.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Results Grid Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/90 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-300">
                  Ergebnisse ({extendedResults.length})
                </span>
                {extendedLoading && (
                  <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                )}
              </div>

              {/* Active Filter Badges Preview */}
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 overflow-hidden text-ellipsis whitespace-nowrap">
                {extDirector && (
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    Regie: {extDirector}
                  </span>
                )}
                {extActor && (
                  <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    Cast: {extActor}
                  </span>
                )}
                {extGenreId && (
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    Genre: {EXTENDED_GENRES.find((g) => g.id === extGenreId)?.label}
                  </span>
                )}
                {extCountry !== "ALL" && (
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                    Land: {COUNTRIES.find((c) => c.code === extCountry)?.label}
                  </span>
                )}
                {extMinRating > 0 && (
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    ★ {extMinRating}+
                  </span>
                )}
              </div>
            </div>

            {/* Results Grid Body */}
            <div className="overflow-y-auto p-4 flex-1">
              {extendedLoading && extendedResults.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-3">
                  <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                  <p className="text-sm">Filtere Filme & Serien aus der TMDB-Datenbank...</p>
                </div>
              ) : extendedResults.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                  {extendedResults.map((item) => (
                    <button
                      key={`${item.mediaType}-${item.id}`}
                      type="button"
                      onClick={() => {
                        onSelectMedia(item);
                        onClose();
                      }}
                      className="group flex flex-col text-left bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-amber-500/40 rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-1 shadow-sm"
                    >
                      <div className="w-full aspect-[2/3] bg-slate-800 relative overflow-hidden">
                        {item.posterPath ? (
                          <Image
                            src={`https://image.tmdb.org/t/p/w342${item.posterPath}`}
                            alt={item.title}
                            fill
                            className="object-cover group-hover:scale-105 transition duration-300"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600">
                            <Film className="w-8 h-8" />
                          </div>
                        )}

                        {/* Top Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                          <span className="px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-md text-[10px] font-bold font-mono text-slate-200 border border-white/10 flex items-center gap-1">
                            {item.mediaType === "tv" ? (
                              <>
                                <Tv className="w-2.5 h-2.5 text-cyan-400" /> TV
                              </>
                            ) : (
                              <>
                                <Film className="w-2.5 h-2.5 text-amber-400" /> Film
                              </>
                            )}
                          </span>

                          {item.oscarInfo && (
                            <span className="flex items-center gap-1 text-[9px] font-bold bg-amber-500/90 text-slate-950 px-1 py-0.5 rounded shadow">
                              <Award className="w-2.5 h-2.5" />
                              Oscar
                            </span>
                          )}
                        </div>

                        {item.isUpcoming ? (
                          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-500 to-orange-500 text-[10px] font-black text-slate-950 shadow flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5 fill-slate-950" />
                            <span>Upcoming</span>
                          </div>
                        ) : item.voteAverage > 0 ? (
                          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md text-[11px] font-bold text-amber-400 border border-amber-500/30 flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-amber-400" />
                            <span>{item.voteAverage.toFixed(1)}</span>
                          </div>
                        ) : null}
                      </div>

                      <div className="p-2.5 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-white text-xs sm:text-sm font-semibold line-clamp-2 group-hover:text-amber-400 transition">
                            {item.title}
                          </h4>
                        </div>
                        <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
                          <span className={item.isUpcoming ? "text-amber-300 font-semibold text-[10px]" : ""}>
                            {item.isUpcoming
                              ? item.releaseDate
                                ? `Start: ${formatGermanReleaseDate(item.releaseDate)}`
                                : "Upcoming"
                              : item.releaseYear || "—"}
                          </span>
                          <span className="text-amber-400/80 font-medium group-hover:translate-x-0.5 transition">
                            Details →
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center text-slate-400 space-y-3">
                  <p className="text-base text-slate-300 font-medium">
                    Keine Filme oder Serien für diese Filterkombination gefunden.
                  </p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Versuche die Mindestbewertung zu senken oder einen der Filter wie Regie, Cast oder Land zurückzusetzen.
                  </p>
                  <button
                    type="button"
                    onClick={resetExtendedFilters}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold rounded-xl transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Alle Filter zurücksetzen</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
