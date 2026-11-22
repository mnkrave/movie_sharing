import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { getAllFriendsWithStats } from "@/lib/store";

export async function GET() {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const users = await getAllFriendsWithStats(undefined, { includeAllForAdmin: true });
  return NextResponse.json(users);
}
