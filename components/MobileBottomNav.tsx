"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Compass, Search, Sparkles, User, Users } from "lucide-react";
import { useMedia } from "./MediaContext";
import { isDiscoverRoute } from "./Navbar";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { openSearch, communityData } = useMedia();

  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  const pendingRequestsCount = communityData?.friendRequests?.pendingReceived?.length || 0;

  const isDiscoverActive = isDiscoverRoute(pathname);
  const isRecsActive = pathname?.startsWith("/recommendations");
  const isSearchActive = pathname?.startsWith("/search");
  const isFriendsActive = pathname?.startsWith("/friends");
  const isProfileActive = pathname === "/profile";

  const profileHref = session?.user ? "/profile" : "/login";

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] shadow-[0_-8px_24px_rgba(0,0,0,0.18)] select-none"
    >
      <div className="grid grid-cols-5 items-stretch max-w-lg mx-auto h-16 px-1">
        <Link
          href="/"
          aria-current={isDiscoverActive ? "page" : undefined}
          className={`flex flex-col items-center justify-center gap-1 rounded-xl transition-all active:scale-95 ${
            isDiscoverActive
              ? "text-primary-text"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span
            className={`px-3 py-1 rounded-full transition-colors ${
              isDiscoverActive ? "bg-primary-soft" : ""
            }`}
          >
            <Compass className="w-5 h-5" aria-hidden="true" />
          </span>
          <span className="text-[11px] font-semibold leading-none tracking-tight">Entdecken</span>
        </Link>

        <Link
          href="/recommendations"
          aria-current={isRecsActive ? "page" : undefined}
          className={`flex flex-col items-center justify-center gap-1 rounded-xl transition-all active:scale-95 ${
            isRecsActive
              ? "text-primary-text"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span
            className={`px-3 py-1 rounded-full transition-colors ${
              isRecsActive ? "bg-primary-soft" : ""
            }`}
          >
            <Sparkles className="w-5 h-5" aria-hidden="true" />
          </span>
          <span className="text-[11px] font-semibold leading-none tracking-tight">Tipps</span>
        </Link>

        <button
          type="button"
          onClick={() => openSearch()}
          aria-label="Schnellsuche öffnen"
          aria-current={isSearchActive ? "page" : undefined}
          className="flex flex-col items-center justify-center gap-1 rounded-xl text-foreground hover:text-primary-text active:scale-95 transition-all"
        >
          <span
            className={`px-3.5 py-1.5 rounded-full border shadow-sm transition-colors ${
              isSearchActive
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-primary-soft border-primary/30 text-primary-text"
            }`}
          >
            <Search className="w-5 h-5" aria-hidden="true" />
          </span>
          <span
            className={`text-[11px] font-semibold leading-none tracking-tight ${
              isSearchActive ? "text-primary-text" : "text-primary-text"
            }`}
          >
            Suche
          </span>
        </button>

        <Link
          href="/friends"
          aria-current={isFriendsActive ? "page" : undefined}
          className={`flex flex-col items-center justify-center gap-1 rounded-xl transition-all active:scale-95 relative ${
            isFriendsActive
              ? "text-primary-text"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span
            className={`relative px-3 py-1 rounded-full transition-colors ${
              isFriendsActive ? "bg-primary-soft" : ""
            }`}
          >
            <Users className="w-5 h-5" aria-hidden="true" />
            {pendingRequestsCount > 0 && (
              <span className="absolute -top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shadow">
                {pendingRequestsCount}
              </span>
            )}
          </span>
          <span className="text-[11px] font-semibold leading-none tracking-tight">Freunde</span>
        </Link>

        <Link
          href={profileHref}
          aria-current={isProfileActive ? "page" : undefined}
          className={`flex flex-col items-center justify-center gap-1 rounded-xl transition-all active:scale-95 ${
            isProfileActive
              ? "text-primary-text"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span
            className={`px-3 py-1 rounded-full transition-colors ${
              isProfileActive ? "bg-primary-soft" : ""
            }`}
          >
            <User className="w-5 h-5" aria-hidden="true" />
          </span>
          <span className="text-[11px] font-semibold leading-none tracking-tight">
            {session?.user ? "Profil" : "Login"}
          </span>
        </Link>
      </div>
    </nav>
  );
}
