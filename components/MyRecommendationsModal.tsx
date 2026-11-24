"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import type { AppRecommendation } from "@/lib/store";
import { BottomSheetDialog } from "./BottomSheetDialog";
import {
  X,
  Flame,
  Star,
  Film,
  Tv,
  MessageSquare,
  Edit3,
  Trash2,
  ExternalLink,
  Plus,
  Search,
} from "lucide-react";

interface MyRecommendationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendations: AppRecommendation[];
  onEdit: (rec: AppRecommendation) => void;
  onDelete: (rec: AppRecommendation) => void;
  onOpenMedia: (media: {
    id: number;
    mediaType: "movie" | "tv";
    title?: string;
    posterPath?: string | null;
  }) => void;
  onOpenSearch: () => void;
}

export function MyRecommendationsModal({
  isOpen,
  onClose,
  recommendations,
  onEdit,
  onDelete,
  onOpenMedia,
  onOpenSearch,
}: MyRecommendationsModalProps) {
  const [searchFilter, setSearchFilter] = useState("");
  const [tagFilter, setTagFilter] = useState<string>("ALL");

  // Extract all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    recommendations.forEach((r) => {
      (r.tags || []).forEach((t) => set.add(t));
    });
    return Array.from(set);
  }, [recommendations]);

  // Filter recommendations
  const filteredRecs = useMemo(() => {
    return recommendations.filter((r) => {
      if (searchFilter.trim()) {
        const query = searchFilter.toLowerCase();
        const matchesTitle = r.title.toLowerCase().includes(query);
        const matchesComment = (r.comment || "").toLowerCase().includes(query);
        if (!matchesTitle && !matchesComment) return false;
      }
      if (tagFilter !== "ALL") {
        if (!r.tags || !r.tags.includes(tagFilter)) return false;
      }
      return true;
    });
  }, [recommendations, searchFilter, tagFilter]);

  if (!isOpen) return null;

  return (
    <BottomSheetDialog
      isOpen={isOpen}
      onClose={onClose}
      ariaLabelledBy="my-recommendations-title"
      maxWidthClass="max-w-4xl"
      panelClassName="bg-slate-950 border-0 sm:border sm:border-slate-800 max-h-[92dvh]"
    >
        {/* Header */}
        <div className="relative p-5 sm:p-6 border-b border-slate-800/80 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 pr-8 sm:pr-0">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="my-recommendations-title"
                  className="text-lg sm:text-2xl font-black text-white"
                >
                  Meine Empfehlungen
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {recommendations.length}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Titel, die du mit deinen Freunden und Gruppen geteilt hast
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSearch();
              }}
              className="min-h-[44px] sm:min-h-0 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-black font-black text-xs transition flex items-center gap-1.5 shadow-md shadow-rose-500/20"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Neuen Titel empfehlen</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Schließen"
              className="min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center p-2 rounded-full text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Bar (if recommendations exist) */}
        {recommendations.length > 0 && (
          <div className="px-5 sm:px-6 py-3 border-b border-slate-800/60 bg-slate-900/40 flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                enterKeyHint="search"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Empfehlungen durchsuchen..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
              />
              {searchFilter && (
                <button
                  type="button"
                  onClick={() => setSearchFilter("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {allTags.length > 0 && (
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full">
                <button
                  type="button"
                  onClick={() => setTagFilter("ALL")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap ${
                    tagFilter === "ALL"
                      ? "bg-amber-500 text-black"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  Alle
                </button>
                {allTags.slice(0, 5).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTagFilter(tagFilter === t ? "ALL" : t)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition whitespace-nowrap ${
                      tagFilter === t
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {recommendations.length === 0 ? (
            <div className="p-10 sm:p-14 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
                <Flame className="w-8 h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Noch keine Empfehlungen verfasst
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                Teile deine Lieblingsfilme und Geheimtipps mit Freunden. Suche einfach
                nach einem Titel und klicke auf „Empfehlen“.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenSearch();
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs sm:text-sm transition shadow-lg shadow-amber-500/20"
                >
                  Filme & Serien durchsuchen
                </button>
              </div>
            </div>
          ) : filteredRecs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Keine Empfehlungen für diese Filterung gefunden.
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
                    className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/90 hover:border-slate-700 transition flex flex-col justify-between space-y-3.5 group"
                  >
                    {/* Top Row: Poster & Metadata */}
                    <div className="flex gap-3.5">
                      <button
                        type="button"
                        onClick={() =>
                          onOpenMedia({
                            id: rec.tmdbId,
                            mediaType: rec.mediaType,
                            title: rec.title,
                            posterPath: rec.posterPath,
                          })
                        }
                        className="relative w-18 sm:w-20 aspect-[2/3] rounded-xl overflow-hidden shrink-0 bg-slate-950 border border-slate-800 shadow-md group-hover:shadow-amber-500/10 transition group/poster"
                        title="Titel im Detail öffnen"
                      >
                        {posterUrl ? (
                          <Image
                            src={posterUrl}
                            alt={rec.title}
                            fill
                            sizes="(max-width: 640px) 72px, 80px"
                            className="object-cover group-hover/poster:scale-105 transition duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600">
                            {rec.mediaType === "tv" ? (
                              <Tv className="w-6 h-6" />
                            ) : (
                              <Film className="w-6 h-6" />
                            )}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/poster:opacity-100 transition flex items-center justify-center">
                          <ExternalLink className="w-4 h-4 text-white drop-shadow" />
                        </div>
                      </button>

                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-start justify-between gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              onOpenMedia({
                                id: rec.tmdbId,
                                mediaType: rec.mediaType,
                                title: rec.title,
                                posterPath: rec.posterPath,
                              })
                            }
                            className="text-left font-black text-white hover:text-amber-400 text-sm sm:text-base line-clamp-1 transition"
                            title={rec.title}
                          >
                            {rec.title}
                          </button>

                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 font-black text-xs shrink-0">
                            <Star className="w-3 h-3 fill-amber-400" />
                            <span>{rec.rating || 9}/10</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-[11px]">
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold uppercase tracking-wider text-[9px]">
                            {rec.mediaType === "tv" ? "Serie" : "Film"}
                          </span>
                          {rec.releaseYear && (
                            <span className="text-slate-400">{rec.releaseYear}</span>
                          )}
                          <span className="text-slate-600">•</span>
                          {isTargeted ? (
                            <span className="px-1.5 py-0.5 rounded bg-purple-500/15 border border-purple-500/30 text-purple-300 truncate max-w-[130px]">
                              🎯 {rec.targetNames?.slice(0, 2).join(", ")}
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded bg-sky-500/15 border border-sky-500/30 text-sky-300">
                              🌐 Alle Freunde
                            </span>
                          )}
                        </div>

                        {rec.tags && rec.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {rec.tags.slice(0, 3).map((t) => (
                              <span
                                key={t}
                                className="px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-medium"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Comment Quote Bubble */}
                    {rec.comment && (
                      <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-200 italic leading-relaxed">
                        <MessageSquare className="w-3 h-3 text-slate-500 mb-0.5 inline-block mr-1 not-italic" />
                        <span>„{rec.comment}“</span>
                      </div>
                    )}

                    {/* Footer Row */}
                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 font-semibold text-slate-300">
                          <Flame className="w-3 h-3 text-rose-400" />
                          <span>{rec.upvoterIds?.length || 0}</span>
                        </span>
                        {rec.replies && rec.replies.length > 0 && (
                          <span className="flex items-center gap-1 text-slate-400">
                            <MessageSquare className="w-3 h-3 text-indigo-400" />
                            <span>{rec.replies.length}</span>
                          </span>
                        )}
                        {formattedDate && (
                          <span className="text-slate-500 hidden sm:inline">• {formattedDate}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onEdit(rec)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-amber-300 hover:text-black hover:bg-amber-400 bg-amber-500/15 border border-amber-500/30 transition flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Bearbeiten</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onDelete(rec)}
                          className="min-w-[40px] min-h-[40px] sm:min-w-0 sm:min-h-0 flex items-center justify-center p-2 sm:p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition"
                          title="Empfehlung löschen"
                          aria-label="Empfehlung löschen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
    </BottomSheetDialog>
  );
}
