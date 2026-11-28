"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type { MediaItem, PersonSearchResult } from "@/lib/tmdb";
import type { SortByOption } from "@/lib/search-filters";

export interface CatalogDiscoverFilters {
  mediaType: "all" | "movie" | "tv";
  genreId: number | null;
  director: string;
  actor: string;
  country: string;
  minRating: number;
  era: string;
  sortBy: SortByOption;
  query: string;
}

export interface UseCatalogDiscoverOptions {
  filters: CatalogDiscoverFilters;
  initialResults?: MediaItem[];
  initialPage?: number;
  initialHasMore?: boolean;
  initialLoading?: boolean;
  skipInitialFetch?: boolean;
  useTrendingMode?: boolean;
  debounceMs?: number;
  textDebounceMs?: number;
}

/**
 * Shared client hook for `/api/tmdb/discover` with AbortController cancellation,
 * pagination deduplication, and optional trending fast-path for HomeCatalogSearch.
 */
export function useCatalogDiscover({
  filters,
  initialResults = [],
  initialPage = 1,
  initialHasMore = false,
  initialLoading = true,
  skipInitialFetch = false,
  useTrendingMode = false,
  debounceMs = 300,
  textDebounceMs = 300,
}: UseCatalogDiscoverOptions) {
  const { mediaType, genreId, director, actor, country, minRating, era, sortBy, query } = filters;

  const [results, setResults] = useState<MediaItem[]>(initialResults);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(initialLoading);
  const [loadingMore, setLoadingMore] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const isFirstMountRef = useRef(true);
  const prevTextRef = useRef({ query, director, actor });

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
          console.error("Catalog discover error:", err);
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
    if (skipInitialFetch && isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }
    isFirstMountRef.current = false;

    const textChanged =
      prevTextRef.current.query !== query ||
      prevTextRef.current.director !== director ||
      prevTextRef.current.actor !== actor;
    prevTextRef.current = { query, director, actor };

    if (useTrendingMode && isDefaultTrendingMode && mediaType === "all") {
      abortControllerRef.current?.abort();
      setResults(initialResults);
      setPage(initialPage);
      setHasMore(initialHasMore);
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    if (useTrendingMode && isDefaultTrendingMode && (mediaType === "movie" || mediaType === "tv")) {
      const immediateSubset = initialResults.filter((item) => item.mediaType === mediaType);
      if (immediateSubset.length > 0) {
        setResults(immediateSubset);
      }
      fetchCatalog(1, false, true);
      return () => {
        abortControllerRef.current?.abort();
      };
    }

    const delay = textChanged ? textDebounceMs : debounceMs;
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
    skipInitialFetch,
    useTrendingMode,
    isDefaultTrendingMode,
    initialResults,
    initialPage,
    initialHasMore,
    debounceMs,
    textDebounceMs,
    fetchCatalog,
  ]);

  const handleLoadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    fetchCatalog(page + 1, true, Boolean(useTrendingMode && isDefaultTrendingMode));
  }, [loading, loadingMore, hasMore, page, fetchCatalog, useTrendingMode, isDefaultTrendingMode]);

  const triggerImmediateSearch = useCallback(() => {
    if (useTrendingMode && isDefaultTrendingMode && mediaType === "all") return;
    fetchCatalog(1, false, Boolean(useTrendingMode && isDefaultTrendingMode));
  }, [useTrendingMode, isDefaultTrendingMode, mediaType, fetchCatalog]);

  return {
    results,
    loading,
    loadingMore,
    hasMore,
    isDefaultTrendingMode,
    handleLoadMore,
    triggerImmediateSearch,
  };
}

/** Debounced person lookup against `/api/tmdb/search?type=person` with AbortController cleanup. */
export function usePersonSearch(
  query: string,
  options?: { minLength?: number; limit?: number; delayMs?: number }
): PersonSearchResult[] {
  const minLength = options?.minLength ?? 1;
  const limit = options?.limit ?? 3;
  const delayMs = options?.delayMs ?? 220;
  const [persons, setPersons] = useState<PersonSearchResult[]>([]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < minLength) {
      setPersons([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/tmdb/search?type=person&q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal }
        );
        if (!res.ok) return;
        const data = await res.json();
        setPersons((data.results || data.persons || []).slice(0, limit));
      } catch (err) {
        if ((err as Error)?.name !== "AbortError") {
          // ignore transient errors
        }
      }
    }, delayMs);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, minLength, limit, delayMs]);

  return persons;
}
