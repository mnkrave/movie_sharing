import { NextResponse } from "next/server";
import { getPersonDetails } from "@/lib/tmdb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const idStr = searchParams.get("id");

  if (!idStr) {
    return NextResponse.json({ error: "Missing person id" }, { status: 400 });
  }

  const id = parseInt(idStr, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid person id" }, { status: 400 });
  }

  const person = await getPersonDetails(id);
  if (!person) {
    return NextResponse.json({ error: "Person not found" }, { status: 404 });
  }

  return NextResponse.json(person);
}
