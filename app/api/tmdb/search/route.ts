import { NextResponse } from "next/server";
import { searchMultiMedia, searchPersons } from "@/lib/tmdb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim().slice(0, 120);
  const type = searchParams.get("type");

  if (!q) {
    return NextResponse.json({ results: [], persons: [] });
  }

  if (type === "person") {
    const results = await searchPersons(q);
    return NextResponse.json({ results, persons: results });
  }

  const [mediaResults, personResults] = await Promise.all([
    searchMultiMedia(q),
    q.length >= 2 ? searchPersons(q) : Promise.resolve([]),
  ]);

  const relevantPersons = personResults
    .filter((p) => {
      const pop = p.popularity ?? 0;
      return (Boolean(p.profilePath) && Boolean(p.knownFor) && pop >= 1.5) || pop >= 5;
    })
    .slice(0, 4);

  return NextResponse.json({
    results: mediaResults,
    persons: relevantPersons,
  });
}
