"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useMedia } from "@/components/MediaContext";
import type { AppMediaStatus, AppRecommendation } from "@/lib/store";
import type { BatchMediaMeta } from "@/app/api/tmdb/batch-genres/route";
import { formatWatchedSeasons } from "@/lib/seasons";
import {
  Bookmark,
  Check,
  Edit3,
  Film,
  Flame,
  MessageSquare,
  Plus,
  Search,
  Star,
  Trash2,
  Tv,
  X,
} from "lucide-react";

interface ProfileWatchlistPanelProps {
  watchlistItems: AppMediaStatus[];
  watchingItems: AppMediaStatus[];
  metaMap: Record<string, BatchMediaMeta>;
  recommendations?: AppRecommendation[];
  initialSubTab?: "watchlist" | "watching" | "recommendations";
  onEditRecommendation?: (rec: AppRecommendation) => void;
  onDeleteRecommendation?: (rec: AppRecommendation) => void;
}

export function ProfileWatchlistPanel({
  watchlistItems,
  watchingItems,
  metaMap,
  recommendations,
  initialSubTab = "watchlist",
  onEditRecommendation,
  onDeleteRecommendation,
}: ProfileWatchlistPanelProps) {
  const { openMediaModal, openRatingModal, openSearch, updateMediaStatus, showToast } = useMedia();

  const hasRecsTab = Array.isArray(recommendations);
  const [subTab, setSubTab] = useState<"watchlist" | "watching" | "recommendations">(initialSubTab);
  const [mediaTypeFilter, setMediaTypeFilter] = useState<"ALL" | "movie" | "tv">("ALL");
  const [selectedGenre, setSelectedGenre] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date_desc" | "year_desc" | "title_asc">("date_desc");
  const [recTagFilter, setRecTagFilter] = useState<string>("ALL");

  useEffect(() => {
    setSubTab(initialSubTab);
  }, [initialSubTab]);

  const activeList = useMemo(
    () => (subTab === "watching" ? watchingItems : watchlistItems),
    [subTab, watchingItems, watchlistItems]
  );

  const availableGenres = useMemo(() => {
    const counts: Record<string, number> = {};
    activeList.forEach((item) => {
      const meta = metaMap[`${item.mediaType}_${item.tmdbId}`];
      const names = meta?.genres?.map((g) => g.name) || meta?.genreNames || [];
      names.forEach((name) => {
        counts[name] = (counts[name] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [activeList, metaMap]);

  const filteredMediaItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = activeList.filter((item) => {
      if (mediaTypeFilter !== "ALL" && item.mediaType !== mediaTypeFilter) return false;
      if (q && !item.title.toLowerCase().includes(q)) return false;
      if (selectedGenre !== "ALL") {
        const meta = metaMap[`${item.mediaType}_${item.tmdbId}`];
        const names = meta?.genres?.map((g) => g.name) || meta?.genreNames || [];
        if (!names.includes(selectedGenre)) return false;
      }
      return true;
    });

    list.sort((a, b) => {
      if (sortBy === "year_desc") {
        return (parseInt(b.releaseYear || "0", 10) || 0) - (parseInt(a.releaseYear || "0", 10) || 0);
      }
      if (sortBy === "title_asc") {
        return a.title.localeCompare(b.title);
      }
      return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
    });

    return list;
  }, [activeList, mediaTypeFilter, searchQuery, selectedGenre, sortBy, metaMap]);

  const allRecTags = useMemo(() => {
    const set = new Set<string>();
    (recommendations || []).forEach((r) => (r.tags || []).forEach((t) => set.add(t)));
    return Array.from(set);
  }, [recommendations]);

  const filteredRecs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return (recommendations || []).filter((r) => {
      if (q) {
        const matchesTitle = r.title.toLowerCase().includes(q);
        const matchesComment = (r.comment || "").toLowerCase().includes(q);
        if (!matchesTitle && !matchesComment) return false;
      }
      if (recTagFilter !== "ALL" && !(r.tags || []).includes(recTagFilter)) return false;
      return true;
    });
  }, [recommendations, searchQuery, recTagFilter]);

  const handleRemoveItem = async (item: AppMediaStatus) => {
    await updateMediaStatus({
      tmdbId: item.tmdbId,
      mediaType: item.mediaType,
      title: item.title,
      posterPath: item.posterPath,
      releaseYear: item.releaseYear,
      status: "NONE",
    });
    showToast(`„${item.title}“ von der Liste entfernt`, { type: "info" });
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Sub-Tabs + Quick Add */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-muted border border-border overflow-x-auto no-scrollbar max-w-full">
          <button
            type="button"
            onClick={() => {
              setSubTab("watchlist");
              setSelectedGenre("ALL");
            }}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              subTab === "watchlist"
                ? "bg-card text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground border border-transparent"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-primary-text" aria-hidden="true" />
            <span>Merkliste ({watchlistItems.length})</span>
          </button>

          {(watchingItems.length > 0 || !hasRecsTab) && (
            <button
              type="button"
              onClick={() => {
                setSubTab("watching");
                setSelectedGenre("ALL");
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                subTab === "watching"
                  ? "bg-card text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground border border-transparent"
              }`}
            >
              <Tv className="w-3.5 h-3.5 text-primary-text" aria-hidden="true" />
              <span>Am Schauen ({watchingItems.length})</span>
            </button>
          )}

          {hasRecsTab && (
            <button
              type="button"
              onClick={() => setSubTab("recommendations")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                subTab === "recommendations"
                  ? "bg-card text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground border border-transparent"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-primary-text" aria-hidden="true" />
              <span>Meine Empfehlungen ({recommendations?.length || 0})</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={openSearch}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{subTab === "recommendations" ? "Titel empfehlen" : "Titel hinzufügen"}</span>
        </button>
      </div>

      {/* Filter Bar */}
      {subTab !== "recommendations" ? (
        activeList.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-card border border-border space-y-3 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="In Liste suchen…"
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-muted/70 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Suche leeren"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {subTab === "watchlist" && (
                  <div className="inline-flex items-center p-1 rounded-xl bg-muted border border-border">
                    {(
                      [
                        { key: "ALL", label: "Alle" },
                        { key: "movie", label: "Filme" },
                        { key: "tv", label: "Serien" },
                      ] as const
                    ).map((t) => (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setMediaTypeFilter(t.key)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          mediaTypeFilter === t.key
                            ? "bg-card text-foreground shadow-xs border border-border"
                            : "text-muted-foreground hover:text-foreground border border-transparent"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                )}

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  aria-label="Sortierung"
                  className="px-2.5 py-2 rounded-xl bg-muted/70 border border-border text-xs font-medium text-foreground focus:outline-none focus:border-primary/60"
                >
                  <option value="date_desc">Zuletzt hinzugefügt</option>
                  <option value="year_desc">Erscheinungsjahr</option>
                  <option value="title_asc">Titel (A–Z)</option>
                </select>
              </div>
            </div>

            {availableGenres.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1 border-t border-border">
                <button
                  type="button"
                  onClick={() => setSelectedGenre("ALL")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer ${
                    selectedGenre === "ALL"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Alle Genres
                </button>
                {availableGenres.map((g) => (
                  <button
                    key={g.name}
                    type="button"
                    onClick={() => setSelectedGenre((prev) => (prev === g.name ? "ALL" : g.name))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer border ${
                      selectedGenre === g.name
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
        )
      ) : (
        (recommendations?.length || 0) > 0 && (
          <div className="p-3.5 rounded-2xl bg-card border border-border flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Empfehlungen durchsuchen…"
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-muted/70 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Suche leeren"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {allRecTags.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full">
                <button
                  type="button"
                  onClick={() => setRecTagFilter("ALL")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer ${
                    recTagFilter === "ALL"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Alle Tags
                </button>
                {allRecTags.slice(0, 6).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setRecTagFilter((prev) => (prev === t ? "ALL" : t))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer border ${
                      recTagFilter === t
                        ? "bg-primary-soft text-primary-text border-primary/40 font-semibold"
                        : "bg-background border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      )}

      {/* Body Content */}
      {subTab !== "recommendations" ? (
        activeList.length === 0 ? (
          <div className="p-12 rounded-2xl bg-card border border-border text-center space-y-3 shadow-xs">
            <Bookmark className="w-10 h-10 text-primary-text mx-auto" aria-hidden="true" />
            <h3 className="text-base sm:text-lg font-bold text-foreground">
              {subTab === "watching"
                ? "Keine Serien aktuell am Schauen"
                : "Deine Merkliste ist noch leer"}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              Suche nach Filmen oder Serien und speichere sie mit einem Klick für später.
            </p>
            <button
              type="button"
              onClick={openSearch}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold transition cursor-pointer"
            >
              Titel entdecken
            </button>
          </div>
        ) : filteredMediaItems.length === 0 ? (
          <div className="p-10 rounded-2xl bg-card border border-border text-center space-y-3">
            <p className="text-sm font-bold text-foreground">Keine Treffer für diese Filter</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setMediaTypeFilter("ALL");
                setSelectedGenre("ALL");
              }}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold cursor-pointer"
            >
              Filter zurücksetzen
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredMediaItems.map((item) => {
              const meta = metaMap[`${item.mediaType}_${item.tmdbId}`];
              const seasonLabel =
                item.mediaType === "tv" &&
                item.watchedSeasons &&
                item.totalSeasons &&
                item.watchedSeasons.length > 0
                  ? formatWatchedSeasons(item.watchedSeasons, item.totalSeasons)
                  : null;

              return (
                <div
                  key={`${item.mediaType}_${item.tmdbId}`}
                  className="group rounded-2xl bg-card border border-border hover:border-primary/40 overflow-hidden flex flex-col transition shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() =>
                      openMediaModal({
                        id: item.tmdbId,
                        mediaType: item.mediaType,
                        title: item.title,
                        posterPath: item.posterPath,
                      })
                    }
                    className="relative aspect-[2/3] w-full bg-muted cursor-pointer overflow-hidden text-left"
                  >
                    {item.posterPath ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w500${item.posterPath}`}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 50vw, 220px"
                        className="object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        {item.mediaType === "tv" ? (
                          <Tv className="w-8 h-8" />
                        ) : (
                          <Film className="w-8 h-8" />
                        )}
                      </div>
                    )}

                    <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/75 text-white text-[10px] font-bold uppercase">
                      {item.mediaType === "tv" ? "Serie" : "Film"}
                    </span>

                    {seasonLabel && (
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-white text-[10px] font-semibold">
                        {seasonLabel}
                      </span>
                    )}
                  </button>

                  <div className="p-3 flex-1 flex flex-col justify-between gap-2.5">
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-foreground line-clamp-1">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {item.releaseYear || meta?.releaseYear || ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          openRatingModal({
                            tmdbId: item.tmdbId,
                            mediaType: item.mediaType,
                            title: item.title,
                            posterPath: item.posterPath,
                            releaseYear: item.releaseYear,
                            currentRating: item.rating,
                            isWatched: false,
                            watchedSeasons: item.watchedSeasons,
                            totalSeasons: item.totalSeasons,
                          })
                        }
                        className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary-soft hover:bg-primary text-primary-text hover:text-primary-foreground text-[11px] font-bold transition cursor-pointer"
                      >
                        <Check className="w-3 h-3" aria-hidden="true" />
                        <span>Gesehen</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item)}
                        title="Aus Liste entfernen"
                        aria-label={`${item.title} aus Liste entfernen`}
                        className="p-1.5 rounded-lg bg-muted hover:bg-rose-500/15 text-muted-foreground hover:text-rose-500 border border-border transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (recommendations?.length || 0) === 0 ? (
        <div className="p-12 rounded-2xl bg-card border border-border text-center space-y-3 shadow-xs">
          <Flame className="w-10 h-10 text-primary-text mx-auto" aria-hidden="true" />
          <h3 className="text-base sm:text-lg font-bold text-foreground">
            Noch keine Empfehlungen verfasst
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            Teile deine Lieblingsfilme mit Freunden — suche einfach nach einem Titel und klicke auf
            „Empfehlen“.
          </p>
          <button
            type="button"
            onClick={openSearch}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold transition cursor-pointer"
          >
            Titel empfehlen
          </button>
        </div>
      ) : filteredRecs.length === 0 ? (
        <div className="p-10 rounded-2xl bg-card border border-border text-center space-y-3">
          <p className="text-sm font-bold text-foreground">Keine Empfehlungen gefunden</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setRecTagFilter("ALL");
            }}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold cursor-pointer"
          >
            Filter zurücksetzen
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecs.map((rec) => {
            const posterUrl = rec.posterPath
              ? rec.posterPath.startsWith("http")
                ? rec.posterPath
                : `https://image.tmdb.org/t/p/w342${rec.posterPath}`
              : null;

            const isTargeted =
              rec.targetType &&
              rec.targetType !== "ALL" &&
              ((rec.targetNames && rec.targetNames.length > 0) ||
                (rec.targetGroupIds && rec.targetGroupIds.length > 0));

            const formattedDate = rec.createdAt
              ? new Date(rec.createdAt).toLocaleDateString("de-DE", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : null;

            return (
              <div
                key={rec.id}
                className="p-4 rounded-2xl bg-card border border-border hover:border-primary/40 transition flex flex-col justify-between gap-3.5 shadow-xs"
              >
                <div className="flex gap-3.5">
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
                    className="relative w-16 aspect-[2/3] rounded-xl overflow-hidden shrink-0 bg-muted border border-border cursor-pointer"
                  >
                    {posterUrl ? (
                      <Image
                        src={posterUrl}
                        alt={rec.title}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        {rec.mediaType === "tv" ? (
                          <Tv className="w-5 h-5" />
                        ) : (
                          <Film className="w-5 h-5" />
                        )}
                      </div>
                    )}
                  </button>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
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
                        className="text-left font-bold text-foreground hover:text-primary-text text-sm sm:text-base line-clamp-1 transition cursor-pointer"
                      >
                        {rec.title}
                      </button>

                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-primary-soft text-primary-text font-bold text-xs shrink-0">
                        <Star className="w-3 h-3 fill-primary text-primary" aria-hidden="true" />
                        <span>{rec.rating || 9}/10</span>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span className="px-1.5 py-0.5 rounded bg-muted border border-border font-semibold uppercase text-[10px]">
                        {rec.mediaType === "tv" ? "Serie" : "Film"}
                      </span>
                      {rec.releaseYear && <span>{rec.releaseYear}</span>}
                      <span>·</span>
                      <span className="truncate max-w-[160px]">
                        {isTargeted ? rec.targetNames?.slice(0, 2).join(", ") : "Alle Freunde"}
                      </span>
                    </div>

                    {rec.tags && rec.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {rec.tags.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-medium"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {rec.comment && (
                  <p className="p-2.5 rounded-xl bg-muted/60 border border-border text-xs text-foreground leading-relaxed">
                    „{rec.comment}“
                  </p>
                )}

                <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                      <Flame className="w-3 h-3 text-rose-500" aria-hidden="true" />
                      <span>{rec.upvoterIds?.length || 0}</span>
                    </span>
                    {rec.replies && rec.replies.length > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" aria-hidden="true" />
                        <span>{rec.replies.length}</span>
                      </span>
                    )}
                    {formattedDate && <span>· {formattedDate}</span>}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {onEditRecommendation && (
                      <button
                        type="button"
                        onClick={() => onEditRecommendation(rec)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted hover:bg-primary-soft text-foreground hover:text-primary-text border border-border text-xs font-semibold transition cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" aria-hidden="true" />
                        <span>Bearbeiten</span>
                      </button>
                    )}
                    {onDeleteRecommendation && (
                      <button
                        type="button"
                        onClick={() => onDeleteRecommendation(rec)}
                        title="Empfehlung löschen"
                        aria-label="Empfehlung löschen"
                        className="p-1.5 rounded-lg bg-muted hover:bg-rose-500/15 text-muted-foreground hover:text-rose-500 border border-border transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
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
  );
}
