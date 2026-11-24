import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { getAdminUserProfile } from "@/lib/store";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await context.params;
  let target = "";
  try {
    target = decodeURIComponent(id || "").trim();
  } catch {
    return NextResponse.json({ error: "Ungültige Nutzer-ID" }, { status: 400 });
  }

  if (!target || target.length > 200 || target === "." || target === "..") {
    return NextResponse.json({ error: "Ungültige Nutzer-ID" }, { status: 400 });
  }

  try {
    const profile = await getAdminUserProfile(target, admin.userId);
    if (!profile) {
      return NextResponse.json({ error: "Benutzer nicht gefunden" }, { status: 404 });
    }

    return NextResponse.json(profile, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (err) {
    console.error("Admin user profile fetch error:", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
