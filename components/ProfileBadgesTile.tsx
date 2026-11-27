"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import type { AppMediaStatus, AppUserBadge } from "@/lib/store";
import type { BatchMediaMeta } from "@/app/api/tmdb/batch-genres/route";
import {
  BadgeCategory,
  BadgeIconName,
  BadgeTier,
  EvaluatedBadge,
  TIER_LABELS,
  TIER_ORDER,
  evaluateUserBadges,
} from "@/lib/badges";
import {
  Award,
  ChevronDown,
  ChevronUp,
  Clapperboard,
  Clock,
  Compass,
  Crown,
  Film,
  Flame,
  Heart,
  History,
  Layers,
  Lock,
  Megaphone,
  Scale,
  Sparkles,
  Trophy,
  Tv,
  Users,
} from "lucide-react";

const ICON_MAP: Record<BadgeIconName, React.ComponentType<{ className?: string }>> = {
  clock: Clock,
  flame: Flame,
  film: Film,
  award: Award,
  crown: Crown,
  history: History,
  clapperboard: Clapperboard,
  compass: Compass,
  trophy: Trophy,
  tv: Tv,
  sparkles: Sparkles,
  scale: Scale,
  heart: Heart,
  megaphone: Megaphone,
  users: Users,
  layers: Layers,
};

const TIER_STYLES: Record<
  BadgeTier,
  {
    card: string;
    ring: string;
    pill: string;
    icon: string;
  }
