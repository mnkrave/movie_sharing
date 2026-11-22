"use client";

import React from "react";
import { Check, SlidersHorizontal, Tv } from "lucide-react";
import { formatWatchedSeasons } from "@/lib/seasons";

interface TvStatusToggleProps {
  status: "WATCHED" | "WATCHING";
  onSelectWatched: () => void;
  onSelectWatching: () => void;
  className?: string;
  buttonPaddingClass?: string;
}

/** Two-column toggle between completely watched and currently watching TV series. */
export function TvStatusToggle({
  status,
  onSelectWatched,
  onSelectWatching,
  className = "rounded-2xl bg-slate-900 border border-slate-800",
  buttonPaddingClass = "py-2 px-2.5 rounded-xl",
}: TvStatusToggleProps) {
  return (
    <div className={`grid grid-cols-2 gap-1.5 p-1 ${className}`}>
      <button
        type="button"
        onClick={onSelectWatched}
        className={`${buttonPaddingClass} text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
          status === "WATCHED"
            ? "bg-emerald-500 text-black shadow-sm"
            : "text-slate-400 hover:text-white"
        }`}
      >
        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>Komplett gesehen</span>
      </button>
      <button
        type="button"
        onClick={onSelectWatching}
        className={`${buttonPaddingClass} text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
          status === "WATCHING"
            ? "bg-cyan-400 text-black shadow-sm"
            : "text-slate-400 hover:text-white"
        }`}
      >
        <Tv className="w-3.5 h-3.5" />
        <span>Schaue ich gerade</span>
      </button>
    </div>
  );
}

interface TvSeasonSelectorProps {
  status: "WATCHED" | "WATCHING";
  totalSeasons: number;
  selectedSeasons: number[];
  showEditor: boolean;
  onToggleEditor: () => void;
  onChangeSeasons: (updater: number[] | ((prev: number[]) => number[])) => void;
  containerClassName?: string;
  gridColsClass?: string;
}

/** Expandable TV season progress summary and multi-select season grid. */
export function TvSeasonSelector({
  status,
  totalSeasons,
  selectedSeasons,
  showEditor,
  onToggleEditor,
  onChangeSeasons,
  containerClassName = "rounded-2xl bg-slate-900/90 border border-slate-800",
  gridColsClass = "grid-cols-4 sm:grid-cols-5",
}: TvSeasonSelectorProps) {
  return (
    <div className={`p-3 text-left ${containerClassName}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-bold">
          <Tv className="w-3.5 h-3.5 text-cyan-400" />
          {status === "WATCHING" ? (
            <span className="text-cyan-300 font-semibold">
              Aktuell bis {formatWatchedSeasons(selectedSeasons, totalSeasons)}
            </span>
          ) : selectedSeasons.length === totalSeasons ? (
            <span className="text-emerald-400 font-semibold">
              Alle {totalSeasons} {totalSeasons === 1 ? "Staffel" : "Staffeln"} gesehen ✓
            </span>
          ) : (
            <span className="text-amber-400 font-semibold">
              {formatWatchedSeasons(selectedSeasons, totalSeasons)} gesehen
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleEditor}
          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700/80 transition flex items-center gap-1"
        >
          <SlidersHorizontal className="w-3 h-3" />
          <span>{showEditor ? "Fertig" : "Edit Staffeln"}</span>
        </button>
      </div>

      {showEditor && (
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>
              {status === "WATCHING"
                ? "Bis zu welcher Staffel schaust du?"
                : "Wähle deine gesehenen Staffeln:"}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  onChangeSeasons(Array.from({ length: totalSeasons }, (_, i) => i + 1))
                }
                className="text-amber-400 hover:underline font-semibold"
              >
                Alle
              </button>
              <button
                type="button"
                onClick={() => onChangeSeasons([1])}
                className="text-slate-400 hover:underline"
              >
                Nur S1
              </button>
            </div>
          </div>

          <div className={`grid ${gridColsClass} gap-1.5 max-h-36 overflow-y-auto pt-1`}>
            {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((sNum) => {
              const isSelected = selectedSeasons.includes(sNum);
              return (
                <button
                  key={sNum}
                  type="button"
                  onClick={() =>
                    onChangeSeasons((prev) =>
                      prev.includes(sNum)
                        ? prev.filter((s) => s !== sNum)
                        : [...prev, sNum].sort((a, b) => a - b)
                    )
                  }
                  className={`py-1.5 px-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1 ${
                    isSelected
                      ? status === "WATCHING"
                        ? "bg-cyan-400 text-black shadow-sm"
                        : "bg-amber-500 text-black shadow-sm"
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
  );
}
