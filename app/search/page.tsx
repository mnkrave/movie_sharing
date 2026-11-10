"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { MediaItem, PersonSearchResult, formatGermanReleaseDate } from "@/lib/tmdb";
import { MediaCard } from "@/components/MediaCard";
import {
  SlidersHorizontal,
  Search,
  X,
  RotateCcw,
  Sparkles,
  Film,
  Tv,
  Star,
  Loader2,
  Calendar,
  Layers,
  ChevronDown,
  Filter,
  User,
  ChevronRight,
} from "lucide-react";

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
  { value: 8.0, label: "★ 8.0+ (Top)" },
  { value: 8.5, label: "★ 8.5+ (Meisterwerke)" },
];

function ExtendedSearchContent() {
  const searchParams = useSearchParams();

  // Filter States
  const [mediaType, setMediaType] = useState<"all" | "movie" | "tv">("all");
  const [genreId, setGenreId] = useState<number | null>(null);
  const [director, setDirector] = useState("");
  const [actor, setActor] = useState("");
  const [country, setCountry] = useState("ALL");
  const [minRating, setMinRating] = useState<number>(0);
  const [era, setEra] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    "popularity.desc" | "vote_average.desc" | "primary_release_date.desc"
  >("popularity.desc");
  const [query, setQuery] = useState("");

  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchingPersons, setMatchingPersons] = useState<PersonSearchResult[]>([]);
  const [selectedActorPerson, setSelectedActorPerson] = useState<PersonSearchResult | null>(null);

  // Auto-resolve actor profile info when actor filter changes
  useEffect(() => {
    if (!actor.trim()) {
      setSelectedActorPerson(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/tmdb/search?type=person&q=${encodeURIComponent(actor.trim())}`);
        const data = await res.json();
        const first = (data.results || data.persons || [])[0];
        setSelectedActorPerson(first || null);
      } catch (e) {
        // ignore
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [actor]);

  // Auto-search matching persons when main query changes
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setMatchingPersons([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/tmdb/search?type=person&q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setMatchingPersons((data.results || data.persons || []).slice(0, 3));
      } catch (e) {
        // ignore
      }
    }, 280);
    return () => clearTimeout(timer);
  }, [query]);

  // Initialize from URL search params if present
  useEffect(() => {
    const qParam = searchParams.get("q") || searchParams.get("query");
    if (qParam) setQuery(qParam);

    const dirParam = searchParams.get("director");
    if (dirParam) setDirector(dirParam);

    const actorParam = searchParams.get("actor");
    if (actorParam) setActor(actorParam);

    const genreParam = searchParams.get("genreId");
    if (genreParam) setGenreId(parseInt(genreParam, 10));

    const countryParam = searchParams.get("country");
    if (countryParam) setCountry(countryParam);

    const ratingParam = searchParams.get("minRating");
    if (ratingParam) setMinRating(parseFloat(ratingParam));

    const typeParam = searchParams.get("mediaType");
    if (typeParam === "movie" || typeParam === "tv") setMediaType(typeParam);
  }, [searchParams]);

  // Fetch function
  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (mediaType !== "all") params.set("mediaType", mediaType);
      if (genreId !== null) params.set("genreId", String(genreId));
      if (director.trim()) params.set("director", director.trim());
      if (actor.trim()) params.set("actor", actor.trim());
      if (country !== "ALL") params.set("country", country);
      if (minRating > 0) params.set("minRating", String(minRating));
      if (era !== "all") params.set("era", era);
      if (sortBy) params.set("sortBy", sortBy);
      if (query.trim()) params.set("query", query.trim());

      const res = await fetch(`/api/tmdb/discover?${params.toString()}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error("Extended discover error:", err);
    } finally {
      setLoading(false);
    }
  }, [mediaType, genreId, director, actor, country, minRating, era, sortBy, query]);

  // Debounced auto-fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchResults]);

  const activeFilterCount =
    (mediaType !== "all" ? 1 : 0) +
    (genreId !== null ? 1 : 0) +
    (director.trim() ? 1 : 0) +
    (actor.trim() ? 1 : 0) +
    (country !== "ALL" ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (era !== "all" ? 1 : 0) +
    (query.trim() ? 1 : 0);

  const resetAllFilters = () => {
    setMediaType("all");
    setGenreId(null);
    setDirector("");
    setActor("");
    setCountry("ALL");
    setMinRating(0);
    setEra("all");
    setSortBy("popularity.desc");
    setQuery("");
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 pb-20">
      {/* Top Hero Section */}
      <div className="relative border-b border-slate-800/80 bg-gradient-to-b from-[#0e1424] via-[#090d19] to-[#07090e] pt-10 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-3 shadow-sm">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>MULTIFILTER FILMDATENBANK</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                Extended Search
              </h1>
              <p className="text-sm sm:text-base text-slate-400 max-w-2xl mt-1.5">
                Filtere die gesamte Film- & Seriensammlung präzise nach Regie, Cast, Herkunftsland,
                Genre, Mindestbewertung und Erscheinungsjahr.
              </p>
            </div>

            {/* Quick Stats or Reset */}
            <div className="flex items-center gap-3">
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 transition shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Alle Filter zurücksetzen ({activeFilterCount})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area: Controls + Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Filter Controls Box */}
        <div className="rounded-2xl bg-[#0c111e] border border-slate-800/90 p-5 shadow-xl space-y-5">
          {/* Row 1: Format Toggle & Sort Options */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
            {/* Format Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setMediaType("all")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  mediaType === "all"
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Alle Formate
              </button>
              <button
                type="button"
                onClick={() => setMediaType("movie")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  mediaType === "movie"
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Nur Filme</span>
              </button>
              <button
                type="button"
                onClick={() => setMediaType("tv")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  mediaType === "tv"
                    ? "bg-cyan-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Tv className="w-3.5 h-3.5" />
                <span>Nur Serien</span>
              </button>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 px-2 hidden sm:inline">
                Sortierung:
              </span>
              <button
                type="button"
                onClick={() => setSortBy("popularity.desc")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  sortBy === "popularity.desc"
                    ? "bg-slate-800 text-amber-300 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🔥 Beliebteste
              </button>
              <button
                type="button"
                onClick={() => setSortBy("vote_average.desc")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  sortBy === "vote_average.desc"
                    ? "bg-slate-800 text-amber-300 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                ⭐ Beste Bewertung
              </button>
              <button
                type="button"
                onClick={() => setSortBy("primary_release_date.desc")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  sortBy === "primary_release_date.desc"
                    ? "bg-slate-800 text-amber-300 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                📅 Neueste
              </button>
            </div>
          </div>

          {/* Row 2: Optional Title Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Zusätzlicher Titel oder Stichwort (z. B. Batman, Cyberpunk, Zeitreise)..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 shadow-inner"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Row 3: Regie (Director) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5 text-amber-400">
                🎬 Regie (Director)
              </span>
              {director && (
                <button
                  type="button"
                  onClick={() => setDirector("")}
                  className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition"
                >
                  <span>Zurücksetzen</span>
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <input
              type="text"
              value={director}
              onChange={(e) => setDirector(e.target.value)}
              placeholder="Name des Regisseurs eingeben (z. B. Christopher Nolan, Tarantino, Scorsese)..."
              className="w-full px-3.5 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 shadow-inner"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {POPULAR_DIRECTORS.map((name) => {
                const isSelected = director.toLowerCase().trim() === name.toLowerCase().trim();
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setDirector(isSelected ? "" : name)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                      isSelected
                        ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                        : "bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:border-slate-700"
                    }`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 4: Schauspieler:in (Cast) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5 text-cyan-400">
                🎭 Schauspieler:in (Cast)
              </span>
              {actor && (
                <button
                  type="button"
                  onClick={() => setActor("")}
                  className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition"
                >
                  <span>Zurücksetzen</span>
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <input
              type="text"
              value={actor}
              onChange={(e) => setActor(e.target.value)}
              placeholder="Schauspieler:in suchen (z. B. Leonardo DiCaprio, Cillian Murphy)..."
              className="w-full px-3.5 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 shadow-inner"
            />

            {/* Resolved Actor Spotlight Card with Direct Profile Link */}
            {selectedActorPerson && (
              <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-800/60 flex items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 flex-shrink-0 relative border border-cyan-500/50 shadow">
                    {selectedActorPerson.profilePath ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w185${selectedActorPerson.profilePath}`}
                        alt={selectedActorPerson.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block truncate">
                      {selectedActorPerson.name}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {selectedActorPerson.knownFor || "Schauspieler:in"}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/person/${selectedActorPerson.id}`}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition flex-shrink-0 shadow-sm"
                >
                  <span>Profil ansehen</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {POPULAR_ACTORS.map((name) => {
                const isSelected = actor.toLowerCase().trim() === name.toLowerCase().trim();
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setActor(isSelected ? "" : name)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                      isSelected
                        ? "bg-cyan-500 text-slate-950 font-bold shadow-sm"
                        : "bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:border-slate-700"
                    }`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 5: Herkunftsland */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <span>🌍 Herkunftsland</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {COUNTRIES.map((c) => {
                const isSelected = country === c.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setCountry(c.code)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                      isSelected
                        ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
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
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <span>🏷️ Kategorie & Genre</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {EXTENDED_GENRES.map((g) => {
                const isSelected = genreId === g.id;
                return (
                  <button
                    key={g.label}
                    type="button"
                    onClick={() => setGenreId(g.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                      isSelected
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold shadow-sm"
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

          {/* Row 7: Mindestbewertung & Ära */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Mindestbewertung */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 block">
                ⭐ Mindestbewertung (TMDB)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {RATINGS.map((r) => {
                  const isSelected = minRating === r.value;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setMinRating(r.value)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                        isSelected
                          ? "bg-amber-400 text-slate-950 font-bold shadow-sm"
                          : "bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:border-slate-700"
                      }`}
                    >
                      {r.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Erscheinungsjahr / Ära */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 block">
                📅 Erscheinungsjahr & Zeitraum
              </span>
              <div className="flex flex-wrap gap-1.5">
                {ERAS.map((itemEra) => {
                  const isSelected = era === itemEra.id;
                  return (
                    <button
                      key={itemEra.id}
                      type="button"
                      onClick={() => setEra(itemEra.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                        isSelected
                          ? "bg-amber-400 text-slate-950 font-bold shadow-sm"
                          : "bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:border-slate-700"
                      }`}
                    >
                      {itemEra.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Results Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">
              Gefundene Titel ({results.length})
            </h2>
            {loading && <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />}
          </div>

          {/* Active Filter Chips Preview */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
            {director && (
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                <span>Regie: {director}</span>
                <button type="button" onClick={() => setDirector("")}>
                  <X className="w-3 h-3 hover:text-white" />
                </button>
              </span>
            )}
            {actor && (
              <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
                <span>Cast: {actor}</span>
                <button type="button" onClick={() => setActor("")}>
                  <X className="w-3 h-3 hover:text-white" />
                </button>
              </span>
            )}
            {genreId && (
              <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                <span>Genre: {EXTENDED_GENRES.find((g) => g.id === genreId)?.label}</span>
                <button type="button" onClick={() => setGenreId(null)}>
                  <X className="w-3 h-3 hover:text-white" />
                </button>
              </span>
            )}
            {country !== "ALL" && (
              <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
                <span>Land: {COUNTRIES.find((c) => c.code === country)?.label}</span>
                <button type="button" onClick={() => setCountry("ALL")}>
                  <X className="w-3 h-3 hover:text-white" />
                </button>
              </span>
            )}
            {minRating > 0 && (
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                <span>★ {minRating}+</span>
                <button type="button" onClick={() => setMinRating(0)}>
                  <X className="w-3 h-3 hover:text-white" />
                </button>
              </span>
            )}
            {era !== "all" && (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <span>{ERAS.find((e) => e.id === era)?.label}</span>
                <button type="button" onClick={() => setEra("all")}>
                  <X className="w-3 h-3 hover:text-white" />
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Matching Person Spotlight Banner */}
        {matchingPersons.length > 0 && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-900/80 to-slate-950/80 border border-amber-500/30 shadow-lg space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Passende Schauspieler:innen & Filmschaffende gefunden:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {matchingPersons.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 flex-shrink-0 relative border border-amber-500/30">
                      {p.profilePath ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w185${p.profilePath}`}
                          alt={p.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white block truncate">
                        {p.name}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {p.knownFor || "Schauspieler:in"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setActor(p.name)}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold border border-slate-700 transition"
                      title={`Filme mit ${p.name} filtern`}
                    >
                      Filtern
                    </button>
                    <Link
                      href={`/person/${p.id}`}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold transition shadow-sm"
                    >
                      <span>Profil</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results Media Grid */}
        {loading && results.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
            <p className="text-sm font-medium">Filtere Filme und Serien aus der TMDB-Datenbank...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
            {results.map((item) => (
              <MediaCard key={`${item.mediaType}-${item.id}`} item={item} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center rounded-2xl bg-[#0c111e] border border-slate-800 p-8 space-y-4">
            <p className="text-lg text-slate-200 font-bold">
              Keine Filme oder Serien für diese Filterkombination gefunden.
            </p>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              Versuche die Mindestbewertung zu verringern oder einzelne Filter wie Regie, Cast oder
              das Herkunftsland zurückzusetzen.
            </p>
            <div>
              <button
                type="button"
                onClick={resetAllFilters}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-md"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Alle Filter zurücksetzen</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExtendedSearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07090e] flex items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          <span>Extended Search wird geladen...</span>
        </div>
      }
    >
      <ExtendedSearchContent />
    </Suspense>
  );
}
