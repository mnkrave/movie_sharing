import { COLLECTIONS_DATA } from "./collections";
import { OSCAR_WINNERS } from "./oscars";
import { getItemRuntimeMinutes, type MediaRuntimeMeta } from "./seasons";

export type BadgeTier = "bronze" | "silver" | "gold" | "platinum";
export type BadgeCategory = "milestones" | "cinema" | "community" | "collections";

export type BadgeIconName =
  | "clock"
  | "flame"
  | "film"
  | "award"
  | "crown"
  | "history"
  | "clapperboard"
  | "compass"
  | "trophy"
  | "tv"
  | "sparkles"
  | "scale"
  | "heart"
  | "megaphone"
  | "users"
  | "layers";

export interface BadgeDefinition {
  key: string;
  title: string;
  description: string;
  category: BadgeCategory;
  tier: BadgeTier;
  icon: BadgeIconName;
  target: number;
  unit?: string;
  collectionId?: string;
}

export interface PersistedBadgeRecord {
  badgeKey: string;
  unlockedAt: string;
}

export interface EvaluatedBadge extends BadgeDefinition {
  unlocked: boolean;
  progressCurrent: number;
  progressTarget: number;
  progressPercent: number;
  unlockedAt?: string;
}

export interface BadgeWatchedInput {
  tmdbId: number;
  mediaType: "movie" | "tv";
  releaseYear?: string | null;
  rating?: number | null;
  watchedSeasons?: number[] | null;
  totalSeasons?: number | null;
}

const OSCAR_MOVIE_IDS = new Set(OSCAR_WINNERS.map((o) => o.tmdbId));

export const CORE_BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Milestones (Watchtime & Watched Count)
  {
    key: "watchtime-100h",
    title: "Kino-Starter",
    description: "100 Stunden Filme & Serien geschaut",
    category: "milestones",
    tier: "bronze",
    icon: "clock",
    target: 100,
    unit: "Std.",
  },
  {
    key: "watchtime-500h",
    title: "Cinephile Ausdauer",
    description: "500 Stunden Kino-Lebenszeit gesammelt",
    category: "milestones",
    tier: "silver",
    icon: "clock",
    target: 500,
    unit: "Std.",
  },
  {
    key: "watchtime-1000h",
    title: "1.000h Kino-Lebenszeit",
    description: "Über 1.000 Stunden vor der Leinwand verbracht",
    category: "milestones",
    tier: "platinum",
    icon: "flame",
    target: 1000,
    unit: "Std.",
  },
  {
    key: "club-50",
    title: "Stammgast",
    description: "50 Filme oder Serien gesehen",
    category: "milestones",
    tier: "bronze",
    icon: "film",
    target: 50,
    unit: "Titel",
  },
  {
    key: "club-100",
    title: "Centurion",
    description: "100 gesehene Titel im Archiv",
    category: "milestones",
    tier: "silver",
    icon: "film",
    target: 100,
    unit: "Titel",
  },
  {
    key: "club-250",
    title: "250-Club",
    description: "Meilenstein von 250 gesehenen Titeln geknackt",
    category: "milestones",
    tier: "gold",
    icon: "award",
    target: 250,
    unit: "Titel",
  },
  {
    key: "club-500",
    title: "Film-Legende",
    description: "500 gesehene Filme & Serien — echte Leidenschaft",
    category: "milestones",
    tier: "platinum",
    icon: "crown",
    target: 500,
    unit: "Titel",
  },

  // Cinema History & Taste
  {
    key: "pre-1950",
    title: "Goldene Ära",
    description: "Einen Klassiker aus der Zeit vor 1950 gesehen",
    category: "cinema",
    tier: "gold",
    icon: "history",
    target: 1,
    unit: "Film",
  },
  {
    key: "pre-1970",
    title: "Klassiker-Archiv",
    description: "5 Filme aus der Ära vor 1970 geschaut",
    category: "cinema",
    tier: "silver",
    icon: "clapperboard",
    target: 5,
    unit: "Filme",
  },
  {
    key: "time-traveler",
    title: "Zeitreisender",
    description: "Titel aus mindestens 6 verschiedenen Jahrzehnten",
    category: "cinema",
    tier: "gold",
    icon: "compass",
    target: 6,
    unit: "Jahrzehnte",
  },
  {
    key: "oscar-10",
    title: "Academy-Kenner",
    description: "10 Oscar-Gewinner (Bester Film) gesehen",
    category: "cinema",
    tier: "silver",
    icon: "trophy",
    target: 10,
    unit: "Oscars",
  },
  {
    key: "oscar-25",
    title: "Oscar-Archivar",
    description: "25 Oscar-Gewinner (Bester Film) gesehen",
    category: "cinema",
    tier: "platinum",
    icon: "trophy",
    target: 25,
    unit: "Oscars",
  },
  {
    key: "series-binge",
    title: "Serien-Marathon",
    description: "25 TV-Serien abgeschlossen",
    category: "cinema",
    tier: "silver",
    icon: "tv",
    target: 25,
    unit: "Serien",
  },
  {
    key: "masterpiece-hunter",
    title: "Meisterwerk-Jäger",
    description: "10 Titel mit vollen 10/10 Sternen bewertet",
    category: "cinema",
    tier: "bronze",
    icon: "sparkles",
    target: 10,
    unit: "10★",
  },
  {
    key: "tough-critic",
    title: "Strenger Kritiker",
    description: "5 Titel kritisch mit 4/10 oder weniger bewertet",
    category: "cinema",
    tier: "bronze",
    icon: "scale",
    target: 5,
    unit: "Wertungen",
  },

  // Community
  {
    key: "first-tip",
    title: "Tippgeber",
    description: "Erste Filmempfehlung mit Freunden geteilt",
    category: "community",
    tier: "bronze",
    icon: "heart",
    target: 1,
    unit: "Tipp",
  },
  {
    key: "curator-10",
    title: "Chef-Kurator",
    description: "10 persönliche Empfehlungen ausgesprochen",
    category: "community",
    tier: "gold",
    icon: "megaphone",
    target: 10,
    unit: "Tipps",
  },
  {
    key: "cine-circle-5",
    title: "Kino-Crew",
    description: "Mit mindestens 5 Freunden vernetzt",
    category: "community",
    tier: "silver",
    icon: "users",
    target: 5,
    unit: "Freunde",
  },
];

