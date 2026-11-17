"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { useMedia } from "./MediaContext";
import type { AppMediaStatus } from "@/lib/store";
import { formatWatchedSeasons } from "@/lib/seasons";
import type { BatchMediaMeta } from "@/app/api/tmdb/batch-genres/route";
import {
  X,
  Clock,
  Trophy,
  BarChart3,
  Film,
  Tv,
  Star,
  ChevronRight,
  TrendingUp,
  Award,
  Layers,
  Sparkles,
  Percent,
} from "lucide-react";
import { ALL_GENRES_MAP, OFFICIAL_MOVIE_GENRES, OFFICIAL_TV_GENRES } from "@/lib/tmdb";

function getEmojiForGenre(name: string, id?: number): string {
  if (id && ALL_GENRES_MAP[id]) return ALL_GENRES_MAP[id].emoji;
  const lower = name.toLowerCase();
  const match = [...OFFICIAL_MOVIE_GENRES, ...OFFICIAL_TV_GENRES].find(
    (g) => g.name.toLowerCase() === lower
  );
  if (match) return match.emoji;
  if (lower.includes("sci-fi") || lower.includes("science")) return "🚀";
  if (lower.includes("action")) return "💥";
  if (lower.includes("komödie") || lower.includes("comedy")) return "😂";
  if (lower.includes("krimi") || lower.includes("crime")) return "🕵️";
  if (lower.includes("drama")) return "🎭";
  if (lower.includes("horror")) return "🩸";
  if (lower.includes("thriller")) return "😱";
  if (lower.includes("animation")) return "✨";
  if (lower.includes("abenteuer") || lower.includes("adventure")) return "🗺️";
  if (lower.includes("fantasy")) return "🧙‍♂️";
  if (lower.includes("doku")) return "🎥";
  if (lower.includes("liebe") || lower.includes("romance")) return "❤️";
  if (lower.includes("historie")) return "📜";
  if (lower.includes("krieg") || lower.includes("war")) return "🪖";
  if (lower.includes("western")) return "🤠";
  if (lower.includes("musik")) return "🎵";
  if (lower.includes("mystery")) return "🔍";
  if (lower.includes("familie") || lower.includes("family")) return "👨‍👩‍👧‍👦";
  return "🎬";
}

interface WatchtimeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  watchedItems: AppMediaStatus[];
  metaMap: Record<string, BatchMediaMeta>;
}

