import { NextResponse } from "next/server";

const TMDB_API_KEY = process.env.TMDB_API_KEY || "92dc1c6b15658b43e4c7a71b45addf36";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// In-memory cache for fast repeated lookups
const genresCache = new Map<string, string[]>();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const items: { id: number; type: "movie" | "tv" }[] = body.items || [];

    const result: Record<string, string[]> = {};
    const toFetch: { id: number; type: "movie" | "tv"; key: string }[] = [];

    for (const item of items) {
      const key = `${item.type}_${item.id}`;
      if (genresCache.has(key)) {
        result[key] = genresCache.get(key)!;
      } else {
        toFetch.push({ id: item.id, type: item.type, key });
      }
    }

    if (toFetch.length > 0) {
      await Promise.all(
        toFetch.map(async ({ id, type, key }) => {
          try {
            const url = `${TMDB_BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}&language=de-DE`;
            const res = await fetch(url, { next: { revalidate: 86400 } });
            if (res.ok) {
              const data = await res.json();
              const genreNames: string[] = (data.genres || []).map((g: any) => g.name);
              genresCache.set(key, genreNames);
              result[key] = genreNames;
            } else {
              result[key] = [];
            }
          } catch {
            result[key] = [];
          }
        })
      );
    }

    return NextResponse.json({ genres: result });
  } catch (err) {
    console.error("Batch genres error:", err);
    return NextResponse.json({ error: "Fehler beim Laden der Genres" }, { status: 500 });
  }
}
