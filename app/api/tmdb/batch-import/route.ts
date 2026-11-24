import { NextResponse } from "next/server";
import { requireUserSession } from "@/lib/auth";
import { searchMultiMedia, MediaItem } from "@/lib/tmdb";

interface RawImportQuery {
  queryTitle: string;
  year?: string;
  mediaTypeHint?: "movie" | "tv";
  rating?: number;
  watchedSeasons?: number[];
  watchCount?: number;
}

export interface MatchedImportItem {
  item: MediaItem;
  sourceTitle: string;
  rating?: number;
  watchedSeasons?: number[];
  watchCount: number;
}

export async function POST(req: Request) {
  const auth = await requireUserSession();
  if (!auth) {
    return NextResponse.json({ error: "Bitte zuerst einloggen." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const rawEntries: RawImportQuery[] = Array.isArray(body.entries)
      ? body.entries.slice(0, 120)
      : [];

    const matchedMap = new Map<string, MatchedImportItem>();
    const chunkSize = 10;

    for (let i = 0; i < rawEntries.length; i += chunkSize) {
      const chunk = rawEntries.slice(i, i + chunkSize);
      const chunkResults = await Promise.all(
        chunk.map(async (entry) => {
          const cleanTitle = String(entry.queryTitle || "")
            .trim()
            .slice(0, 160);
          if (!cleanTitle || cleanTitle.length < 2) return null;

          const hits = await searchMultiMedia(cleanTitle);
          if (!hits || hits.length === 0) return null;

          // Pick best match based on mediaTypeHint and optional releaseYear
          let best = hits[0];
          const normalizedQuery = cleanTitle.toLowerCase();

          const scored = hits.map((candidate) => {
            let score = 0;
            const cTitle = candidate.title.toLowerCase();
            const cOrig = (candidate.originalTitle || "").toLowerCase();
            if (cTitle === normalizedQuery || cOrig === normalizedQuery) score += 50;
            else if (cTitle.startsWith(normalizedQuery) || cOrig.startsWith(normalizedQuery))
              score += 20;

            if (entry.mediaTypeHint && candidate.mediaType === entry.mediaTypeHint) {
              score += 35;
            }
            if (entry.year && candidate.releaseYear === String(entry.year)) {
              score += 40;
            }
            score += Math.min(25, (candidate.voteCount || 0) / 500);
            return { candidate, score };
          });

          scored.sort((a, b) => b.score - a.score);
          best = scored[0].candidate;

          return {
            item: best,
            sourceTitle: cleanTitle,
            rating:
              typeof entry.rating === "number" && entry.rating >= 1 && entry.rating <= 10
                ? Math.round(entry.rating)
                : undefined,
            watchedSeasons: Array.isArray(entry.watchedSeasons) ? entry.watchedSeasons : undefined,
            watchCount: entry.watchCount || 1,
          };
        })
      );

      for (const res of chunkResults) {
        if (!res) continue;
        const key = `${res.item.mediaType}_${res.item.id}`;
        const existing = matchedMap.get(key);
        if (!existing) {
          matchedMap.set(key, res);
        } else {
          existing.watchCount += res.watchCount;
          if (!existing.rating && res.rating) existing.rating = res.rating;
          if (res.watchedSeasons && res.watchedSeasons.length > 0) {
            const combined = new Set([
              ...(existing.watchedSeasons || []),
              ...res.watchedSeasons,
            ]);
            existing.watchedSeasons = Array.from(combined).sort((a, b) => a - b);
          }
        }
      }
    }

    return NextResponse.json({
      matches: Array.from(matchedMap.values()),
    });
  } catch (error) {
    console.error("Batch import match error:", error);
    return NextResponse.json(
      { matches: [], error: "Fehler beim Abgleichen der CSV-Datei." },
      { status: 500 }
    );
  }
}
