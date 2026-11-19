"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { MediaItem, OFFICIAL_MOVIE_GENRES, resolveItemGenres } from "@/lib/tmdb";
import { useMedia } from "@/components/MediaContext";
import {
  Zap,
  Star,
  Film,
  Tv,
  X,
  Plus,
  Info,
  RotateCcw,
  LayoutGrid,
  Layers,
  Check,
  Search,
  Sparkles,
  Trophy,
} from "lucide-react";

const GOAL_COUNT = 250;
const SKIPPED_STORAGE_KEY = "cinecircle_quick_rate_skipped_v1";

interface QuickRateClientProps {
  initialItems: MediaItem[];
}

export function QuickRateClient({ initialItems }: QuickRateClientProps) {
  const { data: session } = useSession();
  const { communityData, updateMediaStatus, openMediaModal, openRatingModal, showToast } =
    useMedia();

  const [viewMode, setViewMode] = useState<"auto" | "grid" | "swipe">("auto");
  const [mediaFilter, setMediaFilter] = useState<"ALL" | "movie" | "tv">("ALL");
  const [selectedGenre, setSelectedGenre] = useState<number | "ALL">("ALL");
  const [selectedDecade, setSelectedDecade] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [skippedKeys, setSkippedKeys] = useState<string[]>([]);
  const [lastAction, setLastAction] = useState<{
    key: string;
    type: "skip" | "rate" | "watchlist";
    item: MediaItem;
  } | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDeltaX, setTouchDeltaX] = useState<number>(0);
  const [visibleGridCount, setVisibleGridCount] = useState(24);

  const myUserId = (session?.user as any)?.id || "user_lukas";
  const myName = session?.user?.name?.toLowerCase();
  const myEmail = session?.user?.email?.toLowerCase();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SKIPPED_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setSkippedKeys(parsed);
      }
    } catch {}
  }, []);

  const saveSkippedKeys = (next: string[]) => {
    setSkippedKeys(next);
    try {
      localStorage.setItem(SKIPPED_STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  // All user statuses (WATCHED + WATCHLIST)
  const myStatuses = useMemo(() => {
    return communityData.mediaStatuses.filter(
      (m) =>
        m.userId === myUserId ||
        (myName && m.userName?.toLowerCase() === myName) ||
        (myEmail && (m as any).userEmail?.toLowerCase() === myEmail)
    );
  }, [communityData.mediaStatuses, myUserId, myName, myEmail]);

  const watchedCount = useMemo(
    () => myStatuses.filter((m) => m.status === "WATCHED").length,
    [myStatuses]
  );

  const existingStatusKeySet = useMemo(() => {
    const set = new Set<string>();
    myStatuses.forEach((m) => set.add(`${m.mediaType}_${m.tmdbId}`));
    return set;
  }, [myStatuses]);

  const skippedKeySet = useMemo(() => new Set(skippedKeys), [skippedKeys]);

  // Remaining unrated & unskipped items matching current filters
  const candidateItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return initialItems.filter((item) => {
      const key = `${item.mediaType}_${item.id}`;
      if (existingStatusKeySet.has(key)) return false;
      if (skippedKeySet.has(key)) return false;

      if (mediaFilter !== "ALL" && item.mediaType !== mediaFilter) return false;

      if (selectedGenre !== "ALL") {
        if (!item.genreIds || !item.genreIds.includes(selectedGenre)) return false;
      }

      if (selectedDecade !== "ALL" && item.releaseYear) {
        const y = parseInt(item.releaseYear, 10);
        if (selectedDecade === "2020s" && y < 2020) return false;
        if (selectedDecade === "2010s" && (y < 2010 || y >= 2020)) return false;
        if (selectedDecade === "2000s" && (y < 2000 || y >= 2010)) return false;
        if (selectedDecade === "1990s" && (y < 1990 || y >= 2000)) return false;
        if (selectedDecade === "classic" && y >= 1990) return false;
      }

      if (q) {
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchOrig = item.originalTitle?.toLowerCase().includes(q);
        if (!matchTitle && !matchOrig) return false;
      }

      return true;
    });
  }, [
    initialItems,
    existingStatusKeySet,
    skippedKeySet,
    mediaFilter,
    selectedGenre,
    selectedDecade,
    searchQuery,
  ]);

  const requireLogin = (): boolean => {
    if (!session) {
      showToast("Bitte logge dich ein, um deine Bewertungen zu speichern!", {
        type: "info",
        actionLabel: "Einloggen",
        actionHref: "/login",
      });
      return false;
    }
    return true;
  };

  const handleInstantRate = (item: MediaItem, rating: number) => {
    if (!requireLogin()) return;
    const key = `${item.mediaType}_${item.id}`;
    setLastAction({ key, type: "rate", item });
    updateMediaStatus({
      tmdbId: item.id,
      mediaType: item.mediaType,
      title: item.title,
      posterPath: item.posterPath,
      releaseYear: item.releaseYear,
      status: "WATCHED",
      rating,
    });
  };

  const handleInstantWatchlist = (item: MediaItem) => {
    if (!requireLogin()) return;
    const key = `${item.mediaType}_${item.id}`;
    setLastAction({ key, type: "watchlist", item });
    updateMediaStatus({
      tmdbId: item.id,
      mediaType: item.mediaType,
      title: item.title,
      posterPath: item.posterPath,
      releaseYear: item.releaseYear,
      status: "WATCHLIST",
    });
  };

  const handleSkipItem = (item: MediaItem) => {
    const key = `${item.mediaType}_${item.id}`;
    setLastAction({ key, type: "skip", item });
    if (!skippedKeySet.has(key)) {
      saveSkippedKeys([...skippedKeys, key]);
    }
  };

  const handleUndo = () => {
    if (!lastAction) return;
    if (lastAction.type === "skip") {
      saveSkippedKeys(skippedKeys.filter((k) => k !== lastAction.key));
    } else {
      updateMediaStatus({
        tmdbId: lastAction.item.id,
        mediaType: lastAction.item.mediaType,
        title: lastAction.item.title,
        posterPath: lastAction.item.posterPath,
        releaseYear: lastAction.item.releaseYear,
        status: "NONE",
      });
    }
    setLastAction(null);
  };

  const handleOpenDetails = (item: MediaItem) => {
    openMediaModal({
      id: item.id,
      mediaType: item.mediaType,
      title: item.title,
      posterPath: item.posterPath,
      genreIds: item.genreIds,
    });
  };

  const progressPct = Math.min(100, Math.round((watchedCount / GOAL_COUNT) * 100));
  const currentSwipeItem = candidateItems[0] || null;
  const nextSwipePreview = candidateItems[1] || null;

  // Touch handlers for Mobile Swipe Card (Swipe Left = Not watched / Skip, Swipe Right = Watchlist)
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchDeltaX(0);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    setTouchDeltaX(e.touches[0].clientX - touchStartX);
  };

  const onTouchEnd = () => {
    if (touchStartX === null || !currentSwipeItem) return;
    if (touchDeltaX < -95) {
      handleSkipItem(currentSwipeItem);
    } else if (touchDeltaX > 110) {
      handleInstantWatchlist(currentSwipeItem);
    }
    setTouchStartX(null);
    setTouchDeltaX(0);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header & 250 Goal Progress Card */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-amber-500/15 via-slate-900 to-[#0b101d] border border-amber-500/30 shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Speed-Bewerten & Geschmacks-Boost</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Bewerte die bekanntesten Filme & Serien in Sekunden
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Klicke direkt auf <strong className="text-amber-300">1–10 ★</strong>, wenn du einen
              Titel gesehen hast, wische nach links (bzw. klicke auf{" "}
              <strong className="text-slate-200">Nicht gesehen</strong>) zum Überspringen oder tippe
              auf das Poster für <strong className="text-white">Details, Trailer & Empfehlen</strong>.
            </p>
          </div>

          {/* 250 Club Progress Box */}
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 min-w-[260px] sm:min-w-[300px] space-y-2.5 self-start lg:self-center">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Dein 250-Club Fortschritt</span>
              </span>
              <span className="font-black text-amber-400 font-mono text-sm">
                {watchedCount} / {GOAL_COUNT}
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800 p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 transition-all duration-500"
                style={{ width: `${Math.max(progressPct, 4)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>
                {watchedCount >= GOAL_COUNT
                  ? "🎉 250er-Ziel erreicht! Dein KI-Profil ist maximal kalibriert."
                  : `Noch ${GOAL_COUNT - watchedCount} Titel bis zum vollen KI-Profil`}
              </span>
              <Link
                href="/profile?tab=hall-of-fame"
                className="text-amber-400 hover:text-amber-300 font-bold underline underline-offset-2 ml-2 flex-shrink-0"
              >
                Hall of Fame
              </Link>
            </div>
          </div>
        </div>

        {/* Filter Bar + View Mode Switch + Undo */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          {/* Media Type Filter */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/90 border border-slate-800">
            {[
              { key: "ALL", label: "Alle Klassiker", icon: Sparkles },
              { key: "movie", label: "Filme", icon: Film },
              { key: "tv", label: "Serien", icon: Tv },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setMediaFilter(tab.key as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    mediaFilter === tab.key
                      ? "bg-amber-500 text-black"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search & Decade Filter */}
          <div className="flex flex-1 items-center gap-2 min-w-[220px] max-w-md">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Titel in der Liste filtern..."
                className="w-full bg-slate-950/90 border border-slate-800 focus:border-amber-400 rounded-xl pl-8 pr-7 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={selectedDecade}
              onChange={(e) => setSelectedDecade(e.target.value)}
              className="bg-slate-950/90 border border-slate-800 focus:border-amber-400 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
            >
              <option value="ALL">Alle Jahrzehnte</option>
              <option value="2020s">2020er</option>
              <option value="2010s">2010er</option>
              <option value="2000s">2000er</option>
              <option value="1990s">1990er</option>
              <option value="classic">Klassiker (&lt;1990)</option>
            </select>
          </div>

          {/* Right actions: Undo + Skipped reset + Swipe/Grid toggle */}
          <div className="flex items-center gap-2">
            {lastAction && (
              <button
                type="button"
                onClick={handleUndo}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-amber-500/30 transition cursor-pointer"
                title={`Letzte Aktion für "${lastAction.item.title}" rückgängig machen`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Rückgängig</span>
              </button>
            )}

            {skippedKeys.length > 0 && (
              <button
                type="button"
                onClick={() => saveSkippedKeys([])}
                className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-[11px] font-semibold transition cursor-pointer"
              >
                {skippedKeys.length} Übersprungene einblenden
              </button>
            )}

            {/* Mode Switcher (Auto = Swipe on Mobile / Grid on Desktop) */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/90 border border-slate-800">
              <button
                type="button"
                onClick={() => setViewMode("swipe")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === "swipe"
                    ? "bg-amber-500 text-black"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Karten-Swipe-Modus (Ideal fürs Handy)"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Swipe</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-amber-500 text-black"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Grid-Ansicht (Ideal für PC/Desktop)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>
            </div>
          </div>
        </div>

        {/* Genre Quick Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1">
          <button
            type="button"
            onClick={() => setSelectedGenre("ALL")}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              selectedGenre === "ALL"
                ? "bg-amber-500 text-black"
                : "bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            Alle Genres ({candidateItems.length})
          </button>
          {OFFICIAL_MOVIE_GENRES.slice(0, 12).map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setSelectedGenre((prev) => (prev === g.id ? "ALL" : g.id))}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedGenre === g.id
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold"
                  : "bg-slate-950/70 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {candidateItems.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/50 border border-slate-800 text-center space-y-4">
          <Sparkles className="w-10 h-10 text-amber-400 mx-auto" />
          <h2 className="text-xl font-black text-white">
            Keine unbewerteten Titel für diesen Filter übrig!
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Du hast bereits alle geladenen Klassiker in dieser Ansicht bewertet oder übersprungen.
          </p>
          <div className="flex items-center justify-center gap-3">
            {skippedKeys.length > 0 && (
              <button
                type="button"
                onClick={() => saveSkippedKeys([])}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition cursor-pointer"
              >
                Übersprungene Titel zurückholen ({skippedKeys.length})
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setMediaFilter("ALL");
                setSelectedGenre("ALL");
                setSelectedDecade("ALL");
                setSearchQuery("");
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
            >
              Filter zurücksetzen
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* 1. MOBILE / SWIPE DECK VIEW (Default on mobile, or when viewMode === "swipe") */}
          <div
            className={`${
              viewMode === "swipe"
                ? "block"
                : viewMode === "grid"
                ? "hidden"
                : "block md:hidden"
            }`}
          >
            {currentSwipeItem && (
              <div className="max-w-md mx-auto space-y-4">
                <div className="relative">
                  {/* Background next card preview */}
                  {nextSwipePreview && (
                    <div className="absolute inset-x-4 -bottom-3 h-full rounded-3xl bg-slate-900/60 border border-slate-800/80 scale-[0.96] opacity-50 pointer-events-none" />
                  )}

                  {/* Active Swipe Card */}
                  <div
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                    style={{
                      transform:
                        touchDeltaX !== 0
                          ? `translateX(${touchDeltaX}px) rotate(${touchDeltaX * 0.03}deg)`
                          : undefined,
                    }}
                    className="relative rounded-3xl bg-[#0d1322] border border-slate-800 shadow-2xl overflow-hidden transition-transform duration-150 select-none"
                  >
                    {/* Swipe direction hint badges */}
                    {touchDeltaX < -45 && (
                      <div className="absolute top-5 right-5 z-30 px-3 py-1.5 rounded-xl bg-rose-500/90 text-white font-black text-xs uppercase tracking-wider shadow-lg">
                        ✕ Nicht gesehen
                      </div>
                    )}
                    {touchDeltaX > 45 && (
                      <div className="absolute top-5 left-5 z-30 px-3 py-1.5 rounded-xl bg-sky-500/90 text-black font-black text-xs uppercase tracking-wider shadow-lg">
                        + Watchlist
                      </div>
                    )}

                    {/* Poster Area - Tap opens full MediaModal (Details, Trailer, Recommend) */}
                    <div
                      onClick={() => handleOpenDetails(currentSwipeItem)}
                      className="relative aspect-[2/3] max-h-[54vh] w-full bg-slate-950 cursor-pointer group mx-auto"
                    >
                      {currentSwipeItem.posterPath && (
                        <Image
                          src={`https://image.tmdb.org/t/p/w780${currentSwipeItem.posterPath}`}
                          alt={currentSwipeItem.title}
                          fill
                          priority
                          sizes="(max-width: 768px) 95vw, 420px"
                          className="object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0d1322] via-[#0d1322]/25 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2">
                        <span
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-md border ${
                            currentSwipeItem.mediaType === "tv"
                              ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                              : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          }`}
                        >
                          {currentSwipeItem.mediaType === "tv" ? "📺 Serie" : "🎬 Film"} •{" "}
                          {currentSwipeItem.releaseYear}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetails(currentSwipeItem);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/75 hover:bg-black text-white text-xs font-bold border border-white/15 backdrop-blur-md transition cursor-pointer"
                        >
                          <Info className="w-3.5 h-3.5 text-amber-400" />
                          <span>Details / Trailer / Empfehlen</span>
                        </button>
                      </div>

                      {/* Title & Genres Overlay at bottom of poster */}
                      <div className="absolute bottom-3 inset-x-4 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {resolveItemGenres(
                            currentSwipeItem.mediaType,
                            currentSwipeItem.genreIds
                          )
                            .slice(0, 3)
                            .map((g) => (
                              <span
                                key={g.id}
                                className="px-2 py-0.5 rounded-lg bg-slate-900/85 border border-slate-700/80 text-[10px] font-semibold text-slate-300"
                              >
                                {g.emoji} {g.name}
                              </span>
                            ))}
                          {currentSwipeItem.voteAverage > 0 && (
                            <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-[10px] font-bold text-amber-300">
                              TMDB {currentSwipeItem.voteAverage} ★
                            </span>
                          )}
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow">
                          {currentSwipeItem.title}
                        </h2>
                        {currentSwipeItem.overview && (
                          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                            {currentSwipeItem.overview}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* 1-10 Instant Star Tap Grid */}
                    <div className="p-4 space-y-3 bg-[#0d1322]">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-bold text-amber-400 flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>Gesehen? Tippe direkt auf deine Note (1–10 ★):</span>
                        </span>
                        {currentSwipeItem.mediaType === "tv" && (
                          <button
                            type="button"
                            onClick={() =>
                              openRatingModal({
                                tmdbId: currentSwipeItem.id,
                                mediaType: "tv",
                                title: currentSwipeItem.title,
                                posterPath: currentSwipeItem.posterPath,
                                releaseYear: currentSwipeItem.releaseYear,
                              })
                            }
                            className="text-cyan-400 hover:underline font-semibold"
                          >
                            Staffeln wählen
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-5 gap-1.5">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                          <button
                            key={score}
                            type="button"
                            onClick={() => handleInstantRate(currentSwipeItem, score)}
                            className={`py-2.5 rounded-xl font-black text-xs border transition active:scale-95 cursor-pointer flex items-center justify-center gap-0.5 ${
                              score >= 9
                                ? "bg-emerald-500/15 hover:bg-emerald-500 hover:text-black text-emerald-300 border-emerald-500/35"
                                : score >= 7
                                ? "bg-amber-500/15 hover:bg-amber-500 hover:text-black text-amber-300 border-amber-500/35"
                                : "bg-slate-900 hover:bg-slate-700 text-slate-300 border-slate-800"
                            }`}
                          >
                            <span>{score}</span>
                            <Star className="w-3 h-3 fill-current" />
                          </button>
                        ))}
                      </div>

                      {/* Bottom Action Row: Skip (Swipe Left), Details, Watchlist (Swipe Right) */}
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleSkipItem(currentSwipeItem)}
                          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-slate-800 hover:border-rose-500/40 text-xs font-bold transition cursor-pointer"
                        >
                          <X className="w-4 h-4 text-rose-400" />
                          <span>Nicht gesehen</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenDetails(currentSwipeItem)}
                          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-bold transition cursor-pointer"
                        >
                          <Info className="w-4 h-4 text-amber-400" />
                          <span>Details & Trailer</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleInstantWatchlist(currentSwipeItem)}
                          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-sky-500/20 text-slate-300 hover:text-sky-300 border border-slate-800 hover:border-sky-500/40 text-xs font-bold transition cursor-pointer"
                        >
                          <Plus className="w-4 h-4 text-sky-400" />
                          <span>Watchlist</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-center text-[11px] text-slate-500">
                  Tipp: Auf dem Handy kannst du die Karte auch einfach{" "}
                  <strong className="text-slate-400">nach links wischen</strong> (Nicht gesehen)
                  oder <strong className="text-slate-400">nach rechts wischen</strong> (+ Watchlist).
                </p>
              </div>
            )}
          </div>

          {/* 2. DESKTOP / SPEED-GRID VIEW (Default on md+, or when viewMode === "grid") */}
          <div
            className={`${
              viewMode === "grid"
                ? "block"
                : viewMode === "swipe"
                ? "hidden"
                : "hidden md:block"
            } space-y-6`}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {candidateItems.slice(0, visibleGridCount).map((item) => {
                const genres = resolveItemGenres(item.mediaType, item.genreIds).slice(0, 2);
                return (
                  <div
                    key={`${item.mediaType}_${item.id}`}
                    onClick={() => handleOpenDetails(item)}
                    className="group relative rounded-2xl bg-[#0d121f] border border-slate-800/90 hover:border-amber-500/60 overflow-hidden shadow-lg transition-all duration-200 flex flex-col cursor-pointer"
                  >
                    {/* Poster */}
                    <div className="relative aspect-[2/3] w-full bg-slate-950 overflow-hidden">
                      {item.posterPath && (
                        <Image
                          src={`https://image.tmdb.org/t/p/w500${item.posterPath}`}
                          alt={item.title}
                          fill
                          sizes="(max-width: 1024px) 33vw, 18vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}

                      {/* Top row: Type badge + Skip button */}
                      <div className="absolute top-2 inset-x-2 flex items-center justify-between z-20">
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold backdrop-blur-md border ${
                            item.mediaType === "tv"
                              ? "bg-cyan-950/85 text-cyan-300 border-cyan-500/30"
                              : "bg-slate-950/85 text-amber-300 border-amber-500/30"
                          }`}
                        >
                          {item.mediaType === "tv" ? "Serie" : "Film"} • {item.releaseYear}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSkipItem(item);
                          }}
                          title="Nicht gesehen / Ausblenden"
                          className="p-1.5 rounded-lg bg-black/75 hover:bg-rose-500 text-slate-300 hover:text-white border border-white/10 transition cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Desktop Hover Overlay: 1-10 Quick Rating + Watchlist + Details/Trailer */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3 z-10">
                        <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                          <p className="text-[11px] font-bold text-amber-300 text-center">
                            Schnell bewerten (1–10 ★):
                          </p>
                          <div className="grid grid-cols-5 gap-1">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                              <button
                                key={score}
                                type="button"
                                onClick={() => handleInstantRate(item, score)}
                                className={`py-1.5 rounded-lg font-black text-[11px] border transition cursor-pointer ${
                                  score >= 9
                                    ? "bg-emerald-500/20 hover:bg-emerald-400 hover:text-black text-emerald-300 border-emerald-500/40"
                                    : score >= 7
                                    ? "bg-amber-500/20 hover:bg-amber-400 hover:text-black text-amber-300 border-amber-500/40"
                                    : "bg-slate-900/90 hover:bg-slate-700 text-slate-200 border-slate-700"
                                }`}
                              >
                                {score}★
                              </button>
                            ))}
                          </div>

                          <div className="grid grid-cols-2 gap-1.5 pt-1">
                            <button
                              type="button"
                              onClick={() => handleInstantWatchlist(item)}
                              className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-sky-500/20 hover:bg-sky-500 hover:text-black text-sky-300 border border-sky-500/40 text-[11px] font-bold transition cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Watchlist</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenDetails(item)}
                              className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-[11px] font-bold transition cursor-pointer"
                            >
                              <Info className="w-3 h-3 text-amber-400" />
                              <span>Details</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer: Title + compact mobile/always-visible action bar */}
                    <div className="p-2.5 flex-1 flex flex-col justify-between gap-1.5">
                      <div>
                        <h3 className="text-xs font-bold text-white line-clamp-1 group-hover:text-amber-400 transition">
                          {item.title}
                        </h3>
                        <p className="text-[10px] text-slate-400 line-clamp-1">
                          {genres.map((g) => g.name).join(" • ") || "Klassiker"}
                        </p>
                      </div>

                      <div
                        className="flex items-center justify-between gap-1 pt-1 border-t border-slate-800/80"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            openRatingModal({
                              tmdbId: item.id,
                              mediaType: item.mediaType,
                              title: item.title,
                              posterPath: item.posterPath,
                              releaseYear: item.releaseYear,
                            })
                          }
                          className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500 hover:text-black text-amber-300 text-[11px] font-bold transition cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          <span>Bewerten</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDetails(item)}
                          title="Details, Trailer & Empfehlen öffnen"
                          className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition cursor-pointer"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {candidateItems.length > visibleGridCount && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setVisibleGridCount((prev) => prev + 24)}
                  className="px-6 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs border border-amber-500/30 transition cursor-pointer"
                >
                  Weitere Klassiker laden ({candidateItems.length - visibleGridCount} übrig)
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
