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
