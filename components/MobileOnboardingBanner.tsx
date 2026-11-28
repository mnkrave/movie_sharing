"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useMedia } from "./MediaContext";
import { Sparkles, Tv, Zap, X, Check } from "lucide-react";

const DISMISS_KEY = "cinecircle_mobile_onboarding_dismissed_v1";

/**
 * Mobile-only (`md:hidden`) dismissible 2-step starter card for newly signed-in users
 * (< 10 rated titles) so they can configure streaming subscriptions and jump into Speed-Rating
 * without hunting in the top menu. Never renders on desktop.
 */
export function MobileOnboardingBanner() {
  const { data: session } = useSession();
  const { communityData, openSubscriptions, userSubscriptions } = useMedia();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === "true");
    } catch {
      setDismissed(false);
    }
  }, []);

  if (!session?.user || dismissed) return null;

  const myUserId = (session.user as any)?.id;
  const myName = session.user.name?.toLowerCase();
  const myWatchedCount = communityData.mediaStatuses.filter(
    (m) =>
      m.status === "WATCHED" &&
      ((myUserId && m.userId === myUserId) ||
        (myName && m.userName?.toLowerCase() === myName))
  ).length;

  if (myWatchedCount >= 10) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "true");
    } catch {
      // ignore
    }
  };

  return (
    <div className="md:hidden rounded-2xl bg-card border border-border p-4 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary-text flex-shrink-0" />
          <p className="text-sm font-bold text-foreground leading-tight">
            Starte in 2 schnellen Schritten
          </p>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Start-Hilfe ausblenden"
          className="-mr-1.5 -mt-1.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-muted-foreground active:bg-muted"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={openSubscriptions}
          className="min-h-[48px] p-3 rounded-xl bg-muted border border-border text-left flex flex-col justify-between gap-1.5 active:scale-[0.98] transition"
        >
          <div className="flex items-center justify-between">
            <Tv className="w-4 h-4 text-primary-text" />
            <span className="text-[11px] font-bold text-primary-text flex items-center gap-0.5">
              <Check className="w-3 h-3" /> {userSubscriptions.length}
            </span>
          </div>
          <span className="text-xs font-bold text-foreground leading-snug">
            1. Deine Abos wählen
          </span>
        </button>

        <Link
          href="/quick-rate"
          className="min-h-[48px] p-3 rounded-xl bg-primary-soft border border-primary/30 text-left flex flex-col justify-between gap-1.5 active:scale-[0.98] transition"
        >
          <div className="flex items-center justify-between">
            <Zap className="w-4 h-4 text-primary-text" />
            <span className="text-[11px] font-mono font-bold text-primary-text">
              {myWatchedCount}/10
            </span>
          </div>
          <span className="text-xs font-bold text-foreground leading-snug">
            2. Per Swipe bewerten
          </span>
        </Link>
      </div>
    </div>
  );
}
