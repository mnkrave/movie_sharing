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
  const { openMediaModal, communityData, updateMediaStatus, userSubscriptions } = useMedia();
  const { data: session } = useSession();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [matchedMovies, setMatchedMovies] = useState<MediaItem[]>([]);
  const [matchedTv, setMatchedTv] = useState<MediaItem[]>([]);
  const touchStartXRef = useRef<number | null>(null);

  const myUserId = (session?.user as any)?.id;

  // Filter user's watched items
  const watchedItems = useMemo(() => {
    return communityData.mediaStatuses.filter(
      (m) =>
        m.status === "WATCHED" &&
        (myUserId ? m.userId === myUserId : true)
    );
  }, [communityData.mediaStatuses, myUserId]);

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

        setMatchedMovies(movies.slice(0, 3));
        setMatchedTv(tvShows.slice(0, 1));
      })
      .catch((err) => {
        console.error("Hero matches fetch error:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [watchedItems, userSubscriptions]);

  // Assemble the 6-slide carousel:
  // Slide 1: Generic Film (Trending Kinofilm)
  // Slide 2: Generic Serie (Trending Serie)
  // Slide 3: Matched Film 1 (or generic fallback)
  // Slide 4: Matched Serie 1 (or generic fallback)
  // Slide 5: Matched Film 2 (or generic fallback)
  // Slide 6: Matched Film 3 (or generic fallback)
  // Total: Exactly 4 Films + 2 Series!
  const slides: CarouselSlide[] = useMemo(() => {
    const defaultM1 = initialGenericMovies[0] || heroItem;
    const defaultT1 = initialGenericTv[0];
    const defaultM2 = initialGenericMovies[1] || defaultM1;
    const defaultT2 = initialGenericTv[1] || defaultT1;
    const defaultM3 = initialGenericMovies[2] || defaultM2;
    const defaultM4 = initialGenericMovies[3] || defaultM3;

    if (!defaultM1) return [];

    const slide1: CarouselSlide = {
      item: defaultM1,
      badgeLabel: "Trending diese Woche",
      badgeStyle: "bg-amber-500/20 border-amber-500/40 text-amber-300",
      badgeIcon: Flame,
    };

    const slide2: CarouselSlide = {
      item: defaultT1 || defaultM2,
      badgeLabel: defaultT1 ? "Top-Serie der Woche" : "Trending Highlight",
      badgeStyle: "bg-cyan-500/20 border-cyan-500/40 text-cyan-300",
      badgeIcon: Tv,
    };

    const slide3: CarouselSlide = {
      item: matchedMovies[0] || defaultM2,
      badgeLabel: "Empfehlung für dich",
      badgeStyle: "bg-purple-500/20 border-purple-500/40 text-purple-300",
      badgeIcon: Sparkles,
    };

    const slide4: CarouselSlide = {
      item: matchedTv[0] || defaultT2 || defaultM3,
      badgeLabel: (matchedTv[0] || defaultT2)?.mediaType === "tv" ? "Serien-Highlight" : "Film-Highlight",
      badgeStyle: "bg-indigo-500/20 border-indigo-500/40 text-indigo-300",
      badgeIcon: Tv,
    };

    const slide5: CarouselSlide = {
      item: matchedMovies[1] || defaultM3,
      badgeLabel: "Kino-Highlight",
      badgeStyle: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300",
      badgeIcon: Film,
    };

    const slide6: CarouselSlide = {
      item: matchedMovies[2] || defaultM4,
      badgeLabel: "Must-Watch",
      badgeStyle: "bg-rose-500/20 border-rose-500/40 text-rose-300",
      badgeIcon: Star,
    };

    return [slide1, slide2, slide3, slide4, slide5, slide6].filter(
      (s) => s.item && s.item.id
    );
  }, [initialGenericMovies, initialGenericTv, heroItem, matchedMovies, matchedTv]);

  // Auto-advance carousel every 7 seconds when not paused
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 7000);

    return () => clearInterval(timer);
  }, [slides.length, isPaused]);

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
      alert("Bitte logge dich ein, um deine Merkliste zu speichern!");
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
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    touchStartXRef.current = null;
  };

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative min-h-[520px] sm:min-h-[580px] w-full overflow-hidden bg-slate-950 border-b border-slate-800/80 group select-none"
    >
      {/* Background Backdrop Images with smooth cross-fade */}
      {slides.map((s, idx) => {
        const isActive = idx === (currentIndex % slides.length);
        if (!s.item.backdropPath) return null;
        return (
          <div
            key={`${s.item.mediaType}_${s.item.id}_bg`}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              isActive ? "opacity-80 sm:opacity-90 z-0" : "opacity-0 pointer-events-none"
            }`}
          >
            <Image
              src={`https://image.tmdb.org/t/p/original${s.item.backdropPath}`}
              alt={s.item.title}
              fill
              priority={idx === 0}
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
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full min-h-[520px] sm:min-h-[580px] flex items-center py-10 sm:py-14">
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
            <div className="flex flex-wrap items-center gap-3 pt-3">
              {/* Primary Action Button */}
              <button
                type="button"
                onClick={() => openMediaModal(currentItem)}
                className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition shadow-xl shadow-amber-500/30 hover:scale-105 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Details, Trailer & Stream</span>
              </button>

              {/* Quick Watchlist Toggle */}
              <button
                type="button"
                onClick={handleWatchlist}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold border transition cursor-pointer ${
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

      {/* Carousel Navigation Arrows (Left & Right) */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Vorheriger Titel"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-2xl bg-black/40 hover:bg-black/80 border border-white/10 text-white/70 hover:text-white transition backdrop-blur-md shadow-xl hover:scale-105 cursor-pointer opacity-70 group-hover:opacity-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Nächster Titel"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-2xl bg-black/40 hover:bg-black/80 border border-white/10 text-white/70 hover:text-white transition backdrop-blur-md shadow-xl hover:scale-105 cursor-pointer opacity-70 group-hover:opacity-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Bottom Carousel Navigation Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 z-30 flex items-center justify-center gap-2">
          {slides.map((s, idx) => {
            const isActive = idx === (currentIndex % slides.length);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                title={`${idx + 1}. ${s.item.title} (${s.item.mediaType === "tv" ? "Serie" : "Film"})`}
                className={`transition-all duration-300 rounded-full cursor-pointer flex items-center justify-center ${
                  isActive
                    ? "w-8 h-2.5 bg-amber-400 shadow-md shadow-amber-400/50"
                    : "w-2.5 h-2.5 bg-slate-700/80 hover:bg-slate-500"
                }`}
                aria-label={`Slide ${idx + 1} - ${s.item.title}`}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
