"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { MediaItem } from "@/lib/tmdb";
import { MediaCard } from "@/components/MediaCard";
import { useCatalogDiscover, usePersonSearch } from "@/lib/useCatalogDiscover";
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

interface PersonFilterFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  suggestions: readonly string[];
  rightExtra?: React.ReactNode;
}

function PersonFilterField({
  id,
  label,
  value,
  onChange,
  placeholder,
  suggestions,
  rightExtra,
}: PersonFilterFieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-[11px] font-bold text-muted-foreground">
          {label}
        </label>
        <div className="flex items-center gap-2">
          {rightExtra}
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Leeren
            </button>
          )}
        </div>
      </div>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-xl bg-muted/70 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60"
      />
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {suggestions.map((name) => {
          const selected = value.toLowerCase().trim() === name.toLowerCase();
          return (
            <button
              key={name}
              type="button"
              onClick={() => onChange(selected ? "" : name)}
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
  );
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

  const filters = useMemo(
    () => ({ mediaType, genreId, director, actor, country, minRating, era, sortBy, query }),
    [mediaType, genreId, director, actor, country, minRating, era, sortBy, query]
  );

  const {
    results,
    loading,
    loadingMore,
    hasMore,
    isDefaultTrendingMode,
    handleLoadMore,
    triggerImmediateSearch,
  } = useCatalogDiscover({
    filters,
    initialResults: initialTrending,
    initialPage: 2,
    initialHasMore: true,
    initialLoading: false,
    skipInitialFetch: true,
    useTrendingMode: true,
    debounceMs: 0,
    textDebounceMs: 200,
  });

  const matchingPersons = usePersonSearch(query, { minLength: 2, limit: 3, delayMs: 220 });
  const actorMatches = usePersonSearch(actor, { minLength: 1, limit: 1, delayMs: 220 });
  const selectedActorPerson = actorMatches[0] ?? null;

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

  const activeChips = [
    query.trim()
      ? {
          key: "query",
          label: `Suche: „${query.trim()}“`,
          ariaLabel: "Suche entfernen",
          onClear: () => setQuery(""),
          highlight: true,
        }
      : null,
    mediaType !== "all"
      ? {
          key: "mediaType",
          label: mediaType === "movie" ? "Nur Filme" : "Nur Serien",
          ariaLabel: "Format zurücksetzen",
          onClear: () => setMediaType("all"),
        }
      : null,
    genreId !== null
      ? {
          key: "genre",
          label: EXTENDED_GENRES.find((g) => g.id === genreId)?.label || "",
          ariaLabel: "Genre entfernen",
          onClear: () => setGenreId(null),
        }
      : null,
    director.trim()
      ? {
          key: "director",
          label: `Regie: ${director.trim()}`,
          ariaLabel: "Regie entfernen",
          onClear: () => setDirector(""),
        }
      : null,
    actor.trim()
      ? {
          key: "actor",
          label: `Cast: ${actor.trim()}`,
          ariaLabel: "Cast entfernen",
          onClear: () => setActor(""),
        }
      : null,
    country !== "ALL"
      ? {
          key: "country",
          label: COUNTRIES.find((c) => c.code === country)?.label || country,
          ariaLabel: "Land entfernen",
          onClear: () => setCountry("ALL"),
        }
      : null,
    minRating > 0
      ? {
          key: "rating",
          label: `★ ${minRating}+`,
          ariaLabel: "Bewertung zurücksetzen",
          onClear: () => setMinRating(0),
        }
      : null,
    era !== "all"
      ? {
          key: "era",
          label: ERAS.find((e) => e.id === era)?.label || era,
          ariaLabel: "Zeitraum entfernen",
          onClear: () => setEra("all"),
        }
      : null,
    sortBy !== "popularity.desc"
      ? {
          key: "sort",
          label: SORT_OPTIONS.find((s) => s.value === sortBy)?.label || sortBy,
          ariaLabel: "Sortierung zurücksetzen",
          onClear: () => setSortBy("popularity.desc"),
        }
      : null,
  ].filter((chip): chip is NonNullable<typeof chip> => Boolean(chip));

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
              <PersonFilterField
                id="home-filter-director"
                label="Regie"
                value={director}
                onChange={setDirector}
                placeholder="z. B. Christopher Nolan, Denis Villeneuve"
                suggestions={POPULAR_DIRECTORS}
              />

              <PersonFilterField
                id="home-filter-actor"
                label="Schauspieler:in (Cast)"
                value={actor}
                onChange={setActor}
                placeholder="z. B. Leonardo DiCaprio, Cillian Murphy"
                suggestions={POPULAR_ACTORS}
                rightExtra={
                  selectedActorPerson ? (
                    <Link
                      href={`/person/${selectedActorPerson.id}`}
                      className="text-[11px] font-semibold text-primary-text hover:underline inline-flex items-center gap-0.5"
                    >
                      <span>Profil: {selectedActorPerson.name}</span>
                      <ChevronRight className="w-3 h-3" aria-hidden="true" />
                    </Link>
                  ) : null
                }
              />
            </div>
          </div>
        )}

        {/* Active Filter Chips */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
            {activeChips.map((chip) => (
              <span
                key={chip.key}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border font-medium ${
                  chip.highlight
                    ? "bg-primary-soft text-primary-text border-primary/30"
                    : "bg-muted text-foreground border-border"
                }`}
              >
                <span>{chip.label}</span>
                <button
                  type="button"
                  onClick={chip.onClear}
                  aria-label={chip.ariaLabel}
                  className="cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
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
