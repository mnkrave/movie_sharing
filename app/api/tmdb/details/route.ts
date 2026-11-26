import { NextResponse } from "next/server";
import { getMediaDetails } from "@/lib/tmdb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  const type = (searchParams.get("type") || "movie") as "movie" | "tv";

  if (!id || (type !== "movie" && type !== "tv")) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  try {
    const details = await getMediaDetails(id, type);
    return NextResponse.json(details, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch (error) {
    console.error("Error fetching media details:", error);
    return NextResponse.json({ error: "Failed to load media details" }, { status: 500 });
  }
}
