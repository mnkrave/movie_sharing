"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Star, X, Check, Film, Tv, Trash2, SlidersHorizontal } from "lucide-react";

export interface RatingTarget {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath?: string | null;
  releaseYear?: string | null;
  currentRating?: number | null;
  isWatched?: boolean;
  watchedSeasons?: number[] | null;
  totalSeasons?: number | null;
}

interface QuickRatingModalProps {
  target: RatingTarget | null;
  onClose: () => void;
  onSaveRating: (
    rating: number | undefined,
    watchedSeasons?: number[] | null,
    totalSeasons?: number | null
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
  const [totalSeasons, setTotalSeasons] = useState<number>(() => target?.totalSeasons || 1);
  const [selectedSeasons, setSelectedSeasons] = useState<number[]>(() => {
    if (target?.watchedSeasons && target.watchedSeasons.length > 0) {
      return target.watchedSeasons;
    }
    const count = target?.totalSeasons || 1;
    return Array.from({ length: count }, (_, i) => i + 1);
  });
  const [showSeasonEditor, setShowSeasonEditor] = useState<boolean>(false);
  const [loadingSeasons, setLoadingSeasons] = useState<boolean>(false);

  // Sync state and fetch TV series total seasons if needed
  useEffect(() => {
    if (!target) return;
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
            if (!target.watchedSeasons || target.watchedSeasons.length === 0) {
              setSelectedSeasons(Array.from({ length: count }, (_, i) => i + 1));
            } else {
              setSelectedSeasons(target.watchedSeasons);
            }
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

  useEffect(() => {
    if (!target) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.querySelector("dialog[open]")) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [target, onClose]);

  if (!target) return null;

  const current = target.currentRating || 8;
  const activeRating = hoveredNumber ?? current;

  const handleSave = (score?: number) => {
    if (target.mediaType === "tv") {
      onSaveRating(score, selectedSeasons, totalSeasons);
    } else {
      onSaveRating(score);
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#0b101d] border border-slate-800 rounded-3xl w-full max-w-sm max-h-[90dvh] overflow-y-auto overscroll-contain p-6 shadow-2xl relative text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
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

        {/* TV Series Seasons Selector (Default: All) */}
        {target.mediaType === "tv" && (
          <div className="my-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-left">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <Tv className="w-3.5 h-3.5 text-cyan-400" />
                {selectedSeasons.length === totalSeasons ? (
                  <span className="text-emerald-400 font-semibold">
                    Alle {totalSeasons} {totalSeasons === 1 ? "Staffel" : "Staffeln"} gesehen ✓
                  </span>
                ) : (
                  <span className="text-amber-400 font-semibold">
                    {selectedSeasons.length} von {totalSeasons} Staffeln gesehen
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowSeasonEditor(!showSeasonEditor)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700/80 transition flex items-center gap-1"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>{showSeasonEditor ? "Fertig" : "Edit Staffeln"}</span>
              </button>
            </div>

            {showSeasonEditor && (
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Wähle deine gesehenen Staffeln:</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedSeasons(Array.from({ length: totalSeasons }, (_, i) => i + 1))
                      }
                      className="text-amber-400 hover:underline font-semibold"
                    >
                      Alle
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedSeasons([1])}
                      className="text-slate-400 hover:underline"
                    >
                      Nur S1
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 max-h-36 overflow-y-auto pt-1">
                  {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((sNum) => {
                    const isSelected = selectedSeasons.includes(sNum);
                    return (
                      <button
                        key={sNum}
                        type="button"
                        onClick={() => {
                          setSelectedSeasons((prev) =>
                            prev.includes(sNum)
                              ? prev.filter((s) => s !== sNum)
                              : [...prev, sNum].sort((a, b) => a - b)
                          );
                        }}
                        className={`py-1.5 px-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1 ${
                          isSelected
                            ? "bg-amber-500 text-black shadow-sm"
                            : "bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/50"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        <span>S{sNum}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
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
                className={`py-2.5 rounded-xl text-sm font-black transition transform active:scale-95 ${
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
            Ohne Note als gesehen speichern
          </button>

          {target.isWatched && (
            <button
              type="button"
              onClick={onRemoveWatched}
              className="w-full py-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 rounded-xl transition flex items-center justify-center gap-1.5 font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Von &apos;Gesehen&apos; entfernen</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

