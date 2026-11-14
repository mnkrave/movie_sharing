"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Compass, Flame, Search, Users } from "lucide-react";
import { useMedia } from "./MediaContext";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { openSearch, communityData } = useMedia();

  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  const pendingRequestsCount = communityData?.friendRequests?.pendingReceived?.length || 0;

  const isDiscoverActive = pathname === "/";
  const isFeedActive = pathname?.startsWith("/feed");
  const isListActive = pathname?.startsWith("/my-list");
  const isFriendsActive = pathname?.startsWith("/friends");

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#07090e]/95 backdrop-blur-xl border-t border-slate-800/80 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(0,0,0,0.45)]"
    >
      <div className="grid grid-cols-5 items-stretch max-w-lg mx-auto h-16 px-1">
        <Link
          href="/"
          aria-current={isDiscoverActive ? "page" : undefined}
          className={`flex flex-col items-center justify-center gap-1 rounded-xl transition-colors ${
            isDiscoverActive
              ? "text-amber-400"
              : "text-slate-400 hover:text-slate-200 active:bg-slate-900/70"
          }`}
        >
          <span
            className={`px-3 py-1 rounded-full transition-colors ${
              isDiscoverActive ? "bg-amber-500/15" : ""
            }`}
          >
            <Compass className="w-5 h-5" />
          </span>
          <span className="text-[11px] font-semibold leading-none tracking-tight">Entdecken</span>
        </Link>

        <Link
          href="/feed"
          aria-current={isFeedActive ? "page" : undefined}
          className={`flex flex-col items-center justify-center gap-1 rounded-xl transition-colors ${
            isFeedActive
              ? "text-amber-400"
              : "text-slate-400 hover:text-slate-200 active:bg-slate-900/70"
          }`}
        >
          <span
            className={`px-3 py-1 rounded-full transition-colors ${
              isFeedActive ? "bg-amber-500/15" : ""
            }`}
          >
            <Flame className="w-5 h-5" />
          </span>
          <span className="text-[11px] font-semibold leading-none tracking-tight">Feed</span>
        </Link>

        <button
          type="button"
          onClick={() => openSearch()}
          aria-label="Schnellsuche öffnen"
          className="flex flex-col items-center justify-center gap-1 rounded-xl text-slate-300 hover:text-amber-400 active:scale-95 transition-all"
        >
          <span className="px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-sm">
            <Search className="w-5 h-5" />
          </span>
          <span className="text-[11px] font-semibold leading-none tracking-tight text-amber-300/90">
            Suche
          </span>
        </button>

        <Link
          href="/my-list"
          aria-current={isListActive ? "page" : undefined}
          className={`flex flex-col items-center justify-center gap-1 rounded-xl transition-colors ${
            isListActive
              ? "text-amber-400"
              : "text-slate-400 hover:text-slate-200 active:bg-slate-900/70"
          }`}
        >
          <span
            className={`px-3 py-1 rounded-full transition-colors ${
              isListActive ? "bg-amber-500/15" : ""
            }`}
          >
            <Bookmark className="w-5 h-5" />
          </span>
          <span className="text-[11px] font-semibold leading-none tracking-tight">Liste</span>
        </Link>

        <Link
          href="/friends"
          aria-current={isFriendsActive ? "page" : undefined}
          className={`flex flex-col items-center justify-center gap-1 rounded-xl transition-colors relative ${
            isFriendsActive
              ? "text-amber-400"
              : "text-slate-400 hover:text-slate-200 active:bg-slate-900/70"
          }`}
        >
          <span
            className={`relative px-3 py-1 rounded-full transition-colors ${
              isFriendsActive ? "bg-amber-500/15" : ""
            }`}
          >
            <Users className="w-5 h-5" />
            {pendingRequestsCount > 0 && (
              <span className="absolute -top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-black text-[10px] font-bold flex items-center justify-center shadow">
                {pendingRequestsCount}
              </span>
            )}
          </span>
          <span className="text-[11px] font-semibold leading-none tracking-tight">Freunde</span>
        </Link>
      </div>
    </nav>
  );
}
