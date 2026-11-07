import { NextResponse } from "next/server";
import { searchMultiMedia, searchPersons } from "@/lib/tmdb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const type = searchParams.get("type");

  if (!q.trim()) {
    return NextResponse.json({ results: [] });
  }

  if (type === "person") {
    const results = await searchPersons(q);
    return NextResponse.json({ results });
  }

  const results = await searchMultiMedia(q);
  return NextResponse.json({ results });
}
