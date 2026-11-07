import { NextResponse } from "next/server";
import { searchMultiMedia } from "@/lib/tmdb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  if (!q.trim()) {
    return NextResponse.json({ results: [] });
  }
  const results = await searchMultiMedia(q);
  return NextResponse.json({ results });
}
