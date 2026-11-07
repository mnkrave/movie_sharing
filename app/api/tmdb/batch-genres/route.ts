import { NextResponse } from "next/server";
import { normalizeProviderKey } from "@/lib/tmdb";

const TMDB_API_KEY = process.env.TMDB_API_KEY || "92dc1c6b15658b43e4c7a71b45addf36";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export interface BatchMediaMeta {
  genreNames: string[];
  genres: { id: number; name: string }[];
  runtimeMinutes: number;
  director?: string;
  actors: string[];
  tmdbVoteAverage: number;
  releaseYear: string;
  providersDE?: string[];
  providerNamesDE?: string[];
  providerLogosDE?: { name: string; logo: string; key: string }[];
  hasFlatrateDE?: boolean;
}

// In-memory cache for fast repeated lookups
const metaCache = new Map<string, BatchMediaMeta>();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const items: { id: number; type: "movie" | "tv" }[] = body.items || [];

    const genresResult: Record<string, string[]> = {};
    const metaResult: Record<string, BatchMediaMeta> = {};
    const toFetch: { id: number; type: "movie" | "tv"; key: string }[] = [];

    for (const item of items) {
      const key = `${item.type}_${item.id}`;
      if (metaCache.has(key)) {
        const cached = metaCache.get(key)!;
        genresResult[key] = cached.genreNames;
        metaResult[key] = cached;
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
              if (type === "movie") {
                runtimeMinutes = data.runtime || 115;
              } else {
                const epLen = data.episode_run_time?.[0] || data.last_episode_to_air?.runtime || 45;
                const epCount = Math.min(data.number_of_episodes || 10, 40);
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

              metaCache.set(key, meta);
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
