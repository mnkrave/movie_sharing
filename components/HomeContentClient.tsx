"use client";

import React, { useState, useEffect, useMemo } from "react";
import { MediaItem } from "@/lib/tmdb";
import { MediaCard } from "@/components/MediaCard";
import { useMedia } from "@/components/MediaContext";
import { useSession } from "next-auth/react";
import { Award, Film, Tv, Sparkles, Dices, Layers } from "lucide-react";
import Link from "next/link";
import { MobileOnboardingBanner } from "@/components/MobileOnboardingBanner";
import { HomeCatalogSearch } from "@/components/HomeCatalogSearch";

const MOBILE_RAIL_GRID_CLASS =
  "flex overflow-x-auto snap-x snap-mandatory overscroll-x-contain snap-smooth gap-3.5 -mx-4 px-4 pb-2 scrollbar-none sm:mx-0 sm:px-0 sm:pb-0 sm:overflow-visible sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-5";
const MOBILE_RAIL_ITEM_CLASS = "w-[43vw] max-w-[176px] shrink-0 snap-start sm:w-auto sm:max-w-none";

interface HomeContentClientProps {
  topMovies: MediaItem[];
  topTv: MediaItem[];
  trending: MediaItem[];
  oscarWinners: MediaItem[];
  allOscarWinners?: MediaItem[];
}

type DiscoveryCategory = "MIX" | "TRENDING" | "GEMS" | "CLASSICS";