export const COLLECTION_BADGE_DEFINITIONS: BadgeDefinition[] = COLLECTIONS_DATA.map((col) => ({
  key: `collection-${col.id}`,
  title: col.name,
  description: `Alle ${col.movies.length} Titel dieser Kollektion gesehen`,
  category: "collections",
  tier: col.movies.length >= 10 ? "platinum" : "gold",
  icon: "layers",
  target: col.movies.length,
  unit: "Teile",
  collectionId: col.id,
}));

export const ALL_BADGE_DEFINITIONS: BadgeDefinition[] = [
  ...CORE_BADGE_DEFINITIONS,
  ...COLLECTION_BADGE_DEFINITIONS,
];

export const TIER_ORDER: Record<BadgeTier, number> = {
  platinum: 4,
  gold: 3,
  silver: 2,
  bronze: 1,
};

export const TIER_LABELS: Record<BadgeTier, string> = {
  platinum: "Platin",
  gold: "Gold",
  silver: "Silber",
  bronze: "Bronze",
};

export function evaluateUserBadges(input: {
  watchedItems: BadgeWatchedInput[];
  recommendationsCount: number;
  friendsCount?: number;
  metaMap?: Record<string, MediaRuntimeMeta>;
  persistedBadges?: PersistedBadgeRecord[];
}): EvaluatedBadge[] {
  const {
    watchedItems,
    recommendationsCount,
    friendsCount,
    metaMap,
    persistedBadges = [],
  } = input;

  const persistedMap = new Map<string, string>();
  for (const record of persistedBadges) {
    if (record.badgeKey) {
      persistedMap.set(record.badgeKey, record.unlockedAt);
    }
  }

  let totalMinutes = 0;
  let movieCount = 0;
  let tvCount = 0;
  let pre1950Count = 0;
  let pre1970Count = 0;
  let oscarCount = 0;
  let tenStarCount = 0;
  let lowRatingCount = 0;
  const decades = new Set<number>();
  const watchedKeys = new Set<string>();

  for (const item of watchedItems) {
    const key = `${item.mediaType}_${item.tmdbId}`;
    watchedKeys.add(key);

    const meta = metaMap?.[key];
    totalMinutes += getItemRuntimeMinutes(item, meta);

    if (item.mediaType === "tv") {
      tvCount += 1;
    } else {
      movieCount += 1;
      if (OSCAR_MOVIE_IDS.has(item.tmdbId)) {
        oscarCount += 1;
      }
    }

    const yearRaw = item.releaseYear || (meta as { releaseYear?: string } | undefined)?.releaseYear || "";
    const year = parseInt(yearRaw, 10);
    if (Number.isFinite(year) && year > 1880 && year <= 2100) {
      decades.add(Math.floor(year / 10) * 10);
      if (item.mediaType === "movie") {
        if (year < 1950) pre1950Count += 1;
        if (year < 1970) pre1970Count += 1;
      }
    }

    if (typeof item.rating === "number" && item.rating > 0) {
      if (item.rating >= 10) tenStarCount += 1;
      if (item.rating <= 4) lowRatingCount += 1;
    }
  }

  const totalHours = Math.floor(totalMinutes / 60);
  const totalWatched = movieCount + tvCount;
  const decadeCount = decades.size;

  const collectionProgressById = new Map<string, number>();
  for (const col of COLLECTIONS_DATA) {
    let seen = 0;
    for (const m of col.movies) {
      const mKey = `${m.mediaType || "movie"}_${m.id}`;
      if (watchedKeys.has(mKey)) {
        seen += 1;
      }
    }
    collectionProgressById.set(col.id, seen);
  }

  const metricByKey: Record<string, number> = {
    "watchtime-100h": totalHours,
    "watchtime-500h": totalHours,
    "watchtime-1000h": totalHours,
    "club-50": totalWatched,
    "club-100": totalWatched,
    "club-250": totalWatched,
    "club-500": totalWatched,
    "pre-1950": pre1950Count,
    "pre-1970": pre1970Count,
    "time-traveler": decadeCount,
    "oscar-10": oscarCount,
    "oscar-25": oscarCount,
    "series-binge": tvCount,
    "masterpiece-hunter": tenStarCount,
    "tough-critic": lowRatingCount,
    "first-tip": recommendationsCount,
    "curator-10": recommendationsCount,
    "cine-circle-5":
      typeof friendsCount === "number"
        ? friendsCount
        : persistedMap.has("cine-circle-5")
        ? 5
        : 0,
  };

  return ALL_BADGE_DEFINITIONS.map((def) => {
    const rawProgress = def.collectionId
      ? collectionProgressById.get(def.collectionId) || 0
      : metricByKey[def.key] || 0;
    const progressCurrent = Math.min(def.target, Math.max(0, rawProgress));
    const unlocked = rawProgress >= def.target;
    const progressPercent = def.target > 0 ? Math.min(100, Math.round((progressCurrent / def.target) * 100)) : 0;

    return {
      ...def,
      unlocked,
      progressCurrent,
      progressTarget: def.target,
      progressPercent,
      unlockedAt: unlocked ? persistedMap.get(def.key) : undefined,
    };
  });
}
