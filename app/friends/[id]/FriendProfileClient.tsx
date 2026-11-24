"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useMedia } from "@/components/MediaContext";
import { useSession } from "next-auth/react";
import { POPULAR_SUBSCRIPTIONS } from "@/lib/tmdb";
import { formatWatchedSeasons } from "@/lib/seasons";
import type { AdminUserProfile, AppUserWithStats } from "@/lib/store";
import {
  Star,
  Film,
  Tv,
  Sparkles,
  Bookmark,
  Check,
  Plus,
  ArrowLeft,
  Wand2,
  Trash2,
  Shield,
  Heart,
  MessageSquare,
  UserPlus,
  Search,
  X,
  Layers,
  Users,
  Lock,
  Globe,
  Bell,
  Calendar,
  ExternalLink,
  ArrowUpDown,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const TITLE_COLLATOR = new Intl.Collator("de", { numeric: true, sensitivity: "base" });

type ProfileTab =
  | "watched"
  | "watching"
  | "watchlist"
  | "recommendations"
  | "collections"
  | "network";

type RatingFilter =
  | "ALL"
  | "RATED"
  | "TOP"
  | "MID"
  | "LOW"
  | "UNRATED"
  | `${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10}`;

type SortMode = "rating_desc" | "rating_asc" | "recent" | "title_asc";

const RATING_FILTER_OPTIONS: ReadonlyArray<readonly [RatingFilter, string]> = [
  ["ALL", "Alle"],
  ["RATED", "Bewertet"],
  ["TOP", "8–10 ★"],
  ["MID", "6–7 ★"],
  ["LOW", "≤ 5 ★"],
  ["UNRATED", "Ohne ★"],
];

const COLLECTION_VISIBILITY_META = {
  PUBLIC: {
    badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    icon: Globe,
    label: (approvalStatus: string) => `Öffentlich (${approvalStatus})`,
  },
  FRIENDS: {
    badgeClass: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
    icon: Users,
    label: () => "Freunde",
  },
  PRIVATE: {
    badgeClass: "bg-slate-800 text-slate-300 border-slate-700",
    icon: Lock,
    label: () => "Privat",
  },
} as const;

interface FriendProfileClientProps {
  friendIdParam: string;
  mode?: "friend" | "admin";
}

function safeDecodeParam(raw: string): string {
  try {
    return decodeURIComponent(raw).trim();
  } catch {
    return raw.trim();
  }
}

function isSafeRouteIdentifier(val: string): boolean {
  return Boolean(val) && val.length <= 200 && val !== "." && val !== ".." && !val.includes("/") && !val.includes("\\");
}

export function FriendProfileClient({
  friendIdParam,
  mode = "friend",
}: FriendProfileClientProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const {
    communityData,
    userSubscriptions,
    openMediaModal,
    updateMediaStatus,
    removeFriend,
    sendFriendRequest,
    currentUserAvatar,
    confirmDialog,
    showToast,
  } = useMedia();

  const [activeTab, setActiveTab] = useState<ProfileTab>("watched");
  const [filterType, setFilterType] = useState<"ALL" | "movie" | "tv">("ALL");
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("ALL");
  const [sortBy, setSortBy] = useState<SortMode>("rating_desc");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [requestSent, setRequestSent] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const [adminProfile, setAdminProfile] = useState<AdminUserProfile | null>(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [allAdminUsers, setAllAdminUsers] = useState<AppUserWithStats[]>([]);

  const myUserId = (session?.user as any)?.id;
  const myName = session?.user?.name || "Kino-Fan";
  const isAdmin =
    session?.user?.email?.toLowerCase() === "lukasreinle0@gmail.com" ||
    (session?.user as any)?.role === "ADMIN";

  const decodedRaw = safeDecodeParam(friendIdParam);
  const decodedParam = decodedRaw.toLowerCase();

  // Reset per-user UI filters when navigating to another profile
  useEffect(() => {
    setFilterType("ALL");
    setRatingFilter("ALL");
    setSearchFilter("");
    setRequestSent(false);
    setRequestError(null);
  }, [friendIdParam]);

  // Find friend in accepted friends list
  const communityFriend = useMemo(() => {
    return communityData.friends.find(
      (f) =>
        f.id.toLowerCase() === decodedParam ||
        f.name.toLowerCase() === decodedParam ||
        (f.email && f.email.toLowerCase() === decodedParam)
    );
  }, [communityData.friends, decodedParam]);

  // Load full profile via admin endpoint exclusively in admin mode (avoids redundant fetches before communityData hydration)
  const shouldLoadAdminProfile = isAdmin && mode === "admin";

  useEffect(() => {
    if (!shouldLoadAdminProfile) {
      setAdminProfile(null);
      setAdminError(null);
      setAdminLoading(false);
      return;
    }

    if (!isSafeRouteIdentifier(decodedRaw)) {
      setAdminProfile(null);
      setAdminError("Ungültige Nutzer-ID.");
      setAdminLoading(false);
      return;
    }

    const controller = new AbortController();
    setAdminLoading(true);
    setAdminError(null);

    fetch(`/api/admin/users/${encodeURIComponent(decodedRaw)}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Benutzerprofil konnte nicht geladen werden.");
        }
        return res.json();
      })
      .then((data: AdminUserProfile) => {
        if (!data || typeof data !== "object" || !data.user || typeof data.user.id !== "string") {
          throw new Error("Ungültige Serverantwort beim Laden des Nutzerprofils.");
        }
        setAdminProfile(data);
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setAdminProfile(null);
        setAdminError(err?.message || "Benutzerprofil konnte nicht geladen werden.");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setAdminLoading(false);
        }
      });

    return () => controller.abort();
  }, [shouldLoadAdminProfile, decodedRaw]);

  // Fetch compact user list once for quick admin user switcher
  useEffect(() => {
    if (!shouldLoadAdminProfile) return;
    let active = true;
    fetch("/api/admin/users")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (active && Array.isArray(data)) {
          setAllAdminUsers(data);
        }
      })
      .catch(() => {
        // ignore switcher error
      });
    return () => {
      active = false;
    };
  }, [shouldLoadAdminProfile]);

  const friend = adminProfile?.user ?? communityFriend ?? null;
  const isAdminView = Boolean(adminProfile);
  const isFriendWithMe = adminProfile
    ? adminProfile.user.isFriendWithAdmin
    : Boolean(communityFriend);

  const isMe = useMemo(() => {
    if (!friend) return false;
    if (myUserId && friend.id === myUserId) return true;
    if (myName && friend.name.toLowerCase() === myName.toLowerCase()) return true;
    return false;
  }, [friend, myUserId, myName]);

  // User's media statuses (watched, watching & watchlist)
  const friendStatuses = useMemo(() => {
    if (adminProfile) return adminProfile.mediaStatuses;
    if (!friend) return [];
    return communityData.mediaStatuses.filter(
      (m) =>
        m.userId === friend.id ||
        (friend.name && m.userName?.toLowerCase() === friend.name.toLowerCase())
    );
  }, [adminProfile, communityData.mediaStatuses, friend]);

  const friendWatched = useMemo(() => {
    return friendStatuses.filter((m) => m.status === "WATCHED");
  }, [friendStatuses]);

  const friendWatching = useMemo(() => {
    return friendStatuses.filter((m) => m.status === "WATCHING" && m.mediaType === "tv");
  }, [friendStatuses]);

  const friendWatchlist = useMemo(() => {
    return friendStatuses.filter((m) => m.status === "WATCHLIST");
  }, [friendStatuses]);

  const friendRecommendations = useMemo(() => {
    if (adminProfile) return adminProfile.recommendations;
    if (!friend) return [];
    return communityData.recommendations.filter(
      (r) =>
        r.userId === friend.id ||
        (friend.name && r.userName?.toLowerCase() === friend.name.toLowerCase())
    );
  }, [adminProfile, communityData.recommendations, friend]);

  const profileCollections = adminProfile?.customCollections ?? [];
  const profileFriends = adminProfile?.friends ?? [];
  const profileFriendGroups = adminProfile?.friendGroups ?? [];

  // My own watched map for instant comparison
  const myWatchedMap = useMemo(() => {
    const map = new Map<string, { rating: number | null | undefined }>();
    communityData.mediaStatuses.forEach((m) => {
      if (
        m.status === "WATCHED" &&
        ((myUserId && m.userId === myUserId) ||
          (myName && m.userName?.toLowerCase() === myName.toLowerCase()))
      ) {
        map.set(`${m.mediaType}_${m.tmdbId}`, { rating: m.rating });
      }
    });
    return map;
  }, [communityData.mediaStatuses, myUserId, myName]);

  // My own watchlist set
  const myWatchlistSet = useMemo(() => {
    const set = new Set<string>();
    communityData.mediaStatuses.forEach((m) => {
      if (
        m.status === "WATCHLIST" &&
        ((myUserId && m.userId === myUserId) ||
          (myName && m.userName?.toLowerCase() === myName.toLowerCase()))
      ) {
        set.add(`${m.mediaType}_${m.tmdbId}`);
      }
    });
    return set;
  }, [communityData.mediaStatuses, myUserId, myName]);

  // Taste Match & Common Hits Calculation
  const tasteMatchAnalysis = useMemo(() => {
    const commonRated: {
      title: string;
      myRating: number;
      friendRating: number;
      mediaType: string;
      tmdbId: number;
      posterPath?: string | null;
    }[] = [];

    const commonLoved: {
      title: string;
      myRating: number;
      friendRating: number;
      mediaType: string;
      tmdbId: number;
      posterPath?: string | null;
    }[] = [];

    let totalDiff = 0;

    friendWatched.forEach((fw) => {
      const key = `${fw.mediaType}_${fw.tmdbId}`;
      const myMatch = myWatchedMap.get(key);

      if (myMatch && typeof myMatch.rating === "number" && typeof fw.rating === "number") {
        const diff = Math.abs(myMatch.rating - fw.rating);
        totalDiff += diff;
        const item = {
          title: fw.title,
          myRating: myMatch.rating,
          friendRating: fw.rating,
          mediaType: fw.mediaType,
          tmdbId: fw.tmdbId,
          posterPath: fw.posterPath,
        };
        commonRated.push(item);
        if (myMatch.rating >= 8 && fw.rating >= 8) {
          commonLoved.push(item);
        }
      }
    });

    let score: number | null = null;
    if (commonRated.length >= 2) {
      const avgDiff = totalDiff / commonRated.length; // 0 to 9
      // Map avg diff to percentage: 0 diff -> 99%, 1 diff -> 90%, 2 diff -> 80%
      score = Math.max(50, Math.min(99, Math.round(100 - avgDiff * 9.5)));
    }

    return {
      score,
      comparisonCount: commonRated.length,
      commonLoved,
    };
  }, [friendWatched, myWatchedMap]);

  // Rating Distribution & Average Rating (single pass)
  const ratingStats = useMemo(() => {
    const counts = Array<number>(11).fill(0);
    let ratedCount = 0;
    let unratedCount = 0;
    let ratingSum = 0;

    for (const item of friendWatched) {
      if (typeof item.rating === "number" && item.rating > 0) {
        const score = Math.min(10, Math.max(1, Math.round(item.rating)));
        counts[score]++;
        ratedCount++;
        ratingSum += item.rating;
      } else {
        unratedCount++;
      }
    }

    const maxBucket = Math.max(...counts.slice(1), 1);
    return {
      avgRating: ratedCount > 0 ? Math.round((ratingSum / ratedCount) * 10) / 10 : null,
      ratedCount,
      unratedCount,
      buckets: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((score) => ({
        score,
        count: counts[score],
        percent: Math.round((counts[score] / maxBucket) * 100),
      })),
    };
  }, [friendWatched]);

  // Filtered & Sorted Watched
  const filteredWatched = useMemo(() => {
    const query = searchFilter.trim().toLowerCase();
    const exactScore = Number(ratingFilter);
    const hasExactScore = Number.isInteger(exactScore) && exactScore >= 1 && exactScore <= 10;

    return friendWatched
      .filter((item) => {
        if (filterType !== "ALL" && item.mediaType !== filterType) return false;
        const r = typeof item.rating === "number" && item.rating > 0 ? Math.round(item.rating) : 0;
        if (ratingFilter === "RATED" && r === 0) return false;
        if (ratingFilter === "UNRATED" && r !== 0) return false;
        if (ratingFilter === "TOP" && r < 8) return false;
        if (ratingFilter === "MID" && (r < 6 || r > 7)) return false;
        if (ratingFilter === "LOW" && (r === 0 || r > 5)) return false;
        if (hasExactScore && r !== exactScore) return false;
        if (query && !item.title.toLowerCase().includes(query)) return false;
        return true;
      })
      .sort((a, b) => {
        const rA = a.rating || 0;
        const rB = b.rating || 0;
        const tA = new Date(a.updatedAt || 0).getTime();
        const tB = new Date(b.updatedAt || 0).getTime();
        if (sortBy === "rating_asc") {
          if (rA !== rB) return rA - rB;
          return tB - tA;
        }
        if (sortBy === "recent") {
          return tB - tA;
        }
        if (sortBy === "title_asc") {
          return TITLE_COLLATOR.compare(a.title, b.title);
        }
        if (rB !== rA) return rB - rA;
        return tB - tA;
      });
  }, [friendWatched, filterType, ratingFilter, searchFilter, sortBy]);

  // Filtered Watchlist
  const filteredWatchlist = useMemo(() => {
    const query = searchFilter.trim().toLowerCase();
    return friendWatchlist
      .filter((item) => {
        if (filterType !== "ALL" && item.mediaType !== filterType) return false;
        if (query && !item.title.toLowerCase().includes(query)) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "title_asc") return TITLE_COLLATOR.compare(a.title, b.title);
        return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
      });
  }, [friendWatchlist, filterType, searchFilter, sortBy]);

  const handleUnfriend = async () => {
    if (!friend) return;
    const confirmed = await confirmDialog({
      title: "Freundschaft beenden?",
      message: `Möchtest du die Freundschaft mit ${friend.name} wirklich beenden?`,
      confirmLabel: "Freund entfernen",
      dangerous: true,
    });
    if (!confirmed) return;
    const res = await removeFriend(friend.id);
    if (res.success) {
      if (mode === "admin") {
        setAdminProfile((prev) =>
          prev ? { ...prev, user: { ...prev.user, isFriendWithAdmin: false } } : prev
        );
        showToast(`Freundschaft mit ${friend.name} beendet.`, { type: "info" });
      } else {
        router.push("/friends");
      }
    }
  };

  const handleSendAnonRequest = async () => {
    setRequestError(null);
    const target = friend?.email || friend?.id || decodedRaw;
    const res = await sendFriendRequest(target);
    if (res.success) {
      setRequestSent(true);
      showToast("Freundschaftsanfrage gesendet!", { type: "success" });
    } else {
      setRequestError(res.error || "Fehler beim Senden der Anfrage.");
    }
  };

  if (mode === "admin" && status === "loading") {
    return <div className="p-12 text-center text-xs text-slate-500">Authentifizierung prüfen...</div>;
  }

  if (mode === "admin" && !isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white">Zugriff verweigert</h2>
        <p className="text-sm text-slate-400">
          Dieser Bereich ist exklusiv für Admins reserviert.
        </p>
      </div>
    );
  }

  if (shouldLoadAdminProfile && adminLoading && !friend) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 text-center space-y-3">
        <div className="w-10 h-10 rounded-2xl border-2 border-amber-500/30 border-t-amber-400 animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-400">Lade Nutzerprofil...</p>
      </div>
    );
  }

  if (mode === "admin" && adminError && !friend) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
          <Shield className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-2xl font-black text-white">Benutzer nicht gefunden</h1>
          <p className="text-sm text-slate-400">{adminError}</p>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Zurück zum Admin-Dashboard</span>
        </Link>
      </div>
    );
  }

  // If friend was not found in accepted friends list (and not loaded via admin) -> show private profile notice
  if (!friend) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
          <Shield className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white">Privates Profil</h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Die Filme, Bewertungen und Watchlists von Nutzern sind privat und nur für gegenseitig befreundete Kontakte sichtbar.
          </p>
        </div>

        {requestSent ? (
          <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-sm font-semibold inline-flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Freundschaftsanfrage gesendet! Sobald sie angenommen wird, seht ihr eure Profile.</span>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {isAdmin && isSafeRouteIdentifier(decodedRaw) && (
              <Link
                href={`/admin/users/${encodeURIComponent(decodedRaw)}`}
                className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs sm:text-sm transition flex items-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Shield className="w-4 h-4" />
                <span>In Admin-Ansicht öffnen</span>
              </Link>
            )}
            <button
              type="button"
              onClick={handleSendAnonRequest}
              className="px-6 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs sm:text-sm transition flex items-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              <UserPlus className="w-4 h-4" />
              <span>Freundschaftsanfrage senden</span>
            </button>
            <Link
              href="/friends"
              className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs sm:text-sm border border-slate-800 transition"
            >
              Zurück zu deinen Freunden
            </Link>
          </div>
        )}

        {requestError && (
          <p className="text-xs text-rose-400">{requestError}</p>
        )}
      </div>
    );
  }

  const friendAvatar = isMe ? currentUserAvatar || friend.image : friend.image;

  type FriendMediaItem = (typeof friendStatuses)[number];

  const renderWatchlistToggleButton = (
    item: FriendMediaItem,
    {
      onMyWatchlist,
      labelAdded,
      labelAdd,
      buttonClass,
      mediaTypeOverride,
    }: {
      onMyWatchlist: boolean;
      labelAdded: string;
      labelAdd: string;
      buttonClass: string;
      mediaTypeOverride?: "movie" | "tv";
    }
  ) => (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        updateMediaStatus({
          tmdbId: item.tmdbId,
          mediaType: mediaTypeOverride ?? item.mediaType,
          title: item.title,
          posterPath: item.posterPath,
          releaseYear: item.releaseYear,
          status: onMyWatchlist ? "NONE" : "WATCHLIST",
        });
      }}
      className={`${buttonClass} font-bold border transition flex items-center gap-1 ${
        onMyWatchlist
          ? "bg-sky-500 text-black border-sky-400"
          : "bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800"
      }`}
    >
      <Plus className="w-3 h-3" />
      <span>{onMyWatchlist ? labelAdded : labelAdd}</span>
    </button>
  );

  const renderFriendMediaCard = (
    item: FriendMediaItem,
    {
      index,
      accentColor,
      badge,
      topRightBadge,
      footerContent,
      mediaTypeOverride,
      fallbackIcon,
    }: {
      index: number;
      accentColor: "emerald" | "cyan" | "sky";
      badge: React.ReactNode;
      topRightBadge?: React.ReactNode;
      footerContent: React.ReactNode;
      mediaTypeOverride?: "movie" | "tv";
      fallbackIcon?: React.ReactNode;
    }
  ) => {
    const borderHover =
      accentColor === "emerald"
        ? "hover:border-emerald-500/50"
        : accentColor === "cyan"
        ? "hover:border-cyan-400/50"
        : "hover:border-sky-500/50";
    const titleHover =
      accentColor === "emerald"
        ? "group-hover:text-emerald-300"
        : accentColor === "cyan"
        ? "group-hover:text-cyan-300"
        : "group-hover:text-sky-300";

    return (
      <div
        key={item.id}
        onClick={() =>
          openMediaModal({
            id: item.tmdbId,
            mediaType: mediaTypeOverride ?? item.mediaType,
            title: item.title,
            posterPath: item.posterPath,
          })
        }
        className={`group cursor-pointer rounded-2xl bg-slate-900/70 border border-slate-800 ${borderHover} overflow-hidden flex flex-col justify-between transition duration-300 hover:-translate-y-1 shadow-lg ${
          index >= 10 ? "[content-visibility:auto] [contain-intrinsic-size:auto_260px]" : ""
        }`}
      >
        <div className="relative aspect-[2/3] w-full bg-slate-950 overflow-hidden">
          {item.posterPath ? (
            <Image
              src={`https://image.tmdb.org/t/p/w342${item.posterPath}`}
              alt={item.title}
              fill
              sizes="(max-width: 768px) 50vw, 20vw"
              className="object-cover group-hover:scale-105 transition duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600">
              {fallbackIcon ?? <Film className="w-8 h-8" />}
            </div>
          )}
          {badge}
          {topRightBadge}
        </div>

        <div className="p-3 space-y-2">
          <div>
            <div className="flex items-center justify-between gap-1 text-[11px] text-slate-400 font-semibold">
              <span>{item.releaseYear || ""}</span>
              {isAdminView && item.updatedAt && (
                <span className="text-[10px] text-slate-500 font-normal">
                  {new Date(item.updatedAt).toLocaleDateString("de-DE")}
                </span>
              )}
            </div>
            <h3 className={`text-xs font-bold text-white ${titleHover} transition line-clamp-1`}>
              {item.title}
            </h3>
          </div>
          {footerContent}
        </div>
      </div>
    );
  };

  const tabs: Array<{
    id: ProfileTab;
    label: string;
    count: number;
    icon: React.ComponentType<{ className?: string }>;
    activeClass: string;
    inactiveClass: string;
  }> = [
    {
      id: "watched",
      label: "Gesehen & Bewertungen",
      count: friendWatched.length,
      icon: Check,
      activeClass: "bg-emerald-500 text-black border-b-2 border-emerald-200 shadow-lg shadow-emerald-500/20 font-black",
      inactiveClass: "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800",
    },
    {
      id: "watching",
      label: "Schaut gerade",
      count: friendWatching.length,
      icon: Tv,
      activeClass: "bg-cyan-400 text-black border-b-2 border-cyan-100 shadow-lg shadow-cyan-500/20 font-black",
      inactiveClass: "bg-slate-900/80 text-cyan-300 hover:text-white border border-slate-800",
    },
    {
      id: "watchlist",
      label: "Merkliste",
      count: friendWatchlist.length,
      icon: Bookmark,
      activeClass: "bg-sky-500 text-black border-b-2 border-sky-200 shadow-lg shadow-sky-500/20 font-black",
      inactiveClass: "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800",
    },
    {
      id: "recommendations",
      label: "Tipps",
      count: friendRecommendations.length,
      icon: MessageSquare,
      activeClass: "bg-rose-500 text-black border-b-2 border-rose-200 shadow-lg shadow-rose-500/20 font-black",
      inactiveClass: "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800",
    },
    ...(isAdminView
      ? [
          {
            id: "collections" as const,
            label: "Kollektionen",
            count: profileCollections.length,
            icon: Layers,
            activeClass: "bg-purple-500 text-white border-b-2 border-purple-200 shadow-lg shadow-purple-500/20 font-black",
            inactiveClass: "bg-slate-900/80 text-purple-300 hover:text-white border border-slate-800",
          },
          {
            id: "network" as const,
            label: "Netzwerk",
            count: profileFriends.length,
            icon: Users,
            activeClass: "bg-amber-500 text-black border-b-2 border-amber-200 shadow-lg shadow-amber-500/20 font-black",
            inactiveClass: "bg-slate-900/80 text-amber-300 hover:text-white border border-slate-800",
          },
        ]
      : []),
  ];

  const effectiveTab: ProfileTab =
    !isAdminView && (activeTab === "collections" || activeTab === "network")
      ? "watched"
      : activeTab;

  const hasActiveFilters =
    filterType !== "ALL" || ratingFilter !== "ALL" || searchFilter.trim().length > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      {/* Top Back Nav & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={mode === "admin" ? "/admin" : "/friends"}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
          <span>
            {mode === "admin" ? "Zurück zum Admin-Dashboard" : "Zurück zur Freunde-Übersicht"}
          </span>
        </Link>

        <div className="flex flex-wrap items-center gap-2.5">
          {mode === "admin" && allAdminUsers.length > 1 && (
            <label className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold hidden sm:inline">Nutzer wechseln:</span>
              <select
                aria-label="Anderes Nutzerprofil öffnen"
                value={friend.id}
                onChange={(e) => {
                  if (e.target.value && e.target.value !== friend.id) {
                    router.push(`/admin/users/${encodeURIComponent(e.target.value)}`);
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-500/50 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
              >
                {allAdminUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.watchedCount} gesehen)
                  </option>
                ))}
              </select>
            </label>
          )}

          {mode === "friend" && isAdmin && (
            <Link
              href={`/admin/users/${encodeURIComponent(friend.id)}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-300 text-xs font-bold transition"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin-Vollansicht</span>
            </Link>
          )}

          {isMe && (
            <Link
              href="/profile"
              className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold"
            >
              Das bist du (Dein Profil bearbeiten)
            </Link>
          )}
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div
        className={`relative overflow-hidden p-5 sm:p-8 rounded-3xl bg-gradient-to-br ${
          isAdminView
            ? "from-amber-950/35 via-slate-900 to-[#0c1222] border-amber-500/30"
            : "from-indigo-950/60 via-slate-900 to-[#0c1222] border-indigo-500/25"
        } border shadow-2xl space-y-6`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6 min-w-0">
            {friendAvatar ? (
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden border-2 border-amber-500/50 shadow-xl flex-shrink-0">
                <Image
                  src={friendAvatar}
                  alt={friend.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-amber-500 flex items-center justify-center text-black font-black text-3xl shadow-xl flex-shrink-0">
                {friend.name.slice(0, 1)}
              </div>
            )}

            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight truncate">
                  {friend.name}
                </h1>
                {friend.role === "ADMIN" && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                    Admin
                  </span>
                )}
                {isAdminView && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-bold text-[10px] border border-amber-500/40 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    <span>Admin-Ansicht</span>
                  </span>
                )}
                {!isMe &&
                  (isFriendWithMe ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-bold text-[10px] border border-emerald-500/30 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Befreundet</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold text-[10px] border border-slate-700">
                      Nicht befreundet
                    </span>
                  ))}
              </div>
              <p className="text-xs text-slate-400 truncate">{friend.email}</p>

              {/* Admin Account Metadata */}
              {adminProfile && (
                <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px] text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>
                      Dabei seit {new Date(adminProfile.user.createdAt).toLocaleDateString("de-DE")}
                    </span>
                  </span>
                  <span className="text-slate-700">•</span>
                  <span>
                    Letzte Aktivität:{" "}
                    <strong className="text-slate-300">
                      {new Date(adminProfile.user.lastActivityAt).toLocaleDateString("de-DE")}
                    </strong>
                  </span>
                  <span className="text-slate-700">•</span>
                  <span className="inline-flex items-center gap-1">
                    <Bell
                      className={`w-3 h-3 ${
                        adminProfile.user.watchlistAlertsEnabled ? "text-emerald-400" : "text-slate-500"
                      }`}
                    />
                    <span>
                      Watchlist-Alarm: {adminProfile.user.watchlistAlertsEnabled ? "An" : "Aus"}
                    </span>
                  </span>
                </div>
              )}

              {/* Shared Streaming Subscriptions Banner */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-400">Streaming:</span>
                {friend.subscriptions && friend.subscriptions.length > 0 ? (
                  friend.subscriptions.map((subKey: string) => {
                    const meta = POPULAR_SUBSCRIPTIONS.find((s) => s.key === subKey) || {
                      key: subKey,
                      label: subKey,
                      color: "#94a3b8",
                    };
                    const isShared = userSubscriptions.includes(subKey);
                    return (
                      <span
                        key={subKey}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          isShared
                            ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                            : "bg-slate-900 border-slate-800 text-slate-400"
                        }`}
                        title={isShared ? "Gemeinsames Streaming-Abo!" : undefined}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
                        <span>{meta.label}</span>
                        {isShared && <Check className="w-2.5 h-2.5 ml-0.5" />}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-[11px] text-slate-500">Keine Abos angegeben</span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap sm:flex-col items-stretch gap-2.5 w-full sm:w-auto">
            {(isFriendWithMe || isMe) && (
              <Link
                href={`/recommendations?tab=ai&prompt=${encodeURIComponent(
                  `Heute will ich mit @${friend.name} einen Film schauen`
                )}`}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-fuchsia-500 to-purple-500 hover:from-amber-400 hover:to-purple-400 text-black font-black text-xs sm:text-sm transition shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 flex-1 sm:flex-initial"
              >
                <Wand2 className="w-4 h-4" />
                <span>Filmabend mit @{friend.name} matchen</span>
              </Link>
            )}

            {!isMe &&
              (isFriendWithMe ? (
                <button
                  type="button"
                  onClick={handleUnfriend}
                  className="px-4 py-2.5 rounded-2xl bg-slate-950/80 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Freundschaft beenden</span>
                </button>
              ) : requestSent ? (
                <span className="px-4 py-2.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>Anfrage gesendet</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendAnonRequest}
                  className="px-4 py-2.5 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-500/20"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Freundschaftsanfrage senden</span>
                </button>
              ))}
            {requestError && <p className="text-[11px] text-rose-400 text-center">{requestError}</p>}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-emerald-400">
              <Film className="w-4 h-4" />
              <span className="text-xl sm:text-2xl font-black">{friendWatched.length}</span>
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Gesehen ({ratingStats.ratedCount} ★)
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-sky-400">
              <Bookmark className="w-4 h-4" />
              <span className="text-xl sm:text-2xl font-black">{friendWatchlist.length}</span>
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Merkliste</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-rose-400">
              <MessageSquare className="w-4 h-4" />
              <span className="text-xl sm:text-2xl font-black">{friendRecommendations.length}</span>
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Empfehlungen</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
              <span className="text-xl sm:text-2xl font-black">
                {ratingStats.avgRating ? `${ratingStats.avgRating} ★` : "–"}
              </span>
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Ø Bewertung</p>
          </div>
        </div>
      </div>

      {/* Currently Watching TV Series Spotlight (TV only) */}
      {friendWatching.length > 0 && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-cyan-950/35 via-slate-900/75 to-[#0d1322] border border-cyan-500/30 space-y-4 shadow-xl">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Tv className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base sm:text-lg font-black text-white">
                @{friend.name} schaut gerade ({friendWatching.length}{" "}
                {friendWatching.length === 1 ? "Serie" : "Serien"})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("watching")}
              className="text-xs font-bold text-cyan-300 hover:text-cyan-200 transition cursor-pointer"
            >
              Alle ansehen →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {friendWatching.slice(0, 6).map((item) => (
              <div
                key={item.id}
                onClick={() =>
                  openMediaModal({
                    id: item.tmdbId,
                    mediaType: "tv",
                    title: item.title,
                    posterPath: item.posterPath,
                  })
                }
                className="group cursor-pointer flex items-center gap-3 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-400/50 transition"
              >
                <div className="relative w-12 h-16 rounded-xl overflow-hidden bg-slate-900 flex-shrink-0 border border-slate-800">
                  {item.posterPath ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w185${item.posterPath}`}
                      alt={item.title}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <Tv className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 transition truncate">
                    {item.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">
                      {formatWatchedSeasons(item.watchedSeasons, item.totalSeasons)}
                    </span>
                    {item.rating && (
                      <span className="px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        <span>{item.rating}★</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Taste Match Analysis Section */}
      {!isMe && (
        <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" />
                <h2 className="text-lg font-black text-white">
                  Geschmacks-Match zwischen dir und @{friend.name}
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                Basierend auf den Filmen und Serien, die ihr beide gesehen und bewertet habt.
              </p>
            </div>

            {tasteMatchAnalysis.score !== null ? (
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-300 font-black text-sm">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>{tasteMatchAnalysis.score}% Film-Match</span>
              </div>
            ) : (
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs font-semibold">
                {tasteMatchAnalysis.comparisonCount === 0
                  ? "Noch keine gemeinsamen Bewertungen"
                  : `1 gemeinsamer Film (ab 2 Filmen gibt's einen Score)`}
              </div>
            )}
          </div>

          {tasteMatchAnalysis.commonLoved.length > 0 && (
            <div className="pt-2 space-y-2">
              <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <span>🔥 Eure gemeinsamen Lieblingsfilme (beide 8–10★):</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {tasteMatchAnalysis.commonLoved.map((item) => (
                  <div
                    key={`${item.mediaType}_${item.tmdbId}`}
                    onClick={() =>
                      openMediaModal({
                        id: item.tmdbId,
                        mediaType: item.mediaType as any,
                        title: item.title,
                        posterPath: item.posterPath,
                      })
                    }
                    className="cursor-pointer group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-400/50 transition text-xs text-slate-200"
                  >
                    <span className="font-bold group-hover:text-amber-300 transition truncate max-w-[200px]">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-amber-400 font-mono">
                      (Du: {item.myRating}★ | @{friend.name}: {item.friendRating}★)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation Tabs & Content Panels */}
      <div className="space-y-5">
        <div
          role="tablist"
          aria-label="Profil-Bereiche"
          className="scroll-fade-x flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-slate-800 pb-4"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const selected = effectiveTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`profile-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition whitespace-nowrap flex-shrink-0 cursor-pointer ${
                  selected ? tab.activeClass : tab.inactiveClass
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>
                  {tab.label} ({tab.count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Search, Format, Rating & Sort Controls */}
        {(effectiveTab === "watched" || effectiveTab === "watchlist") && (
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="search"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Titel durchsuchen..."
                className="w-full bg-slate-900/90 border border-slate-800 focus:border-amber-400 rounded-xl py-2 pl-9 pr-8 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              {searchFilter && (
                <button
                  type="button"
                  onClick={() => setSearchFilter("")}
                  aria-label="Suche leeren"
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
                {(["ALL", "movie", "tv"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFilterType(t)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      filterType === t
                        ? "bg-slate-800 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {t === "ALL" ? "Alle" : t === "movie" ? "Filme" : "Serien"}
                  </button>
                ))}
              </div>

              {effectiveTab === "watched" && (
                <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto">
                  {RATING_FILTER_OPTIONS.map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRatingFilter(value)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                        ratingFilter === value
                          ? "bg-amber-500 text-black"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}

              <label className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-400">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                <select
                  aria-label="Sortierung"
                  value={effectiveTab === "watchlist" && sortBy.startsWith("rating_") ? "recent" : sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortMode)}
                  className="bg-transparent text-xs font-bold text-white focus:outline-none"
                >
                  {effectiveTab === "watched" && <option value="rating_desc">Beste Bewertung</option>}
                  {effectiveTab === "watched" && <option value="rating_asc">Niedrigste Bewertung</option>}
                  <option value="recent">Zuletzt aktualisiert</option>
                  <option value="title_asc">Titel A–Z</option>
                </select>
              </label>
            </div>
          </div>
        )}

        {/* Tab 1: Watched Movies & Shows */}
        {effectiveTab === "watched" && (
          <div role="tabpanel" aria-labelledby="profile-tab-watched" className="space-y-4">
            {/* Compact Interactive Star Rating Distribution */}
            {ratingStats.ratedCount > 0 && (
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>
                      Bewertungsverteilung ({ratingStats.ratedCount} bewertet
                      {ratingStats.unratedCount > 0 ? `, ${ratingStats.unratedCount} ohne Sterne` : ""})
                    </span>
                  </span>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={() => {
                        setFilterType("ALL");
                        setRatingFilter("ALL");
                        setSearchFilter("");
                      }}
                      className="text-[11px] font-bold text-amber-400 hover:underline"
                    >
                      Filter zurücksetzen ({filteredWatched.length}/{friendWatched.length})
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                  {ratingStats.buckets.map((b) => {
                    const key = String(b.score) as RatingFilter;
                    const active = ratingFilter === key;
                    return (
                      <button
                        key={b.score}
                        type="button"
                        disabled={b.count === 0}
                        onClick={() => setRatingFilter(active ? "ALL" : key)}
                        className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl border text-[11px] transition disabled:opacity-35 ${
                          active
                            ? "bg-amber-500 text-black border-amber-300 font-black"
                            : "bg-slate-950/70 hover:bg-slate-800/80 border-slate-800 text-slate-300"
                        }`}
                        title={`${b.count} Titel mit ${b.score} Sternen`}
                      >
                        <span className="font-bold">{b.score}★</span>
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${active ? "bg-black/60" : "bg-amber-400"}`}
                            style={{ width: `${b.count > 0 ? Math.max(15, b.percent) : 0}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono">{b.count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {filteredWatched.length === 0 ? (
              <div className="p-12 rounded-3xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-2">
                <Film className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-bold text-slate-300">Keine Titel für diesen Filter gefunden.</p>
                <p className="text-xs text-slate-500">
                  {friend.name} hat hierfür noch keine passenden Einträge gespeichert.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredWatched.map((item, idx) => {
                  const key = `${item.mediaType}_${item.tmdbId}`;
                  const myWatched = myWatchedMap.get(key);
                  const onMyWatchlist = myWatchlistSet.has(key);

                  return renderFriendMediaCard(item, {
                    index: idx,
                    accentColor: "emerald",
                    badge: (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md border border-amber-500/40 text-amber-300 text-xs font-black flex items-center gap-1 shadow">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{item.rating ? `${item.rating}★` : "Gesehen"}</span>
                      </div>
                    ),
                    topRightBadge: (
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-slate-950/80 text-[10px] text-slate-300 font-bold uppercase tracking-wider">
                        {item.mediaType === "movie" ? "Film" : "Serie"}
                      </div>
                    ),
                    footerContent: (
                      <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                        {myWatched ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Du: {myWatched.rating ? `${myWatched.rating}★` : "Gesehen"}</span>
                          </span>
                        ) : (
                          renderWatchlistToggleButton(item, {
                            onMyWatchlist,
                            labelAdded: "Auf Merkliste ✓",
                            labelAdd: "+ Merkliste",
                            buttonClass: "px-2 py-0.5 rounded-md text-[10px]",
                          })
                        )}
                      </div>
                    ),
                  });
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 1b: Currently Watching TV Series */}
        {effectiveTab === "watching" && (
          <div role="tabpanel" aria-labelledby="profile-tab-watching" className="space-y-4">
            {friendWatching.length === 0 ? (
              <div className="p-12 rounded-3xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-2">
                <Tv className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-bold text-slate-300">
                  Aktuell keine Serien im Status &bdquo;Schaue ich gerade&ldquo;.
                </p>
                <p className="text-xs text-slate-500">
                  Sobald {friend.name} eine laufende Serie markiert, erscheint sie hier inkl. aktuellem Staffel-Stand.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {friendWatching.map((item, idx) => {
                  const onMyWatchlist = myWatchlistSet.has(`tv_${item.tmdbId}`);
                  return renderFriendMediaCard(item, {
                    index: idx,
                    accentColor: "cyan",
                    mediaTypeOverride: "tv",
                    fallbackIcon: <Tv className="w-8 h-8" />,
                    badge: (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-cyan-400/95 text-black text-[10px] font-black shadow flex items-center gap-1">
                        <Tv className="w-3 h-3" />
                        <span>{formatWatchedSeasons(item.watchedSeasons, item.totalSeasons)}</span>
                      </div>
                    ),
                    topRightBadge: item.rating ? (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-black/80 border border-amber-500/40 text-amber-300 text-xs font-black flex items-center gap-1 shadow">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{item.rating}★</span>
                      </div>
                    ) : null,
                    footerContent: renderWatchlistToggleButton(item, {
                      onMyWatchlist,
                      labelAdded: "Auf Merkliste ✓",
                      labelAdd: "+ Merkliste",
                      buttonClass: "px-2.5 py-1 rounded-lg text-xs w-full justify-center",
                      mediaTypeOverride: "tv",
                    }),
                  });
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Friend's Watchlist */}
        {effectiveTab === "watchlist" && (
          <div role="tabpanel" aria-labelledby="profile-tab-watchlist" className="space-y-4">
            {filteredWatchlist.length === 0 ? (
              <div className="p-12 rounded-3xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-2">
                <Bookmark className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-bold text-slate-300">Merkliste ist aktuell leer.</p>
                <p className="text-xs text-slate-500">
                  {friend.name} hat aktuell keine passenden ungesehenen Titel auf der Watchlist.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredWatchlist.map((item, idx) => {
                  const key = `${item.mediaType}_${item.tmdbId}`;
                  const isWatchedByMe = myWatchedMap.has(key);
                  const onMyWatchlist = myWatchlistSet.has(key);

                  return renderFriendMediaCard(item, {
                    index: idx,
                    accentColor: "sky",
                    badge: (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-sky-500/90 text-black text-[10px] font-black shadow flex items-center gap-1">
                        <Bookmark className="w-3 h-3 fill-black" />
                        <span>Will @{friend.name} schauen</span>
                      </div>
                    ),
                    footerContent: (
                      <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                        {isWatchedByMe ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Du hast ihn schon gesehen</span>
                          </span>
                        ) : (
                          renderWatchlistToggleButton(item, {
                            onMyWatchlist,
                            labelAdded: "Auch auf deiner Liste ✓",
                            labelAdd: "Auch merken +",
                            buttonClass: "px-2.5 py-1 rounded-lg text-xs w-full justify-center",
                          })
                        )}
                      </div>
                    ),
                  });
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Friend's Recommendations */}
        {effectiveTab === "recommendations" && (
          <div role="tabpanel" aria-labelledby="profile-tab-recommendations" className="space-y-4">
            {friendRecommendations.length === 0 ? (
              <div className="p-12 rounded-3xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-bold text-slate-300">Noch keine Tipps veröffentlicht.</p>
                <p className="text-xs text-slate-500">
                  @{friend.name} hat noch keine Filmempfehlungen für den Freundeskreis gepostet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {friendRecommendations.map((rec) => (
                  <div
                    key={rec.id}
                    onClick={() =>
                      openMediaModal({
                        id: rec.tmdbId,
                        mediaType: rec.mediaType,
                        title: rec.title,
                        posterPath: rec.posterPath,
                      })
                    }
                    className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-rose-500/40 cursor-pointer transition shadow-lg space-y-3.5 group"
                  >
                    <div className="flex gap-4">
                      {rec.posterPath ? (
                        <div className="relative w-16 aspect-[2/3] rounded-xl overflow-hidden bg-slate-950 flex-shrink-0 border border-slate-800">
                          <Image
                            src={`https://image.tmdb.org/t/p/w185${rec.posterPath}`}
                            alt={rec.title}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 aspect-[2/3] rounded-xl bg-slate-950 flex items-center justify-center text-slate-600 flex-shrink-0">
                          <Film className="w-6 h-6" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] text-slate-400 font-semibold">
                            {rec.releaseYear || ""} • {rec.mediaType === "movie" ? "Film" : "Serie"}
                            {isAdminView && rec.createdAt
                              ? ` • ${new Date(rec.createdAt).toLocaleDateString("de-DE")}`
                              : ""}
                          </span>
                          <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-black text-xs border border-amber-500/30 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400" />
                            <span>{rec.rating}/10★</span>
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition truncate">
                          {rec.title}
                        </h3>

                        {rec.comment ? (
                          <p className="text-xs text-slate-300 italic line-clamp-3">
                            &ldquo;{rec.comment}&rdquo;
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {rec.targetNames && rec.targetNames.length > 0 ? (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-[10px] text-purple-300 font-bold w-fit">
                          <Sparkles className="w-3 h-3 text-purple-400" />
                          <span>
                            {isAdminView || rec.targetNames.some((t) => t.startsWith("@"))
                              ? `Für ${rec.targetNames.join(", ")} empfohlen`
                              : "Speziell für dich empfohlen!"}
                          </span>
                        </div>
                      ) : isAdminView ? (
                        <span className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-slate-400 font-semibold">
                          An alle Freunde
                        </span>
                      ) : null}

                      {isAdminView && (
                        <span className="text-[10px] text-slate-500 font-semibold">
                          👍 {rec.upvoterIds.length} · 💬 {rec.replies?.length || 0}
                        </span>
                      )}
                    </div>

                    {rec.tags && rec.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {rec.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] text-slate-300 font-semibold"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4 (Admin): User's Custom Collections */}
        {effectiveTab === "collections" && isAdminView && (
          <div role="tabpanel" aria-labelledby="profile-tab-collections" className="space-y-4">
            {profileCollections.length === 0 ? (
              <div className="p-12 rounded-3xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-2">
                <Layers className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-bold text-slate-300">Keine eigenen Kollektionen.</p>
                <p className="text-xs text-slate-500">
                  {friend.name} hat noch keine eigenen Film-Kollektionen angelegt.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profileCollections.map((col) => {
                  const visMeta =
                    COLLECTION_VISIBILITY_META[col.visibility] ?? COLLECTION_VISIBILITY_META.PRIVATE;
                  const VisIcon = visMeta.icon;
                  return (
                    <div
                      key={col.id}
                      className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-3 shadow-lg"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-black text-white truncate">
                              {col.emoji} {col.name}
                            </h3>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${visMeta.badgeClass}`}
                            >
                              <VisIcon className="w-2.5 h-2.5" />
                              <span>{visMeta.label(col.approvalStatus)}</span>
                            </span>
                          </div>
                          {col.description && (
                            <p className="text-xs text-slate-400 line-clamp-2">{col.description}</p>
                          )}
                        </div>
                        <Link
                          href={`/collections/${col.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-bold text-amber-300 flex-shrink-0"
                        >
                          <span>Öffnen</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {col.movies.map((m) => (
                          <button
                            key={`${col.id}_${m.id}`}
                            type="button"
                            onClick={() =>
                              openMediaModal({
                                id: m.id,
                                mediaType: m.mediaType || "movie",
                                title: m.title,
                                posterPath: m.posterPath,
                              })
                            }
                            className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 text-[11px] text-slate-200 font-semibold transition cursor-pointer"
                          >
                            {m.title} {m.releaseYear ? `(${m.releaseYear})` : ""}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 5 (Admin): User's Friends & CineCrews */}
        {effectiveTab === "network" && isAdminView && (
          <div role="tabpanel" aria-labelledby="profile-tab-network" className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span>Befreundete Nutzer ({profileFriends.length})</span>
              </h3>
              {profileFriends.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                  {friend.name} hat aktuell noch keine bestätigten Freunde.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {profileFriends.map((pf) => (
                    <Link
                      key={pf.id}
                      href={`/admin/users/${encodeURIComponent(pf.id)}`}
                      className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 transition group"
                    >
                      {pf.image ? (
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-slate-700 flex-shrink-0">
                          <Image src={pf.image} alt={pf.name} fill sizes="40px" className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-amber-500 flex items-center justify-center text-black font-black text-sm flex-shrink-0">
                          {pf.name.slice(0, 1)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white group-hover:text-amber-300 truncate">
                          {pf.name}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">{pf.email}</p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {profileFriendGroups.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  CineCrews / Gruppen ({profileFriendGroups.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {profileFriendGroups.map((grp) => (
                    <div
                      key={grp.id}
                      className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{grp.emoji}</span>
                        <div>
                          <p className="text-sm font-bold text-white">{grp.name}</p>
                          {grp.ownerName && (
                            <p className="text-[10px] text-slate-500">Erstellt von {grp.ownerName}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {grp.memberNames.map((m) => (
                          <span
                            key={m}
                            className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] text-slate-300 font-semibold"
                          >
                            @{m}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
