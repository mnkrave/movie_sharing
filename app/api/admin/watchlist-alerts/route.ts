import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { getWatchlistAlertContext } from "@/lib/store";
import {
  runWatchlistStreamingCheck,
  sendTestWatchlistDigest,
} from "@/lib/watchlist-alerts";

export async function GET() {
  const admin = await requireAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { candidates, snapshots } = await getWatchlistAlertContext();
  const uniqueTitles = new Set(candidates.map((c) => `${c.mediaType}:${c.tmdbId}`));

  return NextResponse.json({
    configured: Boolean(process.env.RESEND_API_KEY?.trim()),
    fromEmail: process.env.RESEND_FROM_EMAIL || "CineCircle <noreply@l-reinle.de>",
    watchlistEntries: candidates.length,
    uniqueWatchlistTitles: uniqueTitles.size,
    trackedSnapshots: snapshots.size,
  });
}

export async function POST(req: Request) {
  const admin = await requireAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const action = body?.action;

    if (action === "send_test") {
      const result = await sendTestWatchlistDigest({
        userId: admin.userId,
        userName: admin.userName,
        userEmail: admin.email,
      });
      if (!result.sent) {
        return NextResponse.json(
          { error: result.error || "Test-Mail konnte nicht gesendet werden." },
          { status: 500 }
        );
      }
      return NextResponse.json({ ok: true, ...result });
    }

    const dryRun = action !== "run_live";
    const summary = await runWatchlistStreamingCheck({ dryRun });
    return NextResponse.json({ ok: true, summary });
  } catch (err) {
    console.error("Admin watchlist-alerts error:", err);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
