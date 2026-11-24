"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useMedia } from "./MediaContext";
import { clearOfflineWatchlist } from "@/lib/offline-watchlist";
import {
  Video,
  Film,
  Search,
  Tv,
  Award,
  Sparkles,
  Bookmark,
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
  BarChart3,
  Zap,
} from "lucide-react";

export function isDiscoverRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname === "/" ||
    pathname === "/movies" ||
    pathname === "/tv" ||
    pathname.startsWith("/collections") ||
    pathname === "/oscars" ||
    pathname.startsWith("/recommendations") ||
    pathname === "/quick-rate"
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const {
    openSearch,
    openSubscriptions,
    userSubscriptions,
    currentUserAvatar,
    openAvatarPicker,
    communityData,
  } = useMedia();
  const pendingRequestsCount = communityData.friendRequests?.pendingReceived?.length || 0;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [discoverDropdownOpen, setDiscoverDropdownOpen] = useState(false);
  const discoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setDiscoverDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!userDropdownOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [userDropdownOpen]);

  const handleDiscoverEnter = () => {
    if (discoverTimeoutRef.current) clearTimeout(discoverTimeoutRef.current);
    setDiscoverDropdownOpen(true);
  };

  const handleDiscoverLeave = () => {
    discoverTimeoutRef.current = setTimeout(() => {
      setDiscoverDropdownOpen(false);
    }, 200);
  };

  const isAdmin =
    session?.user?.email?.toLowerCase() === "lukasreinle0@gmail.com" ||
    (session?.user as any)?.role === "ADMIN";

  const myUserId = (session?.user as any)?.id || "user_lukas";
  const myName = session?.user?.name?.toLowerCase();
  const myWatchedCount = communityData.mediaStatuses.filter(
    (m) =>
      m.status === "WATCHED" &&
      (m.userId === myUserId || (myName && m.userName?.toLowerCase() === myName))
  ).length;
  const showQuickRateNav = Boolean(session?.user && myWatchedCount < 250);

  const isDiscoverActive = isDiscoverRoute(pathname);

  const mainNavLinks = [
    { href: "/feed", label: "Freunde-Feed", icon: Sparkles },
    { href: "/my-list", label: "Meine Liste", icon: Bookmark },
    { href: "/friends", label: "Freunde", icon: Users },
  ];

  if (isAdmin) {
    mainNavLinks.push({ href: "/admin", label: "Admin", icon: Shield });
  }

  const discoverItems = [
    ...(showQuickRateNav
      ? [
          {
            href: "/quick-rate",
            label: `Schnell-Bewerten (${myWatchedCount}/250)`,
            sub: "Klassiker im Speed-Modus bewerten",
            icon: Zap,
            color: "text-amber-400 bg-amber-500/15",
          },
        ]
      : []),
    {
      href: "/recommendations",
      label: "Empfehlungen",
      sub: "KI-Berater & Algorithmus-Matches",
      icon: Sparkles,
      color: "text-amber-400 bg-amber-500/10",
    },
    {
      href: "/",
      label: "Startseite",
      sub: "Übersicht & Trends",
      icon: Film,
      color: "text-amber-400 bg-amber-500/10",
    },
    {
      href: "/collections",
      label: "Kollektionen & Universen",
      sub: "Star Wars, Spielberg, MCU & mehr",
      icon: Layers,
      color: "text-purple-400 bg-purple-500/10",
    },
    {
      href: "/movies",
      label: "Top 250 Filme",
      sub: "Die besten Filme aller Zeiten",
      icon: Film,
      color: "text-sky-400 bg-sky-500/10",
    },
    {
      href: "/tv",
      label: "Top Serien",
      sub: "Die besten TV-Serien",
      icon: Tv,
      color: "text-cyan-400 bg-cyan-500/10",
    },
    {
      href: "/oscars",
      label: "Oscar-Gewinner",
      sub: "Academy Award Meisterwerke",
      icon: Award,
      color: "text-amber-400 bg-amber-500/10",
    },
  ];

  return (
    <nav className="sticky top-0 z-40 pt-[env(safe-area-inset-top)] bg-[#07090e]/95 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo with Film Camera */}
        <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-black shadow-lg shadow-amber-500/25 group-hover:scale-105 transition">
            <Video className="w-5 h-5 text-black fill-black" />
          </div>
          <span className="text-xl font-black tracking-tight text-white group-hover:text-amber-400 transition">
            CineCircle
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1.5">
          {/* Entdecken Dropdown */}
          <div
            className="relative"
            onMouseEnter={handleDiscoverEnter}
            onMouseLeave={handleDiscoverLeave}
          >
            <button
              type="button"
              onClick={() => setDiscoverDropdownOpen(!discoverDropdownOpen)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                isDiscoverActive
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Entdecken</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  discoverDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {discoverDropdownOpen && (
              <div
                className="absolute left-0 top-full pt-1.5 w-64 z-50"
                onMouseEnter={handleDiscoverEnter}
                onMouseLeave={handleDiscoverLeave}
              >
                <div
                  className="rounded-2xl bg-[#0c111d] border border-slate-800 shadow-2xl p-1.5 animate-in fade-in"
                  onClick={() => setDiscoverDropdownOpen(false)}
                >
                  {discoverItems.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-start gap-3 p-2.5 rounded-xl transition ${
                          active
                            ? "bg-amber-500/15 border border-amber-500/30 text-white"
                            : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                        }`}
                      >
                        <div className={`p-2 rounded-lg flex-shrink-0 ${item.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white leading-tight">{item.label}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{item.sub}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Main Links (Freunde-Feed, Meine Liste, Freunde, Admin) */}
          {showQuickRateNav && (
            <Link
              href="/quick-rate"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                pathname === "/quick-rate"
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                  : "bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25"
              }`}
              title="Schnell Filme & Serien bewerten (verschwindet ab 250 Bewertungen)"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Bewerten</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black ${
                  pathname === "/quick-rate"
                    ? "bg-black/20 text-black"
                    : "bg-amber-500/20 text-amber-300"
                }`}
              >
                {myWatchedCount}/250
              </span>
            </Link>
          )}
          {mainNavLinks.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            const showBadge = link.href === "/friends" && pendingRequestsCount > 0;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition relative ${
                  active
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
                {showBadge && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-black font-black text-[10px] shadow">
                    {pendingRequestsCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Trigger Button (Desktop - on mobile/tablet < md Search is prominent in MobileBottomNav) */}
          <button
            type="button"
            onClick={openSearch}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-xs font-medium transition shadow-sm"
          >
            <Search className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Suchen...</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-400 rounded border border-slate-700 font-mono">
              ⌘K
            </kbd>
          </button>

          {/* Subscriptions Setting Button */}
          <button
            type="button"
            onClick={openSubscriptions}
            title="Deine Streaming-Abos verwalten"
            aria-label={`Deine Streaming-Abos verwalten (${userSubscriptions.length} aktiv)`}
            className="flex items-center justify-center gap-1.5 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 px-3 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-slate-300 text-xs font-semibold transition"
          >
            <Tv className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Abos</span>
            <span className="text-[11px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 md:py-0.2 rounded font-mono font-bold">
              {userSubscriptions.length}
            </span>
          </button>

          {/* User Account / Profile */}
          {session?.user ? (
            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                aria-label="Benutzermenü öffnen"
                className="flex items-center justify-center gap-2 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 p-1.5 sm:pr-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
              >
                {currentUserAvatar ? (
                  <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-amber-500/50 flex-shrink-0">
                    <Image
                      src={currentUserAvatar}
                      alt={session.user.name || "User"}
                      fill
                      sizes="28px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-black font-extrabold text-xs">
                    {session.user.name?.slice(0, 1) || "U"}
                  </div>
                )}
                <span className="hidden sm:inline text-xs font-semibold text-white truncate max-w-[100px]">
                  {session.user.name}
                </span>
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-2xl bg-[#0f1422] border border-slate-800 shadow-2xl p-1.5 z-50 text-xs animate-in fade-in"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                    <p className="font-bold text-white truncate">{session.user.name}</p>
                    <p className="text-slate-400 text-[11px] truncate">{session.user.email}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      openAvatarPicker();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Profilbild wählen</span>
                  </button>

                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Mein Profil & Statistik</span>
                  </Link>

                  <Link
                    href="/quick-rate"
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition"
                  >
                    <div className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>Filme bewerten & Import</span>
                    </div>
                    {myWatchedCount < 250 && (
                      <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/15 px-1.5 py-0.2 rounded">
                        {myWatchedCount}/250
                      </span>
                    )}
                  </Link>

                  <Link
                    href="/my-list"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-sky-400" />
                    <span>Meine Listen</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-amber-400 hover:bg-amber-500/10 transition"
                    >
                      <Shield className="w-3.5 h-3.5 text-amber-400" />
                      <span>Admin-Verwaltung</span>
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      clearOfflineWatchlist();
                      signOut({ callbackUrl: "/" });
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition mt-1 border-t border-slate-800/60"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Abmelden</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 min-h-[44px] md:min-h-0 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition shadow-lg shadow-amber-500/20"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Einloggen</span>
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
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

      {/* Mobile Drawer (Secondary destinations only; Feed, Liste & Freunde live in MobileBottomNav) */}
      {mobileMenuOpen && (
        <div className="md:hidden relative z-40 bg-[#0a0e1a] border-b border-slate-800 px-4 pt-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] max-h-[calc(100dvh-4rem-env(safe-area-inset-top))] overflow-y-auto overscroll-contain space-y-1 text-sm shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">
            Entdecken & Listen
          </div>
          {discoverItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 min-h-[44px] px-4 py-2.5 rounded-xl font-semibold transition ${
                pathname === item.href
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                  : "text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <item.icon className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div className="min-w-0">
                <span className="block leading-tight">{item.label}</span>
                <span className="block text-xs font-normal text-slate-400 truncate">{item.sub}</span>
              </div>
            </Link>
          ))}

          {(session?.user || isAdmin) && (
            <>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 pt-3 pb-1">
                Konto & Verwaltung
              </div>
              {session?.user && (
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 min-h-[44px] px-4 py-2.5 rounded-xl font-semibold transition ${
                    pathname === "/profile"
                      ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                      : "text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                  <span>Mein Profil & Kino-DNA</span>
                </Link>
              )}
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 min-h-[44px] px-4 py-2.5 rounded-xl font-semibold transition ${
                    pathname === "/admin"
                      ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                      : "text-amber-300 hover:bg-amber-500/10"
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin-Verwaltung</span>
                </Link>
              )}
            </>
          )}
        </div>
      )}
    </nav>
  );
}
