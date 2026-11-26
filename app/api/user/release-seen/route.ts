import { NextResponse } from "next/server";
import { requireUserSession } from "@/lib/auth";
import { isValidReleaseId } from "@/lib/changelog";
import { getUserReleaseStatus, updateUserLastSeenReleaseId } from "@/lib/store";

const RELEASE_ID_PATTERN = /^[a-zA-Z0-9._-]+$/;

export async function GET() {
  const auth = await requireUserSession();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = await getUserReleaseStatus(auth.userId);
  return NextResponse.json(status);
}

export async function PATCH(req: Request) {
  const auth = await requireUserSession();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const releaseId = typeof body?.releaseId === "string" ? body.releaseId.trim() : "";

  if (
    !releaseId ||
    releaseId.length > 80 ||
    !RELEASE_ID_PATTERN.test(releaseId) ||
    !isValidReleaseId(releaseId)
  ) {
    return NextResponse.json({ error: "Ungültige Release-ID." }, { status: 400 });
  }

  const lastSeenReleaseId = await updateUserLastSeenReleaseId(auth.userId, releaseId);
  return NextResponse.json({ lastSeenReleaseId });
}
