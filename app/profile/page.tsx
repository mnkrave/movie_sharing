"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useMedia } from "@/components/MediaContext";
import { clearOfflineWatchlist } from "@/lib/offline-watchlist";
import { POPULAR_SUBSCRIPTIONS } from "@/lib/tmdb";
import { COLLECTIONS_DATA } from "@/lib/collections";
import { WatchtimeDetailsModal } from "@/components/WatchtimeDetailsModal";
import { EditRecommendationModal } from "@/components/EditRecommendationModal";
import { MyRecommendationsModal } from "@/components/MyRecommendationsModal";
import { StreamingHistoryImporter } from "@/components/StreamingHistoryImporter";
import { ThemeSelector } from "@/components/ThemeToggle";
import { SubscriptionToggleList, SwitchRow } from "@/components/SubscriptionToggleList";
import { useBatchMediaMeta } from "@/lib/useBatchMediaMeta";
import { useWatchlistAlerts } from "@/lib/useWatchlistAlerts";
import type { AppRecommendation } from "@/lib/store";
import { formatWatchedSeasons, getItemRuntimeMinutes } from "@/lib/seasons";
import {
  User,
  Star,
  Film,
  Tv,
  Clock,
  Bookmark,
  BarChart3,
  Layers,
  Clapperboard,
  Calendar,
  Settings2,
  ChevronRight,
  Trophy,
  Filter,
  Camera,
  Search,
  X,
  ArrowUpDown,
  ArrowRight,
  Shield,
  LogOut,
  Bell,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type ProfileTab = "overview" | "hall-of-fame" | "stats" | "streaming" | "settings";

type HofRatingFilter =
  | "ALL"
  | "10"
  | "9"
  | "8"
  | "7"
  | "6"
  | "5"
  | "4"
  | "3"
  | "2"
  | "1"
  | "UNRATED"
  | "9_PLUS"
  | "8_PLUS"
  | "7_PLUS"
  | "LOW";

const HOF_EXACT_RATINGS: Array<{ score: number; value: HofRatingFilter; label: string }> = [
  { score: 10, value: "10", label: "Meisterwerk" },
  { score: 9, value: "9", label: "Herausragend" },
  { score: 8, value: "8", label: "Sehr gut" },
  { score: 7, value: "7", label: "Gut & sehenswert" },
  { score: 6, value: "6", label: "Ganz solide" },
  { score: 5, value: "5", label: "Mittelmäßig" },
  { score: 4, value: "4", label: "Unterdurchschnittlich" },
  { score: 3, value: "3", label: "Schwach" },
  { score: 2, value: "2", label: "Sehr schwach" },
  { score: 1, value: "1", label: "Flop" },
];

const OVERVIEW_SUB_KEYS = ["netflix", "prime", "disney", "apple", "wow"];

function ProfileContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    communityData,
    userSubscriptions,
    setUserSubscriptions,
    openSubscriptions,
    openMediaModal,
    openRatingModal,
    openSearch,
    openAvatarPicker,
    currentUserAvatar,
    deleteRecommendation,
    confirmDialog,
    showToast,
  } = useMedia();

  const [favFilter, setFavFilter] = useState<"ALL" | "movie" | "tv">("ALL");
  const [hofSearch, setHofSearch] = useState("");
  const [hofRatingFilter, setHofRatingFilter] = useState<HofRatingFilter>("ALL");
  const [hofGenreFilter, setHofGenreFilter] = useState<string>("ALL");
  const [hofDecadeFilter, setHofDecadeFilter] = useState<
    "ALL" | "2020s" | "2010s" | "2000s" | "1990s" | "classic"
  >("ALL");
  const [hofSortBy, setHofSortBy] = useState<
    "rating_desc" | "rating_asc" | "date_desc" | "year_desc" | "year_asc" | "title_asc"
  >("rating_desc");
  const [showWatchtimeModal, setShowWatchtimeModal] = useState(false);
  const [showRecommendationsModal, setShowRecommendationsModal] = useState(false);
  const [editingRecommendation, setEditingRecommendation] = useState<AppRecommendation | null>(null);
  const [genreSortMode, setGenreSortMode] = useState<"count" | "rating">("count");

  // Notification toggle state (Settings tab)
  const { watchlistAlerts, savingAlerts, toggleWatchlistAlerts } = useWatchlistAlerts({
    enabled: Boolean(session?.user),
  });

  const urlTab = searchParams.get("tab");
  const urlPrompt = searchParams.get("prompt");

  // Redirect legacy /profile?tab=ai or matches to /recommendations
  useEffect(() => {
    if (urlTab === "ai" || urlPrompt) {
      const params = new URLSearchParams();
      params.set("tab", "ai");
      if (urlPrompt) params.set("prompt", urlPrompt);
      router.replace(`/recommendations?${params.toString()}`);
    } else if (urlTab === "matches") {
      router.replace("/recommendations?tab=algorithm");
    } else if (urlTab === "recommendations") {
      setShowRecommendationsModal(true);
    }
  }, [urlTab, urlPrompt, router]);

  const [activeTab, setActiveTab] = useState<ProfileTab>(() => {
    if (
      urlTab === "overview" ||
      urlTab === "hall-of-fame" ||
      urlTab === "stats" ||
      urlTab === "streaming" ||
      urlTab === "settings"
    ) {
      return urlTab;
    }
    return "overview";
  });

  useEffect(() => {
    if (
      urlTab === "overview" ||
      urlTab === "hall-of-fame" ||
      urlTab === "stats" ||
      urlTab === "streaming" ||
      urlTab === "settings"
    ) {
      setActiveTab(urlTab);
    }
  }, [urlTab]);

  const myUserId = (session?.user as any)?.id || "user_lukas";
  const myName = session?.user?.name || "Kino-Fan";
  const myEmail = session?.user?.email || "";
  const isAdmin =
    session?.user?.email?.toLowerCase() === "lukasreinle0@gmail.com" ||
    (session?.user as any)?.role === "ADMIN";

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

  // Fetch rich TMDB metadata for watched items
  const { metaMap, loadingMeta } = useBatchMediaMeta(watchedItems);

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

  const totalMinutes = useMemo(() => {
    return watchedItems.reduce((acc, item) => {
      const meta = metaMap[`${item.mediaType}_${item.tmdbId}`];
      return acc + getItemRuntimeMinutes(item, meta);
    }, 0);
  }, [watchedItems, metaMap]);

  const totalHours = Math.round(totalMinutes / 60);
  const totalDays = (totalHours / 24).toFixed(1);

  const recentRatings = useMemo(() => {
    return [...watchedItems]
      .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
      .slice(0, 5);
  }, [watchedItems]);

  const genreStats = useMemo(() => {
    const map: Record<
      string,
      { name: string; count: number; ratingSum: number; ratedCount: number }
    > = {};

    watchedItems.forEach((item) => {
      const meta = metaMap[`${item.mediaType}_${item.tmdbId}`];
      (meta?.genres || []).forEach((g) => {
        if (!map[g.name]) {
          map[g.name] = {
            name: g.name,
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

  const ratingHistogram = useMemo(() => {
    const buckets: Record<number, number> = {
      10: 0, 9: 0, 8: 0, 7: 0, 6: 0, 5: 0, 4: 0, 3: 0, 2: 0, 1: 0,
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

  const topDecadeLabel = useMemo(() => {
    const sorted = [...decadeStats].sort((a, b) => b.count - a.count);
    return sorted[0]?.count > 0 ? sorted[0].label : "–";
  }, [decadeStats]);

  const availableHofGenres = useMemo(() => {
    const counts: Record<string, { name: string; count: number }> = {};
    watchedItems.forEach((item) => {
      if (favFilter !== "ALL" && item.mediaType !== favFilter) return;
      const meta = metaMap[`${item.mediaType}_${item.tmdbId}`];
      (meta?.genres || []).forEach((g) => {
        if (!counts[g.name]) {
          counts[g.name] = {
            name: g.name,
            count: 0,
          };
        }
        counts[g.name].count += 1;
      });
    });
    return Object.values(counts).sort((a, b) => b.count - a.count);
  }, [watchedItems, metaMap, favFilter]);

  const favoriteItems = useMemo(() => {
    const query = hofSearch.trim().toLowerCase();

    return [...watchedItems]
      .filter((item) => {
        const meta = metaMap[`${item.mediaType}_${item.tmdbId}`];
        if (favFilter !== "ALL" && item.mediaType !== favFilter) return false;

        const r = item.rating ? Math.min(10, Math.max(1, Math.round(item.rating))) : 0;
        if (hofRatingFilter === "UNRATED" && r !== 0) return false;
        if (hofRatingFilter === "9_PLUS" && r < 9) return false;
        if (hofRatingFilter === "8_PLUS" && r < 8) return false;
        if (hofRatingFilter === "7_PLUS" && r < 7) return false;
        if (hofRatingFilter === "LOW" && (r === 0 || r >= 7)) return false;
        const exactScore = Number(hofRatingFilter);
        if (Number.isInteger(exactScore) && exactScore >= 1 && exactScore <= 10 && r !== exactScore) {
          return false;
        }

        if (hofGenreFilter !== "ALL") {
          const itemGenres = (meta?.genres || []).map((g) => g.name);
          if (!itemGenres.includes(hofGenreFilter)) return false;
        }

        if (hofDecadeFilter !== "ALL") {
          const yearStr = item.releaseYear || meta?.releaseYear || "";
          const year = parseInt(yearStr, 10);
          if (!year) return false;
          if (hofDecadeFilter === "2020s" && year < 2020) return false;
          if (hofDecadeFilter === "2010s" && (year < 2010 || year >= 2020)) return false;
          if (hofDecadeFilter === "2000s" && (year < 2000 || year >= 2010)) return false;
          if (hofDecadeFilter === "1990s" && (year < 1990 || year >= 2000)) return false;
          if (hofDecadeFilter === "classic" && year >= 1990) return false;
        }

        if (query) {
          const titleMatch = item.title.toLowerCase().includes(query);
          const dirMatch = (meta?.director || "").toLowerCase().includes(query);
          const actorMatch = (meta?.actors || []).some((a) => a.toLowerCase().includes(query));
          if (!titleMatch && !dirMatch && !actorMatch) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const rA = a.rating || 0;
        const rB = b.rating || 0;
        const metaA = metaMap[`${a.mediaType}_${a.tmdbId}`];
        const metaB = metaMap[`${b.mediaType}_${b.tmdbId}`];
        const yA = parseInt(a.releaseYear || metaA?.releaseYear || "0", 10) || 0;
        const yB = parseInt(b.releaseYear || metaB?.releaseYear || "0", 10) || 0;
        const dA = new Date(a.updatedAt || 0).getTime();
        const dB = new Date(b.updatedAt || 0).getTime();

        if (hofSortBy === "rating_asc") return rA !== rB ? rA - rB : dB - dA;
        if (hofSortBy === "date_desc") return dB - dA;
        if (hofSortBy === "year_desc") return yB !== yA ? yB - yA : rB - rA;
        if (hofSortBy === "year_asc") return yA !== yB ? yA - yB : rB - rA;
        if (hofSortBy === "title_asc") return a.title.localeCompare(b.title);
        return rB !== rA ? rB - rA : dB - dA;
      });
  }, [
    watchedItems,
    metaMap,
    favFilter,
    hofSearch,
    hofRatingFilter,
    hofGenreFilter,
    hofDecadeFilter,
    hofSortBy,
  ]);

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
      };
    })
      .sort((a, b) => b.pct - a.pct || b.seen - a.seen)
      .slice(0, 6);
  }, [watchedItems]);

  const criticPersona = useMemo(() => {
    const topGenre = genreStats[0];
    const genreTitle = topGenre ? `${topGenre.name}-Fan` : "Film-Entdecker";

    let ratingStyle = "Ausgewogener Kritiker";
    if (avgRating >= 8.7) ratingStyle = "Euphorischer Genießer";
    else if (avgRating >= 7.8) ratingStyle = "Kinoliebhaber";
    else if (avgRating > 0 && avgRating < 6.8) ratingStyle = "Strenger Kritiker";

    return `${genreTitle} · ${ratingStyle}`;
  }, [genreStats, avgRating]);

  const toggleSubscription = (key: string) => {
    if (userSubscriptions.includes(key)) {
      setUserSubscriptions(userSubscriptions.filter((s) => s !== key));
    } else {
      setUserSubscriptions([...userSubscriptions, key]);
    }
  };

  const handleDeleteRec = async (rec: AppRecommendation) => {
    const confirmed = await confirmDialog({
      title: "Empfehlung löschen?",
      message: `Möchtest du deine Empfehlung für „${rec.title}“ wirklich löschen?`,
      confirmLabel: "Löschen",
      dangerous: true,
    });
    if (confirmed) {
      await deleteRecommendation(rec.id);
      showToast("Empfehlung gelöscht", { type: "info" });
    }
  };

  const clubPct = Math.min(100, Math.round((watchedItems.length / 250) * 100));
  const clubRemaining = Math.max(0, 250 - watchedItems.length);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* 1. Open Editorial Profile Header (Flowstep Profil) */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={openAvatarPicker}
            title="Profilbild ändern"
            aria-label="Profilbild ändern"
            className="relative group cursor-pointer flex-shrink-0 rounded-full"
          >
            {currentUserAvatar ? (
              <div className="w-20 h-20 rounded-full overflow-hidden relative border-2 border-primary/50 shadow-sm">
                <Image
                  src={currentUserAvatar}
                  alt={myName}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-black text-2xl shadow-sm">
                {myName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 p-1.5 rounded-full bg-card border border-border text-foreground shadow-sm">
              <Camera className="w-3.5 h-3.5" aria-hidden="true" />
            </span>
          </button>

          <div className="min-w-0 space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight truncate">
              {myName}
            </h1>
            {myEmail && <p className="text-xs sm:text-sm text-muted-foreground truncate">{myEmail}</p>}
            <p className="text-xs text-muted-foreground font-medium">{criticPersona}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openAvatarPicker}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-card hover:bg-muted border border-border text-xs font-semibold text-foreground transition cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 text-primary-text" aria-hidden="true" />
            <span>Profilbild</span>
          </button>
          <button
            type="button"
            onClick={openSubscriptions}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-card hover:bg-muted border border-border text-xs font-semibold text-foreground transition cursor-pointer"
          >
            <Tv className="w-3.5 h-3.5 text-primary-text" aria-hidden="true" />
            <span>Abos ({userSubscriptions.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-card hover:bg-muted border border-border text-xs font-semibold text-foreground transition cursor-pointer"
          >
            <Settings2 className="w-3.5 h-3.5 text-primary-text" aria-hidden="true" />
            <span>Einstellungen</span>
          </button>
          {isAdmin && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-card hover:bg-muted border border-border text-xs font-semibold text-primary-text transition"
            >
              <Shield className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Admin</span>
            </Link>
          )}
        </div>
      </div>

      {/* 2. 4 Clickable Stat Tiles (Preserving Exact Clickable Functionality!) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <button
          type="button"
          onClick={() => setActiveTab("hall-of-fame")}
          className="group text-left p-4 rounded-2xl bg-card border border-border hover:border-primary/50 active:scale-[0.99] transition space-y-1 cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span className="font-medium group-hover:text-foreground transition">Gesehene Titel</span>
            <Film className="w-4 h-4 text-emerald-500" aria-hidden="true" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-foreground">{watchedItems.length}</p>
          <p className="text-[11px] text-muted-foreground">
            {watchedMoviesCount} Filme · {watchedTvCount} Serien
          </p>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("stats")}
          className="group text-left p-4 rounded-2xl bg-card border border-border hover:border-primary/50 active:scale-[0.99] transition space-y-1 cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span className="font-medium group-hover:text-foreground transition">Ø Bewertung</span>
            <Star className="w-4 h-4 text-primary fill-primary" aria-hidden="true" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-primary-text">
            {avgRating > 0 ? `${avgRating} / 10` : "–"}
          </p>
          <p className="text-[11px] text-muted-foreground truncate">
            {tmdbDiff !== null
              ? `${tmdbDiff >= 0 ? `+${tmdbDiff}` : tmdbDiff} ★ vs. TMDB`
              : `Aus ${ratedItems.length} Bewertungen`}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setShowWatchtimeModal(true)}
          className="group text-left p-4 rounded-2xl bg-card border border-border hover:border-primary/50 active:scale-[0.99] transition space-y-1 cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span className="font-medium group-hover:text-foreground transition">Kino-Lebenszeit</span>
            <Clock className="w-4 h-4 text-sky-500" aria-hidden="true" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-foreground">{totalHours} Std.</p>
          <p className="text-[11px] text-muted-foreground truncate">
            Ca. {totalDays} Tage Non-Stop
          </p>
        </button>

        <button
          type="button"
          onClick={() => setShowRecommendationsModal(true)}
          className="group text-left p-4 rounded-2xl bg-card border border-border hover:border-primary/50 active:scale-[0.99] transition space-y-1 cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span className="font-medium group-hover:text-foreground transition">Watchlist & Feed</span>
            <Bookmark className="w-4 h-4 text-rose-500" aria-hidden="true" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-foreground">{watchlistItems.length}</p>
          <p className="text-[11px] text-muted-foreground truncate">
            Watchlist · {myRecommendations.length} Empfehlungen
          </p>
        </button>
      </div>

      {/* 3. Segmented Tabs Navigation (Flowstep) */}
      <div
        role="tablist"
        aria-label="Profil-Bereiche"
        className="flex items-center gap-1 p-1 rounded-xl bg-muted border border-border overflow-x-auto no-scrollbar"
      >
        {[
          { id: "overview" as const, label: "Übersicht" },
          { id: "hall-of-fame" as const, label: `Gesehen (${watchedItems.length})` },
          { id: "stats" as const, label: "Statistiken" },
          { id: "streaming" as const, label: "Streaming-Abos" },
          { id: "settings" as const, label: "Einstellungen" },
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
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

      {/* TAB 1: ÜBERSICHT (Flowstep 2-Column Layout with Live Data) */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-200">
          {/* Left Column: Dein Geschmack + Letzte Bewertungen */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-card border border-border space-y-4 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-bold text-foreground">Dein Geschmack</h2>
                <button
                  type="button"
                  onClick={() => setActiveTab("stats")}
                  className="text-xs font-semibold text-primary-text hover:underline cursor-pointer"
                >
                  Alle Statistiken →
                </button>
              </div>
              {genreStats.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {genreStats.slice(0, 6).map((g) => (
                    <span
                      key={g.name}
                      className="px-2.5 py-1 rounded-full bg-muted border border-border text-xs font-semibold text-foreground"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Bewerte ein paar Filme oder Serien, um dein Geschmacksprofil zu sehen.
                </p>
              )}
              <p className="text-xs sm:text-sm text-muted-foreground">
                Dein häufigstes Jahrzehnt:{" "}
                <span className="font-bold text-foreground">{topDecadeLabel}</span>
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border space-y-4 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-bold text-foreground">Letzte Bewertungen</h2>
                <button
                  type="button"
                  onClick={() => setActiveTab("hall-of-fame")}
                  className="text-xs font-semibold text-primary-text hover:underline cursor-pointer"
                >
                  Alle gesehenen Titel →
                </button>
              </div>

              {recentRatings.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">
                  Noch keine Bewertungen vorhanden.
                </p>
              ) : (
                <div className="space-y-3">
                  {recentRatings.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        openMediaModal({
                          id: item.tmdbId,
                          mediaType: item.mediaType,
                          title: item.title,
                          posterPath: item.posterPath,
                        })
                      }
                      className="w-full flex items-center gap-3 text-left p-2 -mx-2 rounded-xl hover:bg-muted/70 transition cursor-pointer"
                    >
                      <div className="relative w-11 h-16 rounded-md overflow-hidden bg-muted border border-border flex-shrink-0">
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
                            <Film className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.releaseYear || (item.mediaType === "tv" ? "Serie" : "Film")}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-sm font-bold text-foreground flex-shrink-0">
                        <Star className="w-4 h-4 fill-primary text-primary" aria-hidden="true" />
                        <span>{item.rating ?? "✓"}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: 250-Club + Streaming-Abos + Meine Watchlist */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-card border border-border space-y-4 shadow-xs">
              <h2 className="text-base font-bold text-foreground">250-Club</h2>
              <div className="flex items-center justify-between text-sm">
                <p className="font-semibold text-foreground">
                  {watchedItems.length} von 250 Titeln bewertet
                </p>
                <span className="text-muted-foreground font-mono text-xs">{clubPct}%</span>
              </div>
              <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden border border-border">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(2, clubPct)}%` }}
                />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {clubRemaining > 0
                  ? `Noch ${clubRemaining} Titel bis zum 250-Club-Meilenstein`
                  : "Meilenstein von 250 Titeln erreicht!"}
              </p>
              <Link
                href="/quick-rate"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold transition shadow-xs"
              >
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Weiter bewerten</span>
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border space-y-4 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-bold text-foreground">Streaming-Abos</h2>
                <button
                  type="button"
                  onClick={openSubscriptions}
                  className="text-xs font-semibold text-primary-text hover:underline cursor-pointer"
                >
                  Alle verwalten
                </button>
              </div>
              <SubscriptionToggleList
                subscriptions={POPULAR_SUBSCRIPTIONS.filter((s) =>
                  OVERVIEW_SUB_KEYS.includes(s.key)
                )}
                selectedKeys={userSubscriptions}
                onToggle={toggleSubscription}
              />
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border flex items-center justify-between gap-4 shadow-xs">
              <div>
                <h2 className="text-sm font-bold text-foreground">Meine Watchlist</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {watchlistItems.length} Titel vorgemerkt
                </p>
              </div>
              <Link
                href="/my-list"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-background hover:bg-muted border border-border text-xs font-semibold text-foreground transition"
              >
                <span>Liste öffnen</span>
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GESEHEN (Hall of Fame + CSV Importer) */}
      {activeTab === "hall-of-fame" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {watchedItems.length === 0 ? (
            <div className="p-12 rounded-2xl bg-card border border-border text-center space-y-4">
              <Trophy className="w-10 h-10 text-primary-text mx-auto" />
              <h2 className="text-lg font-bold text-foreground">
                Noch keine Titel in deiner Gesehen-Liste
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                Bewerte deine Lieblingsfilme und -serien mit 1 bis 10 Sternen, um deine Bestenliste aufzubauen.
              </p>
              <button
                type="button"
                onClick={openSearch}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs transition cursor-pointer"
              >
                Filme & Serien suchen
              </button>
            </div>
          ) : (
            <section className="space-y-5">
              <div className="legacy-dark-surface rounded-3xl overflow-hidden">
                <StreamingHistoryImporter />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="text-xl font-black text-foreground flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-primary-text" />
                      <span>Gesehene Titel & Hall of Fame</span>
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-soft text-primary-text">
                      {favoriteItems.length} von {watchedItems.length}
                    </span>
                    <Link
                      href="/quick-rate"
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-primary text-primary-foreground"
                    >
                      <Star className="w-3 h-3 fill-current" />
                      <span>Schnell-Bewerten</span>
                    </Link>
                  </div>
                </div>

                <div className="flex items-center gap-1 p-1 rounded-xl bg-muted border border-border self-start">
                  {(
                    [
                      { key: "ALL", label: `Alle (${watchedItems.length})` },
                      { key: "movie", label: `Filme (${watchedMoviesCount})` },
                      { key: "tv", label: `Serien (${watchedTvCount})` },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setFavFilter(f.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        favFilter === f.key
                          ? "bg-card text-foreground shadow-xs border border-border"
                          : "text-muted-foreground hover:text-foreground border border-transparent"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter Panel */}
              <div className="p-4 rounded-2xl bg-card border border-border space-y-3 shadow-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
                  <div className="relative sm:col-span-2 lg:col-span-4">
                    <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={hofSearch}
                      onChange={(e) => setHofSearch(e.target.value)}
                      placeholder="Titel, Regie oder Cast suchen..."
                      className="w-full bg-input border border-border focus:border-primary rounded-xl pl-9 pr-8 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                    {hofSearch && (
                      <button
                        type="button"
                        onClick={() => setHofSearch("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="lg:col-span-3 flex items-center gap-2">
                    <Star className="w-3.5 h-3.5 text-primary-text flex-shrink-0" />
                    <select
                      value={hofRatingFilter}
                      onChange={(e) => setHofRatingFilter(e.target.value as HofRatingFilter)}
                      className="w-full bg-input border border-border focus:border-primary rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none"
                    >
                      <option value="ALL">Alle Bewertungen (1–10 ★)</option>
                      <optgroup label="Einzelne Sterne">
                        {HOF_EXACT_RATINGS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.score} ★ ({opt.label})
                          </option>
                        ))}
                        <option value="UNRATED">Ohne Bewertung</option>
                      </optgroup>
                      <optgroup label="Bereiche">
                        <option value="9_PLUS">9–10 ★</option>
                        <option value="8_PLUS">8–10 ★</option>
                        <option value="7_PLUS">7–10 ★</option>
                        <option value="LOW">Unter 7 ★</option>
                      </optgroup>
                    </select>
                  </div>

                  <div className="lg:col-span-2 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <select
                      value={hofDecadeFilter}
                      onChange={(e) => setHofDecadeFilter(e.target.value as any)}
                      className="w-full bg-input border border-border focus:border-primary rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none"
                    >
                      <option value="ALL">Alle Jahrzehnte</option>
                      <option value="2020s">2020er</option>
                      <option value="2010s">2010er</option>
                      <option value="2000s">2000er</option>
                      <option value="1990s">1990er</option>
                      <option value="classic">Klassiker (&lt; 1990)</option>
                    </select>
                  </div>

                  <div className="lg:col-span-3 flex items-center gap-2">
                    <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <select
                      value={hofSortBy}
                      onChange={(e) => setHofSortBy(e.target.value as any)}
                      className="w-full bg-input border border-border focus:border-primary rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none"
                    >
                      <option value="rating_desc">Beste Bewertung</option>
                      <option value="rating_asc">Niedrigste Bewertung</option>
                      <option value="date_desc">Zuletzt bewertet</option>
                      <option value="year_desc">Jahr (Neu → Alt)</option>
                      <option value="year_asc">Jahr (Alt → Neu)</option>
                      <option value="title_asc">Titel (A–Z)</option>
                    </select>
                  </div>
                </div>

                {availableHofGenres.length > 0 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-border">
                    <Filter className="w-3.5 h-3.5 text-primary-text flex-shrink-0 mr-1" />
                    <button
                      type="button"
                      onClick={() => setHofGenreFilter("ALL")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer ${
                        hofGenreFilter === "ALL"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Alle Genres
                    </button>
                    {availableHofGenres.map((g) => (
                      <button
                        key={g.name}
                        type="button"
                        onClick={() =>
                          setHofGenreFilter((prev) => (prev === g.name ? "ALL" : g.name))
                        }
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer border ${
                          hofGenreFilter === g.name
                            ? "bg-primary-soft text-primary-text border-primary/40 font-semibold"
                            : "bg-background border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {g.name} ({g.count})
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {favoriteItems.length === 0 ? (
                <div className="p-10 rounded-2xl bg-card border border-border text-center space-y-3">
                  <p className="text-sm font-bold text-foreground">Keine Treffer für diese Filter</p>
                  <button
                    type="button"
                    onClick={() => {
                      setFavFilter("ALL");
                      setHofSearch("");
                      setHofRatingFilter("ALL");
                      setHofGenreFilter("ALL");
                      setHofDecadeFilter("ALL");
                    }}
                    className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold cursor-pointer"
                  >
                    Filter zurücksetzen
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {favoriteItems.map((item, idx) => {
                    const meta = metaMap[`${item.mediaType}_${item.tmdbId}`];
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
                        className="group cursor-pointer rounded-2xl bg-card border border-border hover:border-primary/50 overflow-hidden flex flex-col transition shadow-xs"
                      >
                        <div className="relative aspect-[2/3] w-full bg-muted">
                          {item.posterPath ? (
                            <Image
                              src={`https://image.tmdb.org/t/p/w500${item.posterPath}`}
                              alt={item.title}
                              fill
                              sizes="200px"
                              className="object-cover group-hover:scale-105 transition duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <Film className="w-8 h-8" />
                            </div>
                          )}

                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 text-white font-bold text-[11px]">
                            #{idx + 1}
                          </div>

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
                                watchedSeasons: item.watchedSeasons,
                                totalSeasons: item.totalSeasons,
                              });
                            }}
                            title="Bewertung ändern"
                            className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[11px] shadow cursor-pointer"
                          >
                            <Star className="w-3 h-3 fill-slate-950" />
                            <span>{item.rating || "✓"}</span>
                          </button>

                          {item.mediaType === "tv" &&
                            item.watchedSeasons &&
                            item.totalSeasons &&
                            item.watchedSeasons.length < item.totalSeasons && (
                              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-white font-semibold text-[10px]">
                                {formatWatchedSeasons(item.watchedSeasons, item.totalSeasons)}
                              </div>
                            )}
                        </div>

                        <div className="p-3 space-y-1">
                          <p className="text-xs font-bold text-foreground line-clamp-1 group-hover:text-primary-text transition">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {item.releaseYear || meta?.releaseYear || ""}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </div>
      )}

      {/* TAB 3: STATISTIKEN */}
      {activeTab === "stats" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {watchedItems.length === 0 ? (
            <div className="p-12 rounded-2xl bg-card border border-border text-center space-y-4">
              <BarChart3 className="w-10 h-10 text-primary-text mx-auto" />
              <h2 className="text-lg font-bold text-foreground">
                Deine Kino-Statistiken warten auf deine ersten Bewertungen
              </h2>
              <button
                type="button"
                onClick={openSearch}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs cursor-pointer"
              >
                Filme & Serien suchen
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 p-6 rounded-2xl bg-card border border-border space-y-5 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-primary-text" />
                        <span>Lieblings-Genres</span>
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Häufigkeit und Durchschnittsnote
                      </p>
                    </div>

                    <div className="flex items-center gap-1 p-1 rounded-lg bg-muted border border-border self-start">
                      <button
                        type="button"
                        onClick={() => setGenreSortMode("count")}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer ${
                          genreSortMode === "count"
                            ? "bg-card text-foreground shadow-xs"
                            : "text-muted-foreground"
                        }`}
                      >
                        Meistgesehen
                      </button>
                      <button
                        type="button"
                        onClick={() => setGenreSortMode("rating")}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer ${
                          genreSortMode === "rating"
                            ? "bg-card text-foreground shadow-xs"
                            : "text-muted-foreground"
                        }`}
                      >
                        Beste Note
                      </button>
                    </div>
                  </div>

                  {loadingMeta && genreStats.length === 0 ? (
                    <div className="py-10 text-center text-xs text-muted-foreground animate-pulse">
                      Analysiere Genres…
                    </div>
                  ) : genreStats.length > 0 ? (
                    <div className="space-y-3">
                      {genreStats.slice(0, 10).map((g, idx) => {
                        const widthPct =
                          genreSortMode === "count"
                            ? Math.round((g.count / maxGenreCount) * 100)
                            : Math.round((g.avgRating / 10) * 100);

                        return (
                          <div key={g.name} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-foreground">
                                {idx + 1}. {g.name}
                              </span>
                              <span className="text-muted-foreground">
                                <strong className="text-foreground">{g.count}</strong> Titel
                                {g.avgRating > 0 && ` · Ø ${g.avgRating} ★`}
                              </span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full bg-primary transition-all duration-500"
                                style={{ width: `${Math.max(widthPct, 6)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Noch keine Genre-Daten.</p>
                  )}
                </div>

                <div className="lg:col-span-5 space-y-6">
                  <div className="p-6 rounded-2xl bg-card border border-border space-y-4 shadow-xs">
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                      <Star className="w-4 h-4 text-primary fill-primary" />
                      <span>Bewertungs-Verteilung</span>
                    </h3>
                    <div className="space-y-2">
                      {ratingHistogram.map((row) => (
                        <div key={row.score} className="flex items-center gap-3 text-xs">
                          <span className="w-8 font-semibold text-foreground">{row.score}★</span>
                          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary transition-all duration-500"
                              style={{ width: `${row.count > 0 ? Math.max(row.percent, 6) : 0}%` }}
                            />
                          </div>
                          <span className="w-8 text-right font-mono text-muted-foreground">
                            {row.count}x
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-card border border-border space-y-4 shadow-xs">
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary-text" />
                      <span>Nach Jahrzehnten</span>
                    </h3>
                    <div className="space-y-2.5">
                      {decadeStats.map((d) => (
                        <div key={d.key} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-foreground">{d.label}</span>
                            <span className="text-muted-foreground">
                              {d.count} Titel{d.avg ? ` · Ø ${d.avg}★` : ""}
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary transition-all duration-500"
                              style={{ width: `${d.count > 0 ? Math.max(d.percent, 6) : 0}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-card border border-border space-y-3 shadow-xs">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Clapperboard className="w-4 h-4 text-primary-text" />
                    <span>Meistgesehene Regisseure</span>
                  </h3>
                  {topDirectors.length > 0 ? (
                    <div className="space-y-2">
                      {topDirectors.map((dir, i) => (
                        <div
                          key={dir.name}
                          className="flex items-center justify-between p-2 rounded-xl bg-muted/60 text-xs"
                        >
                          <span className="font-semibold text-foreground">
                            {i + 1}. {dir.name}
                          </span>
                          <span className="text-muted-foreground">
                            {dir.count}x{dir.avg ? ` · Ø ${dir.avg}★` : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Wird geladen…</p>
                  )}
                </div>

                <div className="p-6 rounded-2xl bg-card border border-border space-y-3 shadow-xs">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <User className="w-4 h-4 text-primary-text" />
                    <span>Häufigste Stars</span>
                  </h3>
                  {topActors.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {topActors.map((actor) => (
                        <span
                          key={actor.name}
                          className="px-2.5 py-1 rounded-lg bg-muted border border-border text-xs text-foreground font-medium"
                        >
                          {actor.name} · {actor.count}x
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Wird geladen…</p>
                  )}
                </div>

                <div className="p-6 rounded-2xl bg-card border border-border space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Layers className="w-4 h-4 text-primary-text" />
                      <span>Kollektionen</span>
                    </h3>
                    <Link
                      href="/collections"
                      className="text-xs text-primary-text hover:underline font-semibold"
                    >
                      Alle →
                    </Link>
                  </div>
                  <div className="space-y-2.5">
                    {collectionProgress.slice(0, 4).map((col) => (
                      <Link
                        key={col.id}
                        href={`/collections/${col.id}`}
                        className="block p-2 rounded-xl bg-muted/60 hover:bg-muted transition space-y-1"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-foreground truncate max-w-[180px]">
                            {col.name}
                          </span>
                          <span className="text-primary-text font-bold">
                            {col.seen}/{col.total} ({col.pct}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-background overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary"
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

      {/* TAB 4: STREAMING-ABOS */}
      {activeTab === "streaming" && (
        <div className="max-w-2xl p-6 rounded-2xl bg-card border border-border space-y-5 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-foreground">Deine Streaming-Abos</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Markiere deine aktiven Anbieter für Empfehlungen und den Feed.
              </p>
            </div>
            <button
              type="button"
              onClick={openSubscriptions}
              className="px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 border border-border text-xs font-semibold text-foreground cursor-pointer"
            >
              Filter & Details
            </button>
          </div>

          <SubscriptionToggleList
            subscriptions={POPULAR_SUBSCRIPTIONS}
            selectedKeys={userSubscriptions}
            onToggle={toggleSubscription}
            containerClassName="divide-y divide-border"
            rowClassName="py-3"
          />
        </div>
      )}

      {/* TAB 5: EINSTELLUNGEN */}
      {activeTab === "settings" && (
        <div className="max-w-2xl space-y-6 animate-in fade-in duration-200">
          <div className="p-6 rounded-2xl bg-card border border-border divide-y divide-border shadow-xs">
            <div className="pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-foreground">Darstellung</p>
                <p className="text-xs text-muted-foreground">
                  Systemstandard folgen oder zwischen Hell und Dunkel wechseln
                </p>
              </div>
              <ThemeSelector />
            </div>

            <SwitchRow
              checked={watchlistAlerts}
              onToggle={toggleWatchlistAlerts}
              disabled={savingAlerts}
              ariaLabel="Watchlist-E-Mail-Alarm umschalten"
              className="py-4 gap-4"
              label={
                <span className="font-bold flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-primary-text" aria-hidden="true" />
                  <span>Watchlist-E-Mail-Alarm</span>
                </span>
              }
              description="Benachrichtigen, sobald ein gemerkter Titel in deinen Abos startet"
            />

            <div className="pt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={openAvatarPicker}
                  className="px-3.5 py-2 rounded-xl bg-muted hover:bg-muted/80 border border-border text-xs font-semibold text-foreground cursor-pointer"
                >
                  Profilbild ändern
                </button>
                <Link
                  href="/my-list"
                  className="px-3.5 py-2 rounded-xl bg-muted hover:bg-muted/80 border border-border text-xs font-semibold text-foreground"
                >
                  Meine Watchlist
                </Link>
              </div>

              {session?.user && (
                <button
                  type="button"
                  onClick={() => {
                    clearOfflineWatchlist();
                    signOut({ callbackUrl: "/" });
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-bold text-rose-600 dark:text-rose-300 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Abmelden</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Existing Modals Preserved */}
      {showWatchtimeModal && (
        <WatchtimeDetailsModal
          isOpen={showWatchtimeModal}
          onClose={() => setShowWatchtimeModal(false)}
          watchedItems={watchedItems}
          metaMap={metaMap}
        />
      )}

      {showRecommendationsModal && (
        <MyRecommendationsModal
          isOpen={showRecommendationsModal}
          onClose={() => setShowRecommendationsModal(false)}
          recommendations={myRecommendations}
          onEdit={(rec) => setEditingRecommendation(rec)}
          onDelete={(rec) => handleDeleteRec(rec)}
          onOpenMedia={openMediaModal}
          onOpenSearch={openSearch}
        />
      )}

      {editingRecommendation && (
        <EditRecommendationModal
          isOpen={true}
          recommendation={editingRecommendation}
          onClose={() => setEditingRecommendation(null)}
        />
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-muted-foreground animate-pulse">
          Lade Profil…
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
