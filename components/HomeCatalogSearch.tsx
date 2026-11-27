"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { MediaItem } from "@/lib/tmdb";
import { MediaCard } from "@/components/MediaCard";
import {
  EXTENDED_GENRES,
  COUNTRIES,
  POPULAR_DIRECTORS,
  POPULAR_ACTORS,
  ERAS,
  RATINGS,
  SORT_OPTIONS,
  SortByOption,
} from "@/lib/search-filters";
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  Loader2,
  ChevronDown,
  ChevronRight,
  User,
} from "lucide-react";

interface PersonBadge {
  id: number;
  name: string;
  profilePath: string | null;
  knownFor?: string;
}

interface HomeCatalogSearchProps {
  initialTrending: MediaItem[];
}

export function HomeCatalogSearch({ initialTrending }: HomeCatalogSearchProps) {
  const [query, setQuery] = useState("");
  const [mediaType, setMediaType] = useState<"all" | "movie" | "tv">("all");
  const [genreId, setGenreId] = useState<number | null>(null);
  const [director, setDirector] = useState("");
  const [actor, setActor] = useState("");
  const [country, setCountry] = useState("ALL");
  const [minRating, setMinRating] = useState<number>(0);
  const [era, setEra] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortByOption>("popularity.desc");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [results, setResults] = useState<MediaItem[]>(initialTrending);
  const [page, setPage] = useState(2);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [matchingPersons, setMatchingPersons] = useState<PersonBadge[]>([]);
  const [selectedActorPerson, setSelectedActorPerson] = useState<PersonBadge | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const isFirstMountRef = useRef(true);
  const prevTextRef = useRef({ query: "", director: "", actor: "" });

  const isDefaultTrendingMode = useMemo(
    () =>
      !query.trim() &&
      genreId === null &&
      !director.trim() &&
      !actor.trim() &&
      country === "ALL" &&
      minRating === 0 &&
      era === "all" &&
      sortBy === "popularity.desc",
    [query, genreId, director, actor, country, minRating, era, sortBy]
  );

  const advancedFilterCount =
    (sortBy !== "popularity.desc" ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (era !== "all" ? 1 : 0) +
    (country !== "ALL" ? 1 : 0) +
    (director.trim() ? 1 : 0) +
    (actor.trim() ? 1 : 0);

  const activeFilterCount =
    (mediaType !== "all" ? 1 : 0) +
    (genreId !== null ? 1 : 0) +
    (query.trim() ? 1 : 0) +
    advancedFilterCount;

  const buildDiscoverParams = useCallback(
    (targetPage: number, trendingOnly: boolean) => {
      const params = new URLSearchParams();
      if (mediaType !== "all") params.set("mediaType", mediaType);
      if (trendingOnly) {
        params.set("trending", "1");
      } else {
        if (genreId !== null) params.set("genreId", String(genreId));
        if (director.trim()) params.set("director", director.trim());
        if (actor.trim()) params.set("actor", actor.trim());
        if (country !== "ALL") params.set("country", country);
        if (minRating > 0) params.set("minRating", String(minRating));
        if (era !== "all") params.set("era", era);
        if (sortBy) params.set("sortBy", sortBy);
        if (query.trim()) params.set("query", query.trim());
      }
      params.set("page", String(targetPage));
      return params;
    },
    [mediaType, genreId, director, actor, country, minRating, era, sortBy, query]
  );

  const fetchCatalog = useCallback(
    async (targetPage: number, append: boolean, trendingOnly: boolean) => {
      if (!append) {
        abortControllerRef.current?.abort();
        setLoading(true);
        setLoadingMore(false);
      } else {
        setLoadingMore(true);
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const params = buildDiscoverParams(targetPage, trendingOnly);
        const res = await fetch(`/api/tmdb/discover?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Discover failed (${res.status})`);
        const data = await res.json();
        const incoming: MediaItem[] = data.results || [];

        if (append) {
          setResults((prev) => {
            const seen = new Set(prev.map((item) => `${item.mediaType}_${item.id}`));
            const unique = incoming.filter((item) => !seen.has(`${item.mediaType}_${item.id}`));
            return [...prev, ...unique];
          });
        } else {
          setResults(incoming);
        }
        setPage(targetPage);
        setHasMore(Boolean(data.hasMore));
      } catch (err) {
        if ((err as Error)?.name !== "AbortError") {
          console.error("Home catalog discover error:", err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [buildDiscoverParams]
  );

  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }

    const textChanged =
      prevTextRef.current.query !== query ||
      prevTextRef.current.director !== director ||
      prevTextRef.current.actor !== actor;
    prevTextRef.current = { query, director, actor };

    if (isDefaultTrendingMode && mediaType === "all") {
      abortControllerRef.current?.abort();
      setResults(initialTrending);
      setPage(2);
      setHasMore(true);
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    if (isDefaultTrendingMode && (mediaType === "movie" || mediaType === "tv")) {
      const immediateSubset = initialTrending.filter((item) => item.mediaType === mediaType);
      if (immediateSubset.length > 0) {
        setResults(immediateSubset);
      }
      fetchCatalog(1, false, true);
      return () => {
        abortControllerRef.current?.abort();
      };
    }

    const delay = textChanged ? 200 : 0;
    const timer = setTimeout(() => {
      fetchCatalog(1, false, false);
    }, delay);

    return () => {
      clearTimeout(timer);
      abortControllerRef.current?.abort();
    };
  }, [
    query,
    director,
    actor,
    mediaType,
    genreId,
    country,
    minRating,
    era,
    sortBy,
    isDefaultTrendingMode,
    initialTrending,
    fetchCatalog,
  ]);

  // Resolve matching persons when searching by query
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setMatchingPersons([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/tmdb/search?type=person&q=${encodeURIComponent(trimmed)}`);
        if (!res.ok) return;
        const data = await res.json();
        setMatchingPersons((data.results || data.persons || []).slice(0, 3));
      } catch {
        // ignore transient errors
      }
    }, 220);
    return () => clearTimeout(timer);
  }, [query]);

  // Resolve actor spotlight link when filtering by actor
  useEffect(() => {
    const trimmed = actor.trim();
    if (!trimmed) {
      setSelectedActorPerson(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/tmdb/search?type=person&q=${encodeURIComponent(trimmed)}`);
        if (!res.ok) return;
        const data = await res.json();
        setSelectedActorPerson((data.results || data.persons || [])[0] || null);
      } catch {
        // ignore transient errors
      }
    }, 220);
    return () => clearTimeout(timer);
  }, [actor]);

  const handleLoadMore = () => {
    if (loading || loadingMore || !hasMore) return;
    fetchCatalog(page + 1, true, isDefaultTrendingMode);
  };

  const resetAllFilters = () => {
    setQuery("");
    setMediaType("all");
    setGenreId(null);
    setDirector("");
    setActor("");
    setCountry("ALL");
    setMinRating(0);
    setEra("all");
    setSortBy("popularity.desc");
  };

  const triggerImmediateSearch = () => {
    if (isDefaultTrendingMode && mediaType === "all") return;
    fetchCatalog(1, false, isDefaultTrendingMode);
  };

  const sectionTitle = isDefaultTrendingMode
    ? mediaType === "movie"
      ? "Aktuelle Film-Trends"
      : mediaType === "tv"
      ? "Aktuelle Serien-Trends"
      : "Aktuell im Trend"
    : query.trim()
    ? "Suchergebnisse"
    : "Gefilterte Titel";

  return (
    <section id="katalog-suche" className="space-y-4 sm:space-y-5 scroll-mt-20">
      {/* Header Row */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary-text">
            Katalog &amp; Live-Suche
          </p>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              {sectionTitle}
            </h2>
            {loading ? (
              <Loader2 className="w-4 h-4 text-primary-text animate-spin" aria-hidden="true" />
            ) : (
              <span className="text-xs font-mono font-semibold text-muted-foreground">
                ({results.length})
              </span>
            )}
          </div>
        </div>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={resetAllFilters}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted hover:bg-card border border-border text-xs font-semibold text-foreground transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-primary-text" aria-hidden="true" />
            <span>Zurücksetzen ({activeFilterCount})</span>
          </button>
        )}
      </div>

      {/* Compact Search & Filter Bar */}
      <div className="rounded-2xl bg-card border border-border p-3 sm:p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center gap-2.5">
          {/* IME-safe Search Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              triggerImmediateSearch();
            }}
            className="relative flex-1"
          >
            <label htmlFor="home-catalog-search" className="sr-only">
              Filme, Serien, Regie oder Stichwörter suchen
            </label>
            <Search
              className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="home-catalog-search"
              type="search"
              enterKeyHint="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (e.nativeEvent.isComposing || e.keyCode === 229) return;
                  e.currentTarget.form?.requestSubmit();
                }
              }}
              placeholder="Film, Serie oder Stichwort suchen (z. B. Dune, Nolan, Thriller)…"
              className="w-full min-h-[42px] pl-10 pr-9 py-2 bg-muted/70 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Suche leeren"
                className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
            <button type="submit" className="sr-only">
              Suchen
            </button>
          </form>

          {/* Inline Format Toggle + Filter Drawer Trigger */}
          <div className="flex items-center justify-between sm:justify-end gap-2">
            <div
              role="group"
              aria-label="Katalogformat"
              className="inline-flex items-center p-1 rounded-xl bg-muted border border-border"
            >
              {[
                { key: "all" as const, label: "Alle" },
                { key: "movie" as const, label: "Filme" },
                { key: "tv" as const, label: "Serien" },
              ].map((tab) => {
                const active = mediaType === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setMediaType(tab.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      active
                        ? "bg-card text-foreground shadow-xs border border-border"
                        : "text-muted-foreground hover:text-foreground border border-transparent"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              aria-expanded={filtersOpen}
              aria-controls="home-advanced-filters"
              onClick={() => setFiltersOpen((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                filtersOpen || advancedFilterCount > 0
                  ? "bg-primary-soft border-primary/40 text-primary-text"
                  : "bg-muted/70 border-border text-foreground hover:border-border-strong"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Filter</span>
              {advancedFilterCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-black leading-none">
                  {advancedFilterCount}
                </span>
              )}
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  filtersOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        {/* Quick Genre Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
          {EXTENDED_GENRES.map((g) => {
            const active = genreId === g.id;
            return (
              <button
                key={g.label}
                type="button"
                aria-pressed={active}
                onClick={() => setGenreId(g.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  active
                    ? "bg-primary-soft text-primary-text border-primary/40"
                    : "bg-muted/50 text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                {g.label}
              </button>
            );
          })}
        </div>

        {/* Collapsible Extended Filters Panel */}
        {filtersOpen && (
          <div
            id="home-advanced-filters"
            className="pt-3 border-t border-border space-y-3 animate-in fade-in duration-150"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
              <div>
                <label
                  htmlFor="home-filter-sort"
                  className="block text-[11px] font-bold text-muted-foreground mb-1"
                >
                  Sortierung
                </label>
                <select
                  id="home-filter-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortByOption)}
                  className="w-full px-2.5 py-2 rounded-xl bg-muted/70 border border-border text-xs font-medium text-foreground focus:outline-none focus:border-primary/60"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="home-filter-rating"
                  className="block text-[11px] font-bold text-muted-foreground mb-1"
                >
                  Mindestbewertung
                </label>
                <select
                  id="home-filter-rating"
                  value={String(minRating)}
                  onChange={(e) => setMinRating(parseFloat(e.target.value))}
                  className="w-full px-2.5 py-2 rounded-xl bg-muted/70 border border-border text-xs font-medium text-foreground focus:outline-none focus:border-primary/60"
                >
                  {RATINGS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="home-filter-era"
                  className="block text-[11px] font-bold text-muted-foreground mb-1"
                >
                  Zeitraum
                </label>
                <select
                  id="home-filter-era"
                  value={era}
                  onChange={(e) => setEra(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl bg-muted/70 border border-border text-xs font-medium text-foreground focus:outline-none focus:border-primary/60"
                >
                  {ERAS.map((itemEra) => (
                    <option key={itemEra.id} value={itemEra.id}>
                      {itemEra.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="home-filter-country"
                  className="block text-[11px] font-bold text-muted-foreground mb-1"
                >
                  Herkunftsland
                </label>
                <select
                  id="home-filter-country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl bg-muted/70 border border-border text-xs font-medium text-foreground focus:outline-none focus:border-primary/60"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Director Filter */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="home-filter-director"
                    className="text-[11px] font-bold text-muted-foreground"
                  >
                    Regie
                  </label>
                  {director && (
                    <button
                      type="button"
                      onClick={() => setDirector("")}
                      className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      Leeren
                    </button>
                  )}
                </div>
                <input
                  id="home-filter-director"
                  type="text"
                  value={director}
                  onChange={(e) => setDirector(e.target.value)}
                  placeholder="z. B. Christopher Nolan, Denis Villeneuve"
                  className="w-full px-3 py-2 rounded-xl bg-muted/70 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60"
                />
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                  {POPULAR_DIRECTORS.map((name) => {
                    const selected = director.toLowerCase().trim() === name.toLowerCase();
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setDirector(selected ? "" : name)}
                        className={`whitespace-nowrap px-2.5 py-1 rounded-lg text-[11px] font-medium border transition cursor-pointer ${
                          selected
                            ? "bg-primary-soft text-primary-text border-primary/40 font-semibold"
                            : "bg-muted/50 text-muted-foreground border-border hover:text-foreground"
                        }`}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actor Filter */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="home-filter-actor"
                    className="text-[11px] font-bold text-muted-foreground"
                  >
                    Schauspieler:in (Cast)
                  </label>
                  <div className="flex items-center gap-2">
                    {selectedActorPerson && (
                      <Link
                        href={`/person/${selectedActorPerson.id}`}
                        className="text-[11px] font-semibold text-primary-text hover:underline inline-flex items-center gap-0.5"
                      >
                        <span>Profil: {selectedActorPerson.name}</span>
                        <ChevronRight className="w-3 h-3" aria-hidden="true" />
                      </Link>
                    )}
                    {actor && (
                      <button
                        type="button"
                        onClick={() => setActor("")}
                        className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        Leeren
                      </button>
                    )}
                  </div>
                </div>
                <input
                  id="home-filter-actor"
                  type="text"
                  value={actor}
                  onChange={(e) => setActor(e.target.value)}
                  placeholder="z. B. Leonardo DiCaprio, Cillian Murphy"
                  className="w-full px-3 py-2 rounded-xl bg-muted/70 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60"
                />
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                  {POPULAR_ACTORS.map((name) => {
                    const selected = actor.toLowerCase().trim() === name.toLowerCase();
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setActor(selected ? "" : name)}
                        className={`whitespace-nowrap px-2.5 py-1 rounded-lg text-[11px] font-medium border transition cursor-pointer ${
                          selected
                            ? "bg-primary-soft text-primary-text border-primary/40 font-semibold"
                            : "bg-muted/50 text-muted-foreground border-border hover:text-foreground"
                        }`}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
            {query.trim() && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-soft text-primary-text border border-primary/30 font-medium">
                <span>Suche: „{query.trim()}“</span>
                <button type="button" onClick={() => setQuery("")} aria-label="Suche entfernen" className="cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {mediaType !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted text-foreground border border-border font-medium">
                <span>{mediaType === "movie" ? "Nur Filme" : "Nur Serien"}</span>
                <button type="button" onClick={() => setMediaType("all")} aria-label="Format zurücksetzen" className="cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {genreId !== null && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted text-foreground border border-border font-medium">
                <span>{EXTENDED_GENRES.find((g) => g.id === genreId)?.label}</span>
                <button type="button" onClick={() => setGenreId(null)} aria-label="Genre entfernen" className="cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {director.trim() && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted text-foreground border border-border font-medium">
                <span>Regie: {director.trim()}</span>
                <button type="button" onClick={() => setDirector("")} aria-label="Regie entfernen" className="cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {actor.trim() && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted text-foreground border border-border font-medium">
                <span>Cast: {actor.trim()}</span>
                <button type="button" onClick={() => setActor("")} aria-label="Cast entfernen" className="cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {country !== "ALL" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted text-foreground border border-border font-medium">
                <span>{COUNTRIES.find((c) => c.code === country)?.label}</span>
                <button type="button" onClick={() => setCountry("ALL")} aria-label="Land entfernen" className="cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {minRating > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted text-foreground border border-border font-medium">
                <span>★ {minRating}+</span>
                <button type="button" onClick={() => setMinRating(0)} aria-label="Bewertung zurücksetzen" className="cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {era !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted text-foreground border border-border font-medium">
                <span>{ERAS.find((e) => e.id === era)?.label}</span>
                <button type="button" onClick={() => setEra("all")} aria-label="Zeitraum entfernen" className="cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {sortBy !== "popularity.desc" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted text-foreground border border-border font-medium">
                <span>{SORT_OPTIONS.find((s) => s.value === sortBy)?.label}</span>
                <button type="button" onClick={() => setSortBy("popularity.desc")} aria-label="Sortierung zurücksetzen" className="cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Matching Persons Strip */}
      {matchingPersons.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5">
          {matchingPersons.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl bg-card border border-border shrink-0"
            >
              <div className="w-7 h-7 rounded-full overflow-hidden bg-muted relative border border-border shrink-0">
                {p.profilePath ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w185${p.profilePath}`}
                    alt={p.name}
                    fill
                    sizes="28px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <User className="w-3.5 h-3.5" aria-hidden="true" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground truncate max-w-[140px]">
                  {p.name}
                </p>
                {p.knownFor && (
                  <p className="text-[10px] text-muted-foreground truncate max-w-[140px]">
                    {p.knownFor}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setFiltersOpen(true);
                  setActor(p.name);
                }}
                className="px-2 py-1 rounded-lg bg-muted hover:bg-primary-soft text-foreground hover:text-primary-text text-[11px] font-semibold border border-border transition cursor-pointer"
              >
                Filtern
              </button>
              <Link
                href={`/person/${p.id}`}
                className="inline-flex items-center gap-0.5 px-2 py-1 rounded-lg bg-primary text-primary-foreground text-[11px] font-bold transition"
              >
                <span>Profil</span>
                <ChevronRight className="w-3 h-3" aria-hidden="true" />
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Results Grid (keeps current cards visible with subtle fade while updating) */}
      {loading && results.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center text-muted-foreground gap-3 rounded-2xl bg-card border border-border">
          <Loader2 className="w-7 h-7 text-primary-text animate-spin" aria-hidden="true" />
          <p className="text-xs sm:text-sm font-medium">Lade Filme &amp; Serien…</p>
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-6">
          <div
            className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4 transition-opacity duration-150 ${
              loading ? "opacity-60" : "opacity-100"
            }`}
          >
            {results.map((item) => (
              <MediaCard key={`${item.mediaType}_${item.id}`} item={item} />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center pt-1">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore || loading}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-card hover:bg-muted border border-border hover:border-primary/40 text-foreground text-xs sm:text-sm font-bold transition shadow-xs disabled:opacity-60 cursor-pointer"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 text-primary-text animate-spin" aria-hidden="true" />
                    <span>Lade weitere Titel…</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 text-primary-text" aria-hidden="true" />
                    <span>Mehr anzeigen</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="py-16 px-6 text-center rounded-2xl bg-card border border-border space-y-3">
          <p className="text-base font-bold text-foreground">
            Keine Filme oder Serien für diese Auswahl gefunden.
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            Passe deine Suche an oder setze aktive Filter zurück.
          </p>
          <button
            type="button"
            onClick={resetAllFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Alle Filter zurücksetzen</span>
          </button>
        </div>
      )}
    </section>
  );
}
