"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ArrowDown, Loader2, Check } from "lucide-react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  threshold?: number;
  maxPull?: number;
  pullingText?: string;
  releaseText?: string;
  refreshingText?: string;
}

export function PullToRefresh({
  onRefresh,
  children,
  threshold = 64,
  maxPull = 96,
  pullingText = "Nach unten ziehen...",
  releaseText = "Loslassen zum Aktualisieren",
  refreshingText = "Aktualisiere...",
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  const startYRef = useRef<number | null>(null);
  const isPullingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasVibratedRef = useRef(false);

  const isAtTop = () => {
    if (typeof window === "undefined") return false;
    return window.scrollY <= 1;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isRefreshing || !isAtTop()) return;
    startYRef.current = e.touches[0].clientY;
    hasVibratedRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startYRef.current === null || isRefreshing) return;

    // If user scrolled down before pulling, don't initiate pull
    if (!isAtTop()) {
      startYRef.current = null;
      isPullingRef.current = false;
      setPullDistance(0);
      return;
    }

    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;

    if (diff > 0) {
      isPullingRef.current = true;
      // Damping resistance: pull becomes progressively stiffer
      const resistance = 0.42;
      const calculated = Math.min(diff * resistance, maxPull);
      setPullDistance(calculated);

      // Light haptic feedback once threshold is crossed
      if (calculated >= threshold && !hasVibratedRef.current) {
        hasVibratedRef.current = true;
        try {
          if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
            navigator.vibrate(12);
          }
        } catch {
          // ignore
        }
      } else if (calculated < threshold) {
        hasVibratedRef.current = false;
      }
    } else {
      isPullingRef.current = false;
      setPullDistance(0);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPullingRef.current || startYRef.current === null) {
      startYRef.current = null;
      setPullDistance(0);
      return;
    }

    const shouldRefresh = pullDistance >= threshold;
    startYRef.current = null;
    isPullingRef.current = false;

    if (shouldRefresh && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(48); // Hold at comfortable height while spinning
      try {
        await onRefresh();
        setJustCompleted(true);
        setTimeout(() => {
          setJustCompleted(false);
          setIsRefreshing(false);
          setPullDistance(0);
        }, 500);
      } catch {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  const progress = Math.min(pullDistance / threshold, 1);
  const isReady = pullDistance >= threshold;

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className="relative"
    >
      {/* Pull Indicator Area */}
      <div
        style={{
          height: `${pullDistance}px`,
          transition: isPullingRef.current ? "none" : "height 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        className="overflow-hidden flex items-center justify-center pointer-events-none select-none"
        aria-hidden="true"
      >
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-lg text-xs font-semibold">
          {isRefreshing ? (
            justCompleted ? (
              <>
                <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                <span className="text-emerald-300 font-bold">Aktualisiert ✓</span>
              </>
            ) : (
              <>
                <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                <span className="text-slate-300 font-medium">{refreshingText}</span>
              </>
            )
          ) : (
            <>
              <ArrowDown
                style={{
                  transform: `rotate(${isReady ? 180 : progress * 180}deg)`,
                  transition: "transform 0.15s ease-out",
                }}
                className={`w-4 h-4 ${
                  isReady ? "text-amber-400 stroke-[2.5]" : "text-slate-400"
                }`}
              />
              <span className={isReady ? "text-amber-300 font-bold" : "text-slate-400"}>
                {isReady ? releaseText : pullingText}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      {children}
    </div>
  );
}
