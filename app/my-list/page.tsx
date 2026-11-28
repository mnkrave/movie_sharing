"use client";

import React, { useMemo } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Bookmark, LogIn, Trophy, WifiOff } from "lucide-react";
import { useMedia } from "@/components/MediaContext";
import { PullToRefresh } from "@/components/PullToRefresh";
import { ProfileWatchlistPanel } from "@/components/ProfileWatchlistPanel";
import { isCurrentUserMatch } from "@/lib/auth-match";
import { useBatchMediaMeta } from "@/lib/useBatchMediaMeta";

export default function MyListPage() {
  const { data: session } = useSession();
  const { communityData, refreshCommunity, showToast, isOfflineSnapshot } = useMedia();

  const myUserId = (session?.user as any)?.id as string | undefined;

  const myStatuses = useMemo(() => {
    if (!session?.user) return [];
    return communityData.mediaStatuses.filter((m) =>
      isCurrentUserMatch(
        { userId: myUserId, name: session.user?.name, email: session.user?.email },
        { userId: m.userId, userName: m.userName }
      )
    );
  }, [communityData.mediaStatuses, session?.user, myUserId]);

  const watchlistItems = useMemo(
    () => myStatuses.filter((m) => m.status === "WATCHLIST"),
    [myStatuses]
  );

  const watchingItems = useMemo(
    () => myStatuses.filter((m) => m.status === "WATCHING" && m.mediaType === "tv"),
    [myStatuses]
  );

  const watchedCount = useMemo(
    () => myStatuses.filter((m) => m.status === "WATCHED").length,
    [myStatuses]
  );

  const metaInputItems = useMemo(
    () => [...watchlistItems, ...watchingItems],
    [watchlistItems, watchingItems]
  );

  const { metaMap } = useBatchMediaMeta(metaInputItems);

  if (!session) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-primary-soft border border-primary/30 text-primary-text flex items-center justify-center mx-auto">
          <Bookmark className="w-8 h-8" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-black text-foreground">Melde dich an</h1>
        <p className="text-sm text-muted-foreground">
          Um deine persönliche Watchlist und deine vorgemerkten Filme zu sehen, melde dich kurz an.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-sm shadow-sm transition"
        >
          <LogIn className="w-4 h-4" aria-hidden="true" />
          <span>Jetzt einloggen</span>
        </Link>
      </div>
    );
  }

  const handlePullRefresh = async () => {
    try {
      await refreshCommunity();
      showToast("Watchlist aktualisiert!", { type: "success" });
    } catch {
      showToast("Konnte Watchlist nicht aktualisieren.", { type: "error" });
    }
  };

  return (
    <PullToRefresh onRefresh={handlePullRefresh}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
        {isOfflineSnapshot && (
          <div className="p-3.5 rounded-2xl bg-primary-soft border border-primary/30 text-foreground text-xs font-semibold flex items-center gap-2.5">
            <WifiOff className="w-4 h-4 text-primary-text shrink-0" aria-hidden="true" />
            <span>Offline-Ansicht: Zeigt deinen zuletzt gespeicherten Stand deiner Watchlist.</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary-text">
              Persönliche Merkliste
            </p>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Meine Watchlist
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {watchlistItems.length} vorgemerkt · {watchingItems.length} Serien aktuell am Schauen
            </p>
          </div>

          <Link
            href="/profile?tab=hall-of-fame"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-card hover:bg-muted border border-border text-xs font-semibold text-foreground transition self-start sm:self-auto shadow-xs"
          >
            <Trophy className="w-3.5 h-3.5 text-primary-text" aria-hidden="true" />
            <span>Gesehene Titel ({watchedCount})</span>
          </Link>
        </div>

        <ProfileWatchlistPanel
          watchlistItems={watchlistItems}
          watchingItems={watchingItems}
          metaMap={metaMap}
        />
      </div>
    </PullToRefresh>
  );
}
