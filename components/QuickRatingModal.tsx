"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Star, X, Film, Tv, Trash2 } from "lucide-react";
import { resolveSelectedSeasons } from "@/lib/seasons";
import { TvStatusToggle, TvSeasonSelector } from "@/components/TvSeasonControls";
import { BottomSheetDialog } from "./BottomSheetDialog";

export interface RatingTarget {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath?: string | null;
  releaseYear?: string | null;
  currentRating?: number | null;
  isWatched?: boolean;
  currentStatus?: "WATCHED" | "WATCHLIST" | "WATCHING";
  watchedSeasons?: number[] | null;
  totalSeasons?: number | null;
}

interface QuickRatingModalProps {
  target: RatingTarget | null;
  onClose: () => void;
  onSaveRating: (
    rating: number | undefined,
    watchedSeasons?: number[] | null,
    totalSeasons?: number | null,
    status?: "WATCHED" | "WATCHING"
  ) => void;
  onRemoveWatched: () => void;
}

export function QuickRatingModal({
  target,
  onClose,
  onSaveRating,
  onRemoveWatched,
}: QuickRatingModalProps) {
  const [hoveredNumber, setHoveredNumber] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<"WATCHED" | "WATCHING">(
    target?.mediaType === "tv" && target?.currentStatus === "WATCHING" ? "WATCHING" : "WATCHED"
  );
  const [totalSeasons, setTotalSeasons] = useState<number>(() => target?.totalSeasons || 1);
  const [selectedSeasons, setSelectedSeasons] = useState<number[]>(() =>
    resolveSelectedSeasons(
      target?.watchedSeasons,
      target?.totalSeasons || 1,
      target?.mediaType === "tv" && target?.currentStatus === "WATCHING" ? "WATCHING" : "WATCHED"
    )
  );
  const [showSeasonEditor, setShowSeasonEditor] = useState<boolean>(
    target?.mediaType === "tv" && target?.currentStatus === "WATCHING"
  );
  const [loadingSeasons, setLoadingSeasons] = useState<boolean>(false);

  // Sync state and fetch TV series total seasons if needed
  useEffect(() => {
    if (!target) return;
    const initialStatus =
      target.mediaType === "tv" && target.currentStatus === "WATCHING" ? "WATCHING" : "WATCHED";
    setSelectedStatus(initialStatus);
    setShowSeasonEditor(initialStatus === "WATCHING");
    if (target.mediaType === "tv") {
      let isMounted = true;
      setLoadingSeasons(true);
      fetch(`/api/tmdb/details?id=${target.tmdbId}&type=tv`)
        .then((res) => res.json())
        .then((data) => {
          if (!isMounted) return;
          const count = data.numberOfSeasons || (data.seasons ? data.seasons.length : 1);
          if (count > 0) {
            setTotalSeasons(count);
            setSelectedSeasons(
              resolveSelectedSeasons(target.watchedSeasons, count, initialStatus)
            );
          }
        })
        .catch((err) => console.error("Error loading seasons in QuickRatingModal:", err))
        .finally(() => {
          if (isMounted) setLoadingSeasons(false);
        });
      return () => {
        isMounted = false;
      };
    }
  }, [target]);

  if (!target) return null;

  const current = target.currentRating || 8;
  const activeRating = hoveredNumber ?? current;

  const handleSave = (score?: number) => {
    if (target.mediaType === "tv") {
      const finalSeasons = resolveSelectedSeasons(selectedSeasons, totalSeasons, selectedStatus);
      onSaveRating(score, finalSeasons, totalSeasons, selectedStatus);
    } else {
      onSaveRating(score, undefined, undefined, "WATCHED");
    }
  };

  const getRatingLabel = (num: number) => {
    switch (num) {
      case 10:
        return "Meisterwerk! 🔥";
      case 9:
        return "Herausragend ★";
      case 8:
        return "Sehr gut 👍";
      case 7:
        return "Gut & sehenswert";
      case 6:
        return "Ganz solide";
      case 5:
        return "Mittelmäßig";
      case 4:
        return "Unterdurchschnittlich";
      case 3:
      case 2:
      case 1:
        return "Eher schwach 👎";
      default:
        return "";
    }
  };

  return (
    <BottomSheetDialog
      isOpen={true}
      onClose={onClose}
      ariaLabel={`${target.title} bewerten`}
      maxWidthClass="max-w-sm"
      panelClassName="bg-[#0b101d] border-0 sm:border sm:border-slate-800 max-h-[90dvh]"
    >
        <div className="overflow-y-auto overscroll-contain p-5 sm:p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-6 relative text-center">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center text-slate-400 hover:text-white p-2 sm:p-1.5 rounded-lg hover:bg-slate-800 transition"
            aria-label="Schließen"
          >
            <X className="w-4 h-4" />
          </button>

        {/* Thumbnail & Title */}
        <div className="flex items-center gap-3.5 text-left mb-3">
          <div className="w-12 h-16 rounded-xl overflow-hidden bg-slate-900 border border-slate-700/60 relative flex-shrink-0 shadow">
            {target.posterPath ? (
              <Image
                src={`https://image.tmdb.org/t/p/w185${target.posterPath}`}
                alt={target.title}
                fill
                className="object-cover"
                sizes="48px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-600">
                {target.mediaType === "tv" ? <Tv className="w-5 h-5" /> : <Film className="w-5 h-5" />}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              {target.mediaType === "tv" ? "Serie bewerten" : "Film bewerten"}
            </span>
            <h3 className="text-base font-extrabold text-white truncate leading-snug">
              {target.title}
            </h3>
            {target.releaseYear && (
              <p className="text-xs text-slate-400">{target.releaseYear}</p>
            )}
          </div>
        </div>

        {/* TV Series Status Toggle + Seasons Selector (TV only!) */}
        {target.mediaType === "tv" && (
          <div className="my-3 space-y-2.5">
            <TvStatusToggle
              status={selectedStatus}
              onSelectWatched={() => setSelectedStatus("WATCHED")}
              onSelectWatching={() => {
                setSelectedStatus("WATCHING");
                setShowSeasonEditor(true);
                if (!target.watchedSeasons && selectedSeasons.length === totalSeasons && totalSeasons > 1) {
                  setSelectedSeasons([1]);
                }
              }}
            />
            <TvSeasonSelector
              status={selectedStatus}
              totalSeasons={totalSeasons}
              selectedSeasons={selectedSeasons}
              showEditor={showSeasonEditor}
              onToggleEditor={() => setShowSeasonEditor((prev) => !prev)}
              onChangeSeasons={setSelectedSeasons}
            />
          </div>
        )}

        {/* Score indicator */}
        <div className="py-1 mb-1">
          <div className="flex items-center justify-center gap-1.5 text-3xl font-black text-amber-400 font-mono">
            <Star className="w-7 h-7 fill-amber-400" />
            <span>{activeRating}/10</span>
          </div>
          <p className="text-xs font-semibold text-slate-300 mt-1 h-4">
            {getRatingLabel(activeRating)}
          </p>
        </div>

        {/* 1 - 10 Clickable Number Buttons */}
        <div className="grid grid-cols-5 gap-2 my-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
            const isCurrent = target.currentRating === num;
            return (
              <button
                key={num}
                type="button"
                onMouseEnter={() => setHoveredNumber(num)}
                onMouseLeave={() => setHoveredNumber(null)}
                onClick={() => handleSave(num)}
                className={`min-h-[44px] sm:min-h-0 py-2.5 rounded-xl text-sm font-black transition transform active:scale-95 ${
                  num === 10
                    ? "bg-gradient-to-tr from-amber-500 to-emerald-400 text-black hover:scale-105 shadow-md shadow-emerald-500/20"
                    : num >= 8
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500 hover:text-black"
                    : num >= 5
                    ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
                    : "bg-slate-900 text-slate-400 hover:bg-slate-800"
                } ${isCurrent ? "ring-2 ring-amber-400" : ""}`}
              >
                {num}
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-3 border-t border-slate-800/80 text-xs">
          <button
            type="button"
            onClick={() => handleSave(undefined)}
            className="w-full py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition font-medium"
          >
            {selectedStatus === "WATCHING" && target.mediaType === "tv"
              ? "Ohne Note als 'Schaue ich gerade' speichern"
              : "Ohne Note als gesehen speichern"}
          </button>

          {(target.isWatched || target.currentStatus === "WATCHING") && (
            <button
              type="button"
              onClick={onRemoveWatched}
              className="w-full min-h-[44px] sm:min-h-0 py-2 sm:py-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 rounded-xl transition flex items-center justify-center gap-1.5 font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>
                {target.currentStatus === "WATCHING"
                  ? "Von 'Schaue ich gerade' entfernen"
                  : "Von 'Gesehen' entfernen"}
              </span>
            </button>
          )}
        </div>
        </div>
    </BottomSheetDialog>
  );
}

