import { NextResponse } from "next/server";
import { searchMultiMedia, searchPersons } from "@/lib/tmdb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const type = searchParams.get("type");

  if (!q.trim()) {
    return NextResponse.json({ results: [], persons: [] });
  }

  if (type === "person") {
    const results = await searchPersons(q);
    return NextResponse.json({ results, persons: results });
  }

  const [mediaResults, personResults] = await Promise.all([
    searchMultiMedia(q),
    searchPersons(q),
  ]);

  return NextResponse.json({
    results: mediaResults,
    persons: personResults.slice(0, 6),
  });
}
