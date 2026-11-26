"use client";

import { useEffect, useState } from "react";
import { useMedia } from "@/components/MediaContext";

export function useWatchlistAlerts(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  const { showToast } = useMedia();
  const [watchlistAlerts, setWatchlistAlerts] = useState<boolean>(true);
  const [savingAlerts, setSavingAlerts] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let active = true;

    fetch("/api/user/notifications")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (active && typeof d?.watchlistAlertsEnabled === "boolean") {
          setWatchlistAlerts(d.watchlistAlertsEnabled);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [enabled]);

  const toggleWatchlistAlerts = async () => {
    if (!enabled || savingAlerts) return;
    const next = !watchlistAlerts;
    setWatchlistAlerts(next);
    setSavingAlerts(true);
    try {
      const res = await fetch("/api/user/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ watchlistAlertsEnabled: next }),
      });
      if (!res.ok) throw new Error();
      showToast(
        next ? "Watchlist-E-Mail-Alarm aktiviert!" : "Watchlist-E-Mail-Alarm deaktiviert.",
        { type: "info" }
      );
    } catch {
      setWatchlistAlerts(!next);
      showToast("Einstellung konnte nicht gespeichert werden.", { type: "error" });
    } finally {
      setSavingAlerts(false);
    }
  };

  return { watchlistAlerts, savingAlerts, toggleWatchlistAlerts };
}
