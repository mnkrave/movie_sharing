import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { getAdminUserProfile, setUserBanStatus } from "@/lib/store";

function parseTargetId(raw: string): string | null {
  try {
    const decoded = decodeURIComponent(raw || "").trim();
    if (!decoded || decoded.length > 200 || decoded === "." || decoded === "..") {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await context.params;
  const target = parseTargetId(id);
  if (!target) {
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

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await context.params;
  const target = parseTargetId(id);
  if (!target) {
    return NextResponse.json({ error: "Ungültige Nutzer-ID" }, { status: 400 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    if (typeof body?.isBanned !== "boolean") {
      return NextResponse.json({ error: "Ungültiger Sperr-Status." }, { status: 400 });
    }
    const reason = typeof body?.reason === "string" ? body.reason : null;

    const result = await setUserBanStatus({
      targetUserId: target,
      adminUserId: admin.userId,
      adminEmail: admin.email,
      isBanned: body.isBanned,
      reason,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(
      {
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          isBanned: Boolean(result.user.isBanned),
          bannedAt: result.user.bannedAt ?? null,
          banReason: result.user.banReason ?? null,
        },
        revokedInvitesCount: result.revokedInvitesCount,
      },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (err) {
    console.error("Admin user ban update error:", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