export function HomeContentClient({
  topMovies,
  topTv,
  trending,
  oscarWinners,
  allOscarWinners = [],
}: HomeContentClientProps) {
  const [filterMode, setFilterMode] = useState<"ALL" | "movie" | "tv">("ALL");
  const [discoveryCategory, setDiscoveryCategory] = useState<DiscoveryCategory>("MIX");
  const [shuffleSeed, setShuffleSeed] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState(false);

  const { communityData } = useMedia();
  const { data: session } = useSession();
  const myUserId = (session?.user as any)?.id;

  useEffect(() => {
    setShuffleSeed(Math.floor(Math.random() * 100000) + 1);
  }, []);

  const watchedKeys = useMemo(() => {
    const s = new Set<string>();
    for (const m of communityData.mediaStatuses) {
      if (m.status === "WATCHED" && (myUserId ? m.userId === myUserId : false)) {
        s.add(`${m.mediaType}_${m.tmdbId}`);
      }
    }
    return s;
  }, [communityData.mediaStatuses, myUserId]);

  const handleReshuffle = () => {
    setIsSpinning(true);
    setShuffleSeed((prev) => prev + Math.floor(Math.random() * 997) + 13);
    setTimeout(() => setIsSpinning(false), 350);
  };

  const discoveryItems = useMemo(() => {
    const oscarPool = allOscarWinners.length > 0 ? allOscarWinners : oscarWinners;

    let rawPool: MediaItem[] = [];
    if (discoveryCategory === "TRENDING") {
      rawPool = [...trending];
    } else if (discoveryCategory === "GEMS") {
      rawPool = [...topMovies.slice(10), ...topTv.slice(10), ...oscarPool.slice(8)];
    } else if (discoveryCategory === "CLASSICS") {
      rawPool = [...oscarPool, ...topMovies.slice(0, 40), ...topTv.slice(0, 35)];
    } else {
      rawPool = [...trending, ...oscarPool, ...topMovies, ...topTv];
    }

    const seen = new Set<string>();
    const uniquePool: MediaItem[] = [];
    for (const item of rawPool) {
      if (!item || !item.id) continue;
      if (filterMode !== "ALL" && item.mediaType !== filterMode) continue;
      const key = `${item.mediaType}_${item.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      uniquePool.push(item);
    }

    const unwatchedPool = uniquePool.filter((it) => !watchedKeys.has(`${it.mediaType}_${it.id}`));
    const activePool = unwatchedPool.length >= 10 ? unwatchedPool : uniquePool;

    if (shuffleSeed === 0) {
      return activePool.slice(0, 10);
    }

    const scored = activePool.map((item, idx) => {
      const typeSalt = item.mediaType === "tv" ? 7919 : 3571;
      const hash = ((item.id * 2654435761 + shuffleSeed * 40503 + idx * 131 + typeSalt) >>> 0) % 100000;
      return { item, hash };
    });

    scored.sort((a, b) => a.hash - b.hash);
    return scored.slice(0, 10).map((s) => s.item);
  }, [
    allOscarWinners,
    oscarWinners,
    topMovies,
    topTv,
    trending,
    discoveryCategory,
    filterMode,
    shuffleSeed,
    watchedKeys,
  ]);

  const quickLinks = [
    { href: "/collections", label: "Kollektionen", icon: Layers },
    { href: "/movies", label: "Top 250 Filme", icon: Film },
    { href: "/tv", label: "Top 250 Serien", icon: Tv },
    { href: "/oscars", label: "Oscar-Gewinner", icon: Award },
    { href: "/recommendations", label: "KI-Berater", icon: Sparkles },
  ];

  return (
    <div className="space-y-10 sm:space-y-14">
      <MobileOnboardingBanner />

      {/* Compact Quick-Navigation Strip */}
      <nav
        aria-label="Bereiche entdecken"
        className="flex items-center gap-2 overflow-x-auto scrollbar-none scroll-fade-x -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {quickLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-card border border-border hover:border-primary/40 text-xs font-semibold text-foreground whitespace-nowrap inline-flex items-center gap-2 flex-shrink-0 transition shadow-xs"
            >
              <Icon className="w-3.5 h-3.5 text-primary-text flex-shrink-0" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* SECTION 1: Heute entdecken (with Alle / Filme / Serien Switcher & Shuffle) */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary-text">
              Für deine nächste Session
            </p>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Heute entdecken
            </h2>
          </div>

          {/* Minimal Segmented Filter: Alle / Filme / Serien */}
          <div
            role="group"
            aria-label="Format filtern"
            className="inline-flex items-center p-1 rounded-xl bg-muted border border-border self-start sm:self-auto"
          >
            {[
              { key: "ALL" as const, label: "Alle" },
              { key: "movie" as const, label: "Filme" },
              { key: "tv" as const, label: "Serien" },
            ].map((tab) => {
              const active = filterMode === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilterMode(tab.key)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    active
                      ? "bg-card text-foreground shadow-sm border border-border"
                      : "text-muted-foreground hover:text-foreground border border-transparent"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sub-row: Discovery Category Pills & Reshuffle */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none max-w-full">
            {[
              { key: "MIX" as const, label: "Mix" },
              { key: "TRENDING" as const, label: "Trends" },
              { key: "GEMS" as const, label: "Geheimtipps" },
              { key: "CLASSICS" as const, label: "Klassiker" },
            ].map((cat) => {
              const active = discoveryCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setDiscoveryCategory(cat.key)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                    active
                      ? "bg-primary-soft text-primary-text border-primary/35"
                      : "bg-card text-muted-foreground border-border hover:text-foreground"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleReshuffle}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card hover:bg-muted text-foreground border border-border text-xs font-semibold transition cursor-pointer"
            title="10 neue Titel mischen"
          >
            <Dices
              className={`w-3.5 h-3.5 text-primary-text transition-transform duration-300 ${
                isSpinning ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            />
            <span>Neu mischen</span>
          </button>
        </div>

        <div className={MOBILE_RAIL_GRID_CLASS}>
          {discoveryItems.map((item, idx) => (
            <div key={`discover_${item.mediaType}_${item.id}`} className={MOBILE_RAIL_ITEM_CLASS}>
              <MediaCard item={item} priority={idx < 5} />
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: Compact Live Search, Filters & Expandable Catalog */}
      <HomeCatalogSearch initialTrending={trending} />
    </div>
  );
}
