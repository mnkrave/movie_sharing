"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useMedia } from "@/components/MediaContext";
import {
  Bookmark,
  Check,
  Star,
  Film,
  Tv,
  Plus,
  LogIn,
  Search,
  Filter,
  X,
  Trash2,
  Sparkles,
  ArrowUpDown,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function MyListPage() {
  const { data: session } = useSession();
  const { communityData, openMediaModal, updateMediaStatus, openSearch } = useMedia();

  const [activeTab, setActiveTab] = useState<"WATCHLIST" | "WATCHED">("WATCHLIST");
  const [mediaTypeFilter, setMediaTypeFilter] = useState<"ALL" | "movie" | "tv">("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date_desc" | "rating_desc" | "year_desc" | "title_asc">("date_desc");

  // Map of genres per item: key `${mediaType}_${tmdbId}` => string[]
  const [genreMap, setGenreMap] = useState<Record<string, string[]>>({});

  const myUserId = (session?.user as any)?.id || "user_lukas";
  const myName = session?.user?.name;

  // Items for the current tab
  const allMyItems = useMemo(() => {
    return communityData.mediaStatuses.filter(
      (m) =>
        (m.userId === myUserId || (myName && m.userName === myName)) &&
        m.status === activeTab
    );
  }, [communityData.mediaStatuses, myUserId, myName, activeTab]);

  // Fetch genres for items in the user's list
  useEffect(() => {
    if (allMyItems.length === 0) return;

    const itemsToFetch = allMyItems
      .filter((m) => !genreMap[`${m.mediaType}_${m.tmdbId}`])
      .map((m) => ({ id: m.tmdbId, type: m.mediaType }));

    if (itemsToFetch.length === 0) return;

    fetch("/api/tmdb/batch-genres", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: itemsToFetch }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.genres) {
          setGenreMap((prev) => ({ ...prev, ...data.genres }));
        }
      })
      .catch((err) => console.error("Failed to fetch batch genres:", err));
  }, [allMyItems, genreMap]);

  // Counts for media types
  const movieCount = allMyItems.filter((m) => m.mediaType === "movie").length;
  const tvCount = allMyItems.filter((m) => m.mediaType === "tv").length;

  // Extract all unique genres present in the current tab
  const availableGenres = useMemo(() => {
    const counts: Record<string, number> = {};
    allMyItems.forEach((item) => {
      const genres = genreMap[`${item.mediaType}_${item.tmdbId}`] || [];
      genres.forEach((g) => {
        counts[g] = (counts[g] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [allMyItems, genreMap]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let list = allMyItems.filter((item) => {
      // 1. Media Type Filter
      if (mediaTypeFilter !== "ALL" && item.mediaType !== mediaTypeFilter) {
        return false;
      }

      // 2. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!item.title.toLowerCase().includes(q)) {
          return false;
        }
      }

      // 3. Category / Genre Filter
      if (selectedCategory !== "ALL") {
        const genres = genreMap[`${item.mediaType}_${item.tmdbId}`] || [];
        if (!genres.includes(selectedCategory)) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    list.sort((a, b) => {
      if (sortBy === "rating_desc") {
        return (b.rating || 0) - (a.rating || 0);
      }
      if (sortBy === "year_desc") {
        return (parseInt(b.releaseYear || "0", 10) || 0) - (parseInt(a.releaseYear || "0", 10) || 0);
      }
      if (sortBy === "title_asc") {
        return a.title.localeCompare(b.title);
      }
      // Default: date_desc (most recently updated first)
      const dateA = new Date(a.updatedAt || 0).getTime();
      const dateB = new Date(b.updatedAt || 0).getTime();
      return dateB - dateA;
    });

    return list;
  }, [allMyItems, mediaTypeFilter, searchQuery, selectedCategory, sortBy, genreMap]);

  if (!session) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
          <Bookmark className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white">Melde dich an</h2>
        <p className="text-sm text-slate-400">
          Um deine persönliche Watchlist und deine bewerteten Filme zu speichern, melde dich kurz an.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm shadow-lg shadow-amber-500/20"
        >
          <LogIn className="w-4 h-4" />
          <span>Jetzt einloggen</span>
        </Link>
      </div>
    );
  }

  const watchlistTotal = communityData.mediaStatuses.filter(
    (m) => (m.userId === myUserId || m.userName === myName) && m.status === "WATCHLIST"
  ).length;

  const watchedTotal = communityData.mediaStatuses.filter(
    (m) => (m.userId === myUserId || m.userName === myName) && m.status === "WATCHED"
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-8 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Meine Listen
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Behalte den Überblick über alles, was du noch sehen willst oder bereits gesehen hast.
          </p>
        </div>

        <button
          onClick={openSearch}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Titel hinzufügen</span>
        </button>
      </div>

      {/* Main Tabs (Watchlist vs Bereits gesehen) */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setActiveTab("WATCHLIST");
              setSelectedCategory("ALL");
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === "WATCHLIST"
                ? "bg-sky-500 text-black shadow-lg shadow-sky-500/20"
                : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Watchlist ({watchlistTotal})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("WATCHED");
              setSelectedCategory("ALL");
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === "WATCHED"
                ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <Check className="w-4 h-4" />
            <span>Bereits gesehen ({watchedTotal})</span>
          </button>
        </div>

        {/* Media Type Switcher (Alle / Filme / Serien) */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setMediaTypeFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              mediaTypeFilter === "ALL"
                ? "bg-amber-500 text-black font-bold shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Alle ({allMyItems.length})
          </button>
          <button
            type="button"
            onClick={() => setMediaTypeFilter("movie")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              mediaTypeFilter === "movie"
                ? "bg-amber-500 text-black font-bold shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Filme ({movieCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setMediaTypeFilter("tv")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              mediaTypeFilter === "tv"
                ? "bg-amber-500 text-black font-bold shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Serien ({tvCount})</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        {/* Search Input & Sort Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="In deiner Liste suchen..."
              className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-400">Sortierung:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
            >
              <option value="date_desc">Zuletzt aktualisiert</option>
              {activeTab === "WATCHED" && <option value="rating_desc">Höchste Bewertung</option>}
              <option value="year_desc">Erscheinungsjahr (Neu ➔ Alt)</option>
              <option value="title_asc">Titel (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Category & Genre Pills Filter */}
        {availableGenres.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 pr-2 flex-shrink-0">
              <Filter className="w-3.5 h-3.5 text-amber-400" />
              <span>Kategorien:</span>
            </div>

            <button
              type="button"
              onClick={() => setSelectedCategory("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === "ALL"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
              }`}
            >
              Alle ({allMyItems.length})
            </button>

            {availableGenres.map(({ name, count }) => (
              <button
                key={name}
                type="button"
                onClick={() => setSelectedCategory(name)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                  selectedCategory === name
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                }`}
              >
                <span>{name}</span>
                <span className="text-[10px] font-mono text-slate-500">({count})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid of Saved Items */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filteredItems.map((item) => {
            const genres = genreMap[`${item.mediaType}_${item.tmdbId}`] || [];

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
                className="group relative cursor-pointer flex flex-col rounded-2xl overflow-hidden bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/40 transition duration-300 hover:-translate-y-1.5 shadow-md hover:shadow-2xl"
              >
                {/* Poster container */}
                <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-slate-950">
                  {item.posterPath ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w500${item.posterPath}`}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-500 ease-out"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-slate-600">
                      {item.mediaType === "tv" ? <Tv className="w-8 h-8 mb-2" /> : <Film className="w-8 h-8 mb-2" />}
                      <span className="text-xs">{item.title}</span>
                    </div>
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition" />

                  {/* Media Type Badge */}
                  <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                    {item.mediaType === "tv" ? "Serie" : "Film"}
                  </div>

                  {/* Rating Badge if rated */}
                  {item.rating && (
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-amber-400 font-extrabold text-xs border border-white/10 flex items-center gap-1 shadow">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{item.rating}/10</span>
                    </div>
                  )}

                  {/* Hover Quick Action Indicator */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-3 text-center">
                    <span className="text-xs font-bold bg-amber-500 text-black px-3 py-1.5 rounded-xl shadow-lg">
                      Streaming & Details →
                    </span>
                  </div>
                </div>

                {/* Details Footer */}
                <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-amber-400 transition">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      {item.releaseYear && <span>{item.releaseYear}</span>}
                      {genres.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="truncate text-slate-400">{genres.slice(0, 2).join(", ")}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    {activeTab === "WATCHLIST" ? (
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
                            status: "WATCHED",
                            rating: 8,
                          });
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/30 text-[10px] font-bold transition"
                        title="Als gesehen markieren"
                      >
                        <Check className="w-3 h-3" />
                        <span>Gesehen</span>
                      </button>
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
                            status: "WATCHLIST",
                          });
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500 text-sky-400 hover:text-black border border-sky-500/30 text-[10px] font-bold transition"
                        title="Zurück auf die Watchlist"
                      >
                        <Bookmark className="w-3 h-3" />
                        <span>Watchlist</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateMediaStatus({
                          tmdbId: item.tmdbId,
                          mediaType: item.mediaType,
                          title: item.title,
                          status: "NONE",
                        });
                      }}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-rose-500/10 transition"
                      title="Aus Liste entfernen"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-16 text-center rounded-3xl bg-slate-900/30 border border-slate-800/60 text-slate-400 space-y-4">
          <Bookmark className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">
            {searchQuery || selectedCategory !== "ALL" || mediaTypeFilter !== "ALL"
              ? "Keine passenden Titel gefunden"
              : "Hier ist noch nichts gespeichert"}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery || selectedCategory !== "ALL" || mediaTypeFilter !== "ALL"
              ? "Passe deine Filterkriterien an oder setze sie zurück."
              : activeTab === "WATCHLIST"
              ? "Klicke bei einem beliebigen Film auf '+', um ihn für später auf deine Watchlist zu setzen."
              : "Markiere Filme als 'Gesehen' und bewerte sie, um deinen Freunden deine Highlights zu zeigen!"}
          </p>
          {(searchQuery || selectedCategory !== "ALL" || mediaTypeFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("ALL");
                setMediaTypeFilter("ALL");
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition"
            >
              Filter zurücksetzen
            </button>
          )}
          {!searchQuery && selectedCategory === "ALL" && mediaTypeFilter === "ALL" && (
            <button
              onClick={openSearch}
              className="px-5 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs shadow-lg shadow-amber-500/20"
            >
              Filme & Serien entdecken
            </button>
          )}
        </div>
      )}
    </div>
  );
}
