"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useMedia } from "./MediaContext";
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
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { openSearch, openSubscriptions, userSubscriptions } = useMedia();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [discoverDropdownOpen, setDiscoverDropdownOpen] = useState(false);
  const discoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const isDiscoverActive =
    pathname === "/" ||
    pathname === "/movies" ||
    pathname === "/tv" ||
    pathname.startsWith("/collections") ||
    pathname === "/oscars";

  const mainNavLinks = [
    { href: "/feed", label: "Freunde-Feed", icon: Sparkles },
    { href: "/my-list", label: "Meine Liste", icon: Bookmark },
    { href: "/friends", label: "Freunde", icon: Users },
  ];

  if (isAdmin) {
    mainNavLinks.push({ href: "/admin", label: "Admin", icon: Shield });
  }

  const discoverItems = [
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
    <nav className="sticky top-0 z-40 bg-[#07090e]/95 backdrop-blur-xl border-b border-slate-800/80">
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
          {mainNavLinks.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                  active
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Trigger Button */}
          <button
            type="button"
            onClick={openSearch}
            className="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-xs font-medium transition shadow-sm"
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
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-slate-300 text-xs font-semibold transition"
          >
            <Tv className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Abos</span>
            <span className="text-[11px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono font-bold">
              {userSubscriptions.length}
            </span>
          </button>

          {/* User Account / Profile */}
          {session?.user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 sm:pr-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-black font-extrabold text-xs">
                  {session.user.name?.slice(0, 1) || "U"}
                </div>
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
                    onClick={() => signOut({ callbackUrl: "/" })}
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
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition shadow-lg shadow-amber-500/20"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Einloggen</span>
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Navigation umschalten"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a0e1a] border-b border-slate-800 px-4 py-4 space-y-1 text-sm">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 py-1">
            Entdecken
          </div>
          {discoverItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-2 rounded-xl font-semibold transition ${
                pathname === item.href
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                  : "text-slate-300 hover:bg-slate-800/60"
              }`}
            >
              <item.icon className="w-4 h-4 text-amber-400" />
              <span>{item.label}</span>
            </Link>
          ))}

          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 pt-3 pb-1">
            Community
          </div>
          {mainNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-2 rounded-xl font-semibold transition ${
                pathname === link.href
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                  : "text-slate-300 hover:bg-slate-800/60"
              }`}
            >
              <link.icon className="w-4 h-4" />
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