export function WatchtimeDetailsModal({
  isOpen,
  onClose,
  watchedItems,
  metaMap,
}: WatchtimeDetailsModalProps) {
  const { openMediaModal } = useMedia();

  // Mode: "contributors" vs "genres"
  const [activeTab, setActiveTab] = useState<"contributors" | "genres">("contributors");
  // Contributor limit: 10 vs 15
  const [contributorLimit, setContributorLimit] = useState<10 | 15>(15);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Overall totals
  const totalStats = useMemo(() => {
    let totalMinutes = 0;
    let movieMinutes = 0;
    let tvMinutes = 0;
    let movieCount = 0;
    let tvCount = 0;

    watchedItems.forEach((item) => {
      const meta = metaMap[`${item.mediaType}_${item.tmdbId}`];
      let minutes = meta?.runtimeMinutes || (item.mediaType === "movie" ? 120 : 400);
      if (item.mediaType === "tv") {
        const total = item.totalSeasons || meta?.numberOfSeasons || 1;
        const watched =
          item.watchedSeasons && item.watchedSeasons.length > 0
            ? item.watchedSeasons.length
            : total;
        if (total > 0 && watched < total) {
          minutes = Math.round(minutes * (watched / total));
        }
      }
      totalMinutes += minutes;

      if (item.mediaType === "movie") {
        movieMinutes += minutes;
        movieCount++;
      } else {
        tvMinutes += minutes;
        tvCount++;
      }
    });

    const totalHours = Math.round(totalMinutes / 60);
    const totalDays = (totalHours / 24).toFixed(1);

    const movieHours = Math.round(movieMinutes / 60);
    const tvHours = Math.round(tvMinutes / 60);

    const movieSharePct = totalMinutes > 0 ? Math.round((movieMinutes / totalMinutes) * 100) : 0;
    const tvSharePct = totalMinutes > 0 ? 100 - movieSharePct : 0;

    const avgMovieMin = movieCount > 0 ? Math.round(movieMinutes / movieCount) : 0;
    const avgTvHours = tvCount > 0 ? Math.round((tvMinutes / tvCount / 60) * 10) / 10 : 0;

    return {
      totalMinutes,
      totalHours,
      totalDays,
      movieMinutes,
      tvMinutes,
      movieHours,
      tvHours,
      movieCount,
      tvCount,
      movieSharePct,
      tvSharePct,
      avgMovieMin,
      avgTvHours,
    };
  }, [watchedItems, metaMap]);

  // Top Contributors sorted descending by runtime
  const contributors = useMemo(() => {
    const list = watchedItems.map((item) => {
      const meta = metaMap[`${item.mediaType}_${item.tmdbId}`];
      let minutes = meta?.runtimeMinutes || (item.mediaType === "movie" ? 120 : 400);
      let seasonInfo: string | null = null;
      if (item.mediaType === "tv") {
        const total = item.totalSeasons || meta?.numberOfSeasons || 1;
        const watched =
          item.watchedSeasons && item.watchedSeasons.length > 0
            ? item.watchedSeasons.length
            : total;
        if (total > 0 && watched < total) {
          minutes = Math.round(minutes * (watched / total));
          seasonInfo = formatWatchedSeasons(item.watchedSeasons, total);
        }
      }
      const hours = Math.round((minutes / 60) * 10) / 10;
      const sharePercent =
        totalStats.totalMinutes > 0
          ? Math.round((minutes / totalStats.totalMinutes) * 1000) / 10
          : 0;

      return {
        ...item,
        meta,
        minutes,
        hours,
        sharePercent,
        seasonInfo,
      };
    });

    list.sort((a, b) => b.minutes - a.minutes);
    return list.slice(0, contributorLimit);
  }, [watchedItems, metaMap, totalStats.totalMinutes, contributorLimit]);

  const maxContributorMinutes = useMemo(() => {
    return contributors[0]?.minutes || 1;
  }, [contributors]);

  // Aufschlüsselung nach Watchtime und Genre
  const genreWatchtimeStats = useMemo(() => {
    const map: Record<
      string,
      {
        name: string;
        emoji: string;
        minutes: number;
        movieMinutes: number;
        tvMinutes: number;
        count: number;
        ratingSum: number;
        ratedCount: number;
      }
    > = {};

    watchedItems.forEach((item) => {
      const meta = metaMap[`${item.mediaType}_${item.tmdbId}`];
      const itemMinutes = meta?.runtimeMinutes || (item.mediaType === "movie" ? 120 : 400);
      const genres = meta?.genres || [];

      if (genres.length === 0) {
        const fallback = "Sonstige";
        if (!map[fallback]) {
          map[fallback] = {
            name: fallback,
            emoji: "🎬",
            minutes: 0,
            movieMinutes: 0,
            tvMinutes: 0,
            count: 0,
            ratingSum: 0,
            ratedCount: 0,
          };
        }
        map[fallback].minutes += itemMinutes;
        if (item.mediaType === "movie") map[fallback].movieMinutes += itemMinutes;
        else map[fallback].tvMinutes += itemMinutes;
        map[fallback].count += 1;
        if (item.rating) {
          map[fallback].ratingSum += item.rating;
          map[fallback].ratedCount += 1;
        }
      } else {
        genres.forEach((g) => {
          if (!map[g.name]) {
            map[g.name] = {
              name: g.name,
              emoji: getEmojiForGenre(g.name, g.id),
              minutes: 0,
              movieMinutes: 0,
              tvMinutes: 0,
              count: 0,
              ratingSum: 0,
              ratedCount: 0,
            };
          }
          map[g.name].minutes += itemMinutes;
          if (item.mediaType === "movie") map[g.name].movieMinutes += itemMinutes;
          else map[g.name].tvMinutes += itemMinutes;
          map[g.name].count += 1;
          if (item.rating) {
            map[g.name].ratingSum += item.rating;
            map[g.name].ratedCount += 1;
          }
        });
      }
    });

    const totalGenreMinutesSum = Object.values(map).reduce((acc, g) => acc + g.minutes, 0) || 1;
    const maxGenreMinutes = Math.max(...Object.values(map).map((g) => g.minutes), 1);

    return Object.values(map)
      .map((g) => {
        const hours = Math.round((g.minutes / 60) * 10) / 10;
        const percentOfTotal = Math.round((g.minutes / totalGenreMinutesSum) * 1000) / 10;
        const barWidth = Math.round((g.minutes / maxGenreMinutes) * 100);
        const avgRating =
          g.ratedCount > 0 ? Math.round((g.ratingSum / g.ratedCount) * 10) / 10 : 0;
        return {
          ...g,
          hours,
          percentOfTotal,
          barWidth,
          avgRating,
        };
      })
      .sort((a, b) => b.minutes - a.minutes);
  }, [watchedItems, metaMap]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#0b101e] border-0 sm:border sm:border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden relative max-h-[94dvh] sm:max-h-[90dvh] flex flex-col h-[94dvh] sm:h-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Grab Handle */}
        <div
          className="w-12 h-1.5 bg-slate-700/80 rounded-full mx-auto my-2.5 sm:hidden flex-shrink-0 cursor-pointer"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-start sm:items-center justify-between gap-4 bg-slate-900/40 flex-shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 flex-shrink-0 shadow-lg shadow-sky-500/10">
              <Clock className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                  Lifetime Watchtime Analyse
                </h2>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-sky-500/20 text-sky-300 border border-sky-500/30 uppercase">
                  {totalStats.totalHours} Std. Gesamt
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Top Contributor & Spielzeit-Aufschlüsselung nach Genre
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition flex-shrink-0"
            aria-label="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Key KPI Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 p-4 sm:p-5 bg-slate-950/70 border-b border-slate-800/80 flex-shrink-0">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Gesamte Spielzeit
            </span>
            <p className="text-lg sm:text-xl font-black text-white">
              {totalStats.totalHours} Std.
            </p>
            <span className="text-[11px] text-slate-400 block truncate">
              {totalStats.totalMinutes.toLocaleString("de-DE")} Min.
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              In Tagen Non-Stop
            </span>
            <p className="text-lg sm:text-xl font-black text-sky-400">
              ca. {totalStats.totalDays} Tage
            </p>
            <span className="text-[11px] text-slate-400 block truncate">
              24h durchgehend
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Serien-Anteil
            </span>
            <p className="text-lg sm:text-xl font-black text-cyan-400">
              {totalStats.tvHours} Std. ({totalStats.tvSharePct}%)
            </p>
            <span className="text-[11px] text-slate-400 block truncate">
              {totalStats.tvCount} TV-Serien (Ø {totalStats.avgTvHours}h)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Filme-Anteil
            </span>
            <p className="text-lg sm:text-xl font-black text-amber-400">
              {totalStats.movieHours} Std. ({totalStats.movieSharePct}%)
            </p>
            <span className="text-[11px] text-slate-400 block truncate">
              {totalStats.movieCount} Spielfilme (Ø {totalStats.avgMovieMin}m)
            </span>
          </div>
        </div>

        {/* Tab Switcher & Limit Toggle */}
        <div className="p-4 sm:px-6 pb-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-900/20 flex-shrink-0">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab("contributors")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === "contributors"
                  ? "bg-sky-500 text-black shadow-md shadow-sky-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Top Contributor ({contributorLimit})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("genres")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === "genres"
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Watchtime nach Genre ({genreWatchtimeStats.length})</span>
            </button>
          </div>

          {activeTab === "contributors" && (
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400 mr-1 text-[11px] font-semibold">Anzeigen:</span>
              <button
                type="button"
                onClick={() => setContributorLimit(10)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  contributorLimit === 10
                    ? "bg-slate-800 text-white border border-slate-700"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Top 10
              </button>
              <button
                type="button"
                onClick={() => setContributorLimit(15)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  contributorLimit === 15
                    ? "bg-slate-800 text-white border border-slate-700"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Top 15
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4 pb-[calc(2rem+env(safe-area-inset-bottom))]">
          {watchedItems.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-3">
              <Clock className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="font-semibold text-white">Noch keine gesehenen Titel vorhanden</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Markiere Filme oder Serien als „Gesehen“, um die Aufschlüsselung deiner Spielzeit
                nach Titeln und Genres zu sehen.
              </p>
            </div>
          ) : activeTab === "contributors" ? (
            /* ======================================================== */
            /* TAB: TOP 10 / TOP 15 CONTRIBUTORS                       */
            /* ======================================================== */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                <span>
                  Die {contributors.length} Titel mit dem größten Einfluss auf deine Lifetime
                  Watchtime:
                </span>
                <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
                  Klicke auf einen Titel für Details
                </span>
              </div>

              {contributors.map((item, idx) => {
                const isTv = item.mediaType === "tv";
                const isTop3 = idx < 3;
                const barWidth = Math.round((item.minutes / maxContributorMinutes) * 100);

                return (
                  <div
                    key={`${item.mediaType}_${item.tmdbId}`}
                    onClick={() =>
                      openMediaModal({
                        id: item.tmdbId,
                        mediaType: item.mediaType,
                        title: item.title,
                        posterPath: item.posterPath,
                      })
                    }
                    className={`group relative p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isTop3
                        ? "bg-slate-900/80 border-slate-700/80 hover:border-sky-500/60 shadow-lg hover:shadow-sky-500/10"
                        : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      {/* Rank Badge */}
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0 shadow ${
                          idx === 0
                            ? "bg-amber-400 text-black shadow-amber-400/30"
                            : idx === 1
                            ? "bg-slate-300 text-black shadow-slate-300/30"
                            : idx === 2
                            ? "bg-amber-700/80 text-amber-100"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        #{idx + 1}
                      </div>

                      {/* Poster Thumbnail */}
                      <div className="relative w-11 sm:w-12 aspect-[2/3] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex-shrink-0 shadow">
                        {item.posterPath ? (
                          <Image
                            src={`https://image.tmdb.org/t/p/w185${item.posterPath}`}
                            alt={item.title}
                            fill
                            sizes="48px"
                            className="object-cover group-hover:scale-105 transition duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600">
                            {isTv ? <Tv className="w-4 h-4" /> : <Film className="w-4 h-4" />}
                          </div>
                        )}
                      </div>

                      {/* Title & Metadata */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition truncate">
                            {item.title}
                          </h4>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider ${
                              isTv
                                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            }`}
                          >
                            {isTv ? "Serie" : "Film"}
                          </span>
                          {item.seasonInfo && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              {item.seasonInfo}
                            </span>
                          )}
                          {item.releaseYear && (
                            <span className="text-xs text-slate-400 font-mono">
                              ({item.releaseYear})
                            </span>
                          )}
                          {item.rating && (
                            <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded">
                              <Star className="w-3 h-3 fill-amber-400" />
                              <span>{item.rating}/10</span>
                            </span>
                          )}
                        </div>

                        {/* Relative Progress Bar */}
                        <div className="mt-2 w-full max-w-md h-1.5 rounded-full bg-slate-800/80 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isTv
                                ? "bg-gradient-to-r from-cyan-500 to-sky-400"
                                : "bg-gradient-to-r from-amber-500 to-orange-400"
                            }`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right Side: Exact Watchtime & Share */}
                    <div className="flex items-center justify-between sm:justify-end sm:flex-col sm:items-end gap-1 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                      <div className="flex items-baseline gap-1 text-white font-black text-sm sm:text-base">
                        <span>{item.hours}</span>
                        <span className="text-xs text-slate-400 font-medium">Std.</span>
                        <span className="text-xs text-slate-400 font-normal">
                          ({item.minutes}m)
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-sky-400 flex items-center gap-1">
                        <span>{item.sharePercent}%</span>
                        <span className="text-slate-500 font-normal text-[10px]">vom Gesamten</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ======================================================== */
            /* TAB: WATCHTIME NACH GENRE                                */
            /* ======================================================== */
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                <span>
                  Aufschlüsselung der {totalStats.totalHours} Stunden nach Genres & Themen:
                </span>
                <span className="text-slate-500 font-mono text-[11px]">
                  Sortiert nach absoluter Spielzeit
                </span>
              </div>

              {genreWatchtimeStats.map((genre, idx) => {
                const isLeader = idx === 0;

                return (
                  <div
                    key={genre.name}
                    className={`p-4 rounded-2xl border transition-all ${
                      isLeader
                        ? "bg-amber-950/20 border-amber-500/40 shadow-lg shadow-amber-500/10"
                        : "bg-slate-900/50 border-slate-800/80"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl sm:text-2xl">{genre.emoji}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-white">{genre.name}</h4>
                            {isLeader && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black font-black text-[10px] uppercase shadow">
                                Platz 1 Meiste Spielzeit
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {genre.count} {genre.count === 1 ? "Titel" : "Titel"} gesehen
                            {genre.avgRating > 0 && ` • Ø ${genre.avgRating}/10 Sterne`}
                          </p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center gap-1">
                        <div className="text-sm sm:text-base font-black text-amber-300">
                          {genre.hours} Std.{" "}
                          <span className="text-xs font-normal text-slate-400">
                            ({genre.minutes} Min.)
                          </span>
                        </div>
                        <span className="text-xs font-bold text-amber-400/90">
                          {genre.percentOfTotal}% der gesamten Watchtime
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isLeader
                            ? "bg-gradient-to-r from-amber-500 via-orange-400 to-rose-400"
                            : "bg-gradient-to-r from-sky-500 to-amber-400"
                        }`}
                        style={{ width: `${genre.barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800/90 bg-slate-950/70 flex items-center justify-between gap-3 flex-shrink-0">
          <p className="text-xs text-slate-500 hidden sm:block">
            Tipp: Klicke auf einen der Top-Contributor, um Details, Trailer & Streams zu öffnen.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition ml-auto"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}
