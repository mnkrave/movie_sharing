import { NextResponse } from "next/server";
import { discoverMedia, DiscoverFilters } from "@/lib/tmdb";

const VALID_MEDIA_TYPES = new Set(["all", "movie", "tv"]);
const VALID_SORT_BY = new Set([
  "popularity.desc",
  "vote_average.desc",
  "primary_release_date.desc",
]);
const VALID_ERAS = new Set(["new", "2020s", "2010s", "2000s", "1990s", "classics"]);

function sanitizeString(val: unknown, maxLen = 120): string | null {
  if (typeof val !== "string") return null;
  const trimmed = val.trim().slice(0, maxLen);
  return trimmed || null;
}

function sanitizeDiscoverFilters(raw: Record<string, unknown>): DiscoverFilters {
  const mediaType =
    typeof raw.mediaType === "string" && VALID_MEDIA_TYPES.has(raw.mediaType)
      ? (raw.mediaType as DiscoverFilters["mediaType"])
      : "all";

  const sortBy =
    typeof raw.sortBy === "string" && VALID_SORT_BY.has(raw.sortBy)
      ? (raw.sortBy as DiscoverFilters["sortBy"])
      : "popularity.desc";

  const rawGenre = Number(raw.genreId);
  const genreId = Number.isInteger(rawGenre) && rawGenre > 0 ? rawGenre : null;

  const rawRating = Number(raw.minRating);
  const minRating =
    Number.isFinite(rawRating) && rawRating > 0 && rawRating <= 10 ? rawRating : null;

  const rawCountry = typeof raw.country === "string" ? raw.country.trim().toUpperCase() : "";
  const country =
    rawCountry === "ALL" || /^[A-Z]{2}$/.test(rawCountry) ? rawCountry : null;

  const era =
    typeof raw.era === "string" && VALID_ERAS.has(raw.era) ? raw.era : null;

  const rawPage = Number(raw.page);
  const page = Number.isFinite(rawPage)
    ? Math.min(500, Math.max(1, Math.floor(rawPage)))
    : 1;

  return {
    mediaType,
    genreId,
    director: sanitizeString(raw.director),
    actor: sanitizeString(raw.actor),
    country,
    minRating,
    era,
    sortBy,
    query: sanitizeString(raw.query ?? raw.q),
    page,
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filters = sanitizeDiscoverFilters(Object.fromEntries(searchParams.entries()));
    const data = await discoverMedia(filters);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Discover API error:", error);
    return NextResponse.json(
      { results: [], page: 1, totalPages: 1, hasMore: false, error: "Failed to discover media" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const raw = body && typeof body === "object" && !Array.isArray(body) ? body : {};
    const filters = sanitizeDiscoverFilters(raw as Record<string, unknown>);
    const data = await discoverMedia(filters);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Discover API error:", error);
    return NextResponse.json(
      { results: [], page: 1, totalPages: 1, hasMore: false, error: "Failed to discover media" },
      { status: 500 }
    );
  }
}
