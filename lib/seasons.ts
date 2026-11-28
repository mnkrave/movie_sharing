export function resolveSelectedSeasons(
  selectedSeasons: number[] | null | undefined,
  totalSeasons: number,
  status: "WATCHED" | "WATCHING" | string
): number[] {
  if (selectedSeasons && selectedSeasons.length > 0) {
    return selectedSeasons;
  }
  if (status === "WATCHING") {
    return [1];
  }
  const count = Math.max(1, totalSeasons || 1);
  return Array.from({ length: count }, (_, i) => i + 1);
}

export function formatWatchedSeasons(
  watchedSeasons?: number[] | null,
  totalSeasons?: number | null
): string {
  if (!watchedSeasons || watchedSeasons.length === 0) {
    return "Alle Staffeln";
  }
  const total = totalSeasons || 0;
  if (total > 0 && watchedSeasons.length >= total) {
    return "Alle Staffeln";
  }
  const sorted = [...watchedSeasons].sort((a, b) => a - b);
  if (sorted.length === 1) {
    return `Staffel ${sorted[0]}`;
  }
  if (sorted.length === 2) {
    return `Staffel ${sorted[0]}+${sorted[1]}`;
  }
  const isConsecutive = sorted.every((val, idx) => idx === 0 || val === sorted[idx - 1] + 1);
  if (isConsecutive) {
    return `Staffel ${sorted[0]}–${sorted[sorted.length - 1]}`;
  }
  return `Staffel ${sorted.join("+")}`;
}

export interface MediaRuntimeItem {
  mediaType: "movie" | "tv";
  watchedSeasons?: number[] | null;
  totalSeasons?: number | null;
}

export interface MediaRuntimeMeta {
  runtimeMinutes?: number;
  episodeRuntimeMinutes?: number;
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
  seasonEpisodes?: Record<number, number>;
}

export function getItemRuntimeMinutes(
  item: MediaRuntimeItem,
  meta?: MediaRuntimeMeta
): number {
  if (item.mediaType === "movie") {
    return meta?.runtimeMinutes || 120;
  }

  // TV series calculation
  const totalSeasons = item.totalSeasons || meta?.numberOfSeasons || 1;
  const watched =
    item.watchedSeasons && item.watchedSeasons.length > 0
      ? item.watchedSeasons
      : null;

  const baseRuntime = meta?.runtimeMinutes || 400;

  // If user watched all seasons or no specific filter is set
  if (!watched || (totalSeasons > 0 && watched.length >= totalSeasons)) {
    return baseRuntime;
  }

  // If specific seasons are watched and we have per-season episode data
  if (meta?.seasonEpisodes && meta.episodeRuntimeMinutes && meta.episodeRuntimeMinutes > 0) {
    const watchedEpisodes = watched.reduce(
      (sum, sNum) => sum + (meta.seasonEpisodes?.[sNum] || 0),
      0
    );
    if (watchedEpisodes > 0) {
      return watchedEpisodes * meta.episodeRuntimeMinutes;
    }
  }

  // Proportional fallback (watched season count / total seasons)
  if (totalSeasons > 0 && watched.length < totalSeasons) {
    return Math.round(baseRuntime * (watched.length / totalSeasons));
  }

  return baseRuntime;
}

export interface WatchtimeBreakdown {
  totalMinutes: number;
  totalHours: number;
  totalDays: string;
  movieMinutes: number;
  tvMinutes: number;
  movieHours: number;
  tvHours: number;
  movieCount: number;
  tvCount: number;
  movieSharePct: number;
  tvSharePct: number;
  avgMovieMin: number;
  avgTvHours: number;
  itemMinutes: number[];
}

/** Computes aggregate watchtime totals and per-item runtimes across watched media items. */
export function computeWatchtimeBreakdown<T extends MediaRuntimeItem & { tmdbId: number }>(
  watchedItems: T[],
  metaMap: Record<string, MediaRuntimeMeta | undefined>
): WatchtimeBreakdown {
  let totalMinutes = 0;
  let movieMinutes = 0;
  let tvMinutes = 0;
  let movieCount = 0;
  let tvCount = 0;

  const itemMinutes = watchedItems.map((item) => {
    const meta = metaMap[`${item.mediaType}_${item.tmdbId}`];
    const minutes = getItemRuntimeMinutes(item, meta);
    totalMinutes += minutes;

    if (item.mediaType === "movie") {
      movieMinutes += minutes;
      movieCount++;
    } else {
      tvMinutes += minutes;
      tvCount++;
    }
    return minutes;
  });

  const totalHours = Math.round(totalMinutes / 60);
  const totalDays = (totalHours / 24).toFixed(1);
  const movieHours = Math.round(movieMinutes / 60);
  const tvHours = Math.round(tvMinutes / 60);
  const movieSharePct = totalMinutes > 0 ? Math.round((movieMinutes / totalMinutes) * 100) : 0;
  const tvSharePct = totalMinutes > 0 ? 100 - movieSharePct : 0;
  const avgMovieMin = movieCount > 0 ? Math.round(movieMinutes / movieCount) : 0;
  const avgTvHours = tvCount > 0 ? Math.round((tvMinutes / tvCount / 60) * 10) / 10 : 0;

  return {
    totalMinutes,
    totalHours,
    totalDays,
    movieMinutes,
    tvMinutes,
    movieHours,
    tvHours,
    movieCount,
    tvCount,
    movieSharePct,
    tvSharePct,
    avgMovieMin,
    avgTvHours,
    itemMinutes,
  };
}
