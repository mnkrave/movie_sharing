import { NextResponse } from "next/server";
import { discoverMedia, DiscoverFilters } from "@/lib/tmdb";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const genreIdParam = searchParams.get("genreId");
    const minRatingParam = searchParams.get("minRating");

    const filters: DiscoverFilters = {
      mediaType: (searchParams.get("mediaType") as any) || "all",
      genreId: genreIdParam ? parseInt(genreIdParam, 10) : null,
      director: searchParams.get("director") || null,
      actor: searchParams.get("actor") || null,
      country: searchParams.get("country") || null,
      minRating: minRatingParam ? parseFloat(minRatingParam) : null,
      era: searchParams.get("era") || null,
      sortBy: (searchParams.get("sortBy") as any) || "popularity.desc",
      query: searchParams.get("query") || searchParams.get("q") || null,
    };

    const results = await discoverMedia(filters);
    return NextResponse.json({ results });
  } catch (error) {
    console.error("Discover API error:", error);
    return NextResponse.json({ results: [], error: "Failed to discover media" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const results = await discoverMedia(body);
    return NextResponse.json({ results });
  } catch (error) {
    console.error("Discover API error:", error);
    return NextResponse.json({ results: [], error: "Failed to discover media" }, { status: 500 });
  }
}
