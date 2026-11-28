"use client";

import React, { useState } from "react";
import { ChevronDown, SlidersHorizontal, RotateCcw } from "lucide-react";

interface MobileFilterBarProps {
  /** Compact summary of active filters shown on mobile when collapsed */
  summary: string;
  /** Number of currently active filters (badge) */
  activeCount?: number;
  /** Optional result count shown on the right */
  resultLabel?: string;
  /** Optional quick reset handler */
  onReset?: () => void;
  /** Full filter UI: always visible on desktop (md+), collapsible on mobile (< md) */
  children: React.ReactNode;
}

/**
 * Keeps desktop (`md+`) filter bars 100% unchanged while collapsing multi-row
 * filter panels into a compact 1-line toggle on mobile (`< md`) so content
 * appears immediately above the fold.
 */
export function MobileFilterBar({
  summary,
  activeCount = 0,
  resultLabel,
  onReset,
  children,
}: MobileFilterBarProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-3 md:space-y-0">
      {/* Mobile-only compact toggle bar */}
      <div className="md:hidden flex items-center gap-2">
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          className={`flex-1 min-w-0 min-h-[44px] flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl border text-xs font-bold transition active:scale-[0.99] ${
            expanded || activeCount > 0
              ? "bg-card border-primary/50 text-foreground shadow-sm"
              : "bg-card border-border text-foreground"
          }`}
        >
          <span className="flex items-center gap-2 min-w-0">
            <SlidersHorizontal className="w-4 h-4 text-primary-text flex-shrink-0" />
            <span className="truncate">{summary}</span>
            {activeCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[11px] font-black leading-none flex-shrink-0">
                {activeCount}
              </span>
            )}
          </span>
          <span className="flex items-center gap-1.5 flex-shrink-0 text-muted-foreground">
            {resultLabel && <span className="text-[11px] font-semibold">{resultLabel}</span>}
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                expanded ? "rotate-180 text-primary-text" : ""
              }`}
            />
          </span>
        </button>

        {onReset && activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            aria-label="Filter zurücksetzen"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl bg-card border border-border text-rose-500 active:scale-95 transition flex-shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter content: hidden on mobile until toggled, ALWAYS visible on md+ */}
      <div className={expanded ? "block" : "hidden md:block"}>{children}</div>
    </div>
  );
}
