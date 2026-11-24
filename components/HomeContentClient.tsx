"use client";

import React, { useState, useEffect, useMemo } from "react";
import { MediaItem } from "@/lib/tmdb";
import { MediaCard } from "@/components/MediaCard";
import { useMedia } from "@/components/MediaContext";
import { useSession } from "next-auth/react";
import { Award, Film, Tv, Flame, ArrowRight, Sparkles, Dices, Gem, Layers, Zap } from "lucide-react";
import Link from "next/link";
import { MobileOnboardingBanner } from "@/components/MobileOnboardingBanner";

const MOBILE_RAIL_GRID_CLASS =
  "flex overflow-x-auto snap-x snap-mandatory overscroll-x-contain snap-smooth gap-3.5 -mx-4 px-4 pb-2 scrollbar-none sm:mx-0 sm:px-0 sm:pb-0 sm:overflow-visible sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-6";
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

  // Set initial random seed on client mount so every page visit shows a fresh mix
  useEffect(() => {
    setShuffleSeed(Math.floor(Math.random() * 100000) + 1);
  }, []);

  // Build set of watched items for the current user to prioritize unwatched titles in the discovery block
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
    setTimeout(() => setIsSpinning(false), 400);
  };

  // Assemble the dynamic first block ("Heute entdecken & Wechselnde Highlights")
  const discoveryItems = useMemo(() => {
    const oscarPool = allOscarWinners.length > 0 ? allOscarWinners : oscarWinners;

    let rawPool: MediaItem[] = [];
    if (discoveryCategory === "TRENDING") {
      rawPool = [...trending];
    } else if (discoveryCategory === "GEMS") {
      // Geheimtipps & tiefere Perlen: Plätze 10–60 der Top-Listen + Oscar-Filme ab Platz 8
      rawPool = [
        ...topMovies.slice(10),
        ...topTv.slice(10),
        ...oscarPool.slice(8),
      ];
    } else if (discoveryCategory === "CLASSICS") {
      // Meisterwerke & moderne Klassiker
      rawPool = [
        ...oscarPool,
        ...topMovies.slice(0, 40),
        ...topTv.slice(0, 35),
      ];
    } else {
      // MIX: Großer kombinierter Pool aus Trends, Top-Filmen, Top-Serien & Oscar-Gewinnern
      rawPool = [
        ...trending,
        ...oscarPool,
        ...topMovies,
        ...topTv,
      ];
    }

    // Deduplicate and apply mediaType filterMode ("ALL" | "movie" | "tv")
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

    // Prefer items the user hasn't watched yet
    const unwatchedPool = uniquePool.filter((it) => !watchedKeys.has(`${it.mediaType}_${it.id}`));
    const activePool = unwatchedPool.length >= 10 ? unwatchedPool : uniquePool;

    if (shuffleSeed === 0) {
      return activePool.slice(0, 10);
    }

    // Deterministic pseudo-random sort using shuffleSeed
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

  const displayedTrending = trending.filter((item) => {
    if (filterMode === "ALL") return true;
    return item.mediaType === filterMode;
  });

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* Mobile-only 2-step starter onboarding for new users */}
      <MobileOnboardingBanner />

      {/* Mobile-only horizontal Discover quick links so key destinations aren't hidden in top drawer */}
      <div className="md:hidden -mx-4 px-4 flex items-center gap-2 overflow-x-auto scrollbar-none scroll-fade-x">
        {[
          { href: "/recommendations", label: "KI-Berater", icon: Sparkles, accent: "text-purple-300 border-purple-500/35 bg-purple-500/15" },
          { href: "/quick-rate", label: "Bewerten", icon: Zap, accent: "text-amber-300 border-amber-500/35 bg-amber-500/15" },
          { href: "/collections", label: "Kollektionen", icon: Layers, accent: "text-indigo-300 border-indigo-500/35 bg-indigo-500/15" },
          { href: "/movies", label: "Top 250", icon: Film, accent: "text-sky-300 border-sky-500/30 bg-sky-500/10" },
          { href: "/tv", label: "Top Serien", icon: Tv, accent: "text-cyan-300 border-cyan-500/30 bg-cyan-500/10" },
          { href: "/oscars", label: "Oscars", icon: Award, accent: "text-amber-300 border-amber-500/30 bg-amber-500/10" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`min-h-[40px] px-3.5 py-2 rounded-2xl border text-xs font-bold whitespace-nowrap flex items-center gap-1.5 flex-shrink-0 active:scale-95 transition ${item.accent}`}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Top Filter Bar with Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl">
        <div className="space-y-0.5">
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            {filterMode === "movie" && (
              <>
                <Film className="w-5 h-5 text-amber-400" />
                <span>Top Filme & Kino-Highlights</span>
              </>
            )}
            {filterMode === "tv" && (
              <>
                <Tv className="w-5 h-5 text-cyan-400" />
                <span>Top Serien & TV-Meisterwerke</span>
              </>
            )}
            {filterMode === "ALL" && <span>🍿 Filme & Serien entdecken</span>}
          </h2>
          <p className="text-xs text-slate-400">
            {filterMode === "movie" ? (
              "Zeigt nur Filme: Oscar-Gewinner, IMDb Top 250 und Kinotrends"
            ) : filterMode === "tv" ? (
              "Zeigt nur Serien: Staffel-Highlights, TV-Bestenlisten und Serientrends"
            ) : (
              <>
                Alles auf einen Blick –{" "}
                <span className="sm:hidden">wähle unten,</span>
                <span className="hidden sm:inline">wähle rechts oben,</span> um die Ansicht auf nur
                Filme oder Serien umzuschalten
              </>
            )}
          </p>
        </div>

        {/* Segmented Control Switcher (Filme / Serien / Alle) */}
        <div className="w-full sm:w-auto p-1 rounded-2xl bg-black/60 border border-slate-700/80 backdrop-blur-md flex items-center shadow-lg">
          <button
            onClick={() => setFilterMode("movie")}
            className={`flex-1 sm:flex-initial justify-center flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition ${
              filterMode === "movie"
                ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Filme</span>
          </button>

          <button
            onClick={() => setFilterMode("tv")}
            className={`flex-1 sm:flex-initial justify-center flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition ${
              filterMode === "tv"
                ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Serien</span>
          </button>

          <button
            onClick={() => setFilterMode("ALL")}
            className={`flex-1 sm:flex-initial justify-center px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              filterMode === "ALL"
                ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>Alle</span>
          </button>
        </div>
      </div>

      {/* SECTION 1 (NEU): Heute entdecken & Wechselnde Highlights */}
      <section className="space-y-5 animate-in fade-in duration-300">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 sm:gap-4">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="p-2.5 bg-purple-500/15 text-purple-400 rounded-2xl border border-purple-500/30 flex-shrink-0 shadow-inner">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Heute entdecken & Wechselnde Highlights
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Dynamisch
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                Bei jedem Besuch neu gemischt aus Trends, Geheimtipps & Meisterwerken – würfle jederzeit neue Vorschläge!
              </p>
            </div>
          </div>

          {/* Category Quick-Pills & Interactive Shuffle Button */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto w-full lg:w-auto min-w-0">
            <div className="flex items-center p-1 rounded-2xl bg-slate-900/90 border border-slate-800 overflow-x-auto scrollbar-none max-w-full">
              <button
                type="button"
                onClick={() => setDiscoveryCategory("MIX")}
                className={`whitespace-nowrap flex-shrink-0 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  discoveryCategory === "MIX"
                    ? "bg-purple-500 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🎲 Bunter Mix
              </button>
              <button
                type="button"
                onClick={() => setDiscoveryCategory("TRENDING")}
                className={`whitespace-nowrap flex-shrink-0 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  discoveryCategory === "TRENDING"
                    ? "bg-rose-500 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🔥 Trends
              </button>
              <button
                type="button"
                onClick={() => setDiscoveryCategory("GEMS")}
                className={`whitespace-nowrap flex-shrink-0 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  discoveryCategory === "GEMS"
                    ? "bg-emerald-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Gem className="w-3 h-3" />
                <span>Geheimtipps</span>
              </button>
              <button
                type="button"
                onClick={() => setDiscoveryCategory("CLASSICS")}
                className={`whitespace-nowrap flex-shrink-0 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  discoveryCategory === "CLASSICS"
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🏆 Kult & Klassiker
              </button>
            </div>

            <button
              type="button"
              onClick={handleReshuffle}
              className="flex items-center gap-2 min-h-[40px] sm:min-h-0 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 border border-purple-400/30 transition active:scale-95 cursor-pointer"
              title="10 neue Filme & Serien würfeln"
            >
              <Dices
                className={`w-4 h-4 transition-transform duration-300 ${
                  isSpinning ? "rotate-180 scale-110" : ""
                }`}
              />
              <span>Neu würfeln</span>
            </button>
          </div>
        </div>

        <div className={MOBILE_RAIL_GRID_CLASS}>
          {discoveryItems.map((item, idx) => (
            <div key={`discover_${item.mediaType}_${item.id}`} className={MOBILE_RAIL_ITEM_CLASS}>
              <MediaCard item={item} priority={idx < 5} />
            </div>
          ))}
        </div>
      </section>

      {/* SECTION: Oscar-Gewinner (Nur bei ALL oder movie) */}
      {(filterMode === "ALL" || filterMode === "movie") && (
        <section className="space-y-5 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
            <div className="flex items-start sm:items-center gap-3 min-w-0">
              <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20 flex-shrink-0">
                <Award className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Oscar-Gewinner & Bester Film
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Prämierte Meisterwerke von Oppenheimer bis Parasite –{" "}
                  <span className="sm:hidden">tippe</span>
                  <span className="hidden sm:inline">klicke</span> auf einen Film für den weltweiten
                  Streaming-Finder!
                </p>
              </div>
            </div>
            <Link
              href="/oscars"
              className="flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 transition whitespace-nowrap self-start sm:self-auto py-1"
            >
              <span>Alle ansehen</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className={MOBILE_RAIL_GRID_CLASS}>
            {oscarWinners.map((item, idx) => (
              <div key={item.id} className={MOBILE_RAIL_ITEM_CLASS}>
                <MediaCard item={item} priority={idx < 5} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION: Top 250 Filme (Nur bei ALL oder movie) */}
      {(filterMode === "ALL" || filterMode === "movie") && (
        <section className="space-y-5 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
            <div className="flex items-start sm:items-center gap-3 min-w-0">
              <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-2xl border border-sky-500/20 flex-shrink-0">
                <Film className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Top bewertete Filme (IMDb & TMDB)
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Die ewigen Klassiker & höchstbewerteten Filme aller Zeiten.
                </p>
              </div>
            </div>
            <Link
              href="/movies"
              className="hidden sm:flex items-center gap-1 text-xs font-bold text-sky-400 hover:text-sky-300 transition whitespace-nowrap self-start sm:self-auto py-1"
            >
              <span>Ganze Top 250 ansehen</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className={MOBILE_RAIL_GRID_CLASS}>
            {topMovies.slice(0, 15).map((item) => (
              <div key={item.id} className={MOBILE_RAIL_ITEM_CLASS}>
                <MediaCard item={item} />
              </div>
            ))}
          </div>

          <div className="flex justify-center pt-2">
            <Link
              href="/movies"
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-sky-400 hover:text-sky-300 font-bold text-xs border border-slate-800 hover:border-sky-500/40 transition shadow-md"
            >
              <Film className="w-4 h-4" />
              <span>Ganze Top 250 Liste entdecken</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </section>
      )}

      {/* SECTION: Top Serien (Nur bei ALL oder tv) */}
      {(filterMode === "ALL" || filterMode === "tv") && (
        <section className="space-y-5 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
            <div className="flex items-start sm:items-center gap-3 min-w-0">
              <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-2xl border border-cyan-500/20 flex-shrink-0">
                <Tv className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Top bewertete Serien
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Meisterhafte TV-Serien mit weltweiten Streaming-Optionen.
                </p>
              </div>
            </div>
            <Link
              href="/tv"
              className="hidden sm:flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition whitespace-nowrap self-start sm:self-auto py-1"
            >
              <span>Alle Top-Serien ansehen</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className={MOBILE_RAIL_GRID_CLASS}>
            {topTv.slice(0, 15).map((item) => (
              <div key={item.id} className={MOBILE_RAIL_ITEM_CLASS}>
                <MediaCard item={item} />
              </div>
            ))}
          </div>

          <div className="flex justify-center pt-2">
            <Link
              href="/tv"
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 font-bold text-xs border border-slate-800 hover:border-cyan-500/40 transition shadow-md"
            >
              <Tv className="w-4 h-4" />
              <span>Alle Top-Serien entdecken</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </section>
      )}

      {/* SECTION: Aktuell im Trend (Gefiltert nach Modus) */}
      <section className="space-y-5 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20 flex-shrink-0">
              <Flame className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {filterMode === "movie"
                  ? "Aktuelle Film-Trends"
                  : filterMode === "tv"
                  ? "Aktuelle Serien-Trends"
                  : "Aktuell im Trend"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Die meistgesehenen & diskutierten Titel dieser Woche.
              </p>
            </div>
          </div>
        </div>

        <div className={MOBILE_RAIL_GRID_CLASS}>
          {displayedTrending.slice(0, 15).map((item) => (
            <div key={item.id} className={MOBILE_RAIL_ITEM_CLASS}>
              <MediaCard item={item} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
