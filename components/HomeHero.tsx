"use client";

import React from "react";
import { MediaItem, formatGermanReleaseDate } from "@/lib/tmdb";
import { useMedia } from "./MediaContext";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Flame, Play, Plus, Check, Sparkles, Award, Star, Film, Tv } from "lucide-react";

interface HomeHeroProps {
  heroItem: MediaItem;
}

export function HomeHero({ heroItem }: HomeHeroProps) {
  const { openMediaModal, communityData, updateMediaStatus } = useMedia();
  const { data: session } = useSession();

  const myUserId = (session?.user as any)?.id;
  const myStatusObj = communityData.mediaStatuses.find(
    (m) =>
      m.tmdbId === heroItem.id &&
      m.mediaType === heroItem.mediaType &&
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
      tmdbId: heroItem.id,
      mediaType: heroItem.mediaType,
      title: heroItem.title,
      posterPath: heroItem.posterPath,
      releaseYear: heroItem.releaseYear,
      status: isWatchlist ? "NONE" : "WATCHLIST",
    });
  };

  return (
    <section className="relative min-h-[500px] sm:min-h-[560px] w-full overflow-hidden bg-slate-950 border-b border-slate-800/80">
      {/* Backdrop Image with enhanced visibility */}
      {heroItem.backdropPath ? (
        <Image
          src={`https://image.tmdb.org/t/p/original${heroItem.backdropPath}`}
          alt={heroItem.title}
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover object-center sm:object-top opacity-75 sm:opacity-85 transition-transform duration-700 hover:scale-102"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0e1424] to-[#07090e]" />
      )}

      {/* Gradients ensuring readability while keeping the image visible */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#07090e] via-[#07090e]/80 md:via-[#07090e]/40 to-transparent" />

      {/* Content Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full min-h-[500px] sm:min-h-[560px] flex items-center py-10 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center w-full">
          {/* Left Column: Title, Overview & Actions */}
          <div className="md:col-span-8 lg:col-span-8 space-y-4">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold tracking-wide uppercase shadow-sm">
                <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                Trending diese Woche
              </span>

              <span className="px-2.5 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-xs font-mono font-semibold text-slate-300 border border-white/10">
                {heroItem.mediaType === "tv" ? "Serie" : "Film"}
              </span>

              {heroItem.isUpcoming ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow">
                  <Sparkles className="w-3 h-3 fill-slate-950" />
                  <span>
                    {heroItem.releaseDate
                      ? `Start: ${formatGermanReleaseDate(heroItem.releaseDate)}`
                      : "Upcoming"}
                  </span>
                </span>
              ) : heroItem.voteAverage > 0 ? (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-amber-400 text-xs font-bold border border-amber-500/30">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{heroItem.voteAverage} ★ TMDB</span>
                </span>
              ) : null}

              {heroItem.releaseYear && (
                <span className="text-slate-400 text-xs font-semibold">
                  {heroItem.releaseYear}
                </span>
              )}
            </div>

            {/* Clickable Title */}
            <h1
              onClick={() => openMediaModal(heroItem)}
              className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight cursor-pointer hover:text-amber-400 transition"
              title="Klicken, um Film-Details, Trailer & Stream zu öffnen"
            >
              {heroItem.title}
            </h1>

            {/* Overview */}
            <p className="text-sm sm:text-base text-slate-300 line-clamp-3 leading-relaxed max-w-2xl">
              {heroItem.overview}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              {/* Primary: Open Media Details Modal */}
              <button
                type="button"
                onClick={() => openMediaModal(heroItem)}
                className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition shadow-xl shadow-amber-500/30 hover:scale-105 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Details, Trailer & Stream</span>
              </button>

              {/* Quick Watchlist */}
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
              onClick={() => openMediaModal(heroItem)}
              className="group relative cursor-pointer aspect-[2/3] w-52 lg:w-64 rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-800/80 hover:border-amber-500/60 shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1"
              title="Klicken, um Film-Details, Trailer & Stream zu öffnen"
            >
              {heroItem.posterPath ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w500${heroItem.posterPath}`}
                  alt={heroItem.title}
                  fill
                  sizes="(max-width: 1024px) 208px, 256px"
                  className="object-cover group-hover:scale-105 transition duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600">
                  <Film className="w-12 h-12" />
                </div>
              )}

              {/* Play / Details Hover Overlay */}
              <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white">
                <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                  <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                </div>
                <span className="text-xs font-bold text-amber-300">Film öffnen</span>
              </div>

              {/* Bottom Badge */}
              <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded-lg bg-black/80 backdrop-blur-md text-center text-[10px] font-bold text-amber-300 border border-white/10 shadow">
                Klicken für Stream & Details
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
