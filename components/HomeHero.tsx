"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { MediaItem, formatGermanReleaseDate } from "@/lib/tmdb";
import { useMedia } from "./MediaContext";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import {
  Flame,
  Play,
  Plus,
  Check,
  Sparkles,
  Award,
  Star,
  Film,
  Tv,
  ChevronLeft,
  ChevronRight,
  Pause,
} from "lucide-react";

interface CarouselSlide {
  item: MediaItem;
  badgeLabel: string;
  badgeStyle: string;
  badgeIcon: React.ElementType;
}

interface HomeHeroProps {
  heroItem?: MediaItem;
  initialGenericMovies?: MediaItem[];
  initialGenericTv?: MediaItem[];
}

export function HomeHero({
  heroItem,
  initialGenericMovies = [],
  initialGenericTv = [],
}: HomeHeroProps) {
  const { openMediaModal, communityData, updateMediaStatus, userSubscriptions, showToast } = useMedia();
  const { data: session } = useSession();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [autoAdvanceDisabled, setAutoAdvanceDisabled] = useState(false);
  const [matchedMovies, setMatchedMovies] = useState<MediaItem[]>([]);
  const [matchedTv, setMatchedTv] = useState<MediaItem[]>([]);
  const [shuffleSeed, setShuffleSeed] = useState<number>(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Pause auto-advance on touch screens (prevents accidental mis-taps on mobile) & reduced-motion
  useEffect(() => {
    if (typeof window === "undefined") return;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (coarse || reduced) {
      setAutoAdvanceDisabled(true);
    }
  }, []);

  const myUserId = (session?.user as any)?.id;

  // Set random seed after mount so every page visit picks fresh hero highlights
  useEffect(() => {
    setShuffleSeed(Math.floor(Math.random() * 100000) + 1);
  }, []);

  // Filter user's watched items
  const watchedItems = useMemo(() => {
    return communityData.mediaStatuses.filter(
      (m) =>
        m.status === "WATCHED" &&
        (myUserId ? m.userId === myUserId : true)
    );
  }, [communityData.mediaStatuses, myUserId]);

  const watchedKeySet = useMemo(() => {
    const s = new Set<string>();
    for (const m of watchedItems) {
      s.add(`${m.mediaType}_${m.tmdbId}`);
    }
    return s;
  }, [watchedItems]);

  // Fetch personalized match recommendations in background (without match indicators)
  useEffect(() => {
    if (watchedItems.length === 0) return;
    let isMounted = true;

    fetch("/api/tmdb/recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        watchedItems: watchedItems.map((m) => ({
          tmdbId: m.tmdbId,
          mediaType: m.mediaType,
          rating: m.rating,
          title: m.title,
        })),
        subscriptions: userSubscriptions,
        onlyMySubscriptions: false,
        mediaTypeFilter: "ALL",
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data?.recommendations) return;
        const recs: any[] = data.recommendations;
        const movies: MediaItem[] = recs
          .filter((r) => r.mediaType === "movie")
          .map((r) => ({
            id: r.id,
            mediaType: "movie",
            title: r.title,
            originalTitle: r.originalTitle,
            overview: r.overview,
            posterPath: r.posterPath,
            backdropPath: r.backdropPath,
            releaseYear: r.releaseYear,
            voteAverage: r.voteAverage,
            genreIds: r.genreIds,
          }));

        const tvShows: MediaItem[] = recs
          .filter((r) => r.mediaType === "tv")
          .map((r) => ({
            id: r.id,
            mediaType: "tv",
            title: r.title,
            originalTitle: r.originalTitle,
            overview: r.overview,
            posterPath: r.posterPath,
            backdropPath: r.backdropPath,
            releaseYear: r.releaseYear,
            voteAverage: r.voteAverage,
            genreIds: r.genreIds,
          }));

        setMatchedMovies(movies.slice(0, 6));
        setMatchedTv(tvShows.slice(0, 4));
      })
      .catch((err) => {
        console.error("Hero matches fetch error:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [watchedItems, userSubscriptions]);

  // Assemble an 8-slide dynamic carousel from our rich pool (excluding already watched titles & duplicates)
  const slides: CarouselSlide[] = useMemo(() => {
    const scoreWithSeed = (item: MediaItem, idx: number, salt: number) => {
      if (shuffleSeed === 0) return idx;
      const hash = ((item.id * 2654435761 + shuffleSeed * 40503 + salt * 97) >>> 0) % 10000;
      return hash;
    };

    const usedKeys = new Set<string>();

    const filterAndOrder = (items: MediaItem[], salt: number): MediaItem[] => {
      const seenLocal = new Set<string>();
      const valid = items.filter((it) => {
        if (!it || !it.id) return false;
        const key = `${it.mediaType}_${it.id}`;
        if (seenLocal.has(key)) return false;
        seenLocal.add(key);
        // Prefer items with a backdrop image for the big hero banner
        if (!it.backdropPath && items.length > 8) return false;
        // Hide items the user already marked as WATCHED
        if (watchedKeySet.has(key)) return false;
        return true;
      });
      const pool = valid.length >= 4 ? valid : items.filter((it) => it && it.id);
      if (shuffleSeed === 0) return pool;
      return [...pool]
        .map((item, idx) => ({ item, sortKey: scoreWithSeed(item, idx, salt) }))
        .sort((a, b) => a.sortKey - b.sortKey)
        .map((x) => x.item);
    };

    const moviePool = filterAndOrder(initialGenericMovies, 1);
    const tvPool = filterAndOrder(initialGenericTv, 2);
    const matchedMoviePool = filterAndOrder(matchedMovies, 3);
    const matchedTvPool = filterAndOrder(matchedTv, 4);

    const pickNext = (pool: MediaItem[], fallbackPool?: MediaItem[]): MediaItem | undefined => {
      for (const item of pool) {
        const key = `${item.mediaType}_${item.id}`;
        if (!usedKeys.has(key)) {
          usedKeys.add(key);
          return item;
        }
      }
      if (fallbackPool) {
        for (const item of fallbackPool) {
          const key = `${item.mediaType}_${item.id}`;
          if (!usedKeys.has(key)) {
            usedKeys.add(key);
            return item;
          }
        }
      }
      return undefined;
    };

    const m1 = pickNext(moviePool) || heroItem;
    if (!m1) return [];
    const t1 = pickNext(tvPool, moviePool);
    const recM1 = pickNext(matchedMoviePool, moviePool);
    const recT1 = pickNext(matchedTvPool, tvPool) || pickNext(moviePool);
    const m2 = pickNext(moviePool);
    const recM2 = pickNext(matchedMoviePool, moviePool);
    const t2 = pickNext(tvPool, moviePool);
    const m3 = pickNext(moviePool);

    const candidateSlides: (CarouselSlide | null)[] = [
      m1
        ? {
            item: m1,
            badgeLabel: m1.oscarInfo ? "Oscar-Meisterwerk" : "Trending diese Woche",
            badgeStyle: "bg-amber-500/20 border-amber-500/40 text-amber-300",
            badgeIcon: m1.oscarInfo ? Award : Flame,
          }
        : null,
      t1
        ? {
            item: t1,
            badgeLabel: t1.mediaType === "tv" ? "Top-Serie der Woche" : "Trending Highlight",
            badgeStyle: "bg-cyan-500/20 border-cyan-500/40 text-cyan-300",
            badgeIcon: Tv,
          }
        : null,
      recM1
        ? {
            item: recM1,
            badgeLabel: matchedMovies.length > 0 ? "Empfehlung für dich" : "Kino-Highlight",
            badgeStyle: "bg-purple-500/20 border-purple-500/40 text-purple-300",
            badgeIcon: Sparkles,
          }
        : null,
      recT1
        ? {
            item: recT1,
            badgeLabel: recT1.mediaType === "tv" ? "Serien-Highlight" : "Film-Highlight",
            badgeStyle: "bg-indigo-500/20 border-indigo-500/40 text-indigo-300",
            badgeIcon: Tv,
          }
        : null,
      m2
        ? {
            item: m2,
            badgeLabel: m2.oscarInfo ? "Prämiertes Highlight" : "Blockbuster-Tipp",
            badgeStyle: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300",
            badgeIcon: Film,
          }
        : null,
      recM2
        ? {
            item: recM2,
            badgeLabel: "Must-Watch",
            badgeStyle: "bg-rose-500/20 border-rose-500/40 text-rose-300",
            badgeIcon: Star,
          }
        : null,
      t2
        ? {
            item: t2,
            badgeLabel: t2.mediaType === "tv" ? "Binge-Tipp" : "Publikumsliebling",
            badgeStyle: "bg-sky-500/20 border-sky-500/40 text-sky-300",
            badgeIcon: Tv,
          }
        : null,
      m3
        ? {
            item: m3,
            badgeLabel: "Geheimtipp & Klassiker",
            badgeStyle: "bg-amber-500/20 border-amber-500/40 text-amber-300",
            badgeIcon: Sparkles,
          }
        : null,
    ];

    return candidateSlides.filter((s): s is CarouselSlide => Boolean(s && s.item && s.item.id));
  }, [initialGenericMovies, initialGenericTv, heroItem, matchedMovies, matchedTv, shuffleSeed, watchedKeySet]);

  // Auto-advance carousel every 7 seconds when not paused (disabled by default on touch & reduced-motion)
  useEffect(() => {
    if (slides.length <= 1 || isPaused || autoAdvanceDisabled) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 7000);

    return () => clearInterval(timer);
  }, [slides.length, isPaused, autoAdvanceDisabled]);

  if (slides.length === 0) return null;

  const currentSlide = slides[currentIndex % slides.length];
  const currentItem = currentSlide.item;
  const BadgeIcon = currentSlide.badgeIcon;

  const myStatusObj = communityData.mediaStatuses.find(
    (m) =>
      m.tmdbId === currentItem.id &&
      m.mediaType === currentItem.mediaType &&
      (myUserId ? m.userId === myUserId : true)
  );

  const isWatchlist = myStatusObj?.status === "WATCHLIST";

  const handleWatchlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session) {
      showToast("Bitte logge dich ein, um deine Merkliste zu speichern!", {
        type: "info",
        actionLabel: "Einloggen",
        actionHref: "/login",
      });
      return;
    }
    updateMediaStatus({
      tmdbId: currentItem.id,
      mediaType: currentItem.mediaType,
      title: currentItem.title,
      posterPath: currentItem.posterPath,
      releaseYear: currentItem.releaseYear,
      status: isWatchlist ? "NONE" : "WATCHLIST",
    });
  };

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const dx = touchStartRef.current.x - e.changedTouches[0].clientX;
    const dy = touchStartRef.current.y - e.changedTouches[0].clientY;
    // Only trigger slide switch for deliberate horizontal swipes, never diagonal vertical scrolls
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.25) {
      if (dx > 0) handleNext();
      else handlePrev();
    }
    touchStartRef.current = null;
  };

  const activeSlideIdx = currentIndex % slides.length;
  const prevSlideIdx = (activeSlideIdx - 1 + slides.length) % slides.length;
  const nextSlideIdx = (activeSlideIdx + 1) % slides.length;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Empfohlene Highlights"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative min-h-[460px] sm:min-h-[580px] w-full overflow-hidden bg-slate-950 border-b border-slate-800/80 group select-none"
    >
      {/* Background Backdrop Images: mount only active & adjacent slides to save mobile bandwidth */}
      {slides.map((s, idx) => {
        const isActive = idx === activeSlideIdx;
        const shouldMount = isActive || idx === prevSlideIdx || idx === nextSlideIdx;
        if (!s.item.backdropPath || !shouldMount) return null;
        return (
          <div
            key={`${s.item.mediaType}_${s.item.id}_bg`}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              isActive ? "opacity-80 sm:opacity-90 z-0" : "opacity-0 pointer-events-none"
            }`}
          >
            <Image
              src={`https://image.tmdb.org/t/p/w1280${s.item.backdropPath}`}
              alt={s.item.title}
              fill
              priority={isActive && idx === 0}
              sizes="100vw"
              className="object-cover object-center sm:object-top"
            />
          </div>
        );
      })}

      {/* Atmospheric Gradients ensuring contrast & readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/60 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#07090e] via-[#07090e]/85 md:via-[#07090e]/45 to-transparent z-10" />

      {/* Main Content Area */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full min-h-[430px] sm:min-h-[580px] flex items-center pt-10 pb-16 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center w-full">
          {/* Left Column: Title, Overview & Actions */}
          <div className="md:col-span-8 lg:col-span-8 space-y-4 animate-in fade-in duration-300">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold tracking-wide uppercase shadow-sm ${currentSlide.badgeStyle}`}
              >
                <BadgeIcon className="w-3.5 h-3.5 fill-current" />
                <span>{currentSlide.badgeLabel}</span>
              </span>

              <span className="px-2.5 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-xs font-mono font-semibold text-slate-300 border border-white/10">
                {currentItem.mediaType === "tv" ? "📺 Serie" : "🎬 Film"}
              </span>

              {currentItem.isUpcoming ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow">
                  <Sparkles className="w-3 h-3 fill-slate-950" />
                  <span>
                    {currentItem.releaseDate
                      ? `Start: ${formatGermanReleaseDate(currentItem.releaseDate)}`
                      : "Upcoming"}
                  </span>
                </span>
              ) : currentItem.voteAverage > 0 ? (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-amber-400 text-xs font-bold border border-amber-500/30">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{currentItem.voteAverage} ★ TMDB</span>
                </span>
              ) : null}

              {currentItem.releaseYear && (
                <span className="text-slate-400 text-xs font-semibold">
                  {currentItem.releaseYear}
                </span>
              )}
            </div>

            {/* Clickable Title */}
            <h1
              onClick={() => openMediaModal(currentItem)}
              className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight cursor-pointer hover:text-amber-400 transition"
              title="Klicken, um Details, Trailer & Stream zu öffnen"
            >
              {currentItem.title}
            </h1>

            {/* Overview */}
            <p className="text-sm sm:text-base text-slate-300 line-clamp-3 leading-relaxed max-w-2xl">
              {currentItem.overview}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2.5 sm:gap-3 pt-2 sm:pt-3">
              {/* Primary Action Button */}
              <button
                type="button"
                onClick={() => openMediaModal(currentItem)}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-5 sm:px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition shadow-xl shadow-amber-500/30 hover:scale-105 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Details, Trailer & Stream</span>
              </button>

              {/* Quick Watchlist Toggle */}
              <button
                type="button"
                onClick={handleWatchlist}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold border transition cursor-pointer ${
                  isWatchlist
                    ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/25"
                    : "bg-slate-900/80 hover:bg-slate-800 text-white border-slate-700/80 backdrop-blur-md hover:border-slate-600"
                }`}
              >
                {isWatchlist ? (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Auf Merkliste ✓</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Merkliste</span>
                  </>
                )}
              </button>

              {/* Secondary links */}
              <Link
                href="/feed"
                className="hidden sm:flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs border border-slate-800 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                <span>Freunde</span>
              </Link>

              <Link
                href="/oscars"
                className="hidden sm:flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs border border-slate-800 transition"
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Oscars</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Hero Poster (Visible on md and up) */}
          <div className="hidden md:flex md:col-span-4 lg:col-span-4 justify-center lg:justify-end">
            <div
              onClick={() => openMediaModal(currentItem)}
              className="group/poster relative cursor-pointer aspect-[2/3] w-52 lg:w-64 rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-800/80 hover:border-amber-500/60 shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1"
              title="Klicken, um Details, Trailer & Stream zu öffnen"
            >
              {currentItem.posterPath ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w500${currentItem.posterPath}`}
                  alt={currentItem.title}
                  fill
                  sizes="(max-width: 1024px) 208px, 256px"
                  className="object-cover group-hover/poster:scale-105 transition duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600">
                  <Film className="w-12 h-12" />
                </div>
              )}

              {/* Play / Details Hover Overlay */}
              <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover/poster:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white">
                <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg group-hover/poster:scale-110 transition">
                  <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                </div>
                <span className="text-xs font-bold text-amber-300">Öffnen</span>
              </div>

              {/* Bottom Badge */}
              <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded-lg bg-black/80 backdrop-blur-md text-center text-[10px] font-bold text-amber-300 border border-white/10 shadow">
                Klicken für Stream & Details
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Carousel Navigation Arrows (Desktop Side Controls - Hidden on mobile to avoid text overlap) */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Vorheriger Titel"
            className="hidden sm:flex absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-2xl bg-black/40 hover:bg-black/80 border border-white/10 text-white/70 hover:text-white transition backdrop-blur-md shadow-xl hover:scale-105 cursor-pointer opacity-70 group-hover:opacity-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Nächster Titel"
            className="hidden sm:flex absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-2xl bg-black/40 hover:bg-black/80 border border-white/10 text-white/70 hover:text-white transition backdrop-blur-md shadow-xl hover:scale-105 cursor-pointer opacity-70 group-hover:opacity-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Bottom Carousel Navigation Indicators (+ compact mobile arrows) */}
      {slides.length > 1 && (
        <div className="absolute bottom-2 sm:bottom-4 left-0 right-0 z-30 flex items-center justify-center gap-0.5 sm:gap-1.5 px-4">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Vorheriger Titel"
            className="sm:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-black/50 hover:bg-black/75 border border-white/10 text-white/85 hover:text-white transition mr-1"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {slides.map((s, idx) => {
            const isActive = idx === activeSlideIdx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                title={`${idx + 1}. ${s.item.title} (${s.item.mediaType === "tv" ? "Serie" : "Film"})`}
                aria-current={isActive ? "true" : undefined}
                className="min-w-[26px] min-h-[44px] sm:min-w-0 sm:min-h-0 p-1.5 cursor-pointer flex items-center justify-center group/dot"
                aria-label={`Slide ${idx + 1} von ${slides.length} - ${s.item.title}`}
              >
                <span
                  className={`block transition-all duration-300 rounded-full ${
                    isActive
                      ? "w-7 sm:w-8 h-2.5 bg-amber-400 shadow-md shadow-amber-400/50"
                      : "w-2.5 h-2.5 bg-slate-500/90 group-hover/dot:bg-slate-400"
                  }`}
                />
              </button>
            );
          })}

          <button
            type="button"
            onClick={handleNext}
            aria-label="Nächster Titel"
            className="sm:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-black/50 hover:bg-black/75 border border-white/10 text-white/85 hover:text-white transition ml-1"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setAutoAdvanceDisabled((prev) => !prev)}
            aria-label={
              autoAdvanceDisabled ? "Automatischen Wechsel starten" : "Automatischen Wechsel pausieren"
            }
            className="sm:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-black/50 border border-white/10 text-slate-300 transition ml-1"
          >
            {autoAdvanceDisabled ? (
              <Play className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Pause className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      )}
    </section>
  );
}
