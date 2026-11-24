/**
 * Minimal read-only offline snapshot of the signed-in user's own watchlist & watching items.
 * Stored strictly client-side under localStorage (no other users' data, cleared on sign-out).
 */

export interface OfflineWatchlistItem {
  id: string;
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath?: string | null;
  releaseYear?: string | null;
  status: "WATCHLIST" | "WATCHING" | "WATCHED";
  rating?: number | null;
  watchedSeasons?: number[] | null;
  totalSeasons?: number | null;
  updatedAt?: string;
}

export interface OfflineWatchlistSnapshot {
  ownerId: string;
  savedAt: string;
  items: OfflineWatchlistItem[];
}

const STORAGE_KEY = "cinecircle_offline_watchlist_v1";
const MAX_ITEMS = 200;
const TMDB_POSTER_PATH_RE = /^\/[a-zA-Z0-9._-]+\.(jpg|jpeg|png|webp)$/;
const VALID_MEDIA_TYPES = new Set<OfflineWatchlistItem["mediaType"]>(["movie", "tv"]);
const VALID_STATUSES = new Set<OfflineWatchlistItem["status"]>([
  "WATCHLIST",
  "WATCHING",
  "WATCHED",
]);

function sanitizePosterPath(value: unknown): string | null {
  if (typeof value !== "string" || value.includes("..") || !TMDB_POSTER_PATH_RE.test(value)) {
    return null;
  }
  return value;
}

function sanitizeOfflineItem(raw: unknown): OfflineWatchlistItem | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;

  if (typeof item.id !== "string" || item.id.trim().length === 0 || item.id.length > 128) {
    return null;
  }
  if (typeof item.tmdbId !== "number" || !Number.isInteger(item.tmdbId) || item.tmdbId <= 0) {
    return null;
  }
  if (
    typeof item.mediaType !== "string" ||
    !VALID_MEDIA_TYPES.has(item.mediaType as OfflineWatchlistItem["mediaType"])
  ) {
    return null;
  }
  if (
    typeof item.status !== "string" ||
    !VALID_STATUSES.has(item.status as OfflineWatchlistItem["status"])
  ) {
    return null;
  }
  if (typeof item.title !== "string" || item.title.length === 0 || item.title.length > 300) {
    return null;
  }

  const releaseYear =
    typeof item.releaseYear === "string" && item.releaseYear.length <= 16
      ? item.releaseYear
      : null;
  const rating =
    typeof item.rating === "number" &&
    Number.isFinite(item.rating) &&
    item.rating >= 0 &&
    item.rating <= 10
      ? item.rating
      : null;
  const watchedSeasons = Array.isArray(item.watchedSeasons)
    ? item.watchedSeasons
        .filter((s): s is number => typeof s === "number" && Number.isInteger(s) && s > 0)
        .slice(0, 200)
    : null;
  const totalSeasons =
    typeof item.totalSeasons === "number" &&
    Number.isInteger(item.totalSeasons) &&
    item.totalSeasons > 0
      ? item.totalSeasons
      : null;
  const updatedAt =
    typeof item.updatedAt === "string" && item.updatedAt.length <= 64
      ? item.updatedAt
      : undefined;

  return {
    id: item.id,
    tmdbId: item.tmdbId,
    mediaType: item.mediaType as OfflineWatchlistItem["mediaType"],
    title: item.title,
    posterPath: sanitizePosterPath(item.posterPath),
    releaseYear,
    status: item.status as OfflineWatchlistItem["status"],
    rating,
    watchedSeasons,
    totalSeasons,
    updatedAt,
  };
}

export function saveOfflineWatchlist(ownerId: string, items: OfflineWatchlistItem[]): void {
  if (typeof window === "undefined") return;
  const normalizedOwnerId = ownerId.trim();
  if (!normalizedOwnerId) return;
  try {
    const trimmed = items
      .slice(0, MAX_ITEMS)
      .map(sanitizeOfflineItem)
      .filter((item): item is OfflineWatchlistItem => item !== null);
    const payload: OfflineWatchlistSnapshot = {
      ownerId: normalizedOwnerId,
      savedAt: new Date().toISOString(),
      items: trimmed,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage quota / privacy mode errors
  }
}

export function readOfflineWatchlist(expectedOwnerId?: string): OfflineWatchlistSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    const record = parsed as Record<string, unknown>;
    if (
      typeof record.ownerId !== "string" ||
      record.ownerId.trim().length === 0 ||
      record.ownerId.length > 128
    ) {
      return null;
    }
    if (expectedOwnerId !== undefined && (!expectedOwnerId || record.ownerId !== expectedOwnerId)) {
      return null;
    }
    if (typeof record.savedAt !== "string" || record.savedAt.length > 64) {
      return null;
    }
    if (!Array.isArray(record.items)) return null;

    const items = record.items
      .slice(0, MAX_ITEMS)
      .map(sanitizeOfflineItem)
      .filter((item): item is OfflineWatchlistItem => item !== null);

    return {
      ownerId: record.ownerId,
      savedAt: record.savedAt,
      items,
    };
  } catch {
    return null;
  }
}

export function clearOfflineWatchlist(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
