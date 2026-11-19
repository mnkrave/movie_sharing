import { NextResponse } from "next/server";
import { normalizeProviderKey } from "@/lib/tmdb";

const TMDB_API_KEY = process.env.TMDB_API_KEY || "";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export interface BatchMediaMeta {
  genreNames: string[];
  genres: { id: number; name: string }[];
  runtimeMinutes: number;
  episodeRuntimeMinutes?: number;
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
  seasonEpisodes?: Record<number, number>;
  director?: string;
  actors: string[];
  tmdbVoteAverage: number;
  releaseYear: string;
  providersDE?: string[];
  providerNamesDE?: string[];
  providerLogosDE?: { name: string; logo: string; key: string }[];
  hasFlatrateDE?: boolean;
}

// Bounded in-memory LRU cache with 24h TTL to prevent unbounded memory growth
const MAX_CACHE_ENTRIES = 1000;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const metaCache = new Map<string, { data: BatchMediaMeta; expiresAt: number }>();

function getCachedMeta(key: string): BatchMediaMeta | undefined {
  const entry = metaCache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    metaCache.delete(key);
    return undefined;
  }
  metaCache.delete(key);
  metaCache.set(key, entry);
  return entry.data;
}

function setCachedMeta(key: string, data: BatchMediaMeta) {
  if (metaCache.has(key)) {
    metaCache.delete(key);
  } else if (metaCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = metaCache.keys().next().value;
    if (oldestKey !== undefined) {
      metaCache.delete(oldestKey);
    }
  }
  metaCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawItems: any[] = Array.isArray(body.items) ? body.items.slice(0, 200) : [];
    const items: { id: number; type: "movie" | "tv" }[] = rawItems
      .filter(
        (item) =>
          item &&
          (item.type === "movie" || item.type === "tv") &&
          Number.isInteger(Number(item.id)) &&
          Number(item.id) > 0
      )
      .map((item) => ({ id: Number(item.id), type: item.type }));

    const genresResult: Record<string, string[]> = {};
    const metaResult: Record<string, BatchMediaMeta> = {};
    const toFetch: { id: number; type: "movie" | "tv"; key: string }[] = [];

    for (const item of items) {
      const key = `${item.type}_${item.id}`;
      const cached = getCachedMeta(key);
      if (cached) {
        if (item.type === "tv" && !cached.seasonEpisodes && (cached.numberOfSeasons || 0) > 1) {
          toFetch.push({ id: item.id, type: item.type, key });
        } else {
          genresResult[key] = cached.genreNames;
          metaResult[key] = cached;
        }
      } else {
        toFetch.push({ id: item.id, type: item.type, key });
      }
    }

    if (toFetch.length > 0) {
      await Promise.all(
        toFetch.map(async ({ id, type, key }) => {
          try {
            const url = `${TMDB_BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}&language=de-DE&append_to_response=credits,watch/providers`;
            const res = await fetch(url, { next: { revalidate: 86400 } });
            if (res.ok) {
              const data = await res.json();
              const rawGenres: { id: number; name: string }[] = (data.genres || []).map(
                (g: any) => ({ id: g.id, name: g.name })
              );
              const genreNames = rawGenres.map((g) => g.name);

              // Runtime estimation
              let runtimeMinutes = 0;
              let episodeRuntimeMinutes: number | undefined = undefined;
              let seasonEpisodes: Record<number, number> | undefined = undefined;

              if (type === "movie") {
                runtimeMinutes = data.runtime || 115;
              } else {
                const epLen =
                  (Array.isArray(data.episode_run_time) &&
                  data.episode_run_time.length > 0 &&
                  data.episode_run_time[0] > 0
                    ? data.episode_run_time[0]
                    : data.last_episode_to_air?.runtime) || 45;

                episodeRuntimeMinutes = epLen;

                const regularSeasons = Array.isArray(data.seasons)
                  ? data.seasons.filter((s: any) => s.season_number > 0)
                  : [];

                let totalEps = 0;
                if (regularSeasons.length > 0) {
                  seasonEpisodes = {};
                  regularSeasons.forEach((s: any) => {
                    const count = s.episode_count || 0;
                    seasonEpisodes![s.season_number] = count;
                    totalEps += count;
                  });
                }

                const epCount = totalEps > 0 ? totalEps : (data.number_of_episodes || 10);
                runtimeMinutes = epLen * epCount;
              }

              // Director / Creator
              const directorObj =
                type === "movie"
                  ? (data.credits?.crew || []).find((c: any) => c.job === "Director")
                  : (data.created_by || [])[0];

              // Top 3 cast members
              const actors: string[] = (data.credits?.cast || [])
                .slice(0, 3)
                .map((c: any) => c.name)
                .filter(Boolean);

              const dateStr = data.release_date || data.first_air_date || "";

              // Watch providers in DE
              const deProviders = data["watch/providers"]?.results?.DE;
              const flatrateList = [
                ...(deProviders?.flatrate || []),
                ...(deProviders?.free || []),
              ];

              const providersDE: string[] = [];
              const providerNamesDE: string[] = [];
              const providerLogosDE: { name: string; logo: string; key: string }[] = [];

              for (const p of flatrateList) {
                if (p.provider_name) {
                  const { key, displayName } = normalizeProviderKey(p.provider_name);
                  if (!providersDE.includes(key)) {
                    providersDE.push(key);
                    providerNamesDE.push(displayName);
                    providerLogosDE.push({
                      name: displayName,
                      logo: p.logo_path,
                      key,
                    });
                  }
                }
              }

              const hasFlatrateDE = providersDE.length > 0;

              const meta: BatchMediaMeta = {
                genreNames,
                genres: rawGenres,
                runtimeMinutes,
                episodeRuntimeMinutes,
                numberOfSeasons: data.number_of_seasons,
                numberOfEpisodes: data.number_of_episodes,
                seasonEpisodes,
                director: directorObj?.name,
                actors,
                tmdbVoteAverage: data.vote_average
                  ? Math.round(data.vote_average * 10) / 10
                  : 0,
                releaseYear: dateStr ? dateStr.slice(0, 4) : "",
                providersDE,
                providerNamesDE,
                providerLogosDE,
                hasFlatrateDE,
              };

              setCachedMeta(key, meta);
              genresResult[key] = genreNames;
              metaResult[key] = meta;
            } else {
              genresResult[key] = [];
            }
          } catch {
            genresResult[key] = [];
          }
        })
      );
    }

    return NextResponse.json({ genres: genresResult, meta: metaResult });
  } catch (err) {
    console.error("Batch genres error:", err);
    return NextResponse.json({ error: "Fehler beim Laden der Genres" }, { status: 500 });
  }
}
