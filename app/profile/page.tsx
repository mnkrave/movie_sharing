"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMedia } from "@/components/MediaContext";
import {
  POPULAR_SUBSCRIPTIONS,
  ALL_GENRES_MAP,
  OFFICIAL_MOVIE_GENRES,
  OFFICIAL_TV_GENRES,
} from "@/lib/tmdb";
import { COLLECTIONS_DATA } from "@/lib/collections";
import type { BatchMediaMeta } from "@/app/api/tmdb/batch-genres/route";
import type {
  RecommendedMediaItem,
  TasteSummary,
} from "@/app/api/tmdb/recommendations/route";
import { AiMovieAdvisor } from "@/components/AiMovieAdvisor";
import { AlgorithmRecommendations } from "@/components/AlgorithmRecommendations";
import {
  User,
  Star,
  Film,
  Tv,
  Clock,
  Award,
  Sparkles,
  Bookmark,
  BarChart3,
  TrendingUp,
  Layers,
  Clapperboard,
  Calendar,
  Settings,
  ChevronRight,
  Plus,
  Check,
  Flame,
  Trophy,
  Wand2,
  RefreshCw,
  Filter,
  Tag,
  Camera,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function getEmojiForGenreName(name: string, id?: number): string {
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

type ProfileTab = "stats" | "hall-of-fame" | "ai" | "matches";

function ProfileContent() {
  const { data: session } = useSession();
  const {
    communityData,
    userSubscriptions,
    openSubscriptions,
    openMediaModal,
    openRatingModal,
    updateMediaStatus,
    openSearch,
    openAvatarPicker,
    currentUserAvatar,
  } = useMedia();

  const [metaMap, setMetaMap] = useState<Record<string, BatchMediaMeta>>({});
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [favFilter, setFavFilter] = useState<"ALL" | "movie" | "tv">("ALL");
  const searchParams = useSearchParams();
  const urlTab = searchParams.get("tab") as ProfileTab | null;
  const urlPrompt = searchParams.get("prompt");

  const [activeTab, setActiveTab] = useState<ProfileTab>(() => {
    if (urlTab === "ai" || urlTab === "matches" || urlTab === "hall-of-fame" || urlTab === "stats") {
      return urlTab;
    }
    if (urlPrompt) {
      return "ai";
    }
    return "stats"; // Tab 1 default
  });

  useEffect(() => {
    if (urlTab === "ai" || urlTab === "matches" || urlTab === "hall-of-fame" || urlTab === "stats") {
      setActiveTab(urlTab);
    } else if (urlPrompt) {
      setActiveTab("ai");
    }
  }, [urlTab, urlPrompt]);
  const [genreSortMode, setGenreSortMode] = useState<"count" | "rating">("count");

  const myUserId = (session?.user as any)?.id || "user_lukas";
  const myName = session?.user?.name || "Kino-Fan";
  const myEmail = session?.user?.email || "";

  // Filter user's media statuses
  const myStatuses = useMemo(() => {
    return communityData.mediaStatuses.filter(
      (m) => m.userId === myUserId || (session?.user?.name && m.userName === session.user.name)
    );
  }, [communityData.mediaStatuses, myUserId, session?.user?.name]);

  const watchedItems = useMemo(
    () => myStatuses.filter((m) => m.status === "WATCHED"),
    [myStatuses]
  );

  const watchlistItems = useMemo(
    () => myStatuses.filter((m) => m.status === "WATCHLIST"),
    [myStatuses]
  );

  const myRecommendations = useMemo(() => {
    return communityData.recommendations.filter(
      (r) => r.userId === myUserId || (session?.user?.name && r.userName === session.user.name)
    );
  }, [communityData.recommendations, myUserId, session?.user?.name]);

  // Fetch rich TMDB metadata (genres, runtime, director, cast, global rating) for watched items
  useEffect(() => {
    if (watchedItems.length === 0) return;

    const missing = watchedItems
      .filter((m) => !metaMap[`${m.mediaType}_${m.tmdbId}`])
      .map((m) => ({ id: m.tmdbId, type: m.mediaType }));

    if (missing.length === 0) return;

    setLoadingMeta(true);
    fetch("/api/tmdb/batch-genres", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: missing }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.meta) {
          setMetaMap((prev) => ({ ...prev, ...data.meta }));
        }
      })
      .catch((err) => console.error("Profile metadata error:", err))
      .finally(() => setLoadingMeta(false));
  }, [watchedItems, metaMap]);

  // Basic KPIs
  const watchedMoviesCount = watchedItems.filter((m) => m.mediaType === "movie").length;
  const watchedTvCount = watchedItems.filter((m) => m.mediaType === "tv").length;

  const ratedItems = useMemo(
    () => watchedItems.filter((m) => typeof m.rating === "number" && m.rating > 0),
    [watchedItems]
  );

  const avgRating = useMemo(() => {
    if (ratedItems.length === 0) return 0;
    const sum = ratedItems.reduce((acc, item) => acc + (item.rating || 0), 0);
    return Math.round((sum / ratedItems.length) * 10) / 10;
  }, [ratedItems]);

  // Global TMDB comparison
  const tmdbDiff = useMemo(() => {
    let count = 0;
    let diffSum = 0;
    ratedItems.forEach((item) => {
      const meta = metaMap[`${item.mediaType}_${item.tmdbId}`];
      if (meta && meta.tmdbVoteAverage > 0 && item.rating) {
        diffSum += item.rating - meta.tmdbVoteAverage;
        count++;
      }
    });
    if (count === 0) return null;
    return Math.round((diffSum / count) * 10) / 10;
  }, [ratedItems, metaMap]);

  // Total Watchtime
  const totalMinutes = useMemo(() => {
    return watchedItems.reduce((acc, item) => {
      const meta = metaMap[`${item.mediaType}_${item.tmdbId}`];
      if (meta?.runtimeMinutes) return acc + meta.runtimeMinutes;
      return acc + (item.mediaType === "movie" ? 120 : 400);
    }, 0);
  }, [watchedItems, metaMap]);

  const totalHours = Math.round(totalMinutes / 60);
  const totalDays = (totalHours / 24).toFixed(1);

  // Genre Statistics (Count + Average User Rating)
  const genreStats = useMemo(() => {
    const map: Record<
      string,
      { name: string; emoji: string; count: number; ratingSum: number; ratedCount: number }
    > = {};

    watchedItems.forEach((item) => {
      const meta = metaMap[`${item.mediaType}_${item.tmdbId}`];
      const genres = meta?.genres || [];
      genres.forEach((g) => {
        if (!map[g.name]) {
          map[g.name] = {
            name: g.name,
            emoji: getEmojiForGenreName(g.name, g.id),
            count: 0,
            ratingSum: 0,
            ratedCount: 0,
          };
        }
        map[g.name].count += 1;
        if (item.rating) {
          map[g.name].ratingSum += item.rating;
          map[g.name].ratedCount += 1;
        }
      });
    });

    const list = Object.values(map).map((entry) => ({
      ...entry,
      avgRating:
        entry.ratedCount > 0 ? Math.round((entry.ratingSum / entry.ratedCount) * 10) / 10 : 0,
    }));

    if (genreSortMode === "rating") {
      return list.sort((a, b) => b.avgRating - a.avgRating || b.count - a.count);
    }
    return list.sort((a, b) => b.count - a.count || b.avgRating - a.avgRating);
  }, [watchedItems, metaMap, genreSortMode]);

  const maxGenreCount = useMemo(
    () => Math.max(...genreStats.map((g) => g.count), 1),
    [genreStats]
  );

  // Top Directors & Actors
  const topDirectors = useMemo(() => {
    const counts: Record<string, { name: string; count: number; ratingSum: number; rated: number }> =
      {};
    watchedItems.forEach((item) => {
      const dir = metaMap[`${item.mediaType}_${item.tmdbId}`]?.director;
      if (!dir) return;
      if (!counts[dir]) counts[dir] = { name: dir, count: 0, ratingSum: 0, rated: 0 };
      counts[dir].count += 1;
      if (item.rating) {
        counts[dir].ratingSum += item.rating;
        counts[dir].rated += 1;
      }
    });
    return Object.values(counts)
      .sort((a, b) => b.count - a.count || b.ratingSum / (b.rated || 1) - a.ratingSum / (a.rated || 1))
      .slice(0, 6)
      .map((d) => ({
        ...d,
        avg: d.rated > 0 ? (d.ratingSum / d.rated).toFixed(1) : null,
      }));
  }, [watchedItems, metaMap]);

  const topActors = useMemo(() => {
    const counts: Record<string, { name: string; count: number }> = {};
    watchedItems.forEach((item) => {
      const actors = metaMap[`${item.mediaType}_${item.tmdbId}`]?.actors || [];
      actors.forEach((act) => {
        if (!counts[act]) counts[act] = { name: act, count: 0 };
        counts[act].count += 1;
      });
    });
    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [watchedItems, metaMap]);

  // Rating Distribution Histogram (1 to 10)
  const ratingHistogram = useMemo(() => {
    const buckets: Record<number, number> = {
      10: 0,
      9: 0,
      8: 0,
      7: 0,
      6: 0,
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };
    ratedItems.forEach((item) => {
      const r = Math.min(10, Math.max(1, Math.round(item.rating || 8)));
      buckets[r] = (buckets[r] || 0) + 1;
    });
    const maxBucket = Math.max(...Object.values(buckets), 1);
    return [10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((score) => ({
      score,
      count: buckets[score],
      percent: Math.round((buckets[score] / maxBucket) * 100),
    }));
  }, [ratedItems]);

  // Decade Breakdown
  const decadeStats = useMemo(() => {
    const map: Record<string, { label: string; count: number; ratingSum: number; rated: number }> = {
      "2020s": { label: "2020er", count: 0, ratingSum: 0, rated: 0 },
      "2010s": { label: "2010er", count: 0, ratingSum: 0, rated: 0 },
      "2000s": { label: "2000er", count: 0, ratingSum: 0, rated: 0 },
      "1990s": { label: "1990er", count: 0, ratingSum: 0, rated: 0 },
      classic: { label: "Klassiker (<1990)", count: 0, ratingSum: 0, rated: 0 },
    };

    watchedItems.forEach((item) => {
      const yearStr =
        item.releaseYear || metaMap[`${item.mediaType}_${item.tmdbId}`]?.releaseYear || "";
      const year = parseInt(yearStr, 10);
      if (!year) return;
      let key = "classic";
      if (year >= 2020) key = "2020s";
      else if (year >= 2010) key = "2010s";
      else if (year >= 2000) key = "2000s";
      else if (year >= 1990) key = "1990s";

      map[key].count += 1;
      if (item.rating) {
        map[key].ratingSum += item.rating;
        map[key].rated += 1;
      }
    });

    const maxDecade = Math.max(...Object.values(map).map((d) => d.count), 1);
    return Object.entries(map).map(([key, d]) => ({
      key,
      ...d,
      percent: Math.round((d.count / maxDecade) * 100),
      avg: d.rated > 0 ? (d.ratingSum / d.rated).toFixed(1) : null,
    }));
  }, [watchedItems, metaMap]);

  // Favorite Movies & Series (Hall of Fame)
  const favoriteItems = useMemo(() => {
    return [...watchedItems]
      .filter((item) => {
        if (favFilter !== "ALL" && item.mediaType !== favFilter) return false;
        return true;
      })
      .sort((a, b) => {
        const rA = a.rating || 0;
        const rB = b.rating || 0;
        if (rB !== rA) return rB - rA;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      })
      .slice(0, 12);
  }, [watchedItems, favFilter]);

  // Collection Progress Highlights
  const collectionProgress = useMemo(() => {
    const watchedIds = new Set(watchedItems.map((m) => m.tmdbId));
    return COLLECTIONS_DATA.map((col) => {
      const total = col.movies.length;
      const seen = col.movies.filter((m) => watchedIds.has(m.id)).length;
      const pct = total > 0 ? Math.round((seen / total) * 100) : 0;
      return {
        id: col.id,
        name: col.name,
        seen,
        total,
        pct,
        posterPath: col.posterPath,
      };
    })
      .sort((a, b) => b.pct - a.pct || b.seen - a.seen)
      .slice(0, 6);
  }, [watchedItems]);

  // Critic Persona Label
  const criticPersona = useMemo(() => {
    const topGenre = genreStats[0];
    const genreTitle = topGenre ? `${topGenre.emoji} ${topGenre.name}-Enthusiast` : "🎬 Allrounder";

    let ratingStyle = "Ausgewogener Kritiker";
    if (avgRating >= 8.7) ratingStyle = "Euphorischer Genießer";
    else if (avgRating >= 7.8) ratingStyle = "Kinoliebhaber";
    else if (avgRating > 0 && avgRating < 6.8) ratingStyle = "Strenger Kritiker";

    return `${genreTitle} • ${ratingStyle}`;
  }, [genreStats, avgRating]);

  const activeSubObjects = useMemo(() => {
    return POPULAR_SUBSCRIPTIONS.filter((s) => userSubscriptions.includes(s.key));
  }, [userSubscriptions]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* 1. Profile Hero & CineDNA Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950/30 via-slate-900 to-[#0b101e] border border-amber-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div
              className="relative group cursor-pointer flex-shrink-0"
              onClick={openAvatarPicker}
              title="Profilbild ändern"
            >
              {currentUserAvatar ? (
                <div className="w-20 h-20 rounded-3xl overflow-hidden relative border-2 border-amber-500/60 shadow-xl shadow-amber-500/20">
                  <Image
                    src={currentUserAvatar}
                    alt={myName}
                    fill
                    sizes="80px"
                    className="object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-amber-400 to-rose-500 flex items-center justify-center text-black font-black text-3xl shadow-xl shadow-amber-500/20 group-hover:scale-105 transition duration-300">
                  {myName.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 rounded-3xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white backdrop-blur-xs">
                <Camera className="w-6 h-6 text-amber-400" />
              </div>
              <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black shadow-lg transition">
                <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Deine Kino-DNA & Statistiken</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {myName}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-xs sm:text-sm text-slate-300 font-medium">{criticPersona}</p>
                <button
                  type="button"
                  onClick={openAvatarPicker}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 transition"
                >
                  <Camera className="w-3 h-3" />
                  <span>Profilbild anpassen</span>
                </button>
              </div>
              {myEmail && <p className="text-xs text-slate-500">{myEmail}</p>}
            </div>
          </div>

          {/* Active Subscriptions Pill Box */}
          <div className="w-full lg:w-auto p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-2.5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Deine Streaming-Abos ({activeSubObjects.length})
              </span>
              <button
                type="button"
                onClick={openSubscriptions}
                className="flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 transition"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Anpassen</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 max-w-md">
              {activeSubObjects.length > 0 ? (
                activeSubObjects.map((sub) => (
                  <span
                    key={sub.key}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold text-white border border-slate-700/80 bg-slate-900 flex items-center gap-1.5"
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: sub.color }}
                    />
                    {sub.label}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500">Noch keine Abos ausgewählt</span>
              )}
            </div>
          </div>
        </div>

        {/* 4 Key Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-8">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Gesehene Titel</span>
              <Film className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">{watchedItems.length}</p>
            <p className="text-[11px] text-slate-400">
              <span className="text-amber-400 font-semibold">{watchedMoviesCount}</span> Filme •{" "}
              <span className="text-cyan-400 font-semibold">{watchedTvCount}</span> Serien
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Deine Ø Bewertung</span>
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-amber-400">
              {avgRating > 0 ? `${avgRating} / 10` : "–"}
            </p>
            <p className="text-[11px] text-slate-400">
              {tmdbDiff !== null ? (
                <span>
                  {tmdbDiff >= 0 ? `+${tmdbDiff}` : tmdbDiff} ★ vs. TMDB-Weltschnitt
                </span>
              ) : (
                <span>Aus {ratedItems.length} Bewertungen</span>
              )}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Kino-Lebenszeit</span>
              <Clock className="w-4 h-4 text-sky-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">{totalHours} Std.</p>
            <p className="text-[11px] text-slate-400">
              Entspricht ca. <span className="text-sky-400 font-semibold">{totalDays} Tagen</span> Non-Stop
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Watchlist & Feed</span>
              <Bookmark className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">{watchlistItems.length}</p>
            <p className="text-[11px] text-slate-400">
              Auf Watchlist •{" "}
              <span className="text-rose-400 font-semibold">{myRecommendations.length}</span>{" "}
              Empfehlungen
            </p>
          </div>
        </div>
      </div>


      {/* 4 Dedicated Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto no-scrollbar">
        {/* Tab 1: Statistiken */}
        <button
          type="button"
          onClick={() => setActiveTab("stats")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
            activeTab === "stats"
              ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
              : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>1. Statistiken</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === "stats" ? "bg-black/20 text-black" : "bg-slate-800 text-slate-400"
            }`}
          >
            Kino-DNA
          </span>
        </button>

        {/* Tab 2: Hall of Fame */}
        <button
          type="button"
          onClick={() => setActiveTab("hall-of-fame")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
            activeTab === "hall-of-fame"
              ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
              : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>2. Hall of Fame</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === "hall-of-fame" ? "bg-black/20 text-black" : "bg-slate-800 text-slate-400"
            }`}
          >
            {favoriteItems.length}
          </span>
        </button>

        {/* Tab 3: KI-Empfehlungen (Recommendation) */}
        <button
          type="button"
          onClick={() => setActiveTab("ai")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
            activeTab === "ai"
              ? "bg-gradient-to-r from-purple-500 via-fuchsia-500 to-amber-500 text-black shadow-lg shadow-purple-500/20 font-black"
              : "bg-slate-900/80 text-purple-300 hover:text-white hover:bg-slate-800 border border-purple-500/30"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>3. KI-Empfehlungen</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === "ai"
                ? "bg-black/20 text-black"
                : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
            }`}
          >
            Gemini Flash
          </span>
        </button>

        {/* Tab 4: Standard-Matches */}
        <button
          type="button"
          onClick={() => setActiveTab("matches")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
            activeTab === "matches"
              ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
              : "bg-slate-900/80 text-emerald-400 hover:text-white hover:bg-slate-800 border border-emerald-500/30"
          }`}
        >
          <Wand2 className="w-4 h-4" />
          <span>4. Standard-Matches</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === "matches"
                ? "bg-black/20 text-black"
                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
            }`}
          >
            Abo-Matches
          </span>
        </button>
      </div>

      {/* TAB 1: 📊 STATISTIKEN (Kino-DNA, Genres, Histogramm, Universen) */}
      {activeTab === "stats" && (
        <div className="space-y-10 animate-in fade-in duration-300">
          {watchedItems.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-900/50 border border-slate-800 text-center space-y-4">
              <Trophy className="w-12 h-12 text-amber-400 mx-auto opacity-80" />
              <h2 className="text-xl font-bold text-white">
                Deine Kino-Statistiken warten auf deine ersten Bewertungen!
              </h2>
              <p className="text-sm text-slate-400 max-w-lg mx-auto">
                Markiere ein paar Filme oder Serien mit „Gesehen?“ und vergib eine Bewertung von 1–10.
                Sofort berechnet CineCircle deine Lieblings-Genres, Top-Regisseure und deine Hall of Fame.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={openSearch}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition"
                >
                  Filme & Serien suchen
                </button>
                <Link
                  href="/movies"
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
                >
                  Top 250 Filme durchstöbern
                </Link>
              </div>
            </div>
          ) : (
            <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 cols: Lieblings-Genres */}
            <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-amber-400" />
                    <span>Deine Lieblings-Kategorien & Genres</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Welche Genres du am häufigsten schaust & am höchsten bewertest
                  </p>
                </div>

                <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 self-start">
                  <button
                    onClick={() => setGenreSortMode("count")}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                      genreSortMode === "count"
                        ? "bg-amber-500 text-black"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Meistgesehen
                  </button>
                  <button
                    onClick={() => setGenreSortMode("rating")}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                      genreSortMode === "rating"
                        ? "bg-amber-500 text-black"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Beste Ø Note
                  </button>
                </div>
              </div>

              {loadingMeta && genreStats.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
                  Analysiere Genres deiner gesehenen Filme & Serien...
                </div>
              ) : genreStats.length > 0 ? (
                <div className="space-y-3">
                  {genreStats.slice(0, 10).map((g, idx) => {
                    const widthPct =
                      genreSortMode === "count"
                        ? Math.round((g.count / maxGenreCount) * 100)
                        : Math.round((g.avgRating / 10) * 100);

                    return (
                      <div key={g.name} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 font-bold text-white">
                            <span className="text-slate-500 font-mono w-4">{idx + 1}.</span>
                            <span className="text-base">{g.emoji}</span>
                            <span>{g.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-400">
                              <strong className="text-white">{g.count}</strong>{" "}
                              {g.count === 1 ? "Titel" : "Titel"}
                            </span>
                            {g.avgRating > 0 && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold">
                                Ø {g.avgRating} ★
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden p-0.5 border border-slate-800/80">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-500"
                            style={{ width: `${Math.max(widthPct, 8)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-500">Noch keine Genre-Daten vorhanden.</p>
              )}
            </div>

            {/* Right 5 cols: Bewertungs-Histogramm (1-10) & Jahrzehnte */}
            <div className="lg:col-span-5 space-y-6">
              {/* Rating Histogram */}
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Star className="w-5 h-5 text-emerald-400 fill-emerald-400" />
                    <span>Bewertungs-Verteilung (1–10 ★)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Wie oft du welche Punktezahl vergeben hast
                  </p>
                </div>

                <div className="space-y-2">
                  {ratingHistogram.map((row) => (
                    <div key={row.score} className="flex items-center gap-3 text-xs">
                      <span className="w-10 font-bold text-slate-300 flex items-center gap-1">
                        <span>{row.score}</span>
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      </span>
                      <div className="flex-1 h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800/70">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            row.score >= 9
                              ? "bg-emerald-400"
                              : row.score >= 7
                              ? "bg-amber-400"
                              : "bg-slate-500"
                          }`}
                          style={{ width: `${row.count > 0 ? Math.max(row.percent, 6) : 0}%` }}
                        />
                      </div>
                      <span className="w-8 text-right font-mono text-slate-400">{row.count}x</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decade Breakdown */}
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-sky-400" />
                    <span>Kino-Zeitreise nach Jahrzehnten</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Aus welchen Ären deine geschauten Titel stammen
                  </p>
                </div>

                <div className="space-y-2.5">
                  {decadeStats.map((d) => (
                    <div key={d.key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200">{d.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">{d.count} Titel</span>
                          {d.avg && (
                            <span className="text-sky-400 font-bold text-[11px]">Ø {d.avg}★</span>
                          )}
                        </div>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-sky-500 transition-all duration-500"
                          style={{ width: `${d.count > 0 ? Math.max(d.percent, 6) : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 4. Top Regisseure, Schauspieler & Universen-Fortschritt */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Top Directors */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Clapperboard className="w-5 h-5 text-purple-400" />
                  <span>Meistgesehene Regisseure</span>
                </h3>
                <p className="text-xs text-slate-400">Regisseure & Showrunner in deiner Liste</p>
              </div>
              {topDirectors.length > 0 ? (
                <div className="space-y-2.5">
                  {topDirectors.map((dir, i) => (
                    <div
                      key={dir.name}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-md bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center text-[11px]">
                          {i + 1}
                        </span>
                        <span className="font-bold text-white">{dir.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">{dir.count}x</span>
                        {dir.avg && (
                          <span className="text-amber-400 font-bold">Ø {dir.avg}★</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">Wird geladen...</p>
              )}
            </div>

            {/* Top Stars / Cast */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-rose-400" />
                  <span>Häufigste Stars & Cast</span>
                </h3>
                <p className="text-xs text-slate-400">Schauspieler in deinen gesehenen Titeln</p>
              </div>
              {topActors.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {topActors.map((actor) => (
                    <span
                      key={actor.name}
                      className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 font-medium flex items-center gap-2"
                    >
                      <span>{actor.name}</span>
                      <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold text-[10px]">
                        {actor.count}x
                      </span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">Wird geladen...</p>
              )}
            </div>

            {/* Franchise & Collection Progress */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-amber-400" />
                    <span>Universen-Fortschritt</span>
                  </h3>
                  <p className="text-xs text-slate-400">Deine Top-Reihen im Überblick</p>
                </div>
                <Link
                  href="/collections"
                  className="text-xs text-amber-400 hover:underline font-semibold flex items-center"
                >
                  Alle <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3">
                {collectionProgress.slice(0, 4).map((col) => (
                  <Link
                    key={col.id}
                    href={`/collections/${col.id}`}
                    className="block p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-amber-500/40 transition space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white truncate max-w-[180px]">{col.name}</span>
                      <span className="text-amber-400 font-bold">
                        {col.seen}/{col.total} ({col.pct}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-400"
                        style={{ width: `${col.pct}%` }}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

            </>
          )}
        </div>
      )}

      {/* TAB 2: 🏆 HALL OF FAME (Beste Filme & Serien) */}
      {activeTab === "hall-of-fame" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {favoriteItems.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-900/50 border border-slate-800 text-center space-y-4">
              <Trophy className="w-12 h-12 text-amber-400 mx-auto opacity-80" />
              <h2 className="text-xl font-bold text-white">
                Noch keine Meisterwerke in deiner Hall of Fame
              </h2>
              <p className="text-sm text-slate-400 max-w-lg mx-auto">
                Bewerte deine Lieblingsfilme und -serien mit 1 bis 10 Sternen, um deine persönliche Bestenliste aufzubauen.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={openSearch}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition"
                >
                  Filme & Serien suchen
                </button>
              </div>
            </div>
          ) : (
          <section className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
                  <Trophy className="w-6 h-6 text-amber-400" />
                  <span>Deine Hall of Fame (Am besten bewertet)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Deine persönlichen Meisterwerke sortiert nach deiner Bewertung (10★ bis 1★)
                </p>
              </div>

              {/* Filter All / Movies / TV */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start">
                <button
                  onClick={() => setFavFilter("ALL")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    favFilter === "ALL"
                      ? "bg-amber-500 text-black"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Alle ({watchedItems.length})
                </button>
                <button
                  onClick={() => setFavFilter("movie")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    favFilter === "movie"
                      ? "bg-amber-500 text-black"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  🎬 Filme ({watchedMoviesCount})
                </button>
                <button
                  onClick={() => setFavFilter("tv")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    favFilter === "tv"
                      ? "bg-cyan-400 text-black"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  📺 Serien ({watchedTvCount})
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {favoriteItems.map((item, idx) => {
                const meta = metaMap[`${item.mediaType}_${item.tmdbId}`];
                const topGenres = (meta?.genres || []).slice(0, 2);

                return (
                  <div
                    key={item.id}
                    onClick={() =>
                      openMediaModal({
                        id: item.tmdbId,
                        mediaType: item.mediaType,
                        title: item.title,
                        posterPath: item.posterPath,
                      })
                    }
                    className="group cursor-pointer rounded-2xl bg-slate-900/70 border border-slate-800/90 hover:border-amber-500/50 overflow-hidden flex flex-col transition duration-300 hover:-translate-y-1 shadow-lg"
                  >
                    <div className="relative aspect-[2/3] w-full bg-slate-950">
                      {item.posterPath ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w500${item.posterPath}`}
                          alt={item.title}
                          fill
                          sizes="200px"
                          className="object-cover group-hover:scale-105 transition duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <Film className="w-8 h-8" />
                        </div>
                      )}

                      {/* Rank Badge */}
                      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md border border-amber-500/40 text-amber-400 font-black text-xs">
                        #{idx + 1}
                      </div>

                      {/* Personal Rating Badge (Click to edit rating) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openRatingModal({
                            tmdbId: item.tmdbId,
                            mediaType: item.mediaType,
                            title: item.title,
                            posterPath: item.posterPath,
                            releaseYear: item.releaseYear,
                            currentRating: item.rating,
                            isWatched: true,
                          });
                        }}
                        title="Deine Bewertung ändern"
                        className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500 text-black font-black text-xs shadow-lg hover:bg-emerald-400 transition"
                      >
                        <Star className="w-3 h-3 fill-black" />
                        <span>{item.rating || "✓"}/10</span>
                      </button>
                    </div>

                    <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <p className="text-xs font-bold text-white line-clamp-1 group-hover:text-amber-400 transition">
                          {item.title}
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-0.5">
                          <span>{item.releaseYear || meta?.releaseYear || ""}</span>
                          {meta?.tmdbVoteAverage ? (
                            <span className="text-slate-500">TMDB {meta.tmdbVoteAverage}★</span>
                          ) : null}
                        </div>
                      </div>

                      {topGenres.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {topGenres.map((g) => (
                            <span
                              key={g.id}
                              className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 truncate max-w-full"
                            >
                              {getEmojiForGenreName(g.name, g.id)} {g.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          )}
        </div>
      )}

      {/* TAB 3: 🤖 KI-EMPFEHLUNGEN (Recommendation mit Oben KI-Fenster & Vorschlägen) */}
      {activeTab === "ai" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <AiMovieAdvisor initialPrompt={urlPrompt || undefined} />
        </div>
      )}

      {/* TAB 4: ⚡ STANDARD-MATCHES (Stufe 1 Hybrid-Algorithmus basierend auf Abos & Geschmack) */}
      {activeTab === "matches" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <AlgorithmRecommendations />
        </div>
      )}

    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-slate-400 animate-pulse">
          Lade Profil...
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
