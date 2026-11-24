"use client";

import React, { useState, useRef } from "react";
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

  const startXRef = useRef<number | null>(null);
  const startYRef = useRef<number | null>(null);
  const isPullingRef = useRef(false);
  const axisLockedRef = useRef<"x" | "y" | null>(null);
  const hasVibratedRef = useRef(false);

  const isAtTop = () => typeof window !== "undefined" && window.scrollY <= 1;

  const resetGesture = () => {
    startXRef.current = null;
    startYRef.current = null;
    isPullingRef.current = false;
    axisLockedRef.current = null;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isRefreshing || !isAtTop() || e.touches.length !== 1) return;
    startXRef.current = e.touches[0].clientX;
    startYRef.current = e.touches[0].clientY;
    axisLockedRef.current = null;
    hasVibratedRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startYRef.current === null || startXRef.current === null || isRefreshing) return;

    if (!isAtTop()) {
      resetGesture();
      setPullDistance(0);
      return;
    }

    const dx = e.touches[0].clientX - startXRef.current;
    const dy = e.touches[0].clientY - startYRef.current;

    // Lock gesture axis once finger moves >= 8px so horizontal pill scrolling never triggers PTR
    if (axisLockedRef.current === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      axisLockedRef.current = Math.abs(dy) > Math.abs(dx) * 1.25 ? "y" : "x";
    }
    if (axisLockedRef.current === "x") {
      isPullingRef.current = false;
      setPullDistance(0);
      return;
    }

    if (dy > 0 && axisLockedRef.current === "y") {
      isPullingRef.current = true;
      const calculated = Math.min(dy * 0.42, maxPull);
      setPullDistance(calculated);

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
    } else if (dy <= 0) {
      isPullingRef.current = false;
      setPullDistance(0);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPullingRef.current || startYRef.current === null) {
      resetGesture();
      setPullDistance(0);
      return;
    }

    const shouldRefresh = pullDistance >= threshold;
    resetGesture();

    if (shouldRefresh && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(48);
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
  const showIndicator = pullDistance > 2 || isRefreshing;

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className="relative"
    >
      {/* Compositor-only Pull Indicator (no height reflow per frame) */}
      {showIndicator && (
        <div
          style={{
            transform: `translateY(${Math.max(0, pullDistance - 44)}px)`,
            opacity: Math.min(1, pullDistance / 36),
            transition: isPullingRef.current
              ? "none"
              : "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease-out",
          }}
          className="fixed md:hidden top-[calc(4.5rem+env(safe-area-inset-top))] inset-x-0 z-30 flex items-center justify-center pointer-events-none select-none"
          aria-hidden="true"
        >
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/95 border border-slate-700/90 backdrop-blur-md shadow-xl text-xs font-semibold">
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
      )}

      {/* Main Content shifted on GPU compositor only while actively pulling */}
      <div
        style={
          pullDistance > 0
            ? {
                transform: `translateY(${pullDistance}px)`,
                transition: isPullingRef.current
                  ? "none"
                  : "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
              }
            : undefined
        }
      >
        {children}
      </div>
    </div>
  );
}
