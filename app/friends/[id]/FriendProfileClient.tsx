"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useMedia } from "@/components/MediaContext";
import { useSession } from "next-auth/react";
import { POPULAR_SUBSCRIPTIONS } from "@/lib/tmdb";
import {
  User,
  Star,
  Film,
  Tv,
  Clock,
  Sparkles,
  Bookmark,
  Check,
  Plus,
  ArrowLeft,
  Wand2,
  Trash2,
  Shield,
  Heart,
  TrendingUp,
  MessageSquare,
  ThumbsUp,
  AlertCircle,
  UserPlus,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface FriendProfileClientProps {
  friendIdParam: string;
}

export function FriendProfileClient({ friendIdParam }: FriendProfileClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const {
    communityData,
    userSubscriptions,
    openMediaModal,
    openRatingModal,
    updateMediaStatus,
    removeFriend,
    sendFriendRequest,
    currentUserAvatar,
  } = useMedia();

  const [activeTab, setActiveTab] = useState<"watched" | "watchlist" | "recommendations">("watched");
  const [filterType, setFilterType] = useState<"ALL" | "movie" | "tv">("ALL");
  const [ratingFilter, setRatingFilter] = useState<"ALL" | "TOP" | "MID" | "LOW">("ALL");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [requestSent, setRequestSent] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const myUserId = (session?.user as any)?.id;
  const myName = session?.user?.name || "Kino-Fan";

  const decodedParam = decodeURIComponent(friendIdParam).toLowerCase().trim();

  // Find friend in accepted friends list
  const friend = useMemo(() => {
    return communityData.friends.find(
      (f) =>
        f.id.toLowerCase() === decodedParam ||
        f.name.toLowerCase() === decodedParam ||
        (f.email && f.email.toLowerCase() === decodedParam)
    );
  }, [communityData.friends, decodedParam]);

  const isMe = useMemo(() => {
    if (!friend) return false;
    if (myUserId && friend.id === myUserId) return true;
    if (myName && friend.name.toLowerCase() === myName.toLowerCase()) return true;
    return false;
  }, [friend, myUserId, myName]);

  // Friend's media statuses (watched & watchlist)
  const friendStatuses = useMemo(() => {
    if (!friend) return [];
    return communityData.mediaStatuses.filter(
      (m) =>
        m.userId === friend.id ||
        (friend.name && m.userName?.toLowerCase() === friend.name.toLowerCase())
    );
  }, [communityData.mediaStatuses, friend]);

  const friendWatched = useMemo(() => {
    return friendStatuses.filter((m) => m.status === "WATCHED");
  }, [friendStatuses]);

  const friendWatchlist = useMemo(() => {
    return friendStatuses.filter((m) => m.status === "WATCHLIST");
  }, [friendStatuses]);

  const friendRecommendations = useMemo(() => {
    if (!friend) return [];
    return communityData.recommendations.filter(
      (r) =>
        r.userId === friend.id ||
        (friend.name && r.userName?.toLowerCase() === friend.name.toLowerCase())
    );
  }, [communityData.recommendations, friend]);

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

  // Average Rating
  const friendAvgRating = useMemo(() => {
    const rated = friendWatched.filter((w) => typeof w.rating === "number" && w.rating > 0);
    if (rated.length === 0) return null;
    const sum = rated.reduce((acc, curr) => acc + (curr.rating || 0), 0);
    return Math.round((sum / rated.length) * 10) / 10;
  }, [friendWatched]);

  // Filtered Watched
  const filteredWatched = useMemo(() => {
    return friendWatched.filter((item) => {
      if (filterType !== "ALL" && item.mediaType !== filterType) return false;
      if (ratingFilter === "TOP" && (!item.rating || item.rating < 8)) return false;
      if (ratingFilter === "MID" && (!item.rating || item.rating < 6 || item.rating > 7)) return false;
      if (ratingFilter === "LOW" && (!item.rating || item.rating > 5)) return false;
      if (searchFilter.trim() && !item.title.toLowerCase().includes(searchFilter.toLowerCase().trim())) {
        return false;
      }
      return true;
    }).sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }, [friendWatched, filterType, ratingFilter, searchFilter]);

  // Filtered Watchlist
  const filteredWatchlist = useMemo(() => {
    return friendWatchlist.filter((item) => {
      if (filterType !== "ALL" && item.mediaType !== filterType) return false;
      if (searchFilter.trim() && !item.title.toLowerCase().includes(searchFilter.toLowerCase().trim())) {
        return false;
      }
      return true;
    });
  }, [friendWatchlist, filterType, searchFilter]);

  const handleUnfriend = async () => {
    if (!friend) return;
    if (!confirm(`Möchtest du die Freundschaft mit ${friend.name} wirklich beenden?`)) return;
    const res = await removeFriend(friend.id);
    if (res.success) {
      router.push("/friends");
    }
  };

  const handleSendAnonRequest = async () => {
    setRequestError(null);
    const res = await sendFriendRequest(decodedParam);
    if (res.success) {
      setRequestSent(true);
    } else {
      setRequestError(res.error || "Fehler beim Senden der Anfrage.");
    }
  };

  // If friend was not found in accepted friends list -> show private profile notice
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
  const sharedSubs = (friend.subscriptions || []).filter((s: string) => userSubscriptions.includes(s));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      {/* Top Back Nav & Quick Actions */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/friends"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
          <span>Zurück zur Freunde-Übersicht</span>
        </Link>

        {isMe && (
          <Link
            href="/profile"
            className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold"
          >
            Das bist du (Dein Profil bearbeiten)
          </Link>
        )}
      </div>

      {/* Main Profile Header Card */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-[#0c1222] border border-indigo-500/25 shadow-2xl space-y-6">
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
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-bold text-[10px] border border-emerald-500/30 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>Befreundet</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">{friend.email}</p>

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

          {/* Action Button: Movie Night Match with Friend */}
          <div className="flex flex-wrap sm:flex-col items-stretch gap-2.5 w-full sm:w-auto">
            <Link
              href={`/recommendations?tab=ai&prompt=${encodeURIComponent(
                `Heute will ich mit @${friend.name} einen Film schauen`
              )}`}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-fuchsia-500 to-purple-500 hover:from-amber-400 hover:to-purple-400 text-black font-black text-xs sm:text-sm transition shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 flex-1 sm:flex-initial"
            >
              <Wand2 className="w-4 h-4" />
              <span>Filmabend mit @{friend.name} matchen</span>
            </Link>

            {!isMe && (
              <button
                type="button"
                onClick={handleUnfriend}
                className="px-4 py-2.5 rounded-2xl bg-slate-950/80 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 text-xs font-semibold transition flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Freundschaft beenden</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-emerald-400">
              <Film className="w-4 h-4" />
              <span className="text-xl sm:text-2xl font-black">{friendWatched.length}</span>
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Gesehen</p>
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
                {friendAvgRating ? `${friendAvgRating} ★` : "–"}
              </span>
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Ø Bewertung</p>
          </div>
        </div>
      </div>

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

      {/* Navigation Tabs (Gesehen, Merkliste, Empfehlungen) */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("watched")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition ${
                activeTab === "watched"
                  ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 font-black"
                  : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Gesehen ({friendWatched.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("watchlist")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition ${
                activeTab === "watchlist"
                  ? "bg-sky-500 text-black shadow-lg shadow-sky-500/20 font-black"
                  : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Merkliste ({friendWatchlist.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("recommendations")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition ${
                activeTab === "recommendations"
                  ? "bg-rose-500 text-black shadow-lg shadow-rose-500/20 font-black"
                  : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Tipps ({friendRecommendations.length})</span>
            </button>
          </div>

          {/* Quick Filters (Format & Ratings) */}
          {activeTab !== "recommendations" && (
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
                    {t === "ALL" ? "Alle Formate" : t === "movie" ? "Filme" : "Serien"}
                  </button>
                ))}
              </div>

              {activeTab === "watched" && (
                <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
                  {(["ALL", "TOP", "MID", "LOW"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRatingFilter(r)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                        ratingFilter === r
                          ? "bg-amber-500 text-black"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {r === "ALL"
                        ? "Alle Sterne"
                        : r === "TOP"
                        ? "8-10 ★"
                        : r === "MID"
                        ? "6-7 ★"
                        : "≤ 5 ★"}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tab 1: Watched Movies & Shows */}
        {activeTab === "watched" && (
          <div className="space-y-4">
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
                {filteredWatched.map((item) => {
                  const key = `${item.mediaType}_${item.tmdbId}`;
                  const myWatched = myWatchedMap.get(key);
                  const isWatchedByMe = !!myWatched;
                  const myRating = myWatched?.rating;
                  const onMyWatchlist = myWatchlistSet.has(key);

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
                      className="group cursor-pointer rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 overflow-hidden flex flex-col justify-between transition duration-300 hover:-translate-y-1 shadow-lg"
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
                            <Film className="w-8 h-8" />
                          </div>
                        )}

                        {/* Friend's Rating Badge */}
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md border border-amber-500/40 text-amber-300 text-xs font-black flex items-center gap-1 shadow">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{item.rating ? `${item.rating}★` : "Gesehen"}</span>
                        </div>

                        {/* Format Badge */}
                        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-slate-950/80 text-[10px] text-slate-300 font-bold uppercase tracking-wider">
                          {item.mediaType === "movie" ? "Film" : "Serie"}
                        </div>
                      </div>

                      <div className="p-3 space-y-2">
                        <div>
                          <p className="text-[11px] text-slate-400 font-semibold">{item.releaseYear || ""}</p>
                          <h3 className="text-xs font-bold text-white group-hover:text-emerald-300 transition line-clamp-1">
                            {item.title}
                          </h3>
                        </div>

                        {/* Comparison Indicator with Current User */}
                        <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                          {isWatchedByMe ? (
                            <span className="text-emerald-400 font-semibold flex items-center gap-1">
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>Du: {myRating ? `${myRating}★` : "Gesehen"}</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateMediaStatus({
                                  tmdbId: item.tmdbId,
                                  mediaType: item.mediaType,
                                  title: item.title,
                                  posterPath: item.posterPath,
                                  releaseYear: item.releaseYear,
                                  status: onMyWatchlist ? "NONE" : "WATCHLIST",
                                });
                              }}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition flex items-center gap-1 ${
                                onMyWatchlist
                                  ? "bg-sky-500 text-black border-sky-400"
                                  : "bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800"
                              }`}
                            >
                              <Plus className="w-3 h-3" />
                              <span>{onMyWatchlist ? "Auf Merkliste ✓" : "+ Merkliste"}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Friend's Watchlist */}
        {activeTab === "watchlist" && (
          <div className="space-y-4">
            {filteredWatchlist.length === 0 ? (
              <div className="p-12 rounded-3xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-2">
                <Bookmark className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-bold text-slate-300">Merkliste ist aktuell leer.</p>
                <p className="text-xs text-slate-500">
                  {friend.name} hat aktuell keine ungesehenen Titel auf der Watchlist.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredWatchlist.map((item) => {
                  const key = `${item.mediaType}_${item.tmdbId}`;
                  const isWatchedByMe = myWatchedMap.has(key);
                  const onMyWatchlist = myWatchlistSet.has(key);

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
                      className="group cursor-pointer rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-sky-500/50 overflow-hidden flex flex-col justify-between transition duration-300 hover:-translate-y-1 shadow-lg"
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
                            <Film className="w-8 h-8" />
                          </div>
                        )}

                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-sky-500/90 text-black text-[10px] font-black shadow flex items-center gap-1">
                          <Bookmark className="w-3 h-3 fill-black" />
                          <span>Will @{friend.name} schauen</span>
                        </div>
                      </div>

                      <div className="p-3 space-y-2">
                        <div>
                          <p className="text-[11px] text-slate-400 font-semibold">{item.releaseYear || ""}</p>
                          <h3 className="text-xs font-bold text-white group-hover:text-sky-300 transition line-clamp-1">
                            {item.title}
                          </h3>
                        </div>

                        <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                          {isWatchedByMe ? (
                            <span className="text-emerald-400 font-semibold flex items-center gap-1">
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>Du hast ihn schon gesehen</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateMediaStatus({
                                  tmdbId: item.tmdbId,
                                  mediaType: item.mediaType,
                                  title: item.title,
                                  posterPath: item.posterPath,
                                  releaseYear: item.releaseYear,
                                  status: onMyWatchlist ? "NONE" : "WATCHLIST",
                                });
                              }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition flex items-center gap-1 w-full justify-center ${
                                onMyWatchlist
                                  ? "bg-sky-500 text-black border-sky-400"
                                  : "bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800"
                              }`}
                            >
                              <Plus className="w-3 h-3" />
                              <span>{onMyWatchlist ? "Auch auf deiner Liste ✓" : "Auch merken +"}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Friend's Recommendations */}
        {activeTab === "recommendations" && (
          <div className="space-y-4">
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
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-slate-400 font-semibold">
                            {rec.releaseYear || ""} • {rec.mediaType === "movie" ? "Film" : "Serie"}
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
      </div>
    </div>
  );
}
