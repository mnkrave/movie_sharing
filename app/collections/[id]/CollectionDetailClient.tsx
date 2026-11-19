"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { CollectionUniverse, CollectionMovie } from "@/lib/collections";
import type { AppCustomCollection } from "@/lib/store";
import { useMedia } from "@/components/MediaContext";
import { CustomCollectionModal } from "@/components/CustomCollectionModal";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Star,
  Check,
  Plus,
  CheckCircle2,
  Trophy,
  Sparkles,
  Film,
  Layers,
  Tv,
  Filter,
  Heart,
  MessageSquare,
  Send,
  Trash2,
  Edit3,
  Users,
  Lock,
  Globe,
  Clock,
  ShieldCheck,
  X,
} from "lucide-react";

interface CollectionDetailClientProps {
  collection: CollectionUniverse | null;
  customCollectionId?: string;
}

export function CollectionDetailClient({
  collection: staticCollection,
  customCollectionId,
}: CollectionDetailClientProps) {
  const { data: session } = useSession();
  const {
    communityData,
    customCollections,
    updateMediaStatus,
    openMediaModal,
    openRatingModal,
    upvoteCustomCollection,
    addCustomCollectionComment,
    deleteCustomCollectionComment,
    approveCustomCollection,
    showToast,
    confirmDialog,
  } = useMedia();

  const [filterMode, setFilterMode] = useState<"all" | "unwatched" | "watched">("all");
  const [selectedSubGroup, setSelectedSubGroup] = useState<string>("ALL");
  const [mediaTypeFilter, setMediaTypeFilter] = useState<"ALL" | "movie" | "tv">("ALL");
  const [sortBy, setSortBy] = useState<"custom_order" | "year_asc" | "rating_desc">("custom_order");
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const myId = (session?.user as any)?.id;
  const myName = session?.user?.name;
  const isAdmin =
    session?.user?.email?.toLowerCase() === "lukasreinle0@gmail.com" ||
    (session?.user as any)?.role === "ADMIN";

  // Find custom collection if staticCollection is null
  const customCollection: AppCustomCollection | undefined = useMemo(() => {
    if (staticCollection) return undefined;
    return customCollections.find((c) => c.id === customCollectionId);
  }, [staticCollection, customCollections, customCollectionId]);

  const activeCollection: CollectionUniverse | null = useMemo(() => {
    if (staticCollection) return staticCollection;
    if (!customCollection) return null;
    return {
      id: customCollection.id,
      name: customCollection.name,
      tagline: customCollection.tagline,
      description: customCollection.description,
      category: "franchise",
      posterPath: customCollection.posterPath,
      backdropPath: customCollection.backdropPath,
      movies: customCollection.movies.map((m) => ({
        id: m.id,
        title: m.title,
        releaseYear: m.releaseYear,
        posterPath: m.posterPath,
        voteAverage: m.voteAverage,
        mediaType: m.mediaType || "movie",
      })),
    };
  }, [staticCollection, customCollection]);

  // Map of watched movies by current user
  const myWatchedMap = useMemo(() => {
    const map = new Map<number, { rating?: number | null }>();
    communityData.mediaStatuses.forEach((m) => {
      if (m.status === "WATCHED") {
        if ((myId && m.userId === myId) || (myName && m.userName === myName)) {
          map.set(m.tmdbId, { rating: m.rating });
        }
      }
    });
    return map;
  }, [communityData.mediaStatuses, myId, myName]);

  // Set of watchlist movies by current user
  const myWatchlistSet = useMemo(() => {
    const set = new Set<number>();
    communityData.mediaStatuses.forEach((m) => {
      if (m.status === "WATCHLIST") {
        if ((myId && m.userId === myId) || (myName && m.userName === myName)) {
          set.add(m.tmdbId);
        }
      }
    });
    return set;
  }, [communityData.mediaStatuses, myId, myName]);

  const moviesList = activeCollection?.movies || [];

  // SubGroups (e.g. Actors for Bond, Phases for Marvel)
  const availableSubGroups = useMemo(() => {
    const counts: Record<string, number> = {};
    moviesList.forEach((m) => {
      if (m.subGroup) {
        counts[m.subGroup] = (counts[m.subGroup] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [moviesList]);

  const hasTvSeries = useMemo(() => {
    return moviesList.some((m) => m.mediaType === "tv");
  }, [moviesList]);

  const movieCount = moviesList.filter((m) => (m.mediaType || "movie") === "movie").length;
  const tvCount = moviesList.filter((m) => m.mediaType === "tv").length;

  // Progress stats
  const totalCount = moviesList.length;
  const watchedCount = moviesList.filter((m) => myWatchedMap.has(m.id)).length;
  const remainingCount = totalCount - watchedCount;
  const percent = totalCount > 0 ? Math.round((watchedCount / totalCount) * 100) : 0;
  const isComplete = totalCount > 0 && percent === 100;

  // Sorted and filtered movies
  const displayedMovies = useMemo(() => {
    let list = [...moviesList];

    if (filterMode === "unwatched") {
      list = list.filter((m) => !myWatchedMap.has(m.id));
    } else if (filterMode === "watched") {
      list = list.filter((m) => myWatchedMap.has(m.id));
    }

    if (selectedSubGroup !== "ALL") {
      list = list.filter((m) => m.subGroup === selectedSubGroup);
    }

    if (mediaTypeFilter !== "ALL") {
      list = list.filter((m) => (m.mediaType || "movie") === mediaTypeFilter);
    }

    if (sortBy === "year_asc") {
      list.sort((a, b) => (parseInt(a.releaseYear) || 0) - (parseInt(b.releaseYear) || 0));
    } else if (sortBy === "rating_desc") {
      list.sort((a, b) => b.voteAverage - a.voteAverage);
    }

    return list;
  }, [moviesList, filterMode, selectedSubGroup, mediaTypeFilter, sortBy, myWatchedMap]);

  if (!activeCollection) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
          <Layers className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white">Kollektion wird geladen oder ist privat</h2>
        <p className="text-sm text-slate-400">
          Falls es sich um eine private oder für Freunde geteilte Kollektion handelt, logge dich bitte ein.
        </p>
        <Link
          href="/collections"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 text-black font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Zurück zu den Kollektionen</span>
        </Link>
      </div>
    );
  }

  const isCustom = Boolean(customCollection);
  const isMine =
    customCollection &&
    ((myId && customCollection.ownerId === myId) ||
      (myName && customCollection.ownerName.toLowerCase() === myName.toLowerCase()));
  const hasUpvoted =
    customCollection && myId ? customCollection.upvoterIds.includes(myId) : false;

  const handleToggleWatched = (movie: CollectionMovie, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session) {
      showToast("Bitte logge dich ein, um Filme als gesehen zu markieren!", {
        type: "info",
        actionLabel: "Einloggen",
        actionHref: "/login",
      });
      return;
    }
    const watchedInfo = myWatchedMap.get(movie.id);
    openRatingModal({
      tmdbId: movie.id,
      mediaType: movie.mediaType || "movie",
      title: movie.title,
      posterPath: movie.posterPath,
      releaseYear: movie.releaseYear,
      currentRating: watchedInfo?.rating,
      isWatched: !!watchedInfo,
    });
  };

  const handleToggleWatchlist = async (movie: CollectionMovie, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session) {
      showToast("Bitte logge dich ein, um Filme auf deiner Watchlist zu speichern!", {
        type: "info",
        actionLabel: "Einloggen",
        actionHref: "/login",
      });
      return;
    }
    const isOnWatchlist = myWatchlistSet.has(movie.id);
    await updateMediaStatus({
      tmdbId: movie.id,
      mediaType: movie.mediaType || "movie",
      title: movie.title,
      posterPath: movie.posterPath,
      releaseYear: movie.releaseYear,
      status: isOnWatchlist ? "NONE" : "WATCHLIST",
    });
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCollection || !commentText.trim() || submittingComment) return;
    if (!session) {
      showToast("Bitte logge dich ein, um zu kommentieren!", {
        type: "info",
        actionLabel: "Einloggen",
        actionHref: "/login",
      });
      return;
    }
    setSubmittingComment(true);
    await addCustomCollectionComment(customCollection.id, commentText.trim());
    setCommentText("");
    setSubmittingComment(false);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 pb-24">
      {/* Hero Header with Backdrop */}
      <div className="relative border-b border-slate-800/80 bg-slate-950 overflow-hidden">
        {activeCollection.backdropPath && (
          <div className="absolute inset-0 z-0">
            <Image
              src={`https://image.tmdb.org/t/p/w1280${activeCollection.backdropPath}`}
              alt={activeCollection.name}
              fill
              priority
              className="object-cover opacity-25 filter blur-xs"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/80 to-transparent" />
          </div>
        )}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10">
          {/* Top navigation & edit button */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <Link
              href="/collections"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Zurück zu allen Kollektionen</span>
            </Link>

            {customCollection && (isMine || isAdmin) && (
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Kollektion bearbeiten</span>
              </button>
            )}
          </div>

          {/* Admin Approval Bar if Pending */}
          {customCollection &&
            isAdmin &&
            customCollection.visibility === "PUBLIC" &&
            customCollection.approvalStatus === "PENDING" && (
              <div className="mb-6 p-4 rounded-2xl bg-amber-950/50 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-amber-200 font-bold">
                  <ShieldCheck className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <span>
                    @{customCollection.ownerName} möchte diese Kollektion öffentlich mit allen teilen. Jetzt freigeben?
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      await approveCustomCollection(customCollection.id, "REJECTED");
                      showToast("Öffentliche Freigabe abgelehnt.", { type: "info" });
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-300 text-xs font-bold border border-rose-500/30 flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Ablehnen</span>
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await approveCustomCollection(customCollection.id, "APPROVED");
                      showToast("Kollektion ist jetzt für alle freigegeben!", { type: "success" });
                    }}
                    className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black flex items-center gap-1 shadow cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Freigeben (Approve)</span>
                  </button>
                </div>
              </div>
            )}

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {customCollection ? (
                  <>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md bg-emerald-950/70 border border-emerald-500/40 text-emerald-300">
                      <span>{customCollection.emoji}</span>
                      <span>Kollektion von @{customCollection.ownerName}</span>
                    </span>

                    {customCollection.visibility === "PRIVATE" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-900 border border-slate-700 text-slate-300">
                        <Lock className="w-3 h-3" />
                        <span>Privat (Nur für dich)</span>
                      </span>
                    )}

                    {customCollection.visibility === "FRIENDS" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-950/80 border border-indigo-500/40 text-indigo-300">
                        <Users className="w-3 h-3" />
                        <span>
                          {customCollection.targetType === "CUSTOM" &&
                          customCollection.targetNames?.length
                            ? `Geteilt mit: ${customCollection.targetNames.join(", ")}`
                            : "Mit Freunden geteilt"}
                        </span>
                      </span>
                    )}

                    {customCollection.visibility === "PUBLIC" && (
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                          customCollection.approvalStatus === "APPROVED"
                            ? "bg-purple-950/80 border-purple-500/40 text-purple-300"
                            : "bg-amber-950/80 border-amber-500/40 text-amber-300"
                        }`}
                      >
                        {customCollection.approvalStatus === "APPROVED" ? (
                          <>
                            <Globe className="w-3 h-3" />
                            <span>Öffentlich (Freigegeben)</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            <span>Wartet auf Lukas&apos; Freigabe</span>
                          </>
                        )}
                      </span>
                    )}
                  </>
                ) : (
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md border ${
                      activeCollection.category === "franchise"
                        ? "bg-purple-950/70 border-purple-500/40 text-purple-300"
                        : "bg-sky-950/70 border-sky-500/40 text-sky-300"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    {activeCollection.category === "franchise"
                      ? "Universum / Filmreihe"
                      : "Regisseur-Sammlung"}
                  </span>
                )}
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-bold text-slate-300">{totalCount} Titel</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                {customCollection ? `${customCollection.emoji} ` : ""}
                {activeCollection.name}
              </h1>
              {activeCollection.tagline && (
                <p className="mt-2 text-base text-amber-400/90 font-medium italic">
                  &quot;{activeCollection.tagline}&quot;
                </p>
              )}
              <p className="mt-3 text-sm text-slate-300 leading-relaxed max-w-2xl">
                {activeCollection.description}
              </p>

              {/* Like & Comment Quick Buttons for Custom Collections */}
              {customCollection && (
                <div className="flex flex-wrap items-center gap-3 mt-5">
                  <button
                    type="button"
                    onClick={() => upvoteCustomCollection(customCollection.id)}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 border transition cursor-pointer ${
                      hasUpvoted
                        ? "bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/20"
                        : "bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-700"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${hasUpvoted ? "fill-white" : ""}`} />
                    <span>
                      {hasUpvoted ? "Gefällt dir" : "Kollektion liken"} ({customCollection.upvoterIds.length})
                    </span>
                  </button>

                  <a
                    href="#comments"
                    className="px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 transition"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span>Kommentare ({customCollection.comments.length})</span>
                  </a>
                </div>
              )}
            </div>

            {/* Giant Progress Card */}
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800/90 shadow-2xl backdrop-blur-xl w-full lg:w-96 lg:flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {isComplete ? (
                    <Trophy className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Sparkles className="w-5 h-5 text-amber-400" />
                  )}
                  <h3 className="text-sm font-bold text-white">Dein Fortschritt</h3>
                </div>
                <span
                  className={`text-2xl font-black font-mono ${
                    isComplete
                      ? "text-emerald-400"
                      : percent > 0
                      ? "text-amber-400"
                      : "text-slate-500"
                  }`}
                >
                  {percent}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60 shadow-inner">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isComplete
                      ? "bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-300 shadow-lg shadow-emerald-500/50"
                      : percent > 0
                      ? "bg-gradient-to-r from-amber-500 to-amber-300 shadow-md shadow-amber-500/30"
                      : "bg-transparent"
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              {/* Sub stats */}
              <div className="flex items-center justify-between text-xs text-slate-300 mt-3 pt-3 border-t border-slate-800/80 font-medium">
                <span>
                  <strong className="text-white">{watchedCount}</strong> von {totalCount} gesehen
                </span>
                <span>
                  {isComplete ? (
                    <span className="text-emerald-400 font-bold">100% komplett! 🏆</span>
                  ) : (
                    <span>
                      Noch <strong>{remainingCount}</strong> übrig
                    </span>
                  )}
                </span>
              </div>

              {/* Motivation quote */}
              <p className="text-[11px] text-slate-400 mt-2.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60 leading-tight">
                {isComplete
                  ? "Meisterleistung! Du hast jeden einzelnen Titel dieser Kollektion gesehen."
                  : watchedCount > 0
                  ? `Stark! Dir fehlen nur noch ${remainingCount} Titel bis zur Komplettierung.`
                  : "Du hast noch keinen Titel dieser Kollektion als gesehen markiert."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Sorting Toolbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-4">
        {/* Row 1: Status Filter & Media Type & Sort */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-2.5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            {/* Status Filter */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none max-w-full">
              <button
                type="button"
                onClick={() => setFilterMode("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex-shrink-0 ${
                  filterMode === "all"
                    ? "bg-amber-500 text-black shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Alle ({totalCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("unwatched")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex-shrink-0 ${
                  filterMode === "unwatched"
                    ? "bg-amber-500 text-black shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                ⏳ Ungesehen ({remainingCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("watched")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex-shrink-0 ${
                  filterMode === "watched"
                    ? "bg-emerald-500 text-black shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                ✓ Gesehen ({watchedCount})
              </button>
            </div>

            {/* Optional Type Filter for collections with series */}
            {hasTvSeries && (
              <div className="flex items-center gap-1 sm:pl-2 sm:border-l sm:border-slate-800 overflow-x-auto scrollbar-none max-w-full">
                <button
                  type="button"
                  onClick={() => setMediaTypeFilter("ALL")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    mediaTypeFilter === "ALL"
                      ? "bg-slate-700 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Alles
                </button>
                <button
                  type="button"
                  onClick={() => setMediaTypeFilter("movie")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                    mediaTypeFilter === "movie"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Film className="w-3 h-3" />
                  <span>Filme ({movieCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMediaTypeFilter("tv")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                    mediaTypeFilter === "tv"
                      ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Tv className="w-3 h-3" />
                  <span>Serien ({tvCount})</span>
                </button>
              </div>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 pr-2">
            <span className="text-xs text-slate-400">Sortieren:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
            >
              <option value="custom_order">Reihenfolge der Kollektion</option>
              <option value="year_asc">Chronologisch (Erscheinungsjahr)</option>
              <option value="rating_desc">Höchstbewertet (TMDB / IMDb)</option>
            </select>
          </div>
        </div>

        {/* Row 2: SubGroup Pills */}
        {availableSubGroups.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 pr-2 flex-shrink-0">
              <Filter className="w-3.5 h-3.5 text-amber-400" />
              <span>{activeCollection.subGroupLabel || "Filter"}:</span>
            </div>

            <button
              type="button"
              onClick={() => setSelectedSubGroup("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedSubGroup === "ALL"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              Alle ({totalCount})
            </button>

            {availableSubGroups.map(({ name, count }) => (
              <button
                key={name}
                type="button"
                onClick={() => setSelectedSubGroup(name)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                  selectedSubGroup === name
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <span>{name}</span>
                <span className="text-[10px] font-mono text-slate-500">({count})</span>
              </button>
            ))}
          </div>
        )}

        {/* Movies Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 pt-2">
          {displayedMovies.map((movie, idx) => {
            const watchedData = myWatchedMap.get(movie.id);
            const isWatched = myWatchedMap.has(movie.id);
            const isOnWatchlist = myWatchlistSet.has(movie.id);
            const isTv = movie.mediaType === "tv";

            return (
              <div
                key={`${movie.mediaType || "movie"}_${movie.id}`}
                onClick={() =>
                  openMediaModal({
                    id: movie.id,
                    mediaType: movie.mediaType || "movie",
                    title: movie.title,
                    posterPath: movie.posterPath,
                  })
                }
                className="group relative cursor-pointer flex flex-col rounded-2xl overflow-hidden bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/40 hover:-translate-y-1.5 transition duration-300 shadow-md hover:shadow-2xl"
              >
                {/* Poster Container */}
                <div className="relative aspect-[2/3] w-full bg-slate-950 overflow-hidden">
                  {movie.posterPath ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                      alt={movie.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      className="object-cover group-hover:scale-105 transition duration-500 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-slate-600">
                      {isTv ? <Tv className="w-8 h-8 mb-2" /> : <Film className="w-8 h-8 mb-2" />}
                      <span className="text-xs">{movie.title}</span>
                    </div>
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition" />

                  {/* Order index */}
                  <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 text-[10px] font-black text-amber-400 font-mono">
                    #{idx + 1}
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 text-[10px] font-bold text-amber-300">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{movie.voteAverage}</span>
                  </div>

                  {/* Watched / Watchlist Status Tag */}
                  {isWatched && (
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-emerald-500/90 backdrop-blur-md text-black font-bold text-xs py-1 px-2 rounded-lg flex items-center justify-center gap-1.5 shadow-lg">
                      <Check className="w-3.5 h-3.5" />
                      <span>Gesehen {watchedData?.rating ? `(${watchedData.rating}/10)` : "✓"}</span>
                    </div>
                  )}

                  {!isWatched && isOnWatchlist && (
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-emerald-500/95 backdrop-blur-md text-black font-black text-xs py-1 px-2 rounded-lg flex items-center justify-center gap-1.5 shadow-lg">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Auf deiner Merkliste</span>
                    </div>
                  )}
                </div>

                {/* Metadata & Quick Action Bar */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-400 transition line-clamp-1 leading-snug">
                      {movie.title}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                      {isTv ? (
                        <span className="text-[10px] uppercase font-bold text-sky-400">Serie</span>
                      ) : (
                        <span>{movie.releaseYear}</span>
                      )}
                      {movie.subGroup && (
                        <>
                          <span>•</span>
                          <span className="truncate text-slate-300 font-medium">
                            {movie.subGroup}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Quick Action buttons */}
                  <div className="flex items-center gap-1 mt-3 pt-2 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={(e) => handleToggleWatched(movie, e)}
                      title={
                        isWatched
                          ? "Als ungesehen markieren"
                          : "Als gesehen markieren & bewerten"
                      }
                      className={`flex-1 py-2 sm:py-1 rounded-lg text-[11px] sm:text-[10px] font-bold flex items-center justify-center gap-1 transition ${
                        isWatched
                          ? "bg-emerald-500 text-black shadow-sm"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                      }`}
                    >
                      <Check className="w-3 h-3" />
                      <span>{isWatched ? "Gesehen" : "Gesehen?"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleToggleWatchlist(movie, e)}
                      title={isOnWatchlist ? "Von Merkliste entfernen" : "Auf Merkliste setzen"}
                      className={`py-2 sm:py-1 px-2.5 sm:px-2 rounded-lg text-[11px] sm:text-[10px] font-bold flex items-center justify-center gap-1 transition ${
                        isOnWatchlist
                          ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20 ring-1 ring-emerald-400"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                      }`}
                    >
                      {isOnWatchlist ? (
                        <Check className="w-3 h-3 stroke-[2.5]" />
                      ) : (
                        <Plus className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comments & Likes Section for Custom/Friend Collections */}
        {isCustom && customCollection && (
          <div
            id="comments"
            className="mt-12 p-5 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                  <span>
                    Kommentare & Diskussion ({customCollection.comments.length})
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tauscht euch über die Kollektion von @{customCollection.ownerName} aus oder gebt Tipps für weitere Filme!
                </p>
              </div>

              <button
                type="button"
                onClick={() => upvoteCustomCollection(customCollection.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 border transition self-start cursor-pointer ${
                  hasUpvoted
                    ? "bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/20"
                    : "bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800"
                }`}
              >
                <Heart className={`w-4 h-4 ${hasUpvoted ? "fill-white" : ""}`} />
                <span>{customCollection.upvoterIds.length} Likes</span>
              </button>
            </div>

            {/* Comments list */}
            {customCollection.comments.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-950/50 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                Noch keine Kommentare zu dieser Kollektion. Schreib als Erste(r), wie dir die Auswahl von @{customCollection.ownerName} gefällt!
              </div>
            ) : (
              <div className="space-y-3">
                {customCollection.comments.map((c) => {
                  const isMyComment =
                    (myId && c.userId === myId) ||
                    (myName && c.userName.toLowerCase() === myName.toLowerCase());

                  return (
                    <div
                      key={c.id}
                      className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 ${
                        isMyComment
                          ? "bg-emerald-950/20 border-emerald-500/30"
                          : "bg-slate-950/80 border-slate-800"
                      }`}
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-white">@{c.userName}</span>
                          {c.userId === customCollection.ownerId && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                              Ersteller
                            </span>
                          )}
                          <span className="text-[10px] text-slate-500">
                            {new Date(c.createdAt).toLocaleDateString("de-DE", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                          {c.text}
                        </p>
                      </div>

                      {(isMyComment || isMine || isAdmin) && (
                        <button
                          type="button"
                          onClick={async () => {
                            const ok = await confirmDialog({
                              title: "Kommentar löschen?",
                              message: "Möchtest du diesen Kommentar wirklich löschen?",
                              confirmLabel: "Löschen",
                              dangerous: true,
                            });
                            if (ok) {
                              await deleteCustomCollectionComment(customCollection.id, c.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition cursor-pointer"
                          title="Kommentar löschen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={`Kommentar oder Filmvorschlag an @${customCollection.ownerName} schreiben...`}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-400 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!commentText.trim() || submittingComment}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black font-black text-xs flex items-center justify-center gap-1.5 shadow cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submittingComment ? "Sende..." : "Kommentieren"}</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Edit Custom Collection Modal */}
      {customCollection && (
        <CustomCollectionModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          editingCollection={customCollection}
        />
      )}
    </div>
  );
}
