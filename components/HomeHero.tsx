"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { MediaItem, formatGermanReleaseDate } from "@/lib/tmdb";
import { useMedia } from "./MediaContext";
import { useSession } from "next-auth/react";
import Image from "next/image";
import {
  Flame,
  Play,
  Bookmark,
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (coarse || reduced) {
      setAutoAdvanceDisabled(true);
    }
  }, []);

  const myUserId = (session?.user as any)?.id;

  useEffect(() => {
    setShuffleSeed(Math.floor(Math.random() * 100000) + 1);
  }, []);

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

  const slides: CarouselSlide[] = useMemo(() => {
    const scoreWithSeed = (item: MediaItem, idx: number, salt: number) => {
      if (shuffleSeed === 0) return idx;
      return ((item.id * 2654435761 + shuffleSeed * 40503 + salt * 97) >>> 0) % 10000;
    };

    const usedKeys = new Set<string>();

    const filterAndOrder = (items: MediaItem[], salt: number): MediaItem[] => {
      const seenLocal = new Set<string>();
      const valid = items.filter((it) => {
        if (!it || !it.id) return false;
        const key = `${it.mediaType}_${it.id}`;
        if (seenLocal.has(key)) return false;
        seenLocal.add(key);
        if (!it.backdropPath && items.length > 8) return false;
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
            badgeIcon: m1.oscarInfo ? Award : Flame,
          }
        : null,
      t1
        ? {
            item: t1,
            badgeLabel: t1.mediaType === "tv" ? "Top-Serie" : "Highlight",
            badgeIcon: Tv,
          }
        : null,
      recM1
        ? {
            item: recM1,
            badgeLabel: matchedMovies.length > 0 ? "Empfehlung für dich" : "Kino-Highlight",
            badgeIcon: Sparkles,
          }
        : null,
      recT1
        ? {
            item: recT1,
            badgeLabel: recT1.mediaType === "tv" ? "Serien-Highlight" : "Film-Highlight",
            badgeIcon: Tv,
          }
        : null,
      m2
        ? {
            item: m2,
            badgeLabel: m2.oscarInfo ? "Prämiertes Highlight" : "Kino-Tipp",
            badgeIcon: Film,
          }
        : null,
      recM2
        ? {
            item: recM2,
            badgeLabel: "Must-Watch",
            badgeIcon: Star,
          }
        : null,
      t2
        ? {
            item: t2,
            badgeLabel: t2.mediaType === "tv" ? "Serien-Tipp" : "Publikumsliebling",
            badgeIcon: Tv,
          }
        : null,
      m3
        ? {
            item: m3,
            badgeLabel: "Klassiker & Perle",
            badgeIcon: Sparkles,
          }
        : null,
    ];

    return candidateSlides.filter((s): s is CarouselSlide => Boolean(s && s.item && s.item.id));
  }, [initialGenericMovies, initialGenericTv, heroItem, matchedMovies, matchedTv, shuffleSeed, watchedKeySet]);

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
      className="relative min-h-[430px] sm:min-h-[540px] w-full overflow-hidden bg-[#0a0e17] border-b border-border group select-none"
    >
      {/* Background Backdrop Images */}
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

      {/* Cinematic Dark Scrims (stay dark in both light and dark modes over photo backdrop) */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#070a11] via-[#070a11]/60 to-[#070a11]/15 z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#070a11]/95 via-[#070a11]/75 md:via-[#070a11]/45 to-transparent z-10" />

      {/* Main Content Area */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full min-h-[430px] sm:min-h-[540px] flex items-center pt-10 pb-16 sm:py-14">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center w-full">
            {/* Left Column: Meta, Title, Overview & 2 Actions */}
            <div className="md:col-span-8 space-y-3.5 animate-in fade-in duration-300">
              <div className="flex flex-wrap items-center gap-2.5 text-xs">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/35 text-amber-300 font-bold tracking-wide uppercase">
                  <BadgeIcon className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{currentSlide.badgeLabel}</span>
                </span>

                <span className="text-slate-300 font-medium">
                  {currentItem.mediaType === "tv" ? "Serie" : "Film"}
                  {currentItem.releaseYear ? ` · ${currentItem.releaseYear}` : ""}
                  {currentItem.isUpcoming
                    ? currentItem.releaseDate
                      ? ` · Start ${formatGermanReleaseDate(currentItem.releaseDate)}`
                      : " · Upcoming"
                    : currentItem.voteAverage > 0
                    ? ` · ${currentItem.voteAverage.toFixed(1).replace(".", ",")} TMDB`
                    : ""}
                </span>
              </div>

              <h1
                onClick={() => openMediaModal(currentItem)}
                className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight cursor-pointer hover:text-amber-300 transition"
                title="Details, Trailer & Stream öffnen"
              >
                {currentItem.title}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed max-w-xl">
                {currentItem.overview}
              </p>

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => openMediaModal(currentItem)}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-slate-950" aria-hidden="true" />
                  <span>Details & Stream</span>
                </button>

                <button
                  type="button"
                  onClick={handleWatchlist}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition cursor-pointer ${
                    isWatchlist
                      ? "bg-emerald-500 text-slate-950 border-emerald-400"
                      : "bg-black/45 hover:bg-black/65 text-white border-white/20 backdrop-blur-md"
                  }`}
                >
                  {isWatchlist ? (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                      <span>Auf Merkliste</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4" aria-hidden="true" />
                      <span>Merkliste</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column: Clean Desktop Poster */}
            <div className="hidden md:flex md:col-span-4 justify-end">
              <div
                onClick={() => openMediaModal(currentItem)}
                className="group/poster relative cursor-pointer aspect-[2/3] w-44 lg:w-52 rounded-2xl overflow-hidden bg-slate-900 border border-white/15 hover:border-amber-400/60 shadow-2xl transition-all duration-300 hover:scale-[1.03]"
                title="Details, Trailer & Stream öffnen"
              >
                {currentItem.posterPath ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w500${currentItem.posterPath}`}
                    alt={currentItem.title}
                    fill
                    sizes="(max-width: 1024px) 176px, 208px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500">
                    <Film className="w-10 h-10" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Side Arrows */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Vorheriger Titel"
              className="hidden sm:flex absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-2xl bg-black/45 hover:bg-black/75 border border-white/10 text-white/75 hover:text-white transition backdrop-blur-md shadow-xl hover:scale-105 cursor-pointer opacity-70 group-hover:opacity-100 focus-visible:opacity-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Nächster Titel"
              className="hidden sm:flex absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-2xl bg-black/45 hover:bg-black/75 border border-white/10 text-white/75 hover:text-white transition backdrop-blur-md shadow-xl hover:scale-105 cursor-pointer opacity-70 group-hover:opacity-100 focus-visible:opacity-100"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Bottom Pagination Dots & Mobile Controls */}
        {slides.length > 1 && (
          <div className="absolute bottom-2.5 sm:bottom-4 left-0 right-0 z-30 flex items-center justify-center gap-1 px-4">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Vorheriger Titel"
              className="sm:hidden min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full bg-black/50 border border-white/10 text-white/85 mr-1"
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
                  title={`${idx + 1}. ${s.item.title}`}
                  aria-current={isActive ? "true" : undefined}
                  aria-label={`Slide ${idx + 1} von ${slides.length} - ${s.item.title}`}
                  className="min-w-[24px] min-h-[40px] sm:min-w-0 sm:min-h-0 p-1.5 cursor-pointer flex items-center justify-center"
                >
                  <span
                    className={`block transition-all duration-300 rounded-full ${
                      isActive ? "w-6 h-2 bg-amber-400" : "w-2 h-2 bg-white/40 hover:bg-white/70"
                    }`}
                  />
                </button>
              );
            })}

            <button
              type="button"
              onClick={handleNext}
              aria-label="Nächster Titel"
              className="sm:hidden min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full bg-black/50 border border-white/10 text-white/85 ml-1"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setAutoAdvanceDisabled((prev) => !prev)}
              aria-label={
                autoAdvanceDisabled ? "Automatischen Wechsel starten" : "Automatischen Wechsel pausieren"
              }
              className="sm:hidden min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full bg-black/50 border border-white/10 text-slate-300 ml-1"
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
