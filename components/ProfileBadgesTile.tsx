"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import type { AppMediaStatus, AppUserBadge } from "@/lib/store";
import type { BatchMediaMeta } from "@/app/api/tmdb/batch-genres/route";
import {
  BadgeCategory,
  BadgeTier,
  EvaluatedBadge,
  TIER_LABELS,
  TIER_ORDER,
  evaluateUserBadges,
} from "@/lib/badges";
import { BadgeEmblem } from "@/components/BadgeEmblem";
import { Award, LayoutGrid, Sparkles, ArrowRight } from "lucide-react";

const TIER_ACCENT_TEXT: Record<BadgeTier, string> = {
  platinum: "text-indigo-500 dark:text-[#93C5FD]",
  gold: "text-amber-600 dark:text-[#FACC15]",
  silver: "text-slate-600 dark:text-[#CBD5E1]",
  bronze: "text-orange-700 dark:text-[#E8A86B]",
};

const TIER_BORDER_COLORS: Record<BadgeTier, string> = {
  platinum: "border-indigo-400/50 dark:border-[rgba(165,180,252,0.65)]",
  gold: "border-amber-400/55 dark:border-[rgba(250,204,21,0.55)]",
  silver: "border-slate-400/50 dark:border-[rgba(203,213,225,0.45)]",
  bronze: "border-orange-500/45 dark:border-[rgba(205,127,50,0.45)]",
};

const TIER_DOT_COLORS: Record<BadgeTier, string> = {
  platinum: "bg-[#818CF8]",
  gold: "bg-[#EAB308]",
  silver: "bg-[#CBD5E1]",
  bronze: "bg-[#CD7F32]",
};

const CATEGORY_TABS: ReadonlyArray<{ key: "all" | BadgeCategory; label: string }> = [
  { key: "all", label: "Alle" },
  { key: "milestones", label: "Meilensteine" },
  { key: "cinema", label: "Kino & Geschichte" },
  { key: "collections", label: "Kollektionen" },
  { key: "community", label: "Community" },
];

interface ProfileBadgesTileProps {
  watchedItems: AppMediaStatus[];
  recommendationsCount: number;
  friendsCount?: number;
  metaMap?: Record<string, BatchMediaMeta>;
  persistedBadges?: AppUserBadge[];
  isOwnProfile?: boolean;
  ownerName?: string;
}

