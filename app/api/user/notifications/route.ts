import { NextResponse } from "next/server";
import { requireUserSession } from "@/lib/auth";
import {
  getUserWatchlistAlertsEnabled,
  updateUserWatchlistAlerts,
} from "@/lib/store";

export async function GET() {
  const auth = await requireUserSession();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const watchlistAlertsEnabled = await getUserWatchlistAlertsEnabled(auth.userId);
  return NextResponse.json({ watchlistAlertsEnabled });
}

export async function PATCH(req: Request) {
  const auth = await requireUserSession();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  if (typeof body?.watchlistAlertsEnabled !== "boolean") {
    return NextResponse.json({ error: "Ungültiger Wert." }, { status: 400 });
  }

  const watchlistAlertsEnabled = await updateUserWatchlistAlerts(
    auth.userId,
    body.watchlistAlertsEnabled
  );
  return NextResponse.json({ watchlistAlertsEnabled });
}
