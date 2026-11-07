"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Star, X, Check, Film, Tv, Trash2 } from "lucide-react";

export interface RatingTarget {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath?: string | null;
  releaseYear?: string | null;
  currentRating?: number | null;
  isWatched?: boolean;
}

interface QuickRatingModalProps {
  target: RatingTarget | null;
  onClose: () => void;
  onSaveRating: (rating: number | undefined) => void;
  onRemoveWatched: () => void;
}

export function QuickRatingModal({
  target,
  onClose,
  onSaveRating,
  onRemoveWatched,
}: QuickRatingModalProps) {
  const [hoveredNumber, setHoveredNumber] = useState<number | null>(null);

  if (!target) return null;

  const current = target.currentRating || 8;
  const activeRating = hoveredNumber ?? current;

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
        className="bg-[#0b101d] border border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative text-center"
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
        <div className="flex items-center gap-3.5 text-left mb-4">
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

        {/* Score indicator */}
        <div className="py-2 mb-2">
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
                onClick={() => onSaveRating(num)}
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
            onClick={() => onSaveRating(undefined)}
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
