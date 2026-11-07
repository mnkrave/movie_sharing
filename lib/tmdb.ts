import { OSCAR_WINNERS, getOscarInfo, OscarWinnerMeta } from "./oscars";

const TMDB_API_KEY = process.env.TMDB_API_KEY || "92dc1c6b15658b43e4c7a71b45addf36";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export interface MediaItem {
  id: number;
  mediaType: "movie" | "tv";
  title: string;
  originalTitle?: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseYear: string;
  voteAverage: number;
  voteCount?: number;
  rank?: number;
  genreIds?: number[];
  oscarInfo?: OscarWinnerMeta;
}

export interface WatchProviderItem {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

export interface CountryWatchData {
  countryCode: string;
  countryName: string;
  flag: string;
  link?: string;
  flatrate: WatchProviderItem[];
  free: WatchProviderItem[];
  rent: WatchProviderItem[];
  buy: WatchProviderItem[];
}

export interface GlobalProviderVpnMatch {
  providerName: string;
  normalizedKey: string;
  logoPath: string;
  countries: {
    code: string;
    name: string;
    flag: string;
    type: "flatrate" | "free";
    link?: string;
  }[];
}

export interface MediaCollectionPart {
  id: number;
  mediaType: "movie";
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseYear: string;
  voteAverage: number;
  overview?: string;
}

export interface MediaCollectionInfo {
  id: number;
  name: string;
  overview?: string;
  posterPath: string | null;
  backdropPath: string | null;
  parts: MediaCollectionPart[];
}

export interface MediaDetails extends MediaItem {
  runtime?: number;
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
  genres: { id: number; name: string }[];
  tagline?: string;
  imdbId?: string;
  director?: string;
  cast: {
    id: number;
    name: string;
    character: string;
    profilePath: string | null;
  }[];
  trailerKey?: string;
  watchProvidersDE: CountryWatchData;
  vpnProviders: GlobalProviderVpnMatch[];
  allCountriesFlatrate: CountryWatchData[];
  similar: MediaItem[];
  collection?: MediaCollectionInfo | null;
}

export const COUNTRY_META: Record<string, { name: string; flag: string; priority: number }> = {
  DE: { name: "Deutschland", flag: "🇩🇪", priority: 1 },
  AT: { name: "Österreich", flag: "🇦🇹", priority: 2 },
  CH: { name: "Schweiz", flag: "🇨🇭", priority: 3 },
  US: { name: "USA", flag: "🇺🇸", priority: 4 },
  GB: { name: "Großbritannien (UK)", flag: "🇬🇧", priority: 5 },
  JP: { name: "Japan", flag: "🇯🇵", priority: 6 },
  CA: { name: "Kanada", flag: "🇨🇦", priority: 7 },
  AU: { name: "Australien", flag: "🇦🇺", priority: 8 },
  NL: { name: "Niederlande", flag: "🇳🇱", priority: 9 },
  FR: { name: "Frankreich", flag: "🇫🇷", priority: 10 },
  ES: { name: "Spanien", flag: "🇪🇸", priority: 11 },
  IT: { name: "Italien", flag: "🇮🇹", priority: 12 },
  KR: { name: "Südkorea", flag: "🇰🇷", priority: 13 },
  SE: { name: "Schweden", flag: "🇸🇪", priority: 14 },
  NO: { name: "Norwegen", flag: "🇳🇴", priority: 15 },
  DK: { name: "Dänemark", flag: "🇩🇰", priority: 16 },
  BR: { name: "Brasilien", flag: "🇧🇷", priority: 17 },
  MX: { name: "Mexiko", flag: "🇲🇽", priority: 18 },
  IN: { name: "Indien", flag: "🇮🇳", priority: 19 },
  SG: { name: "Singapur", flag: "🇸🇬", priority: 20 },
  HK: { name: "Hongkong", flag: "🇭🇰", priority: 21 },
  TW: { name: "Taiwan", flag: "🇹🇼", priority: 22 },
  PL: { name: "Polen", flag: "🇵🇱", priority: 23 },
  TR: { name: "Türkei", flag: "🇹🇷", priority: 24 },
  AR: { name: "Argentinien", flag: "🇦🇷", priority: 25 },
  IE: { name: "Irland", flag: "🇮🇪", priority: 26 },
  BE: { name: "Belgien", flag: "🇧🇪", priority: 27 },
  PT: { name: "Portugal", flag: "🇵🇹", priority: 28 },
  FI: { name: "Finnland", flag: "🇫🇮", priority: 29 },
  NZ: { name: "Neuseeland", flag: "🇳🇿", priority: 30 },
  ZA: { name: "Südafrika", flag: "🇿🇦", priority: 31 },
  TH: { name: "Thailand", flag: "🇹🇭", priority: 32 },
  PH: { name: "Philippinen", flag: "🇵🇭", priority: 33 },
  ID: { name: "Indonesien", flag: "🇮🇩", priority: 34 },
  MY: { name: "Malaysia", flag: "🇲🇾", priority: 35 },
  CZ: { name: "Tschechien", flag: "🇨🇿", priority: 36 },
  HU: { name: "Ungarn", flag: "🇭🇺", priority: 37 },
  RO: { name: "Rumänien", flag: "🇷🇴", priority: 38 },
  GR: { name: "Griechenland", flag: "🇬🇷", priority: 39 },
  IL: { name: "Israel", flag: "🇮🇱", priority: 40 },
};

export const POPULAR_SUBSCRIPTIONS = [
  { key: "netflix", label: "Netflix", color: "#E50914" },
  { key: "prime", label: "Amazon Prime Video", color: "#00A8E1" },
  { key: "disney", label: "Disney+", color: "#113CCF" },
  { key: "apple", label: "Apple TV+", color: "#A2AAAD" },
  { key: "wow", label: "WOW / Sky", color: "#00D787" },
  { key: "paramount", label: "Paramount+", color: "#0064FF" },
  { key: "crunchyroll", label: "Crunchyroll", color: "#F47521" },
  { key: "max", label: "Max (HBO)", color: "#7B2CBF" },
  { key: "mubi", label: "MUBI", color: "#001489" },
  { key: "ard_zdf", label: "ARD / ZDF / Arte", color: "#F59E0B" },
  { key: "joyn", label: "Joyn", color: "#00E0FF" },
  { key: "rtl", label: "RTL+", color: "#E50000" },
];

export interface GenreMeta {
  id: number;
  name: string;
  emoji: string;
  label: string;
}

// 19 offizielle TMDB Movie Genres (Deutsche Bezeichnungen)
export const OFFICIAL_MOVIE_GENRES: GenreMeta[] = [
  { id: 28, name: "Action", emoji: "💥", label: "💥 Action" },
  { id: 12, name: "Abenteuer", emoji: "🗺️", label: "🗺️ Abenteuer" },
  { id: 16, name: "Animation", emoji: "✨", label: "✨ Animation" },
  { id: 35, name: "Komödie", emoji: "😂", label: "😂 Komödie" },
  { id: 80, name: "Krimi", emoji: "🕵️", label: "🕵️ Krimi" },
  { id: 99, name: "Dokumentarfilm", emoji: "🎥", label: "🎥 Dokumentarfilm" },
  { id: 18, name: "Drama", emoji: "🎭", label: "🎭 Drama" },
  { id: 10751, name: "Familie", emoji: "👨‍👩‍👧‍👦", label: "👨‍👩‍👧‍👦 Familie" },
  { id: 14, name: "Fantasy", emoji: "🧙‍♂️", label: "🧙‍♂️ Fantasy" },
  { id: 36, name: "Historie", emoji: "📜", label: "📜 Historie" },
  { id: 27, name: "Horror", emoji: "🩸", label: "🩸 Horror" },
  { id: 10402, name: "Musik", emoji: "🎵", label: "🎵 Musik" },
  { id: 9648, name: "Mystery", emoji: "🔍", label: "🔍 Mystery" },
  { id: 10749, name: "Liebesfilm", emoji: "❤️", label: "❤️ Liebesfilm" },
  { id: 878, name: "Science Fiction", emoji: "🚀", label: "🚀 Science Fiction" },
  { id: 10770, name: "TV-Film", emoji: "📺", label: "📺 TV-Film" },
  { id: 53, name: "Thriller", emoji: "😱", label: "😱 Thriller" },
  { id: 10752, name: "Kriegsfilm", emoji: "🪖", label: "🪖 Kriegsfilm" },
  { id: 37, name: "Western", emoji: "🤠", label: "🤠 Western" },
];

// 16 offizielle TMDB TV / Serien Genres
export const OFFICIAL_TV_GENRES: GenreMeta[] = [
  { id: 10759, name: "Action & Adventure", emoji: "💥", label: "💥 Action & Adventure" },
  { id: 16, name: "Animation", emoji: "✨", label: "✨ Animation" },
  { id: 35, name: "Comedy", emoji: "😂", label: "😂 Comedy" },
  { id: 80, name: "Crime", emoji: "🕵️", label: "🕵️ Crime" },
  { id: 99, name: "Documentary", emoji: "🎥", label: "🎥 Documentary" },
  { id: 18, name: "Drama", emoji: "🎭", label: "🎭 Drama" },
  { id: 10751, name: "Family", emoji: "👨‍👩‍👧‍👦", label: "👨‍👩‍👧‍👦 Family" },
  { id: 10762, name: "Kids", emoji: "🎈", label: "🎈 Kids" },
  { id: 9648, name: "Mystery", emoji: "🔍", label: "🔍 Mystery" },
  { id: 10763, name: "News", emoji: "📰", label: "📰 News" },
  { id: 10764, name: "Reality", emoji: "🌟", label: "🌟 Reality" },
  { id: 10765, name: "Sci-Fi & Fantasy", emoji: "🚀", label: "🚀 Sci-Fi & Fantasy" },
  { id: 10766, name: "Soap", emoji: "💔", label: "💔 Soap" },
  { id: 10767, name: "Talk", emoji: "🎙️", label: "🎙️ Talk" },
  { id: 10768, name: "War & Politics", emoji: "🪖", label: "🪖 War & Politics" },
  { id: 37, name: "Western", emoji: "🤠", label: "🤠 Western" },
];

export const ALL_GENRES_MAP: Record<number, GenreMeta> = {
  ...Object.fromEntries(OFFICIAL_MOVIE_GENRES.map((g) => [g.id, g])),
  ...Object.fromEntries(OFFICIAL_TV_GENRES.map((g) => [g.id, g])),
};

export function getGenreMeta(id: number, mediaType?: "movie" | "tv"): GenreMeta | undefined {
  if (mediaType === "tv") {
    const tv = OFFICIAL_TV_GENRES.find((g) => g.id === id);
    if (tv) return tv;
  }
  return ALL_GENRES_MAP[id];
}

export function resolveItemGenres(
  mediaType: "movie" | "tv",
  genreIds?: number[],
  genres?: { id: number; name: string }[]
): { id: number; name: string; emoji: string }[] {
  if (genres && genres.length > 0) {
    return genres.map((g) => {
      const meta = getGenreMeta(g.id, mediaType);
      return {
        id: g.id,
        name: g.name || meta?.name || "Genre",
        emoji: meta?.emoji || "🎬",
      };
    });
  }

  if (genreIds && genreIds.length > 0) {
    return genreIds
      .map((id) => {
        const meta = getGenreMeta(id, mediaType);
        if (!meta) return null;
        return {
          id: meta.id,
          name: meta.name,
          emoji: meta.emoji,
        };
      })
      .filter(Boolean) as { id: number; name: string; emoji: string }[];
  }

  return [];
}

export function normalizeProviderKey(name: string): { key: string; displayName: string } {
  const lower = name.toLowerCase();
  if (lower.includes("netflix")) return { key: "netflix", displayName: "Netflix" };
  if (lower.includes("amazon prime") || lower.includes("prime video"))
    return { key: "prime", displayName: "Amazon Prime Video" };
  if (lower.includes("disney")) return { key: "disney", displayName: "Disney+" };
  if (lower.includes("apple tv")) return { key: "apple", displayName: "Apple TV+" };
  if (lower.includes("wow") || lower.includes("sky go") || lower.includes("now tv"))
    return { key: "wow", displayName: "WOW / Sky" };
  if (lower.includes("paramount")) return { key: "paramount", displayName: "Paramount+" };
  if (lower.includes("crunchyroll")) return { key: "crunchyroll", displayName: "Crunchyroll" };
  if (lower === "max" || lower.includes("hbo max")) return { key: "max", displayName: "Max (HBO)" };
  if (lower.includes("mubi")) return { key: "mubi", displayName: "MUBI" };
  if (lower.includes("ard") || lower.includes("zdf") || lower.includes("arte"))
    return { key: "ard_zdf", displayName: name };
  if (lower.includes("hulu")) return { key: "hulu", displayName: "Hulu" };
  if (lower.includes("peacock")) return { key: "peacock", displayName: "Peacock" };
  if (lower.includes("bbc iplayer")) return { key: "bbc", displayName: "BBC iPlayer" };
  if (lower.includes("joyn")) return { key: "joyn", displayName: "Joyn" };
  if (lower.includes("rtl")) return { key: "rtl", displayName: "RTL+" };
  return { key: lower.replace(/[^a-z0-9]/g, "_"), displayName: name };
}

function getCountryInfo(code: string): { name: string; flag: string; priority: number } {
  if (COUNTRY_META[code]) return COUNTRY_META[code];
  // Generate regional indicator flag emoji from 2-letter ISO code
  const flag =
    code.length === 2
      ? String.fromCodePoint(
          ...code
            .toUpperCase()
            .split("")
            .map((c) => 127397 + c.charCodeAt(0))
        )
      : "🌍";
  return { name: code, flag, priority: 99 };
}

async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.set("api_key", TMDB_API_KEY);
  if (!params.language) {
    url.searchParams.set("language", "de-DE");
  }
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`TMDB error ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

function mapRawItem(raw: any, forceMediaType?: "movie" | "tv", rank?: number): MediaItem {
  const mediaType: "movie" | "tv" =
    forceMediaType || (raw.media_type === "tv" || raw.first_air_date ? "tv" : "movie");
  const title = raw.title || raw.name || "Unbekannter Titel";
  const originalTitle = raw.original_title || raw.original_name;
  const dateStr = raw.release_date || raw.first_air_date || "";
  const releaseYear = dateStr ? dateStr.slice(0, 4) : "";
  const oscarInfo = mediaType === "movie" ? getOscarInfo(raw.id) : undefined;

  return {
    id: raw.id,
    mediaType,
    title,
    originalTitle,
    overview: raw.overview || "",
    posterPath: raw.poster_path || null,
    backdropPath: raw.backdrop_path || null,
    releaseYear,
    voteAverage: typeof raw.vote_average === "number" ? Number(raw.vote_average.toFixed(1)) : 0,
    voteCount: raw.vote_count || 0,
    rank,
    genreIds: raw.genre_ids || (raw.genres ? raw.genres.map((g: any) => g.id) : []),
    oscarInfo,
  };
}

export async function getTopRatedMovies(pages = 3): Promise<MediaItem[]> {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const pagePromises = Array.from({ length: pages }, (_, i) =>
      tmdbFetch<{ results: any[] }>("/discover/movie", {
        sort_by: "vote_average.desc",
        "vote_count.gte": "4000",
        "primary_release_date.lte": today,
        page: String(i + 1),
      })
    );
    const responses = await Promise.all(pagePromises);
    const allResults = responses.flatMap((r) => r.results || []);
    return allResults.map((item, idx) => mapRawItem(item, "movie", idx + 1));
  } catch (err) {
    console.error("Fallback top rated movies due to error:", err);
    return getOscarWinnersList();
  }
}

export async function getTopRatedTv(pages = 2): Promise<MediaItem[]> {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const pagePromises = Array.from({ length: pages }, (_, i) =>
      tmdbFetch<{ results: any[] }>("/discover/tv", {
        sort_by: "vote_average.desc",
        "vote_count.gte": "2500",
        "first_air_date.lte": today,
        page: String(i + 1),
      })
    );
    const responses = await Promise.all(pagePromises);
    const allResults = responses.flatMap((r) => r.results || []);
    return allResults.map((item, idx) => mapRawItem(item, "tv", idx + 1));
  } catch (err) {
    console.error("Error fetching top rated TV:", err);
    return [];
  }
}

export async function getTrendingAll(): Promise<MediaItem[]> {
  try {
    const data = await tmdbFetch<{ results: any[] }>("/trending/all/week");
    return (data.results || [])
      .filter((r) => r.media_type === "movie" || r.media_type === "tv")
      .map((item, idx) => mapRawItem(item, undefined, idx + 1));
  } catch (err) {
    console.error("Error fetching trending:", err);
    return getOscarWinnersList();
  }
}

export function getOscarWinnersList(): MediaItem[] {
  return OSCAR_WINNERS.map((o, idx) => ({
    id: o.tmdbId,
    mediaType: "movie",
    title: o.title,
    overview: o.overview,
    posterPath: o.posterPath,
    backdropPath: o.backdropPath,
    releaseYear: o.releaseYear,
    voteAverage: o.voteAverage,
    rank: idx + 1,
    oscarInfo: o,
  }));
}

export async function searchMultiMedia(query: string): Promise<MediaItem[]> {
  if (!query.trim()) return [];
  try {
    const data = await tmdbFetch<{ results: any[] }>("/search/multi", {
      query: query.trim(),
      include_adult: "false",
    });
    return (data.results || [])
      .filter((r) => (r.media_type === "movie" || r.media_type === "tv") && (r.poster_path || r.backdrop_path))
      .slice(0, 24)
      .map((item) => mapRawItem(item));
  } catch (err) {
    console.error("Search error:", err);
    return [];
  }
}

export interface DiscoverFilters {
  mediaType?: "all" | "movie" | "tv";
  genreId?: number | null;
  director?: string | null;
  actor?: string | null;
  country?: string | null;
  minRating?: number | null;
  era?: string | null;
  sortBy?: "popularity.desc" | "vote_average.desc" | "primary_release_date.desc";
  query?: string | null;
}

export async function discoverMedia(filters: DiscoverFilters): Promise<MediaItem[]> {
  const mediaType = filters.mediaType || "all";
  const sortBy = filters.sortBy || "popularity.desc";

  // If title/keyword text query is provided, use search and apply extra filters
  if (filters.query?.trim()) {
    const rawSearchResults = await searchMultiMedia(filters.query.trim());
    return rawSearchResults.filter((item) => {
      if (mediaType !== "all" && item.mediaType !== mediaType) return false;
      if (filters.genreId && item.genreIds && !item.genreIds.includes(filters.genreId))
        return false;
      if (filters.minRating && item.voteAverage < filters.minRating) return false;
      if (filters.era) {
        const year = parseInt(item.releaseYear, 10);
        if (year) {
          if (filters.era === "new" && (year < 2024 || year > 2026)) return false;
          if (filters.era === "2020s" && (year < 2020 || year > 2029)) return false;
          if (filters.era === "2010s" && (year < 2010 || year > 2019)) return false;
          if (filters.era === "2000s" && (year < 2000 || year > 2009)) return false;
          if (filters.era === "1990s" && (year < 1990 || year > 1999)) return false;
          if (filters.era === "classics" && year > 1989) return false;
        }
      }
      return true;
    });
  }

  // Resolve person IDs if director or actor provided
  let directorId: number | null = null;
  if (filters.director?.trim()) {
    try {
      const pData = await tmdbFetch<{ results: any[] }>("/search/person", {
        query: filters.director.trim(),
      });
      if (pData.results && pData.results.length > 0) {
        directorId = pData.results[0].id;
      }
    } catch {}
  }

  let actorId: number | null = null;
  if (filters.actor?.trim()) {
    try {
      const pData = await tmdbFetch<{ results: any[] }>("/search/person", {
        query: filters.actor.trim(),
      });
      if (pData.results && pData.results.length > 0) {
        actorId = pData.results[0].id;
      }
    } catch {}
  }

  const MOVIE_TO_TV_GENRE: Record<number, number> = {
    28: 10759, // Action -> Action & Adventure
    12: 10759, // Abenteuer -> Action & Adventure
    878: 10765, // Sci-Fi -> Sci-Fi & Fantasy
    14: 10765, // Fantasy -> Sci-Fi & Fantasy
    35: 35,
    80: 80,
    18: 18,
    16: 16,
    99: 99,
    9648: 9648,
    10751: 10751,
    10752: 10768,
    36: 10768,
    37: 37,
  };

  const buildParams = (type: "movie" | "tv"): Record<string, string> => {
    const p: Record<string, string> = {
      sort_by:
        sortBy === "primary_release_date.desc" && type === "tv"
          ? "first_air_date.desc"
          : sortBy,
    };

    if (filters.genreId) {
      const gId = type === "tv" ? (MOVIE_TO_TV_GENRE[filters.genreId] || filters.genreId) : filters.genreId;
      p["with_genres"] = String(gId);
    }
    if (directorId) {
      if (type === "movie") p["with_crew"] = String(directorId);
      else p["with_people"] = String(directorId);
    }
    if (actorId) {
      if (type === "movie") p["with_cast"] = String(actorId);
      else p["with_people"] = String(actorId);
    }
    if (filters.country && filters.country !== "ALL") {
      p["with_origin_country"] = filters.country;
    }
    if (filters.minRating && filters.minRating > 0) {
      p["vote_average.gte"] = String(filters.minRating);
      p["vote_count.gte"] = filters.minRating >= 8 ? "100" : "30";
    }

    if (filters.era) {
      const isMovie = type === "movie";
      const startKey = isMovie ? "primary_release_date.gte" : "first_air_date.gte";
      const endKey = isMovie ? "primary_release_date.lte" : "first_air_date.lte";

      if (filters.era === "new") {
        p[startKey] = "2024-01-01";
        p[endKey] = "2026-12-31";
      } else if (filters.era === "2020s") {
        p[startKey] = "2020-01-01";
        p[endKey] = "2029-12-31";
      } else if (filters.era === "2010s") {
        p[startKey] = "2010-01-01";
        p[endKey] = "2019-12-31";
      } else if (filters.era === "2000s") {
        p[startKey] = "2000-01-01";
        p[endKey] = "2009-12-31";
      } else if (filters.era === "1990s") {
        p[startKey] = "1990-01-01";
        p[endKey] = "1999-12-31";
      } else if (filters.era === "classics") {
        p[endKey] = "1989-12-31";
      }
    }

    return p;
  };

  try {
    let items: MediaItem[] = [];

    if (mediaType === "movie") {
      const res = await tmdbFetch<{ results: any[] }>("/discover/movie", buildParams("movie"));
      items = (res.results || []).map((r) => mapRawItem(r, "movie"));
    } else if (mediaType === "tv") {
      const res = await tmdbFetch<{ results: any[] }>("/discover/tv", buildParams("tv"));
      items = (res.results || []).map((r) => mapRawItem(r, "tv"));
    } else {
      const [mRes, tRes] = await Promise.all([
        tmdbFetch<{ results: any[] }>("/discover/movie", buildParams("movie")),
        actorId || directorId
          ? Promise.resolve({ results: [] })
          : tmdbFetch<{ results: any[] }>("/discover/tv", buildParams("tv")),
      ]);
      const movieItems = (mRes.results || []).map((r) => mapRawItem(r, "movie"));
      const tvItems = (tRes.results || []).map((r) => mapRawItem(r, "tv"));
      const combined = [...movieItems, ...tvItems];

      if (sortBy === "vote_average.desc") {
        items = combined.sort((a, b) => b.voteAverage - a.voteAverage);
      } else if (sortBy === "primary_release_date.desc") {
        items = combined.sort(
          (a, b) => (parseInt(b.releaseYear, 10) || 0) - (parseInt(a.releaseYear, 10) || 0)
        );
      } else {
        items = combined;
      }
    }

    return items.slice(0, 36);
  } catch (err) {
    console.error("Error discovering media:", err);
    return [];
  }
}

export async function getMediaDetails(id: number, mediaType: "movie" | "tv"): Promise<MediaDetails> {
  const data = await tmdbFetch<any>(`/${mediaType}/${id}`, {
    append_to_response: "credits,videos,watch/providers,external_ids,similar",
  });

  // If overview is empty in German, fetch English fallback
  let overview = data.overview || "";
  let videosList: any[] = data.videos?.results || [];
  if (!overview || videosList.length === 0) {
    try {
      const enData = await tmdbFetch<any>(`/${mediaType}/${id}`, {
        language: "en-US",
        append_to_response: "videos",
      });
      if (!overview && enData.overview) overview = enData.overview;
      if (videosList.length === 0 && enData.videos?.results) {
        videosList = enData.videos.results;
      }
    } catch {
      // ignore fallback error
    }
  }

  const directorObj =
    mediaType === "movie"
      ? (data.credits?.crew || []).find((c: any) => c.job === "Director")
      : (data.created_by || [])[0];

  const cast = (data.credits?.cast || []).slice(0, 10).map((c: any) => ({
    id: c.id,
    name: c.name,
    character: c.character || "",
    profilePath: c.profile_path || null,
  }));

  const trailer =
    videosList.find((v: any) => v.site === "YouTube" && v.type === "Trailer") ||
    videosList.find((v: any) => v.site === "YouTube");

  // Parse Watch Providers across ALL countries for VPN + DE
  const rawProvidersByCountry: Record<string, any> = data["watch/providers"]?.results || {};

  const deRaw = rawProvidersByCountry["DE"] || {};
  const watchProvidersDE: CountryWatchData = {
    countryCode: "DE",
    countryName: "Deutschland",
    flag: "🇩🇪",
    link: deRaw.link,
    flatrate: deRaw.flatrate || [],
    free: [...(deRaw.free || []), ...(deRaw.ads || [])],
    rent: deRaw.rent || [],
    buy: deRaw.buy || [],
  };

  // Aggregate global VPN providers (flatrate & free across all countries)
  const providerMap = new Map<string, GlobalProviderVpnMatch>();
  const allCountriesFlatrate: CountryWatchData[] = [];

  for (const [countryCode, countryData] of Object.entries(rawProvidersByCountry)) {
    const cInfo = getCountryInfo(countryCode);
    const flatrateList: WatchProviderItem[] = countryData.flatrate || [];
    const freeList: WatchProviderItem[] = [...(countryData.free || []), ...(countryData.ads || [])];

    if (flatrateList.length > 0 || freeList.length > 0) {
      allCountriesFlatrate.push({
        countryCode,
        countryName: cInfo.name,
        flag: cInfo.flag,
        link: countryData.link,
        flatrate: flatrateList,
        free: freeList,
        rent: countryData.rent || [],
        buy: countryData.buy || [],
      });
    }

    const combinedStream = [
      ...flatrateList.map((p) => ({ ...p, streamType: "flatrate" as const })),
      ...freeList.map((p) => ({ ...p, streamType: "free" as const })),
    ];

    for (const p of combinedStream) {
      // Skip "With Ads" duplicate or Amazon Channel add-ons if main provider exists
      if (p.provider_name.toLowerCase().includes("amazon channel")) continue;
      if (p.provider_name.toLowerCase().includes("apple tv channel")) continue;

      const { key, displayName } = normalizeProviderKey(p.provider_name);
      let existing = providerMap.get(key);
      if (!existing) {
        existing = {
          providerName: displayName,
          normalizedKey: key,
          logoPath: p.logo_path,
          countries: [],
        };
        providerMap.set(key, existing);
      }
      if (!existing.countries.some((c) => c.code === countryCode)) {
        existing.countries.push({
          code: countryCode,
          name: cInfo.name,
          flag: cInfo.flag,
          type: p.streamType,
          link: countryData.link,
        });
      }
    }
  }

  // Sort countries inside each provider by priority (DE, AT, CH, US, GB, JP, CA, etc.)
  for (const match of providerMap.values()) {
    match.countries.sort((a, b) => {
      const pA = getCountryInfo(a.code).priority;
      const pB = getCountryInfo(b.code).priority;
      if (pA !== pB) return pA - pB;
      return a.name.localeCompare(b.name);
    });
  }

  allCountriesFlatrate.sort((a, b) => {
    const pA = getCountryInfo(a.countryCode).priority;
    const pB = getCountryInfo(b.countryCode).priority;
    if (pA !== pB) return pA - pB;
    return a.countryName.localeCompare(b.countryName);
  });

  // Sort VPN providers so the major streaming services come first
  const popularOrder = POPULAR_SUBSCRIPTIONS.map((s) => s.key);
  const vpnProviders = Array.from(providerMap.values()).sort((a, b) => {
    const idxA = popularOrder.indexOf(a.normalizedKey);
    const idxB = popularOrder.indexOf(b.normalizedKey);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return b.countries.length - a.countries.length;
  });

  const baseItem = mapRawItem(data, mediaType);

  // Fetch franchise collection parts if this movie belongs to a film series
  let collection: MediaCollectionInfo | null = null;
  if (mediaType === "movie" && data.belongs_to_collection?.id) {
    try {
      const colData = await tmdbFetch<any>(`/collection/${data.belongs_to_collection.id}`);
      if (colData && Array.isArray(colData.parts)) {
        const sortedParts: MediaCollectionPart[] = colData.parts
          .map((p: any) => ({
            id: p.id,
            mediaType: "movie" as const,
            title: p.title || p.name || "",
            posterPath: p.poster_path || null,
            backdropPath: p.backdrop_path || null,
            releaseYear: (p.release_date || "").slice(0, 4),
            voteAverage:
              typeof p.vote_average === "number" ? Math.round(p.vote_average * 10) / 10 : 0,
            overview: p.overview || "",
          }))
          .sort((a: MediaCollectionPart, b: MediaCollectionPart) => {
            const yA = parseInt(a.releaseYear, 10) || 9999;
            const yB = parseInt(b.releaseYear, 10) || 9999;
            return yA - yB;
          });

        collection = {
          id: colData.id,
          name: colData.name || data.belongs_to_collection.name,
          overview: colData.overview || "",
          posterPath: colData.poster_path || data.belongs_to_collection.poster_path || null,
          backdropPath: colData.backdrop_path || data.belongs_to_collection.backdrop_path || null,
          parts: sortedParts,
        };
      }
    } catch (colErr) {
      console.error("Error fetching collection details:", colErr);
    }
  }

  return {
    ...baseItem,
    overview: overview || baseItem.overview,
    runtime: data.runtime || (data.episode_run_time ? data.episode_run_time[0] : undefined),
    numberOfSeasons: data.number_of_seasons,
    numberOfEpisodes: data.number_of_episodes,
    genres: data.genres || [],
    tagline: data.tagline || "",
    imdbId: data.external_ids?.imdb_id || data.imdb_id,
    director: directorObj?.name,
    cast,
    trailerKey: trailer?.key,
    watchProvidersDE,
    vpnProviders,
    allCountriesFlatrate,
    similar: (data.similar?.results || []).slice(0, 8).map((s: any) => mapRawItem(s, mediaType)),
    collection,
  };
}
