"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useMedia } from "@/components/MediaContext";
import { useSession } from "next-auth/react";
import Image from "next/image";
import {
  Sparkles,
  Star,
  ThumbsUp,
  Globe2,
  Film,
  Tv,
  Plus,
  MessageSquare,
  User,
  Users,
  Check,
  RotateCcw,
} from "lucide-react";
import type { BatchMediaMeta } from "@/app/api/tmdb/batch-genres/route";

export default function FeedPage() {
  const { data: session } = useSession();
  const {
    communityData,
    upvoteRecommendation,
    openMediaModal,
    openSearch,
    userSubscriptions,
    currentUserAvatar,
  } = useMedia();

  // Filter States: Default is "FRIENDS", "hideWatched = true", "onlyStreamable = true"
  const [filterType, setFilterType] = useState<"ALL" | "movie" | "tv">("ALL");
  const [authorFilter, setAuthorFilter] = useState<"ALL" | "FRIENDS" | "TARGETED" | "MINE">("FRIENDS");
  const [hideWatched, setHideWatched] = useState<boolean>(true);
  const [onlyStreamable, setOnlyStreamable] = useState<boolean>(true);
  const [selectedTag, setSelectedTag] = useState<string>("ALL");

  const [metaMap, setMetaMap] = useState<Record<string, BatchMediaMeta>>({});

  const myUserId = (session?.user as any)?.id;
  const myName = session?.user?.name;
  const myEmail = session?.user?.email?.toLowerCase();

  const isMe = (userId?: string | null, userName?: string | null, userEmail?: string | null) => {
    if (myUserId && userId && userId === myUserId) return true;
    if (myName && userName && userName.toLowerCase() === myName.toLowerCase()) return true;
    if (myEmail && userEmail && userEmail.toLowerCase() === myEmail) return true;
    return false;
  };

  const hasMyWatched = (tmdbId: number, mediaType: "movie" | "tv") => {
    return communityData.mediaStatuses.some(
      (m) =>
        m.tmdbId === tmdbId &&
        m.mediaType === mediaType &&
        m.status === "WATCHED" &&
        isMe(m.userId, m.userName, (m as any).userEmail)
    );
  };

  const isStreamableOnMySubs = (tmdbId: number, mediaType: "movie" | "tv") => {
    const meta = metaMap[`${mediaType}_${tmdbId}`];
    // If metadata not yet fetched from TMDB, don't hide prematurely
    if (!meta) return true;
    if (!meta.providersDE || meta.providersDE.length === 0) return false;
    if (userSubscriptions.length === 0) return meta.hasFlatrateDE ?? false;
    return userSubscriptions.some((sub) => meta.providersDE?.includes(sub));
  };

  // Batch fetch watch providers and genres for all recommendations in feed
  useEffect(() => {
    if (communityData.recommendations.length === 0) return;

    const itemsToFetch = communityData.recommendations
      .filter((r) => !metaMap[`${r.mediaType}_${r.tmdbId}`])
      .map((r) => ({ id: r.tmdbId, type: r.mediaType }));

    if (itemsToFetch.length === 0) return;

    fetch("/api/tmdb/batch-genres", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: itemsToFetch }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.meta) {
          setMetaMap((prev) => ({ ...prev, ...data.meta }));
        }
      })
      .catch((err) => console.error("Failed to fetch feed metadata:", err));
  }, [communityData.recommendations, metaMap]);

  const movieCount = communityData.recommendations.filter((r) => r.mediaType === "movie").length;
  const tvCount = communityData.recommendations.filter((r) => r.mediaType === "tv").length;

  const myRecCount = communityData.recommendations.filter((r) =>
    isMe(r.userId, r.userName, (r as any).userEmail)
  ).length;

  const friendsRecCount = communityData.recommendations.length - myRecCount;

  const targetedToMeCount = communityData.recommendations.filter((r) => {
    const isMine = isMe(r.userId, r.userName, (r as any).userEmail);
    if (isMine) return false;
    return r.targetType !== "ALL" && ((r.targetNames && r.targetNames.length > 0) || (r.targetGroupIds && r.targetGroupIds.length > 0));
  }).length;

  const GENRE_TAGS = [
    { key: "ALL", label: "Alle Genres & Tags" },
    { key: "Action", label: "💥 Action" },
    { key: "Abenteuer", label: "🗺️ Abenteuer" },
    { key: "Animation", label: "✨ Animation" },
    { key: "Comedy", label: "😂 Comedy / Komödie" },
    { key: "Krimi", label: "🕵️ Krimi" },
    { key: "Drama", label: "🎭 Drama" },
    { key: "Fantasy", label: "🧙‍♂️ Fantasy" },
    { key: "Horror", label: "🩸 Horror" },
    { key: "Sci-Fi", label: "🚀 Sci-Fi" },
    { key: "Thriller", label: "😱 Thriller" },
    { key: "Doku", label: "🎥 Doku" },
    { key: "Mindfuck", label: "🤯 Mindfuck" },
    { key: "Muss", label: "🔥 Must-Watch" },
    { key: "Oscar", label: "🏆 Oscar" },
  ];

  const filteredRecommendations = useMemo(() => {
    return communityData.recommendations.filter((rec) => {
      // 1. Media Type Filter (Film vs Serie)
      if (filterType !== "ALL" && rec.mediaType !== filterType) {
        return false;
      }

      // 2. Author & Target Filter
      const isMine = isMe(rec.userId, rec.userName, (rec as any).userEmail);
      if (authorFilter === "MINE" && !isMine) return false;
      if (authorFilter === "FRIENDS" && isMine) return false;
      if (authorFilter === "TARGETED") {
        if (isMine) return false;
        const hasTarget =
          rec.targetType !== "ALL" &&
          ((rec.targetNames && rec.targetNames.length > 0) ||
            (rec.targetGroupIds && rec.targetGroupIds.length > 0));
        if (!hasTarget) return false;
      }

      // 3. Watched Filter (Standard: Noch nicht gesehen)
      if (hideWatched && hasMyWatched(rec.tmdbId, rec.mediaType)) {
        return false;
      }

      // 4. Streaming Provider Filter (Standard: Im Abo streambar)
      if (onlyStreamable && !isStreamableOnMySubs(rec.tmdbId, rec.mediaType)) {
        return false;
      }

      // 5. Genre / Tag Filter
      if (selectedTag !== "ALL") {
        const query = selectedTag.toLowerCase();
        const hasTag = rec.tags.some((t) => t.toLowerCase().includes(query));
        const inComment = rec.comment ? rec.comment.toLowerCase().includes(query) : false;
        if (!hasTag && !inComment) return false;
      }

      return true;
    });
  }, [
    communityData.recommendations,
    filterType,
    authorFilter,
    hideWatched,
    onlyStreamable,
    selectedTag,
    myUserId,
    myName,
    myEmail,
    communityData.mediaStatuses,
    metaMap,
    userSubscriptions,
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-rose-950/40 via-slate-900 to-[#0e1320] border border-rose-500/20 shadow-xl">
        <div className="space-y-1 max-w-md">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Community-Feed
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Empfehlungen von Freunden
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Finde heraus, was deine Freunde gerade feiern und wo du es mit Streaming oder VPN schauen kannst.
          </p>
        </div>

        {/* Top-Right Action */}
        <div className="flex items-center justify-end w-full lg:w-auto">
          <button
            type="button"
            onClick={openSearch}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-black font-bold text-xs transition shadow-lg shadow-rose-500/20 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Titel empfehlen</span>
          </button>
        </div>
      </div>

      {/* Filter Bar: Format, Author, Smart Filters & Genre Tags */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 shadow-xl">
        {/* Row 1: Format & Author Switchers */}
        <div className="flex flex-wrap items-center justify-between gap-3.5">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {/* Format Filter (Alle vs Filme vs Serien) */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Format:
              </span>
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setFilterType("ALL")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    filterType === "ALL"
                      ? "bg-rose-500 text-white shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Alle ({communityData.recommendations.length})
                </button>

                <button
                  type="button"
                  onClick={() => setFilterType("movie")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    filterType === "movie"
                      ? "bg-amber-500 text-black shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>Filme ({movieCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFilterType("tv")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    filterType === "tv"
                      ? "bg-cyan-500 text-black shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span>Serien ({tvCount})</span>
                </button>
              </div>
            </div>

            {/* Author Switcher (Standard: Von Freunden) */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Ansicht:
              </span>
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setAuthorFilter("FRIENDS")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    authorFilter === "FRIENDS"
                      ? "bg-rose-500 text-white shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Von Freunden ({friendsRecCount})</span>
                </button>

                {targetedToMeCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setAuthorFilter("TARGETED")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      authorFilter === "TARGETED"
                        ? "bg-purple-500 text-black shadow font-extrabold"
                        : "text-purple-300 hover:text-white"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>An mich & Gruppen ({targetedToMeCount})</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setAuthorFilter("ALL")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    authorFilter === "ALL"
                      ? "bg-slate-800 text-white shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Alle ({communityData.recommendations.length})
                </button>

                <button
                  type="button"
                  onClick={() => setAuthorFilter("MINE")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    authorFilter === "MINE"
                      ? "bg-amber-500 text-black shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Meine ({myRecCount})</span>
                </button>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            {filteredRecommendations.length}{" "}
            {filteredRecommendations.length === 1 ? "Empfehlung" : "Empfehlungen"} gefunden
          </div>
        </div>

        {/* Row 2: Standard Smart-Filter (Noch nicht gesehen & Im Abo streambar) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
              Filter:
            </span>

            {/* Toggle: Noch nicht gesehen */}
            <button
              type="button"
              onClick={() => setHideWatched(!hideWatched)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                hideWatched
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-sm"
                  : "bg-slate-950/60 border-slate-800 text-slate-500 hover:text-slate-300"
              }`}
              title="Filtert Titel heraus, die du bereits selbst gesehen hast"
            >
              <Check className={`w-3.5 h-3.5 ${hideWatched ? "text-emerald-400" : "text-slate-600"}`} />
              <span>Noch nicht gesehen</span>
            </button>

            {/* Toggle: Im Abo streambar */}
            <button
              type="button"
              onClick={() => setOnlyStreamable(!onlyStreamable)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                onlyStreamable
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-sm"
                  : "bg-slate-950/60 border-slate-800 text-slate-500 hover:text-slate-300"
              }`}
              title="Zeigt nur Empfehlungen, die du mit deinen Streaming-Abos sofort schauen kannst"
            >
              <Tv className={`w-3.5 h-3.5 ${onlyStreamable ? "text-amber-400" : "text-slate-600"}`} />
              <span>
                Im Abo streambar
                {userSubscriptions.length > 0 && ` (${userSubscriptions.length} Abos)`}
              </span>
            </button>
          </div>

          {(hideWatched || onlyStreamable) && (
            <span className="text-[11px] text-slate-500 font-mono">
              ⚡ Standard-Filter aktiv
            </span>
          )}
        </div>

        {/* Row 3: Genre & Tag Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-2 border-t border-slate-800/60">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mr-1 flex-shrink-0">
            Genre / Typ:
          </span>
          {GENRE_TAGS.map((tag) => (
            <button
              key={tag.key}
              onClick={() => setSelectedTag(tag.key)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedTag === tag.key
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold"
                  : "bg-slate-950/60 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feed List */}
      {filteredRecommendations.length > 0 ? (
        <div className="space-y-6">
          {filteredRecommendations.map((rec) => {
            const isUpvoted = rec.upvoterIds.includes(myUserId || "");
            const isMyOwn = isMe(rec.userId, rec.userName, (rec as any).userEmail);
            const isWatchedByMe = hasMyWatched(rec.tmdbId, rec.mediaType);
            const itemMeta = metaMap[`${rec.mediaType}_${rec.tmdbId}`];

            return (
              <div
                key={rec.id}
                className={`p-5 sm:p-6 rounded-3xl border transition shadow-lg flex flex-col sm:flex-row gap-5 ${
                  isMyOwn
                    ? "bg-gradient-to-br from-slate-900/90 to-[#121828] border-amber-500/30"
                    : "bg-slate-900/70 border-slate-800 hover:border-slate-700"
                }`}
              >
                {/* Poster Thumbnail */}
                <div
                  onClick={() =>
                    openMediaModal({
                      id: rec.tmdbId,
                      mediaType: rec.mediaType,
                      title: rec.title,
                      posterPath: rec.posterPath,
                    })
                  }
                  className="w-24 sm:w-28 aspect-[2/3] rounded-2xl overflow-hidden bg-slate-800 flex-shrink-0 cursor-pointer relative shadow-md group"
                >
                  {rec.posterPath ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w342${rec.posterPath}`}
                      alt={rec.title}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-300"
                      sizes="112px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <Film className="w-6 h-6" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[10px] font-bold">
                    Öffnen
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* User & Rating Header */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Link
                        href={isMyOwn ? "/profile" : `/friends/${encodeURIComponent(rec.userId || rec.userName)}`}
                        className="flex items-center gap-2.5 group hover:opacity-95 transition-opacity"
                        title={isMyOwn ? "Dein Profil aufrufen" : `Profil von ${rec.userName} ansehen`}
                      >
                        {(() => {
                          const authorImg = isMyOwn
                            ? currentUserAvatar || rec.userImage
                            : rec.userImage ||
                              communityData.friends.find(
                                (f) => f.name === rec.userName || f.id === rec.userId
                              )?.image;

                          return authorImg ? (
                            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-amber-500/40 flex-shrink-0 shadow group-hover:border-amber-400 transition-colors">
                              <Image
                                src={authorImg}
                                alt={rec.userName}
                                fill
                                sizes="32px"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-black font-extrabold text-xs shadow flex-shrink-0 group-hover:ring-2 group-hover:ring-amber-400 transition-all ${
                                isMyOwn
                                  ? "bg-amber-400"
                                  : "bg-gradient-to-tr from-amber-500 to-rose-500"
                              }`}
                            >
                              {rec.userName.slice(0, 1)}
                            </div>
                          );
                        })()}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                              {rec.userName}
                            </span>
                            {isMyOwn && (
                              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold border border-amber-500/30">
                                Du
                              </span>
                            )}
                            {isWatchedByMe && (
                              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-semibold border border-emerald-500/30">
                                Von dir gesehen ✓
                              </span>
                            )}
                            {rec.targetNames && rec.targetNames.length > 0 ? (
                              <span className="inline-flex items-center gap-1 text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-bold border border-purple-500/30">
                                <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                                <span>
                                  {rec.targetNames.some((t) => t.startsWith("@"))
                                    ? `Für ${rec.targetNames.join(", ")}`
                                    : isMyOwn
                                    ? `An ${rec.targetNames.join(", ")}`
                                    : `Speziell für dich!`}
                                </span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-medium border border-slate-700">
                                <Users className="w-2.5 h-2.5 text-slate-500" />
                                <span>Alle Freunde</span>
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500">
                            {new Date(rec.createdAt).toLocaleDateString("de-DE")}
                          </span>
                        </div>
                      </Link>

                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-extrabold text-sm">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{rec.rating}/10</span>
                      </div>
                    </div>

                    {/* Movie/TV Title */}
                    <div
                      onClick={() =>
                        openMediaModal({
                          id: rec.tmdbId,
                          mediaType: rec.mediaType,
                          title: rec.title,
                          posterPath: rec.posterPath,
                        })
                      }
                      className="cursor-pointer group inline-block"
                    >
                      <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition flex items-center gap-2">
                        {rec.title}
                        <span className="text-xs font-normal text-slate-400">
                          ({rec.releaseYear || "–"})
                        </span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {rec.mediaType === "tv" ? "Serie" : "Film"}
                        </span>
                      </h3>
                    </div>

                    {/* Comment (if provided) */}
                    {rec.comment ? (
                      <p className="text-sm text-slate-300 leading-relaxed mt-2 italic">
                        &quot;{rec.comment}&quot;
                      </p>
                    ) : null}

                    {/* Streaming Availability Badges (direct on card) */}
                    {itemMeta?.providerLogosDE && itemMeta.providerLogosDE.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-2">
                        <span className="text-[11px] text-slate-400 font-medium">Stream:</span>
                        {itemMeta.providerLogosDE.map((p) => {
                          const inMySubs = userSubscriptions.includes(p.key);
                          return (
                            <span
                              key={p.key}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${
                                inMySubs
                                  ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                                  : "bg-slate-800 border-slate-700 text-slate-300"
                              }`}
                            >
                              {p.logo && (
                                <Image
                                  src={`https://image.tmdb.org/t/p/w92${p.logo}`}
                                  alt={p.name}
                                  width={14}
                                  height={14}
                                  className="rounded"
                                />
                              )}
                              <span>{p.name}</span>
                              {inMySubs && <span className="text-amber-400 font-bold">✓</span>}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Tags */}
                    {rec.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {rec.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-0.5 rounded-lg text-xs bg-slate-800 text-slate-300 border border-slate-700/80"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions (Upvote + Check Streaming Button) */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() =>
                        openMediaModal({
                          id: rec.tmdbId,
                          mediaType: rec.mediaType,
                          title: rec.title,
                          posterPath: rec.posterPath,
                        })
                      }
                      className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition"
                    >
                      <Globe2 className="w-3.5 h-3.5" />
                      <span>Wo streamen? (DE & VPN prüfen)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => upvoteRecommendation(rec.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        isUpvoted
                          ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${isUpvoted ? "fill-white" : ""}`} />
                      <span>{rec.upvoterIds.length}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State with Helpful Context & 1-Click Buttons */
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <MessageSquare className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {authorFilter === "FRIENDS" && friendsRecCount === 0
                ? "Noch keine Empfehlungen von deinen Freunden"
                : "Keine Empfehlungen für diesen Filter"}
            </h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto mt-1">
              {authorFilter === "FRIENDS" && friendsRecCount === 0
                ? "Sobald deine Freunde Filme oder Serien empfehlen, erscheinen sie hier. Du kannst auch alle oder deine eigenen Empfehlungen ansehen."
                : "Passe die Filter an oder deaktiviere 'Noch nicht gesehen' / 'Im Abo streambar', um mehr Titel zu sehen."}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            {authorFilter === "FRIENDS" && (
              <>
                <button
                  type="button"
                  onClick={() => setAuthorFilter("ALL")}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
                >
                  Alle Empfehlungen ansehen ({communityData.recommendations.length})
                </button>
                {myRecCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setAuthorFilter("MINE")}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition"
                  >
                    Meine Empfehlungen ansehen ({myRecCount})
                  </button>
                )}
              </>
            )}

            {(hideWatched || onlyStreamable) && (
              <button
                type="button"
                onClick={() => {
                  setHideWatched(false);
                  setOnlyStreamable(false);
                  setAuthorFilter("ALL");
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-bold transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Filter zurücksetzen</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
