"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useMedia } from "./MediaContext";
import { NavbarThemeToggle, ThemeSelector } from "./ThemeToggle";
import { isCurrentUserMatch } from "@/lib/auth-match";
import { clearOfflineWatchlist } from "@/lib/offline-watchlist";
import {
  Video,
  Film,
  Search,
  Tv,
  Award,
  Sparkles,
  Users,
  Shield,
  LogOut,
  LogIn,
  Menu,
  X,
  ChevronDown,
  Compass,
  Layers,
  User,
  Zap,
  Bookmark,
} from "lucide-react";

export function isDiscoverRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname === "/" ||
    pathname === "/movies" ||
    pathname === "/tv" ||
    pathname.startsWith("/collections") ||
    pathname === "/oscars"
  );
}

const DISCOVER_ITEMS = [
  {
    href: "/collections",
    label: "Kollektionen",
    sub: "Filmreihen, Universen & Listen",
    icon: Layers,
  },
  {
    href: "/movies",
    label: "Top 250 Filme",
    sub: "Die besten Filme aller Zeiten",
    icon: Film,
  },
  {
    href: "/tv",
    label: "Top 250 Serien",
    sub: "Die besten TV-Serien",
    icon: Tv,
  },
  {
    href: "/oscars",
    label: "Oscar-Gewinner",
    sub: "Alle Bester-Film-Preisträger",
    icon: Award,
  },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const {
    openSearch,
    openSubscriptions,
    userSubscriptions,
    currentUserAvatar,
    communityData,
  } = useMedia();
  const pendingRequestsCount = communityData.friendRequests?.pendingReceived?.length || 0;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [discoverDropdownOpen, setDiscoverDropdownOpen] = useState(false);
  const discoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const discoverWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileMenuOpen(false);
    setDiscoverDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!discoverDropdownOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (discoverWrapperRef.current && !discoverWrapperRef.current.contains(e.target as Node)) {
        setDiscoverDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDiscoverDropdownOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [discoverDropdownOpen]);

  const canHoverPreview = () =>
    typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches;

  const handleDiscoverEnter = (e: React.PointerEvent) => {
    if (e.pointerType === "touch" || !canHoverPreview()) return;
    if (discoverTimeoutRef.current) clearTimeout(discoverTimeoutRef.current);
    setDiscoverDropdownOpen(true);
  };

  const handleDiscoverLeave = (e: React.PointerEvent) => {
    if (e.pointerType === "touch" || !canHoverPreview()) return;
    discoverTimeoutRef.current = setTimeout(() => {
      setDiscoverDropdownOpen(false);
    }, 180);
  };

  const handleDiscoverBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const next = e.relatedTarget as Node | null;
    if (!next || !discoverWrapperRef.current?.contains(next)) {
      setDiscoverDropdownOpen(false);
    }
  };

  const isAdmin =
    session?.user?.email?.toLowerCase() === "lukasreinle0@gmail.com" ||
    (session?.user as any)?.role === "ADMIN";

  const myUserId = (session?.user as any)?.id as string | undefined;
  const myWatchedCount = session?.user
    ? communityData.mediaStatuses.filter(
        (m) =>
          m.status === "WATCHED" &&
          isCurrentUserMatch(
            { userId: myUserId, name: session.user?.name, email: session.user?.email },
            { userId: m.userId, userName: m.userName }
          )
      ).length
    : 0;
  const myWatchlistCount = session?.user
    ? communityData.mediaStatuses.filter(
        (m) =>
          m.status === "WATCHLIST" &&
          isCurrentUserMatch(
            { userId: myUserId, name: session.user?.name, email: session.user?.email },
            { userId: m.userId, userName: m.userName }
          )
      ).length
    : 0;
  const showQuickRateNav = Boolean(session?.user && myWatchedCount < 250);

  const isDiscoverActive = isDiscoverRoute(pathname);
  const isWatchlistActive = pathname === "/my-list";
  const isRecsActive = pathname?.startsWith("/recommendations");
  const isFriendsActive = pathname?.startsWith("/friends");
  const isProfileActive = pathname === "/profile";

  return (
    <header className="sticky top-0 z-40 pt-[env(safe-area-inset-top)] bg-background/90 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo + Primary Navigation */}
        <div className="flex items-center gap-6 min-w-0">
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm group-hover:scale-105 transition">
              <Video className="w-5 h-5 fill-current" aria-hidden="true" />
            </div>
            <span className="text-lg sm:text-xl font-black tracking-tight text-foreground group-hover:text-primary-text transition">
              CineCircle
            </span>
          </Link>

          <nav aria-label="Hauptnavigation" className="hidden md:flex items-center gap-1">
            {/* Entdecken Dropdown */}
            <div
              ref={discoverWrapperRef}
              className="relative"
              onPointerEnter={handleDiscoverEnter}
              onPointerLeave={handleDiscoverLeave}
              onBlur={handleDiscoverBlur}
            >
              <button
                type="button"
                aria-expanded={discoverDropdownOpen}
                aria-controls="discover-menu"
                onClick={() => setDiscoverDropdownOpen((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  isDiscoverActive
                    ? "bg-primary-soft text-primary-text border border-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent"
                }`}
              >
                <Compass className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Entdecken</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    discoverDropdownOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              {discoverDropdownOpen && (
                <div className="absolute left-0 top-full pt-2 w-64 z-50">
                  <ul
                    id="discover-menu"
                    className="rounded-2xl bg-card border border-border shadow-xl p-1.5 space-y-0.5 animate-in fade-in"
                  >
                    {DISCOVER_ITEMS.map((item) => {
                      const Icon = item.icon;
                      const active =
                        pathname === item.href ||
                        (item.href === "/collections" && pathname?.startsWith("/collections"));
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            aria-current={active ? "page" : undefined}
                            onClick={() => setDiscoverDropdownOpen(false)}
                            className={`flex items-start gap-3 p-2.5 rounded-xl transition ${
                              active
                                ? "bg-primary-soft text-foreground border border-primary/30"
                                : "text-foreground/85 hover:bg-muted hover:text-foreground border border-transparent"
                            }`}
                          >
                            <span className="p-2 rounded-lg bg-primary-soft text-primary-text flex-shrink-0">
                              <Icon className="w-4 h-4" aria-hidden="true" />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-xs font-bold leading-tight">
                                {item.label}
                              </span>
                              <span className="block text-[11px] text-muted-foreground mt-0.5">
                                {item.sub}
                              </span>
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            {/* Watchlist */}
            <Link
              href="/my-list"
              aria-current={isWatchlistActive ? "page" : undefined}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                isWatchlistActive
                  ? "bg-primary-soft text-primary-text border border-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Watchlist</span>
              {session?.user && myWatchlistCount > 0 && (
                <span className="hidden xl:inline-block px-1.5 py-0.5 rounded-full bg-muted text-foreground font-mono font-bold text-[10px] leading-none">
                  {myWatchlistCount}
                </span>
              )}
            </Link>

            {/* Empfehlungen */}
            <Link
              href="/recommendations"
              aria-current={isRecsActive ? "page" : undefined}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                isRecsActive
                  ? "bg-primary-soft text-primary-text border border-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Empfehlungen</span>
            </Link>

            {/* Freunde */}
            <Link
              href="/friends"
              aria-current={isFriendsActive ? "page" : undefined}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                isFriendsActive
                  ? "bg-primary-soft text-primary-text border border-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent"
              }`}
            >
              <Users className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Freunde</span>
              {pendingRequestsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground font-black text-[10px] leading-none">
                  {pendingRequestsCount}
                </span>
              )}
            </Link>

            {/* Schnell-Bewerten (visible while signed-in user has < 250 watched items) */}
            {showQuickRateNav && (
              <Link
                href="/quick-rate"
                aria-current={pathname === "/quick-rate" ? "page" : undefined}
                title="Schnell Filme & Serien bewerten (verschwindet ab 250 gesehenen Titeln)"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  pathname === "/quick-rate"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-primary-soft text-primary-text border border-primary/30 hover:border-primary/50"
                }`}
              >
                <Zap className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Schnell-Bewerten</span>
                <span
                  className={`hidden xl:inline-block text-[10px] font-mono font-bold px-1.5 py-0.5 rounded leading-none ${
                    pathname === "/quick-rate"
                      ? "bg-black/15 text-primary-foreground"
                      : "bg-card/80 text-primary-text"
                  }`}
                >
                  {myWatchedCount}/250
                </span>
              </Link>
            )}
          </nav>
        </div>

        {/* Right Controls (Search, Abos, Theme, Admin, Profile as Rightmost Item) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openSearch}
            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border hover:border-border-strong text-muted-foreground hover:text-foreground text-xs font-medium transition cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-primary-text" aria-hidden="true" />
            <span>Suchen…</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] bg-muted text-muted-foreground rounded border border-border font-mono">
              ⌘K
            </kbd>
          </button>

          <button
            type="button"
            onClick={openSubscriptions}
            title="Deine Streaming-Abos verwalten"
            aria-label={`Deine Streaming-Abos verwalten (${userSubscriptions.length} aktiv)`}
            className="flex items-center justify-center gap-1.5 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 px-2.5 md:px-3 py-2 rounded-xl bg-card border border-border hover:border-primary/40 text-foreground text-xs font-semibold transition cursor-pointer"
          >
            <Tv className="w-4 h-4 text-primary-text" aria-hidden="true" />
            <span className="hidden sm:inline">Abos</span>
            <span className="text-[11px] bg-primary-soft text-primary-text px-1.5 py-0.5 rounded font-mono font-bold leading-none">
              {userSubscriptions.length}
            </span>
          </button>

          <NavbarThemeToggle />

          {isAdmin && (
            <Link
              href="/admin"
              title="Admin-Verwaltung"
              aria-label="Admin-Verwaltung"
              aria-current={pathname?.startsWith("/admin") ? "page" : undefined}
              className={`hidden md:flex items-center justify-center size-9 rounded-xl border transition ${
                pathname?.startsWith("/admin")
                  ? "bg-primary-soft border-primary/40 text-primary-text"
                  : "bg-card border-border hover:border-border-strong text-muted-foreground hover:text-foreground"
              }`}
            >
              <Shield className="w-4 h-4" aria-hidden="true" />
            </Link>
          )}

          {/* Rightmost Nav Item: Profil (or Einloggen) */}
          {session?.user ? (
            <Link
              href="/profile"
              aria-current={isProfileActive ? "page" : undefined}
              className={`flex items-center justify-center gap-2 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 p-1.5 sm:pr-3 rounded-xl border text-xs font-semibold transition ${
                isProfileActive
                  ? "bg-primary-soft border-primary/40 text-primary-text"
                  : "bg-card border-border hover:border-border-strong text-foreground"
              }`}
            >
              {currentUserAvatar ? (
                <div className="relative w-6 h-6 rounded-lg overflow-hidden border border-primary/40 flex-shrink-0">
                  <Image
                    src={currentUserAvatar}
                    alt={session.user.name || "Profil"}
                    fill
                    sizes="24px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-extrabold text-[11px] flex-shrink-0">
                  {session.user.name?.slice(0, 1).toUpperCase() || "U"}
                </div>
              )}
              <span className="hidden sm:inline">Profil</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 min-h-[44px] md:min-h-0 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold transition shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Einloggen</span>
            </Link>
          )}

          {/* Mobile Drawer Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label="Navigation umschalten"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 top-[calc(4rem+env(safe-area-inset-top))] bg-black/60 backdrop-blur-sm z-30 md:hidden animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden relative z-40 bg-card border-b border-border px-4 pt-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] max-h-[calc(100dvh-4rem-env(safe-area-inset-top))] overflow-y-auto overscroll-contain space-y-2 text-sm shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-1">
            Entdecken
          </div>
          {DISCOVER_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 min-h-[44px] px-4 py-2.5 rounded-xl font-semibold transition ${
                pathname === item.href
                  ? "bg-primary-soft text-primary-text border border-primary/30"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <item.icon className="w-4 h-4 text-primary-text flex-shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <span className="block leading-tight">{item.label}</span>
                <span className="block text-xs font-normal text-muted-foreground truncate">
                  {item.sub}
                </span>
              </div>
            </Link>
          ))}

          <Link
            href="/my-list"
            aria-current={isWatchlistActive ? "page" : undefined}
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center justify-between gap-3 min-h-[44px] px-4 py-2.5 rounded-xl font-semibold transition ${
              isWatchlistActive
                ? "bg-primary-soft text-primary-text border border-primary/30"
                : "text-foreground hover:bg-muted"
            }`}
          >
            <span className="flex items-center gap-3">
              <Bookmark className="w-4 h-4 text-primary-text flex-shrink-0" aria-hidden="true" />
              <span>Watchlist</span>
            </span>
            {session?.user && myWatchlistCount > 0 && (
              <span className="text-xs font-mono text-muted-foreground">
                {myWatchlistCount}
              </span>
            )}
          </Link>

          {showQuickRateNav && (
            <Link
              href="/quick-rate"
              aria-current={pathname === "/quick-rate" ? "page" : undefined}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between gap-3 min-h-[44px] px-4 py-2.5 rounded-xl font-semibold transition ${
                pathname === "/quick-rate"
                  ? "bg-primary-soft text-primary-text border border-primary/30"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <span className="flex items-center gap-3">
                <Zap className="w-4 h-4 text-primary-text flex-shrink-0" aria-hidden="true" />
                <span>Schnell-Bewerten</span>
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                {myWatchedCount}/250
              </span>
            </Link>
          )}

          <div className="pt-2 border-t border-border space-y-2">
            <div className="px-3 py-1 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Darstellung</span>
              <ThemeSelector />
            </div>

            {session?.user && (
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 min-h-[44px] px-4 py-2.5 rounded-xl font-semibold text-foreground hover:bg-muted transition"
              >
                <User className="w-4 h-4 text-primary-text" aria-hidden="true" />
                <span>Mein Profil</span>
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 min-h-[44px] px-4 py-2.5 rounded-xl font-semibold text-primary-text hover:bg-primary-soft transition"
              >
                <Shield className="w-4 h-4" aria-hidden="true" />
                <span>Admin-Verwaltung</span>
              </Link>
            )}

            {session?.user && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  clearOfflineWatchlist();
                  signOut({ callbackUrl: "/" });
                }}
                className="w-full flex items-center gap-3 min-h-[44px] px-4 py-2.5 rounded-xl font-semibold text-rose-500 hover:bg-rose-500/10 transition text-left"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                <span>Abmelden</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