function formatUnlockDate(raw?: string): string | null {
  if (!raw) return null;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function RasterBadgeCard({
  badge,
  recentlyUnlocked,
}: {
  badge: EvaluatedBadge;
  recentlyUnlocked: boolean;
}) {
  const unlockedDate = formatUnlockDate(badge.unlockedAt);
  const borderClass = badge.unlocked ? TIER_BORDER_COLORS[badge.tier] : "border-border";

  return (
    <div
      className={`trophy-card rounded-2xl border p-4 transition flex flex-col justify-between gap-3 ${borderClass} ${
        badge.unlocked ? "shadow-xs" : "opacity-85"
      }`}
    >
      <div className="flex items-start gap-3.5">
        <BadgeEmblem
          badgeKey={badge.key}
          tier={badge.tier}
          unlocked={badge.unlocked}
          size="md"
          recentlyUnlocked={recentlyUnlocked}
        />

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${
                badge.unlocked ? TIER_ACCENT_TEXT[badge.tier] : "text-muted-foreground"
              }`}
            >
              {TIER_LABELS[badge.tier]}
            </span>

            {badge.unlocked && unlockedDate && (
              <span className="text-[10px] text-muted-foreground tabular-nums">
                {unlockedDate}
              </span>
            )}
          </div>

          <h3 className="text-xs sm:text-sm font-bold text-foreground leading-snug line-clamp-1">
            {badge.title}
          </h3>
          <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
            {badge.description}
          </p>
        </div>
      </div>

      {!badge.unlocked ? (
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground tabular-nums">
            <span>
              {badge.progressCurrent.toLocaleString("de-DE")} /{" "}
              {badge.progressTarget.toLocaleString("de-DE")}
              {badge.unit ? ` ${badge.unit}` : ""}
            </span>
            <span>{badge.progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden border border-border/60">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{
                width: `${Math.max(badge.progressCurrent > 0 ? 5 : 0, badge.progressPercent)}%`,
              }}
            />
          </div>
        </div>
      ) : badge.collectionId ? (
        <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[11px]">
          <span className={`font-semibold ${TIER_ACCENT_TEXT[badge.tier]}`}>
            Komplettiert
          </span>
          <Link
            href={`/collections/${badge.collectionId}`}
            className="inline-flex items-center gap-1 font-semibold text-muted-foreground hover:text-foreground transition"
          >
            <span>Kollektion</span>
            <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export function ProfileBadgesTile({
  watchedItems,
  recommendationsCount,
  friendsCount,
  metaMap,
  persistedBadges,
  isOwnProfile = false,
  ownerName,
}: ProfileBadgesTileProps) {
  const [viewMode, setViewMode] = useState<"vitrine" | "raster">("vitrine");
  const [showAllVitrine, setShowAllVitrine] = useState(false);
  const [category, setCategory] = useState<"all" | BadgeCategory>("all");
  const [onlyUnlocked, setOnlyUnlocked] = useState(false);
  const [selectedBadgeKey, setSelectedBadgeKey] = useState<string | null>(null);

  const badges = useMemo(
    () =>
      evaluateUserBadges({
        watchedItems,
        recommendationsCount,
        friendsCount,
        metaMap,
        persistedBadges,
      }),
    [watchedItems, recommendationsCount, friendsCount, metaMap, persistedBadges]
  );

  // Track newly unlocked badges in the active session for the 1-shot unlock snap animation
  const previousUnlockedRef = useRef<Set<string> | null>(null);
  const [recentlyUnlockedKeys, setRecentlyUnlockedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    const currentKeys = new Set(badges.filter((b) => b.unlocked).map((b) => b.key));
    if (previousUnlockedRef.current === null) {
      previousUnlockedRef.current = currentKeys;
      return;
    }
    const newlyUnlocked = Array.from(currentKeys).filter(
      (k) => !previousUnlockedRef.current!.has(k)
    );
    previousUnlockedRef.current = currentKeys;
    if (newlyUnlocked.length > 0) {
      setRecentlyUnlockedKeys(new Set(newlyUnlocked));
      const timer = setTimeout(() => setRecentlyUnlockedKeys(new Set()), 900);
      return () => clearTimeout(timer);
    }
  }, [badges]);

  const unlockedBadges = useMemo(
    () =>
      badges
        .filter((b) => b.unlocked)
        .sort(
          (a, b) =>
            TIER_ORDER[b.tier] - TIER_ORDER[a.tier] ||
            b.progressTarget - a.progressTarget
        ),
    [badges]
  );

  const nextMilestones = useMemo(
    () =>
      badges
        .filter((b) => !b.unlocked && b.progressCurrent > 0)
        .sort(
          (a, b) =>
            b.progressPercent - a.progressPercent ||
            TIER_ORDER[a.tier] - TIER_ORDER[b.tier]
        )
        .slice(0, 3),
    [badges]
  );

  const tierCounts = useMemo(() => {
    const counts: Record<BadgeTier, number> = {
      platinum: 0,
      gold: 0,
      silver: 0,
      bronze: 0,
    };
    unlockedBadges.forEach((b) => {
      counts[b.tier] += 1;
    });
    return counts;
  }, [unlockedBadges]);

  const vitrineDisplayBadges = useMemo(() => {
    if (showAllVitrine) return unlockedBadges;
    const limit = isOwnProfile ? 8 : 10;
    return unlockedBadges.slice(0, limit);
  }, [unlockedBadges, showAllVitrine, isOwnProfile]);

  const inspectedBadge = useMemo(() => {
    if (selectedBadgeKey) {
      const found = badges.find((b) => b.key === selectedBadgeKey);
      if (found) return found;
    }
    return unlockedBadges[0] || nextMilestones[0] || badges[0] || null;
  }, [badges, selectedBadgeKey, unlockedBadges, nextMilestones]);

  const filteredRasterBadges = useMemo(() => {
    return badges
      .filter((b) => (category === "all" ? true : b.category === category))
      .filter((b) => (onlyUnlocked ? b.unlocked : true))
      .sort((a, b) => {
        if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
        if (a.unlocked) return TIER_ORDER[b.tier] - TIER_ORDER[a.tier];
        return b.progressPercent - a.progressPercent;
      });
  }, [badges, category, onlyUnlocked]);

  return (
    <section
      aria-label="Trophäenschrank & Badges"
      className="trophy-cabinet rounded-2xl border border-border p-5 sm:p-6 shadow-xs space-y-5"
    >
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <Award className="w-4 h-4 text-primary-text shrink-0" aria-hidden="true" />
            <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
              {isOwnProfile ? "Trophäenschrank" : `Trophäenschrank · ${ownerName || "Mitglied"}`}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-primary-soft text-primary-text text-xs font-bold tabular-nums">
              {unlockedBadges.length} / {badges.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground tabular-nums">
            {(["platinum", "gold", "silver", "bronze"] as const).map((tier) => (
              <span key={tier} className="inline-flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${TIER_DOT_COLORS[tier]}`} aria-hidden="true" />
                <span>
                  {tierCounts[tier]} {TIER_LABELS[tier]}
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Duo-Layout Switcher: Vitrine vs Raster */}
        <div
          role="group"
          aria-label="Ansicht wechseln"
          className="inline-flex items-center p-1 rounded-xl bg-muted border border-border self-start sm:self-auto"
        >
          <button
            type="button"
            aria-pressed={viewMode === "vitrine"}
            onClick={() => setViewMode("vitrine")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              viewMode === "vitrine"
                ? "bg-card text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground border border-transparent"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-primary-text" aria-hidden="true" />
            <span>Vitrine</span>
          </button>

          <button
            type="button"
            aria-pressed={viewMode === "raster"}
            onClick={() => setViewMode("raster")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              viewMode === "raster"
                ? "bg-card text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground border border-transparent"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-primary-text" aria-hidden="true" />
            <span>Alle {badges.length}</span>
          </button>
        </div>
      </div>

      {/* MODE 1: VITRINE / PIN-BOARD (Frameless Collector Showcase) */}
      {viewMode === "vitrine" ? (
        <div className="space-y-5">
          {vitrineDisplayBadges.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-x-3 gap-y-5 pt-1">
                {vitrineDisplayBadges.map((badge) => {
                  const isSelected = inspectedBadge?.key === badge.key;
                  return (
                    <button
                      key={badge.key}
                      type="button"
                      onClick={() => setSelectedBadgeKey(badge.key)}
                      aria-pressed={isSelected}
                      className={`badge-pin-trigger group flex flex-col items-center text-center gap-2 rounded-xl p-1.5 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        isSelected ? "bg-muted/70" : "hover:bg-muted/40"
                      }`}
                    >
                      <BadgeEmblem
                        badgeKey={badge.key}
                        tier={badge.tier}
                        unlocked={true}
                        size="lg"
                        recentlyUnlocked={recentlyUnlockedKeys.has(badge.key)}
                      />
                      <div className="space-y-0.5 max-w-full">
                        <span className="block text-[11px] font-bold text-foreground leading-tight line-clamp-2">
                          {badge.title}
                        </span>
                        <span
                          className={`block text-[9px] font-bold uppercase tracking-wider ${TIER_ACCENT_TEXT[badge.tier]}`}
                        >
                          {TIER_LABELS[badge.tier]}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {unlockedBadges.length > (isOwnProfile ? 8 : 10) && (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => setShowAllVitrine((prev) => !prev)}
                    className="text-xs font-semibold text-primary-text hover:underline cursor-pointer"
                  >
                    {showAllVitrine
                      ? "Weniger Pins anzeigen"
                      : `Alle ${unlockedBadges.length} freigeschalteten Pins zeigen`}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-muted-foreground">
              Noch keine Trophäen freigeschaltet — entdecke Filme &amp; Serien oder wechsle auf „Alle {badges.length}“, um Fortschritte zu sehen.
            </div>
          )}

          {/* Selected Pin Collector Plaque */}
          {inspectedBadge && (
            <div className="trophy-card rounded-xl border border-border px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <BadgeEmblem
                  badgeKey={inspectedBadge.key}
                  tier={inspectedBadge.tier}
                  unlocked={inspectedBadge.unlocked}
                  size="sm"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-foreground">
                      {inspectedBadge.title}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        inspectedBadge.unlocked
                          ? TIER_ACCENT_TEXT[inspectedBadge.tier]
                          : "text-muted-foreground"
                      }`}
                    >
                      {TIER_LABELS[inspectedBadge.tier]}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{inspectedBadge.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 tabular-nums text-xs">
                {inspectedBadge.unlocked ? (
                  <>
                    {formatUnlockDate(inspectedBadge.unlockedAt) && (
                      <span className="text-muted-foreground">
                        Freigeschaltet am {formatUnlockDate(inspectedBadge.unlockedAt)}
                      </span>
                    )}
                    {inspectedBadge.collectionId && (
                      <Link
                        href={`/collections/${inspectedBadge.collectionId}`}
                        className="inline-flex items-center gap-1 font-semibold text-primary-text hover:underline"
                      >
                        <span>Kollektion</span>
                        <ArrowRight className="w-3 h-3" aria-hidden="true" />
                      </Link>
                    )}
                  </>
                ) : (
                  <span className="font-semibold text-primary-text">
                    {inspectedBadge.progressCurrent.toLocaleString("de-DE")} /{" "}
                    {inspectedBadge.progressTarget.toLocaleString("de-DE")}{" "}
                    {inspectedBadge.unit || ""} ({inspectedBadge.progressPercent}%)
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Closest Silhouette-Preview Milestones (Own Profile) */}
          {isOwnProfile && nextMilestones.length > 0 && (
            <div className="pt-3 border-t border-border/70 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Kurz vor Freischaltung (Silhouette-Preview)
                </p>
                <button
                  type="button"
                  onClick={() => setViewMode("raster")}
                  className="text-xs font-semibold text-primary-text hover:underline cursor-pointer"
                >
                  Katalog öffnen →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {nextMilestones.map((badge) => (
                  <button
                    key={badge.key}
                    type="button"
                    onClick={() => setSelectedBadgeKey(badge.key)}
                    className="trophy-card text-left p-3 rounded-xl border border-border hover:border-primary/40 transition flex items-center gap-3 cursor-pointer"
                  >
                    <BadgeEmblem
                      badgeKey={badge.key}
                      tier={badge.tier}
                      unlocked={false}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-semibold text-foreground truncate">
                          {badge.title}
                        </span>
                        <span className="font-mono text-[11px] text-primary-text font-bold tabular-nums shrink-0">
                          {badge.progressCurrent}/{badge.progressTarget}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500"
                          style={{ width: `${Math.max(5, badge.progressPercent)}%` }}
                        />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* MODE 2: RASTER (Full 37-Badge Catalog Grid with Silhouette Previews) */
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full">
              {CATEGORY_TABS.map((tab) => {
                const active = category === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setCategory(tab.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap border transition cursor-pointer ${
                      active
                        ? "bg-primary-soft text-primary-text border-primary/40"
                        : "bg-muted/60 text-muted-foreground border-border hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setOnlyUnlocked((prev) => !prev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer tabular-nums ${
                onlyUnlocked
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/60 text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              Nur freigeschaltete ({unlockedBadges.length})
            </button>
          </div>

          {filteredRasterBadges.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredRasterBadges.map((badge) => (
                <RasterBadgeCard
                  key={badge.key}
                  badge={badge}
                  recentlyUnlocked={recentlyUnlockedKeys.has(badge.key)}
                />
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-xs text-muted-foreground">
              Keine Badges in dieser Kategorie freigeschaltet.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
