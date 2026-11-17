"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { WifiOff, RefreshCw, Film, Bookmark, Compass } from "lucide-react";

export default function OfflinePage() {
  const [isRetrying, setIsRetrying] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

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

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      window.location.reload();
    }, 400);
  };

  return (
    <div className="min-h-[75dvh] flex items-center justify-center px-4 py-12">
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
            CineCircle konnte den Server gerade nicht erreichen. Bereits geladene Filmdaten, Cover
            und deine Merkliste bleiben auf deinem Smartphone erhalten.
          </p>
        </div>

        {/* Retry Button */}
        <div className="pt-2 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`} />
            <span>{isRetrying ? "Verbindung wird geprüft..." : "Erneut versuchen"}</span>
          </button>

          <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
            <Link
              href="/"
              className="py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold hover:bg-slate-800 transition flex items-center justify-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Startseite</span>
            </Link>
            <Link
              href="/my-list"
              className="py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold hover:bg-slate-800 transition flex items-center justify-center gap-1.5"
            >
              <Bookmark className="w-3.5 h-3.5 text-sky-400" />
              <span>Meine Liste</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
