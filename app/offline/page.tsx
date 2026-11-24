"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { WifiOff, RefreshCw, Bookmark, Compass, Film, Tv } from "lucide-react";
import {
  clearOfflineWatchlist,
  OfflineWatchlistSnapshot,
  readOfflineWatchlist,
} from "@/lib/offline-watchlist";

export default function OfflinePage() {
  const { data: session, status: sessionStatus } = useSession();
  const [isRetrying, setIsRetrying] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [snapshot, setSnapshot] = useState<OfflineWatchlistSnapshot | null>(null);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      window.location.reload();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      const rawId = (session?.user as { id?: unknown } | undefined)?.id;
      const myUserId = typeof rawId === "string" ? rawId.trim() : "";
      if (!myUserId) {
        setSnapshot(null);
        return;
      }
      const existing = readOfflineWatchlist();
      if (existing && existing.ownerId !== myUserId) {
        clearOfflineWatchlist();
        setSnapshot(null);
        return;
      }
      setSnapshot(readOfflineWatchlist(myUserId));
      return;
    }

    const currentlyOnline = typeof navigator !== "undefined" ? navigator.onLine : isOnline;
    if (currentlyOnline) {
      if (sessionStatus === "unauthenticated") {
        clearOfflineWatchlist();
      }
      setSnapshot(null);
      return;
    }

    // Truly offline: /api/auth/session cannot be verified, show only the last verified local snapshot
    setSnapshot(readOfflineWatchlist());
  }, [session, sessionStatus, isOnline]);

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      window.location.reload();
    }, 400);
  };

  const watchlistItems = (snapshot?.items || []).filter(
    (item) => item.status === "WATCHLIST" || item.status === "WATCHING"
  );

  return (
    <div className="min-h-[75dvh] flex flex-col items-center justify-center px-4 py-8 space-y-6">
      <div className="max-w-md w-full bg-[#0b101d] border border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl animate-in fade-in duration-300">
        {/* Offline Icon Banner */}
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-lg shadow-amber-500/10">
          <WifiOff className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-[11px] font-bold uppercase tracking-wider border border-slate-700">
            {isOnline ? "Verbindung wieder da" : "Offline-Modus"}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Keine Internetverbindung
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
            {watchlistItems.length > 0
              ? "CineCircle konnte den Server gerade nicht erreichen. Deine zuletzt synchronisierte Merkliste ist unten weiterhin sichtbar."
              : "CineCircle konnte den Server gerade nicht erreichen. Prüfe deine Verbindung und versuche es erneut."}
          </p>
        </div>

        {/* Retry & Cached Startpage */}
        <div className="pt-2 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full min-h-[44px] py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`} />
            <span>{isRetrying ? "Verbindung wird geprüft..." : "Erneut versuchen"}</span>
          </button>

          <Link
            href="/"
            className="w-full min-h-[44px] py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-800 transition flex items-center justify-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>Zur zwischengespeicherten Startseite</span>
          </Link>
        </div>
      </div>

      {/* Local Read-Only Watchlist Snapshot */}
      {watchlistItems.length > 0 && (
        <section className="max-w-md w-full bg-[#0b101d] border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-black text-white flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-sky-400" />
              <span>Deine Merkliste ({watchlistItems.length})</span>
            </h2>
            {snapshot?.savedAt && (
              <span className="text-[11px] text-slate-400">
                Stand: {new Date(snapshot.savedAt).toLocaleDateString("de-DE")}
              </span>
            )}
          </div>

          <div className="divide-y divide-slate-800/70 max-h-80 overflow-y-auto overscroll-contain pr-1">
            {watchlistItems.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center gap-3">
                <div className="relative w-10 h-14 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 flex-shrink-0">
                  {item.posterPath ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w185${item.posterPath}`}
                      alt={item.title}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      {item.mediaType === "tv" ? (
                        <Tv className="w-4 h-4" />
                      ) : (
                        <Film className="w-4 h-4" />
                      )}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white truncate">{item.title}</p>
                  <p className="text-xs text-slate-400">
                    {item.mediaType === "tv" ? "Serie" : "Film"}
                    {item.releaseYear ? ` · ${item.releaseYear}` : ""}
                    {item.status === "WATCHING" ? " · Schaue ich gerade" : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
