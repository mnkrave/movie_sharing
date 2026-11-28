"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { useMedia } from "@/components/MediaContext";
import type { AppMediaStatus } from "@/lib/store";
import { computeWatchtimeBreakdown, formatWatchedSeasons } from "@/lib/seasons";
import type { BatchMediaMeta } from "@/app/api/tmdb/batch-genres/route";
import { Clock, Trophy, BarChart3, Film, Tv, Star } from "lucide-react";

interface ProfileWatchtimePanelProps {
  watchedItems: AppMediaStatus[];
  metaMap: Record<string, BatchMediaMeta>;
}

export function ProfileWatchtimePanel({
  watchedItems,
  metaMap,
}: ProfileWatchtimePanelProps) {
  const { openMediaModal, openSearch } = useMedia();
  const [subTab, setSubTab] = useState<"contributors" | "genres">("contributors");
  const [contributorLimit, setContributorLimit] = useState<10 | 15 | 25>(15);

  const totalStats = useMemo(
    () => computeWatchtimeBreakdown(watchedItems, metaMap),
    [watchedItems, metaMap]
  );

  const contributors = useMemo(() => {
    const list = watchedItems.map((item, idx) => {
      const meta = metaMap[`${item.mediaType}_${item.tmdbId}`];
      const minutes = totalStats.itemMinutes[idx] ?? 0;
      let seasonInfo: string | null = null;
      if (item.mediaType === "tv") {
        const total = item.totalSeasons || meta?.numberOfSeasons || 1;
        const watched =
          item.watchedSeasons && item.watchedSeasons.length > 0
            ? item.watchedSeasons
            : null;
        if (watched && total > 0 && watched.length < total) {
          seasonInfo = formatWatchedSeasons(watched, total);
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
  }, [watchedItems, metaMap, totalStats.totalMinutes, totalStats.itemMinutes, contributorLimit]);

  const maxContributorMinutes = contributors[0]?.minutes || 1;

  const genreWatchtimeStats = useMemo(() => {
    const map: Record<
      string,
      { name: string; minutes: number; count: number; ratingSum: number; ratedCount: number }
    > = {};

    watchedItems.forEach((item, idx) => {
      const meta = metaMap[`${item.mediaType}_${item.tmdbId}`];
      const itemMinutes = totalStats.itemMinutes[idx] ?? 0;
      const genres = meta?.genres || [];
      const targetGenres = genres.length > 0 ? genres.map((g) => g.name) : ["Sonstige"];

      targetGenres.forEach((genreName) => {
        if (!map[genreName]) {
          map[genreName] = { name: genreName, minutes: 0, count: 0, ratingSum: 0, ratedCount: 0 };
        }
        map[genreName].minutes += itemMinutes;
        map[genreName].count += 1;
        if (item.rating) {
          map[genreName].ratingSum += item.rating;
          map[genreName].ratedCount += 1;
        }
      });
    });

    const totalGenreMinutesSum = Object.values(map).reduce((acc, g) => acc + g.minutes, 0) || 1;
    const maxGenreMinutes = Math.max(...Object.values(map).map((g) => g.minutes), 1);

    return Object.values(map)
      .map((g) => ({
        ...g,
        hours: Math.round((g.minutes / 60) * 10) / 10,
        percentOfTotal: Math.round((g.minutes / totalGenreMinutesSum) * 1000) / 10,
        barWidth: Math.round((g.minutes / maxGenreMinutes) * 100),
        avgRating:
          g.ratedCount > 0 ? Math.round((g.ratingSum / g.ratedCount) * 10) / 10 : 0,
      }))
      .sort((a, b) => b.minutes - a.minutes);
  }, [watchedItems, metaMap, totalStats.itemMinutes]);

  if (watchedItems.length === 0) {
    return (
      <div className="p-12 rounded-2xl bg-card border border-border text-center space-y-4 shadow-xs">
        <Clock className="w-10 h-10 text-primary-text mx-auto" aria-hidden="true" />
        <h2 className="text-lg font-bold text-foreground">
          Noch keine Kino-Lebenszeit erfasst
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
          Markiere Filme oder Serien als „Gesehen“, um deine Spielzeit, Top Contributor und
          Genre-Aufschlüsselung zu sehen.
        </p>
        <button
          type="button"
          onClick={openSearch}
          className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs transition cursor-pointer"
        >
          Filme &amp; Serien suchen
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border space-y-1 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Gesamte Spielzeit
          </p>
          <p className="text-2xl font-black text-foreground">{totalStats.totalHours} Std.</p>
          <p className="text-xs text-muted-foreground">
            {totalStats.totalMinutes.toLocaleString("de-DE")} Min. gesamt
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border space-y-1 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Non-Stop in Tagen
          </p>
          <p className="text-2xl font-black text-sky-600 dark:text-sky-400">
            ca. {totalStats.totalDays} Tage
          </p>
          <p className="text-xs text-muted-foreground">24h durchgehend geschaut</p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border space-y-1 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Serien-Anteil
          </p>
          <p className="text-2xl font-black text-foreground">
            {totalStats.tvHours} Std.{" "}
            <span className="text-sm font-bold text-muted-foreground">
              ({totalStats.tvSharePct}%)
            </span>
          </p>
          <p className="text-xs text-muted-foreground">
            {totalStats.tvCount} Serien (Ø {totalStats.avgTvHours}h)
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border space-y-1 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Filme-Anteil
          </p>
          <p className="text-2xl font-black text-primary-text">
            {totalStats.movieHours} Std.{" "}
            <span className="text-sm font-bold text-muted-foreground">
              ({totalStats.movieSharePct}%)
            </span>
          </p>
          <p className="text-xs text-muted-foreground">
            {totalStats.movieCount} Filme (Ø {totalStats.avgMovieMin}m)
          </p>
        </div>
      </div>

      {/* Sub-tabs & Limit Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-muted border border-border">
          <button
            type="button"
            onClick={() => setSubTab("contributors")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              subTab === "contributors"
                ? "bg-card text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground border border-transparent"
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-primary-text" aria-hidden="true" />
            <span>Top Contributor ({contributors.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab("genres")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              subTab === "genres"
                ? "bg-card text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground border border-transparent"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-primary-text" aria-hidden="true" />
            <span>Watchtime nach Genre ({genreWatchtimeStats.length})</span>
          </button>
        </div>

        {subTab === "contributors" && (
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-muted border border-border">
            <span className="text-[11px] font-semibold text-muted-foreground px-2">Anzeigen:</span>
            {([10, 15, 25] as const).map((limit) => (
              <button
                key={limit}
                type="button"
                onClick={() => setContributorLimit(limit)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  contributorLimit === limit
                    ? "bg-card text-foreground shadow-xs border border-border"
                    : "text-muted-foreground hover:text-foreground border border-transparent"
                }`}
              >
                Top {limit}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      {subTab === "contributors" ? (
        <div className="space-y-2.5">
          {contributors.map((item, idx) => {
            const isTv = item.mediaType === "tv";
            const barWidth = Math.round((item.minutes / maxContributorMinutes) * 100);

            return (
              <button
                key={`${item.mediaType}_${item.tmdbId}`}
                type="button"
                onClick={() =>
                  openMediaModal({
                    id: item.tmdbId,
                    mediaType: item.mediaType,
                    title: item.title,
                    posterPath: item.posterPath,
                  })
                }
                className="w-full text-left group p-3.5 rounded-2xl bg-card border border-border hover:border-primary/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                      idx === 0
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground border border-border"
                    }`}
                  >
                    #{idx + 1}
                  </div>

                  <div className="relative w-11 aspect-[2/3] rounded-lg overflow-hidden bg-muted border border-border shrink-0">
                    {item.posterPath ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w185${item.posterPath}`}
                        alt={item.title}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        {isTv ? <Tv className="w-4 h-4" /> : <Film className="w-4 h-4" />}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-foreground group-hover:text-primary-text transition truncate">
                        {item.title}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] font-bold uppercase text-muted-foreground">
                        {isTv ? "Serie" : "Film"}
                      </span>
                      {item.seasonInfo && (
                        <span className="px-1.5 py-0.5 rounded bg-primary-soft text-primary-text text-[10px] font-bold">
                          {item.seasonInfo}
                        </span>
                      )}
                      {item.releaseYear && (
                        <span className="text-xs text-muted-foreground font-mono">
                          {item.releaseYear}
                        </span>
                      )}
                      {item.rating && (
                        <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-primary-text">
                          <Star className="w-3 h-3 fill-primary text-primary" aria-hidden="true" />
                          <span>{item.rating}/10</span>
                        </span>
                      )}
                    </div>

                    <div className="w-full max-w-md h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isTv ? "bg-sky-500" : "bg-primary"
                        }`}
                        style={{ width: `${Math.max(4, barWidth)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-baseline justify-between sm:flex-col sm:items-end gap-0.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                  <p className="text-sm font-black text-foreground">
                    {item.hours} Std.{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      ({item.minutes}m)
                    </span>
                  </p>
                  <p className="text-[11px] font-semibold text-primary-text">
                    {item.sharePercent}% vom Gesamten
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {genreWatchtimeStats.map((genre, idx) => {
            const isLeader = idx === 0;
            return (
              <div
                key={genre.name}
                className={`p-4 rounded-2xl border space-y-2.5 shadow-xs ${
                  isLeader
                    ? "bg-primary-soft/30 border-primary/40"
                    : "bg-card border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-foreground">
                        {idx + 1}. {genre.name}
                      </h3>
                      {isLeader && (
                        <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                          Top-Genre
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {genre.count} Titel
                      {genre.avgRating > 0 && ` · Ø ${genre.avgRating}/10`}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-foreground">{genre.hours} Std.</p>
                    <p className="text-[11px] font-semibold text-primary-text">
                      {genre.percentOfTotal}% Watchtime
                    </p>
                  </div>
                </div>

                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${Math.max(4, genre.barWidth)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