> = {
  platinum: {
    card: "border-indigo-500/40 bg-gradient-to-br from-indigo-500/12 via-violet-500/6 to-card",
    ring: "bg-indigo-500/15 border-indigo-500/45 ring-2 ring-indigo-500/15",
    pill: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
    icon: "text-indigo-600 dark:text-indigo-300",
  },
  gold: {
    card: "border-amber-500/45 bg-gradient-to-br from-amber-500/14 via-amber-500/5 to-card",
    ring: "bg-amber-500/15 border-amber-500/50 ring-2 ring-amber-500/15",
    pill: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/35",
    icon: "text-amber-600 dark:text-amber-300",
  },
  silver: {
    card: "border-slate-400/45 bg-gradient-to-br from-slate-400/12 via-slate-400/4 to-card",
    ring: "bg-slate-400/15 border-slate-400/50 ring-2 ring-slate-400/10",
    pill: "bg-slate-400/15 text-slate-700 dark:text-slate-200 border-slate-400/35",
    icon: "text-slate-600 dark:text-slate-200",
  },
  bronze: {
    card: "border-orange-500/40 bg-gradient-to-br from-orange-500/12 via-amber-700/5 to-card",
    ring: "bg-orange-500/15 border-orange-500/40 ring-2 ring-orange-500/10",
    pill: "bg-orange-500/15 text-orange-800 dark:text-orange-300 border-orange-500/30",
    icon: "text-orange-600 dark:text-orange-300",
  },
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

function BadgeMedallionCard({ badge }: { badge: EvaluatedBadge }) {
  const Icon = ICON_MAP[badge.icon] || Award;
  const styles = TIER_STYLES[badge.tier];
  const unlockedDate = badge.unlockedAt
    ? new Date(badge.unlockedAt).toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div
      className={`rounded-2xl border p-3.5 transition flex flex-col justify-between gap-3 ${
        badge.unlocked
          ? `${styles.card} shadow-xs`
          : "border-border bg-muted/35 opacity-80"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-11 h-11 rounded-full border flex items-center justify-center shrink-0 ${
            badge.unlocked
              ? styles.ring
              : "bg-muted border-border text-muted-foreground"
          }`}
        >
          {badge.unlocked ? (
            <Icon className={`w-5 h-5 ${styles.icon}`} aria-hidden="true" />
          ) : (
            <Lock className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-1.5">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide ${
                badge.unlocked
                  ? styles.pill
                  : "bg-muted text-muted-foreground border-border"
              }`}
            >
              {TIER_LABELS[badge.tier]}
            </span>

            {badge.unlocked && unlockedDate && (
              <span className="text-[10px] text-muted-foreground font-mono">
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
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground">
            <span>
              {badge.progressCurrent} / {badge.progressTarget}
              {badge.unit ? ` ${badge.unit}` : ""}
            </span>
            <span className="font-mono">{badge.progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden border border-border/60">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${Math.max(badge.progressCurrent > 0 ? 5 : 0, badge.progressPercent)}%` }}
            />
          </div>
        </div>
      ) : badge.collectionId ? (
        <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[11px]">
          <span className="font-semibold text-primary-text">Abgeschlossen</span>
          <Link
            href={`/collections/${badge.collectionId}`}
            className="font-semibold text-muted-foreground hover:text-foreground transition"
          >
            Kollektion →
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
  const [expanded, setExpanded] = useState(false);
  const [category, setCategory] = useState<"all" | BadgeCategory>("all");
  const [onlyUnlocked, setOnlyUnlocked] = useState(false);

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

  const filteredExpandedBadges = useMemo(() => {
    return badges
      .filter((b) => (category === "all" ? true : b.category === category))
      .filter((b) => (onlyUnlocked ? b.unlocked : true))
      .sort((a, b) => {
        if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
        if (a.unlocked) return TIER_ORDER[b.tier] - TIER_ORDER[a.tier];
        return b.progressPercent - a.progressPercent;
      });
  }, [badges, category, onlyUnlocked]);

  const compactBadges = useMemo(
    () => unlockedBadges.slice(0, isOwnProfile ? 6 : 8),
    [unlockedBadges, isOwnProfile]
  );

  return (
    <section
      aria-label="Verdiente Badges"
      className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-xs space-y-4"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Award className="w-4 h-4 text-primary-text shrink-0" aria-hidden="true" />
            <h2 className="text-base font-bold text-foreground">
              {isOwnProfile ? "Deine Badges" : `Badges von ${ownerName || "Mitglied"}`}
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-primary-soft text-primary-text font-mono text-xs font-bold">
              {unlockedBadges.length} / {badges.length}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {unlockedBadges.length > 0
              ? `${tierCounts.platinum} Platin · ${tierCounts.gold} Gold · ${tierCounts.silver} Silber · ${tierCounts.bronze} Bronze`
              : "Sammle Badges durch Watchtime, Klassiker vor 1950 und abgeschlossene Kollektionen."}
          </p>
        </div>

        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((prev) => !prev)}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-muted hover:bg-muted/80 border border-border text-xs font-semibold text-foreground transition cursor-pointer self-start sm:self-auto"
        >
          <span>{expanded ? "Kompakt" : `Alle ${badges.length} ansehen`}</span>
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Compact Mode */}
      {!expanded ? (
        <div className="space-y-4">
          {compactBadges.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {compactBadges.map((badge) => (
                <BadgeMedallionCard key={badge.key} badge={badge} />
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-muted/50 border border-border text-xs text-muted-foreground">
              Noch keine Badges freigeschaltet.
            </div>
          )}

          {isOwnProfile && nextMilestones.length > 0 && (
            <div className="pt-3 border-t border-border space-y-2.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Nächste Meilensteine
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {nextMilestones.map((badge) => (
                  <div
                    key={badge.key}
                    className="p-3 rounded-xl bg-muted/45 border border-border space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-foreground truncate">
                        {badge.title}
                      </span>
                      <span className="font-mono text-[11px] text-primary-text font-bold shrink-0">
                        {badge.progressCurrent}/{badge.progressTarget}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-background overflow-hidden border border-border/60">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${Math.max(5, badge.progressPercent)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Expanded Catalog Mode */
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
                        : "bg-muted/50 text-muted-foreground border-border hover:text-foreground"
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
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                onlyUnlocked
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/50 text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              Nur freigeschaltete ({unlockedBadges.length})
            </button>
          </div>

          {filteredExpandedBadges.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredExpandedBadges.map((badge) => (
                <BadgeMedallionCard key={badge.key} badge={badge} />
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
