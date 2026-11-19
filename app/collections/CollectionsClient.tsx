"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { CollectionUniverse } from "@/lib/collections";
import type { AppCustomCollection } from "@/lib/store";
import { useMedia } from "@/components/MediaContext";
import { CustomCollectionModal } from "@/components/CustomCollectionModal";
import { useSession } from "next-auth/react";
import {
  Layers,
  Sparkles,
  Film,
  Search,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Plus,
  Users,
  Heart,
  MessageSquare,
  Lock,
  Globe,
  Clock,
  ShieldCheck,
  Check,
  X,
  Edit3,
} from "lucide-react";

interface CollectionsClientProps {
  collections: CollectionUniverse[];
}

export function CollectionsClient({ collections }: CollectionsClientProps) {
  const {
    communityData,
    customCollections,
    upvoteCustomCollection,
    approveCustomCollection,
    showToast,
  } = useMedia();
  const { data: session } = useSession();

  // Standard tabs: "all" (Franchises + Directors), "franchise", "director", plus "friends" (User & Friend Collections, NOT shown in standard "all" tab!)
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "franchise" | "director" | "friends"
  >("all");
  const [friendSubFilter, setFriendSubFilter] = useState<"ALL" | "MINE" | "SHARED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [editingCustomCol, setEditingCustomCol] = useState<AppCustomCollection | null>(null);

  const myId = (session?.user as any)?.id;
  const myName = session?.user?.name;
  const isAdmin =
    session?.user?.email?.toLowerCase() === "lukasreinle0@gmail.com" ||
    (session?.user as any)?.role === "ADMIN";

  // Set of watched tmdbIds by the current user
  const myWatchedIds = useMemo(() => {
    const set = new Set<number>();
    communityData.mediaStatuses.forEach((m) => {
      if (m.status === "WATCHED") {
        if ((myId && m.userId === myId) || (myName && m.userName === myName)) {
          set.add(m.tmdbId);
        }
      }
    });
    return set;
  }, [communityData.mediaStatuses, myId, myName]);

  // Overall stats for standard collections
  const overallStats = useMemo(() => {
    const allUniqueMovieIds = new Set<number>();
    collections.forEach((c) => c.movies.forEach((m) => allUniqueMovieIds.add(m.id)));

    let watchedTotal = 0;
    allUniqueMovieIds.forEach((id) => {
      if (myWatchedIds.has(id)) watchedTotal++;
    });

    const percent =
      allUniqueMovieIds.size > 0
        ? Math.round((watchedTotal / allUniqueMovieIds.size) * 100)
        : 0;
    return {
      totalMovies: allUniqueMovieIds.size,
      watchedMovies: watchedTotal,
      percent,
    };
  }, [collections, myWatchedIds]);

  // Filtered standard collections ("all" | "franchise" | "director")
  const filteredCollections = useMemo(() => {
    if (selectedCategory === "friends") return [];
    return collections.filter((col) => {
      if (selectedCategory !== "all" && col.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = col.name.toLowerCase().includes(query);
        const matchesDesc = col.description.toLowerCase().includes(query);
        const matchesMovie = col.movies.some((m) => m.title.toLowerCase().includes(query));
        return matchesName || matchesDesc || matchesMovie;
      }
      return true;
    });
  }, [collections, selectedCategory, searchQuery]);

  // Pending approvals for Admin (Lukas)
  const pendingApprovalCollections = useMemo(() => {
    if (!isAdmin) return [];
    return customCollections.filter(
      (c) => c.visibility === "PUBLIC" && c.approvalStatus === "PENDING"
    );
  }, [customCollections, isAdmin]);

  // Filtered custom/friend collections
  const filteredCustomCollections = useMemo(() => {
    return customCollections.filter((col) => {
      const isMine =
        (myId && col.ownerId === myId) ||
        (myName && col.ownerName.toLowerCase() === myName.toLowerCase());

      if (friendSubFilter === "MINE" && !isMine) return false;
      if (friendSubFilter === "SHARED" && isMine) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = col.name.toLowerCase().includes(query);
        const matchesDesc = col.description.toLowerCase().includes(query);
        const matchesOwner = col.ownerName.toLowerCase().includes(query);
        const matchesMovie = col.movies.some((m) => m.title.toLowerCase().includes(query));
        return matchesName || matchesDesc || matchesOwner || matchesMovie;
      }
      return true;
    });
  }, [customCollections, friendSubFilter, searchQuery, myId, myName]);

  const handleOpenCreate = () => {
    if (!session) {
      showToast("Bitte logge dich ein, um eigene Kollektionen zu erstellen!", {
        type: "info",
        actionLabel: "Einloggen",
        actionHref: "/login",
      });
      return;
    }
    setEditingCustomCol(null);
    setIsCreatorOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 pb-20">
      {/* Hero Header */}
      <div className="relative border-b border-slate-800/80 bg-gradient-to-b from-[#0f172a]/60 via-[#0a0f1d] to-[#07090e] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-3">
                <Layers className="w-3.5 h-3.5" />
                <span>Kino-Universen & Freunde-Kollektionen</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                Kollektionen & Universen
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-2xl">
                Tauche ein in die größten Film-Sagas, legendäre Regisseur-Werkschauen oder erstelle und teile deine eigenen persönlichen Kollektionen (z. B. Top Animes, Klassiker oder Mindfuck-Filme) mit deinen Freunden!
              </p>
            </div>

            {/* Right Action & Progress Area */}
            <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end gap-3 w-full md:w-auto">
              <button
                type="button"
                onClick={handleOpenCreate}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition hover:scale-105 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Eigene Kollektion erstellen</span>
              </button>

              {/* Total progress banner */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl w-full md:w-auto md:flex-shrink-0 md:min-w-[280px]">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    Dein Universen-Fortschritt
                  </span>
                  <span className="font-extrabold text-amber-400 font-mono text-sm">
                    {overallStats.percent}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-700 shadow-sm"
                    style={{ width: `${Math.min(100, Math.max(0, overallStats.percent))}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 font-medium">
                  <span>
                    {overallStats.watchedMovies} von {overallStats.totalMovies} Filmen gesehen
                  </span>
                  <span>{collections.length} Offizielle Listen</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs and Search */}
          <div className="mt-8 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-2xl border border-slate-800 overflow-x-auto scrollbar-none max-w-full">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedCategory === "all"
                    ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                ✨ Offizielle ({collections.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory("franchise")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedCategory === "franchise"
                    ? "bg-purple-500 text-white shadow-md shadow-purple-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                🪐 Filmreihen & Universen ({collections.filter((c) => c.category === "franchise").length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory("director")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedCategory === "director"
                    ? "bg-sky-500 text-black shadow-md shadow-sky-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                🎬 Regisseure & Schöpfer ({collections.filter((c) => c.category === "director").length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory("friends")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  selectedCategory === "friends"
                    ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-black"
                    : "text-emerald-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Von Freunden & Mir ({customCollections.length})</span>
                {pendingApprovalCollections.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black">
                    {pendingApprovalCollections.length} neu
                  </span>
                )}
              </button>
            </div>

            {/* Live Search */}
            <div className="relative w-full lg:w-auto lg:min-w-[280px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  selectedCategory === "friends"
                    ? "Freunde-Kollektion, Ersteller oder Film suchen..."
                    : "Kollektion oder Film suchen..."
                }
                className="w-full bg-slate-900/90 border border-slate-800 focus:border-amber-400 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Admin Approval Queue Banner (Only visible to Lukas when public collections await approval) */}
        {isAdmin && pendingApprovalCollections.length > 0 && (
          <div className="p-5 sm:p-6 rounded-3xl bg-amber-950/30 border border-amber-500/40 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 text-amber-300">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="text-sm sm:text-base font-black">
                  Admin-Freigabe: Öffentliche Kollektionen warten auf dein Approval ({pendingApprovalCollections.length})
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                Prüfe kurz den Inhalt, bevor die Kollektion für alle Nutzer öffentlich sichtbar wird.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pendingApprovalCollections.map((pCol) => (
                <div
                  key={pCol.id}
                  className="p-4 rounded-2xl bg-slate-950/90 border border-amber-500/30 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <Link
                        href={`/collections/${pCol.id}`}
                        className="text-sm font-black text-white hover:text-amber-400 transition flex items-center gap-1.5"
                      >
                        <span>{pCol.emoji}</span>
                        <span>{pCol.name}</span>
                      </Link>
                      <span className="text-[11px] font-bold text-amber-300">
                        von @{pCol.ownerName} • {pCol.movies.length} Titel
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">{pCol.description}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {pCol.movies.slice(0, 6).map((m) => (
                        <span
                          key={m.id}
                          className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300"
                        >
                          {m.title}
                        </span>
                      ))}
                      {pCol.movies.length > 6 && (
                        <span className="text-[10px] text-slate-500 self-center">
                          +{pCol.movies.length - 6} weitere
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                    <Link
                      href={`/collections/${pCol.id}`}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-800"
                    >
                      Ansehen
                    </Link>
                    <button
                      type="button"
                      onClick={async () => {
                        await approveCustomCollection(pCol.id, "REJECTED");
                        showToast(`Öffentliche Freigabe für „${pCol.name}“ abgelehnt.`, {
                          type: "info",
                        });
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-bold border border-rose-500/30 flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Ablehnen</span>
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await approveCustomCollection(pCol.id, "APPROVED");
                        showToast(`„${pCol.name}“ ist jetzt für alle freigegeben!`, {
                          type: "success",
                        });
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black flex items-center gap-1 shadow cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Für alle freigeben</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: VON FREUNDEN & MIR (User & Friend Custom Collections) */}
        {selectedCategory === "friends" ? (
          <div className="space-y-6">
            {/* Sub-header & Sub-filter bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-slate-900/60 border border-slate-800">
              <div className="space-y-0.5">
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  <span>Kollektionen von Freunden & dir</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Entdecke empfohlene Listen deiner Freunde (z. B. Lieblings-Animes, Kult-Klassiker), like & kommentiere sie oder erstelle eigene!
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setFriendSubFilter("ALL")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      friendSubFilter === "ALL"
                        ? "bg-emerald-500 text-black"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Alle ({customCollections.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFriendSubFilter("SHARED")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      friendSubFilter === "SHARED"
                        ? "bg-emerald-500 text-black"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Von Freunden
                  </button>
                  <button
                    type="button"
                    onClick={() => setFriendSubFilter("MINE")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      friendSubFilter === "MINE"
                        ? "bg-amber-500 text-black"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Meine Listen
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Neue Kollektion</span>
                </button>
              </div>
            </div>

            {filteredCustomCollections.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-dashed border-slate-800 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                  <Users className="w-7 h-7" />
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="text-lg font-black text-white">
                    Noch keine Freunde-Kollektionen hier
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Erstelle deine erste eigene Kollektion (z. B. „Meine Top 10 Anime-Klassiker“ oder „Beste Filme für den Freitagabend“) – nur für dich oder zum Teilen mit deinen Freunden!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Jetzt erste Kollektion erstellen</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCustomCollections.map((col) => {
                  const totalInCol = col.movies.length;
                  const watchedInCol = col.movies.filter((m) => myWatchedIds.has(m.id)).length;
                  const percentInCol =
                    totalInCol > 0 ? Math.round((watchedInCol / totalInCol) * 100) : 0;
                  const isComplete = totalInCol > 0 && percentInCol === 100;
                  const isMine =
                    (myId && col.ownerId === myId) ||
                    (myName && col.ownerName.toLowerCase() === myName.toLowerCase());
                  const hasUpvoted = myId ? col.upvoterIds.includes(myId) : false;

                  return (
                    <div
                      key={col.id}
                      className="group relative flex flex-col rounded-3xl overflow-hidden bg-slate-900/70 border border-slate-800/80 hover:border-emerald-500/40 transition duration-300 hover:-translate-y-1 shadow-lg hover:shadow-2xl"
                    >
                      {/* Backdrop Header */}
                      <Link
                        href={`/collections/${col.id}`}
                        className="relative h-48 w-full bg-slate-950 overflow-hidden block"
                      >
                        {col.backdropPath ? (
                          <Image
                            src={`https://image.tmdb.org/t/p/w780${col.backdropPath}`}
                            alt={col.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover group-hover:scale-105 transition duration-700 ease-out"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-900 flex items-center justify-center text-4xl">
                            {col.emoji}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-black/30" />

                        {/* Visibility & Creator Badge */}
                        <div className="absolute top-3.5 left-3.5 flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                            <span>{col.emoji}</span>
                            <span>Von @{col.ownerName}</span>
                          </span>

                          {col.visibility === "PRIVATE" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/90 border border-slate-700 text-slate-300">
                              <Lock className="w-2.5 h-2.5" />
                              <span>Privat</span>
                            </span>
                          )}

                          {col.visibility === "FRIENDS" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950/90 border border-indigo-500/40 text-indigo-300">
                              <Users className="w-2.5 h-2.5" />
                              <span>
                                {col.targetType === "CUSTOM" && col.targetNames?.length
                                  ? col.targetNames.slice(0, 2).join(", ")
                                  : "Freunde"}
                              </span>
                            </span>
                          )}

                          {col.visibility === "PUBLIC" && (
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                col.approvalStatus === "APPROVED"
                                  ? "bg-purple-950/90 border-purple-500/40 text-purple-300"
                                  : "bg-amber-950/90 border-amber-500/40 text-amber-300"
                              }`}
                            >
                              {col.approvalStatus === "APPROVED" ? (
                                <>
                                  <Globe className="w-2.5 h-2.5" />
                                  <span>Öffentlich</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-2.5 h-2.5" />
                                  <span>Wartet auf Freigabe</span>
                                </>
                              )}
                            </span>
                          )}
                        </div>

                        {/* Movie Count Badge */}
                        <div className="absolute top-3.5 right-3.5 bg-black/60 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full text-[11px] font-bold text-white">
                          {totalInCol} Titel
                        </div>

                        {/* Collection Title over Backdrop */}
                        <div className="absolute bottom-3 left-4 right-4">
                          <h3 className="text-xl font-black text-white tracking-tight group-hover:text-emerald-400 transition leading-snug">
                            {col.name}
                          </h3>
                          <p className="text-xs text-slate-300 font-medium truncate mt-0.5">
                            {col.tagline}
                          </p>
                        </div>
                      </Link>

                      {/* Body Content */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {col.description}
                        </p>

                        {/* Movie Poster Previews */}
                        <Link href={`/collections/${col.id}`} className="flex items-center gap-2 pt-1">
                          {col.movies.slice(0, 5).map((m) => (
                            <div
                              key={`${m.mediaType || "movie"}_${m.id}`}
                              className="w-10 h-14 rounded-lg overflow-hidden bg-slate-800 border border-slate-700/60 relative flex-shrink-0 shadow"
                            >
                              {m.posterPath ? (
                                <Image
                                  src={`https://image.tmdb.org/t/p/w154${m.posterPath}`}
                                  alt={m.title}
                                  fill
                                  sizes="40px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-slate-800" />
                              )}
                              {myWatchedIds.has(m.id) && (
                                <div className="absolute inset-0 bg-emerald-500/40 flex items-center justify-center">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-white fill-emerald-500" />
                                </div>
                              )}
                            </div>
                          ))}
                          {col.movies.length > 5 && (
                            <div className="w-8 h-14 rounded-lg bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-[11px] font-bold text-slate-400">
                              +{col.movies.length - 5}
                            </div>
                          )}
                        </Link>

                        {/* Live Progress Bar */}
                        <div className="pt-2 border-t border-slate-800/80">
                          <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                            <span className="text-slate-300 flex items-center gap-1.5">
                              {isComplete ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                              )}
                              <span className={isComplete ? "text-emerald-400 font-bold" : "text-slate-300"}>
                                {isComplete
                                  ? "Komplett gesehen! 🏆"
                                  : `${watchedInCol} von ${totalInCol} gesehen`}
                              </span>
                            </span>
                            <span
                              className={`font-mono font-bold text-xs ${
                                isComplete
                                  ? "text-emerald-400"
                                  : percentInCol > 0
                                  ? "text-amber-400"
                                  : "text-slate-500"
                              }`}
                            >
                              {percentInCol}%
                            </span>
                          </div>

                          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/40">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isComplete
                                  ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                                  : percentInCol > 0
                                  ? "bg-gradient-to-r from-amber-500 to-amber-400"
                                  : "bg-transparent"
                              }`}
                              style={{ width: `${percentInCol}%` }}
                            />
                          </div>
                        </div>

                        {/* Social Bar: Likes, Comments, Edit & View Link */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => upvoteCustomCollection(col.id)}
                              className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 border transition cursor-pointer ${
                                hasUpvoted
                                  ? "bg-rose-500/20 border-rose-500/50 text-rose-300"
                                  : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                              }`}
                              title="Kollektion liken"
                            >
                              <Heart
                                className={`w-3.5 h-3.5 ${hasUpvoted ? "fill-rose-400 text-rose-400" : ""}`}
                              />
                              <span>{col.upvoterIds.length}</span>
                            </button>

                            <Link
                              href={`/collections/${col.id}#comments`}
                              className="px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition"
                              title="Kommentare ansehen"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>{col.comments.length}</span>
                            </Link>

                            {(isMine || isAdmin) && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCustomCol(col);
                                  setIsCreatorOpen(true);
                                }}
                                className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-amber-400 transition cursor-pointer"
                                title="Kollektion bearbeiten"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <Link
                            href={`/collections/${col.id}`}
                            className="flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition"
                          >
                            <span>Öffnen</span>
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* STANDARD COLLECTIONS GRID (Franchises & Directors) */
          <>
            {filteredCollections.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 text-slate-400">
                <p className="text-base font-semibold text-white">Keine Kollektion gefunden</p>
                <p className="text-xs text-slate-500 mt-1">
                  Versuche es mit einem anderen Suchbegriff oder wechsle die Kategorie.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCollections.map((col) => {
                  const totalInCol = col.movies.length;
                  const watchedInCol = col.movies.filter((m) => myWatchedIds.has(m.id)).length;
                  const percentInCol =
                    totalInCol > 0 ? Math.round((watchedInCol / totalInCol) * 100) : 0;
                  const isComplete = percentInCol === 100;

                  return (
                    <Link
                      key={col.id}
                      href={`/collections/${col.id}`}
                      className="group relative flex flex-col rounded-3xl overflow-hidden bg-slate-900/70 border border-slate-800/80 hover:border-amber-500/40 transition duration-300 hover:-translate-y-1 shadow-lg hover:shadow-2xl"
                    >
                      {/* Backdrop Header */}
                      <div className="relative h-48 w-full bg-slate-950 overflow-hidden">
                        {col.backdropPath ? (
                          <Image
                            src={`https://image.tmdb.org/t/p/w780${col.backdropPath}`}
                            alt={col.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover group-hover:scale-105 transition duration-700 ease-out"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-600">
                            <Film className="w-12 h-12" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-black/30" />

                        {/* Category Badge */}
                        <div className="absolute top-3.5 left-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md border ${
                              col.category === "franchise"
                                ? "bg-purple-950/70 border-purple-500/40 text-purple-300"
                                : "bg-sky-950/70 border-sky-500/40 text-sky-300"
                            }`}
                          >
                            {col.category === "franchise" ? "🪐 Universum" : "🎬 Regisseur"}
                          </span>
                        </div>

                        {/* Movie Count Badge */}
                        <div className="absolute top-3.5 right-3.5 bg-black/60 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full text-[11px] font-bold text-white">
                          {totalInCol} Filme
                        </div>

                        {/* Collection Title over Backdrop */}
                        <div className="absolute bottom-3 left-4 right-4">
                          <h3 className="text-xl font-black text-white tracking-tight group-hover:text-amber-400 transition leading-snug">
                            {col.name}
                          </h3>
                          <p className="text-xs text-slate-300 font-medium truncate mt-0.5">
                            {col.tagline}
                          </p>
                        </div>
                      </div>

                      {/* Body Content */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {col.description}
                        </p>

                        {/* Movie Poster Previews */}
                        <div className="flex items-center gap-2 pt-1">
                          {col.movies.slice(0, 5).map((m) => (
                            <div
                              key={m.id}
                              className="w-10 h-14 rounded-lg overflow-hidden bg-slate-800 border border-slate-700/60 relative flex-shrink-0 shadow"
                            >
                              {m.posterPath ? (
                                <Image
                                  src={`https://image.tmdb.org/t/p/w154${m.posterPath}`}
                                  alt={m.title}
                                  fill
                                  sizes="40px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-slate-800" />
                              )}
                              {myWatchedIds.has(m.id) && (
                                <div className="absolute inset-0 bg-emerald-500/40 flex items-center justify-center">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-white fill-emerald-500" />
                                </div>
                              )}
                            </div>
                          ))}
                          {col.movies.length > 5 && (
                            <div className="w-8 h-14 rounded-lg bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-[11px] font-bold text-slate-400">
                              +{col.movies.length - 5}
                            </div>
                          )}
                        </div>

                        {/* Live Progress Bar */}
                        <div className="pt-2 border-t border-slate-800/80">
                          <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                            <span className="text-slate-300 flex items-center gap-1.5">
                              {isComplete ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                              )}
                              <span
                                className={
                                  isComplete ? "text-emerald-400 font-bold" : "text-slate-300"
                                }
                              >
                                {isComplete
                                  ? "Abgeschlossen! 🏆"
                                  : `${watchedInCol} von ${totalInCol} gesehen`}
                              </span>
                            </span>
                            <span
                              className={`font-mono font-bold text-xs ${
                                isComplete
                                  ? "text-emerald-400"
                                  : percentInCol > 0
                                  ? "text-amber-400"
                                  : "text-slate-500"
                              }`}
                            >
                              {percentInCol}%
                            </span>
                          </div>

                          {/* Bar */}
                          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/40">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isComplete
                                  ? "bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-sm shadow-emerald-500/40"
                                  : percentInCol > 0
                                  ? "bg-gradient-to-r from-amber-500 to-amber-400"
                                  : "bg-transparent"
                              }`}
                              style={{ width: `${percentInCol}%` }}
                            />
                          </div>
                        </div>

                        {/* View Details Link */}
                        <div className="flex items-center justify-between pt-1 text-xs font-semibold text-slate-400 group-hover:text-amber-400 transition">
                          <span>Kollektion ansehen</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create / Edit Custom Collection Modal */}
      <CustomCollectionModal
        isOpen={isCreatorOpen}
        onClose={() => {
          setIsCreatorOpen(false);
          setEditingCustomCol(null);
        }}
        editingCollection={editingCustomCol}
        onSuccess={() => setSelectedCategory("friends")}
      />
    </div>
  );
}
