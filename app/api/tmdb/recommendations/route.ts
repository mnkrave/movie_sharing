import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { findUserByEmail, getAllCommunityData } from "@/lib/store";
import {
  ALL_GENRES_MAP,
  mapGenreIdsForMediaType,
  normalizeProviderKey,
  resolveItemGenres,
} from "@/lib/tmdb";

const TMDB_API_KEY = process.env.TMDB_API_KEY || "92dc1c6b15658b43e4c7a71b45addf36";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// Mapping from our subscription keys to official TMDB Watch Provider IDs in Germany (DE)
const SUB_KEY_TO_TMDB_PROVIDER_IDS: Record<string, number[]> = {
  netflix: [8, 1796, 175],
  prime: [9, 2100, 613],
  disney: [337],
  apple: [350, 2243],
  wow: [30, 29],
  paramount: [531, 582],
  crunchyroll: [283, 1968],
  max: [1899],
  mubi: [11, 201],
  ard_zdf: [219, 537, 234, 1902],
  joyn: [304, 421],
  rtl: [2750, 2578],
};

export interface RecommendedMediaItem {
  id: number;
  mediaType: "movie" | "tv";
  title: string;
  originalTitle?: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseYear: string;
  voteAverage: number;
  voteCount: number;
  genreIds: number[];
  genres: { id: number; name: string; emoji: string }[];
  matchScore: number;
  reasons: string[];
  seedTitles: string[];
  isComboMatch?: boolean;
  availableProvidersDE: {
    providerId: number;
    providerName: string;
    logoPath: string;
    isMySub: boolean;
  }[];
}

export interface TasteSummary {
  topGenres: { id: number; name: string; emoji: string; weight: number }[];
  topKeywords: { id: number; name: string; count: number }[];
  favoriteDirectors: string[];
  favoriteActors?: string[];
  seedCount: number;
}

interface SeedInput {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  rating?: number | null;
}

type WatchlistEntryInput = number | { tmdbId: number; mediaType?: "movie" | "tv" };

interface FriendEndorsement {
  friendName: string;
  rating: number;
  similarity: number;
  isExplicitRec: boolean;
}

interface CandidateEntry {
  raw: any;
  mediaType: "movie" | "tv";
  seedSources: { title: string; rating: number; sourceKind: "recommendations" | "similar" }[];
  fromDiscoverSub: boolean;
  fromKeywordDiscover: boolean;
  matchedPeople: { id: number; name: string; role: "director" | "actor" }[];
  friendEndorsements: FriendEndorsement[];
}

/**
 * Bounded in-memory LRU cache with TTL to prevent unbounded growth in long-running processes.
 */
class TtlLruCache<T> {
  private map = new Map<string, { value: T; expiresAt: number }>();

  constructor(
    private maxEntries: number,
    private ttlMs: number
  ) {}

  get(key: string): T | undefined {
    const entry = this.map.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.map.delete(key);
      return undefined;
    }
    // Refresh recency
    this.map.delete(key);
    this.map.set(key, entry);
    return entry.value;
  }

  set(key: string, value: T): void {
    if (this.map.has(key)) {
      this.map.delete(key);
    } else if (this.map.size >= this.maxEntries) {
      const oldestKey = this.map.keys().next().value;
      if (oldestKey !== undefined) {
        this.map.delete(oldestKey);
      }
    }
    this.map.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }
}

const seedCache = new TtlLruCache<any>(500, 24 * 60 * 60 * 1000);
const providerCache = new TtlLruCache<any[]>(800, 12 * 60 * 60 * 1000);

async function fetchSeedData(item: { tmdbId: number; mediaType: "movie" | "tv" }) {
  const key = `${item.mediaType}_${item.tmdbId}`;
  const cached = seedCache.get(key);
  if (cached) return cached;

  try {
    const url = `${TMDB_BASE_URL}/${item.mediaType}/${item.tmdbId}?api_key=${TMDB_API_KEY}&language=de-DE&append_to_response=keywords,recommendations,similar,credits`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const data = await res.json();
    seedCache.set(key, data);
    return data;
  } catch {
    return null;
  }
}

async function fetchDEProviders(mediaType: "movie" | "tv", id: number) {
  const key = `${mediaType}_${id}`;
  const cached = providerCache.get(key);
  if (cached) return cached;

  try {
    const url = `${TMDB_BASE_URL}/${mediaType}/${id}/watch/providers?api_key=${TMDB_API_KEY}`;
    const res = await fetch(url, { next: { revalidate: 43200 } });
    if (!res.ok) return [];
    const data = await res.json();
    const de = data.results?.DE;
    const flatrateAndFree = [...(de?.flatrate || []), ...(de?.free || [])];
    const seen = new Set<number>();
    const unique = flatrateAndFree.filter((p: any) => {
      if (seen.has(p.provider_id)) return false;
      seen.add(p.provider_id);
      return true;
    });
    providerCache.set(key, unique);
    return unique;
  } catch {
    return [];
  }
}

const TITLE_STOPWORDS = new Set([
  "der",
  "die",
  "das",
  "den",
  "dem",
  "des",
  "ein",
  "eine",
  "einer",
  "eines",
  "the",
  "a",
  "an",
  "of",
  "in",
  "on",
  "le",
  "la",
  "les",
]);

// Extracts a normalized franchise key to prevent flooding of the same series/universe
function getFranchiseKey(title: string, raw?: any): string {
  if (raw?.belongs_to_collection?.id) {
    return `col_${raw.belongs_to_collection.id}`;
  }
  const t = (title || "").toLowerCase();

  const FRANCHISE_PATTERNS = [
    { key: "batman", patterns: ["batman", "dark knight", "joker", "gotham", "arkham", "batgirl", "catwoman"] },
    { key: "superman", patterns: ["superman", "man of steel"] },
    { key: "spiderman", patterns: ["spider-man", "spiderman", "venom", "spider-verse", "morbius"] },
    { key: "avengers", patterns: ["avengers", "iron man", "captain america", "thor", "guardians of the galaxy", "ant-man"] },
    { key: "rush_hour", patterns: ["rush hour"] },
    { key: "star_wars", patterns: ["star wars", "krieg der sterne", "mandalorian", "boba fett", "kenobi"] },
    { key: "lord_of_the_rings", patterns: ["lord of the rings", "herr der ringe", "hobbit"] },
    { key: "harry_potter", patterns: ["harry potter", "phantastische tierwesen", "fantastic beasts"] },
    { key: "fast_and_furious", patterns: ["fast & furious", "fast and furious", "tokyo drift", "hobbs & shaw"] },
    { key: "jurassic", patterns: ["jurassic park", "jurassic world"] },
    { key: "mission_impossible", patterns: ["mission: impossible", "mission impossible"] },
    { key: "matrix", patterns: ["matrix"] },
    { key: "cars", patterns: ["cars", "planes"] },
    { key: "despicable_me", patterns: ["ich - einfach unverbesserlich", "ich einfach unverbesserlich", "despicable me", "minions"] },
    { key: "tom_and_jerry", patterns: ["tom & jerry", "tom and jerry", "tom und jerry"] },
    { key: "toy_story", patterns: ["toy story", "lightyear"] },
    { key: "shrek", patterns: ["shrek", "der gestiefelte kater", "puss in boots"] },
    { key: "ice_age", patterns: ["ice age"] },
    { key: "madagascar", patterns: ["madagascar", "die pinguine aus madagascar"] },
    { key: "pirates", patterns: ["fluch der karibik", "pirates of the caribbean"] },
    { key: "godfather", patterns: ["der pate", "the godfather"] },
    { key: "hunger_games", patterns: ["tribute von panem", "hunger games"] },
    { key: "john_wick", patterns: ["john wick", "ballerina"] },
    { key: "transformers", patterns: ["transformers", "bumblebee"] },
    { key: "rocky", patterns: ["rocky", "creed"] },
    { key: "deadpool", patterns: ["deadpool", "wolverine"] },
    { key: "alien", patterns: ["alien", "prometheus", "romulus"] },
    { key: "predator", patterns: ["predator", "prey"] },
    { key: "terminator", patterns: ["terminator"] },
    { key: "gentlemen_caper", patterns: ["the gentlemen", "rocknrolla", "bube, dame", "snatch", "revolver"] },
    { key: "knives_out", patterns: ["knives out", "glass onion"] },
    { key: "dune", patterns: ["dune"] },
    { key: "top_gun", patterns: ["top gun"] },
  ];

  for (const f of FRANCHISE_PATTERNS) {
    if (f.patterns.some((p) => t.includes(p))) {
      return `franchise_${f.key}`;
    }
  }

  // Fallback: title prefix without leading articles/stopwords
  const mainPart = t.split(/[:\-\–]/)[0].trim().replace(/[^a-z0-9äöüß\s]/g, "");
  const words = mainPart
    .split(/\s+/)
    .filter((w) => w.length > 2 && !TITLE_STOPWORDS.has(w));
  if (words.length > 0) {
    return `title_${words.slice(0, 2).join("_")}`;
  }

  return `title_${t.slice(0, 15)}`;
}

function deterministicJitter(id: number, refreshCounter: number): number {
  if (!refreshCounter) return 0;
  const hash = Math.abs(Math.imul(id ^ (refreshCounter * 7919), 2654435761)) % 7;
  return hash - 3; // [-3, +3]
}

async function fetchInBatches<T, R>(
  items: T[],
  batchSize: number,
  worker: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const chunk = items.slice(i, i + batchSize);
    const chunkResults = await Promise.all(chunk.map(worker));
    results.push(...chunkResults);
  }
  return results;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const watchedItems: SeedInput[] = body.watchedItems || [];
    const watchlistInput: WatchlistEntryInput[] = body.watchlistIds || [];
    const userSubscriptions: string[] = body.subscriptions || body.userSubscriptions || [];
    const onlyMySubscriptions: boolean = body.onlyMySubscriptions ?? true;
    const targetMediaType: "ALL" | "movie" | "tv" = body.mediaTypeFilter || body.mediaType || "ALL";
    const excludeWatchlist: boolean = body.excludeWatchlist ?? false;
    const refreshCounter: number = Number.isFinite(Number(body.refreshCounter))
      ? Math.max(0, Math.floor(Number(body.refreshCounter)))
      : 0;

    const watchedSet = new Set(watchedItems.map((i) => `${i.mediaType}_${i.tmdbId}`));

    const watchlistKeySet = new Set<string>();
    const watchlistNumericSet = new Set<number>();
    for (const w of watchlistInput) {
      if (typeof w === "number") {
        watchlistNumericSet.add(w);
      } else if (w && typeof w.tmdbId === "number") {
        if (w.mediaType) {
          watchlistKeySet.add(`${w.mediaType}_${w.tmdbId}`);
        } else {
          watchlistNumericSet.add(w.tmdbId);
        }
      }
    }

    const isExcludedByWatchlist = (mediaType: "movie" | "tv", id: number): boolean => {
      if (!excludeWatchlist) return false;
      return watchlistKeySet.has(`${mediaType}_${id}`) || watchlistNumericSet.has(id);
    };

    // Compute user's relative rating baseline so strict raters aren't starved of seeds
    const numericRatings = watchedItems
      .map((i) => i.rating)
      .filter((r): r is number => typeof r === "number" && r > 0);
    const userAvgRating =
      numericRatings.length > 0
        ? numericRatings.reduce((a, b) => a + b, 0) / numericRatings.length
        : 7.5;

    const positiveThreshold = Math.min(7, Math.max(5.5, userAvgRating + 0.3));
    const dislikeThreshold = Math.max(4, Math.min(5, userAvgRating - 1.8));

    // 1. Sort all watched items by rating descending
    const sortedWatched = [...watchedItems].sort((a, b) => {
      const rA = typeof a.rating === "number" ? a.rating : userAvgRating;
      const rB = typeof b.rating === "number" ? b.rating : userAvgRating;
      return rB - rA;
    });

    const allPositive = sortedWatched.filter((i) =>
      typeof i.rating === "number" ? i.rating >= positiveThreshold : true
    );
    const allDisliked = [...sortedWatched]
      .reverse()
      .filter((i) => typeof i.rating === "number" && i.rating <= dislikeThreshold);

    // Fetch ALL watched items (up to 48 positive + 12 disliked = 60 max for bounded latency)
    // so the entire watch history shapes genres, keywords, directors, actors & animation taste!
    const profilePositiveItems = allPositive.slice(0, 48);
    const profileDislikedItems = allDisliked.slice(0, 12);

    // 2. Fetch TMDB details in bounded batches (fast via LRU + Next.js cache)
    const [positiveDetailsList, dislikedDetailsList] = await Promise.all([
      fetchInBatches(profilePositiveItems, 15, async (seed) => ({
        seed,
        data: await fetchSeedData({ tmdbId: seed.tmdbId, mediaType: seed.mediaType }),
      })),
      fetchInBatches(profileDislikedItems, 12, async (bad) => ({
        seed: bad,
        data: await fetchSeedData({ tmdbId: bad.tmdbId, mediaType: bad.mediaType }),
      })),
    ]);

    const genreWeights = new Map<number, { id: number; name: string; weight: number }>();
    const keywordWeights = new Map<number, { id: number; name: string; count: number }>();
    const directorWeights = new Map<number, { id: number; name: string; weight: number }>();
    const actorWeights = new Map<number, { id: number; name: string; weight: number }>();
    const dislikedOverlapSet = new Set<string>();

    let positiveAnimatedCount = 0;
    let dislikedAnimatedCount = 0;
    let animatedRatingSum = 0;
    let animatedRatingCount = 0;

    // Pass 2a: Build full Taste Profile across ALL fetched positive items
    for (const { seed, data } of positiveDetailsList) {
      if (!data) continue;
      const rating = typeof seed.rating === "number" ? seed.rating : userAvgRating;
      const weightDelta = Math.max(1, Math.round((rating - (positiveThreshold - 1.5)) * 10) / 10);

      const dataGenres: any[] = data.genres || [];
      if (dataGenres.some((g) => g.id === 16)) {
        positiveAnimatedCount++;
        animatedRatingSum += rating;
        animatedRatingCount++;
      }

      for (const g of dataGenres) {
        const existing = genreWeights.get(g.id) || { id: g.id, name: g.name, weight: 0 };
        existing.weight += weightDelta;
        genreWeights.set(g.id, existing);
      }

      const kwList = data.keywords?.keywords || data.keywords?.results || [];
      for (const kw of kwList.slice(0, 14)) {
        const existing = keywordWeights.get(kw.id) || { id: kw.id, name: kw.name, count: 0 };
        existing.count += weightDelta;
        keywordWeights.set(kw.id, existing);
      }

      if (rating >= Math.max(7.5, positiveThreshold)) {
        const directors =
          seed.mediaType === "movie"
            ? (data.credits?.crew || []).filter((c: any) => c.job === "Director").slice(0, 2)
            : (data.created_by || []).slice(0, 2);

        for (const d of directors) {
          if (!d?.id || !d?.name) continue;
          const prev = directorWeights.get(d.id) || { id: d.id, name: d.name, weight: 0 };
          prev.weight += weightDelta;
          directorWeights.set(d.id, prev);
        }

        const cast = (data.credits?.cast || []).slice(0, 3);
        for (const actor of cast) {
          if (!actor?.id || !actor?.name) continue;
          const prev = actorWeights.get(actor.id) || { id: actor.id, name: actor.name, weight: 0 };
          prev.weight += weightDelta * 0.6;
          actorWeights.set(actor.id, prev);
        }
      }
    }

    // Pass 2b: Select up to 20 genre-diversified positive seeds for candidate generation
    // (ensures all taste facets contribute recommendations, not only one dominant genre)
    const candidateSeedList: typeof positiveDetailsList = [];
    const pickedSeedKeys = new Set<string>();
    const coveredPrimaryGenres = new Set<number>();

    // First pick the top-rated seed for each distinct primary genre
    for (const item of positiveDetailsList) {
      if (!item.data) continue;
      if (candidateSeedList.length >= 10) break;
      const primaryGid: number | undefined = item.data.genres?.[0]?.id;
      const sKey = `${item.seed.mediaType}_${item.seed.tmdbId}`;
      if (primaryGid !== undefined && !coveredPrimaryGenres.has(primaryGid)) {
        candidateSeedList.push(item);
        pickedSeedKeys.add(sKey);
        coveredPrimaryGenres.add(primaryGid);
      }
    }

    // Fill remaining seed slots up to 20 (rotating secondary seeds on refreshCounter)
    const remainingPositives = positiveDetailsList.filter(
      (item) => item.data && !pickedSeedKeys.has(`${item.seed.mediaType}_${item.seed.tmdbId}`)
    );
    const seedOffset =
      refreshCounter > 0 && remainingPositives.length > 10
        ? (refreshCounter * 5) % remainingPositives.length
        : 0;
    const rotatedRemaining = [
      ...remainingPositives.slice(seedOffset),
      ...remainingPositives.slice(0, seedOffset),
    ];
    for (const item of rotatedRemaining) {
      if (candidateSeedList.length >= 20) break;
      candidateSeedList.push(item);
      pickedSeedKeys.add(`${item.seed.mediaType}_${item.seed.tmdbId}`);
    }

    const candidatesMap = new Map<string, CandidateEntry>();

    const upsertSeedCandidate = (
      rec: any,
      recType: "movie" | "tv",
      seed: SeedInput,
      rating: number,
      sourceKind: "recommendations" | "similar"
    ) => {
      if (targetMediaType !== "ALL" && recType !== targetMediaType) return;
      const cKey = `${recType}_${rec.id}`;
      if (watchedSet.has(cKey)) return;
      if (isExcludedByWatchlist(recType, rec.id)) return;
      if ((rec.vote_count || 0) < 120 || (rec.vote_average || 0) < 6.3) return;

      const existing = candidatesMap.get(cKey);
      if (existing) {
        const existingSeed = existing.seedSources.find((s) => s.title === seed.title);
        if (!existingSeed) {
          existing.seedSources.push({ title: seed.title, rating, sourceKind });
        } else if (existingSeed.sourceKind === "similar" && sourceKind === "recommendations") {
          existingSeed.sourceKind = "recommendations";
        }
      } else {
        candidatesMap.set(cKey, {
          raw: rec,
          mediaType: recType,
          seedSources: [{ title: seed.title, rating, sourceKind }],
          fromDiscoverSub: false,
          fromKeywordDiscover: false,
          matchedPeople: [],
          friendEndorsements: [],
        });
      }
    };

    for (const { seed, data } of candidateSeedList) {
      if (!data) continue;
      const rating = typeof seed.rating === "number" ? seed.rating : userAvgRating;

      // Collect Collaborative Recommendations & Similar titles from this seed
      for (const rec of (data.recommendations?.results || []).slice(0, 20)) {
        const recType: "movie" | "tv" =
          rec.media_type === "tv" || (rec.media_type !== "movie" && seed.mediaType === "tv")
            ? "tv"
            : "movie";
        upsertSeedCandidate(rec, recType, seed, rating, "recommendations");
      }

      for (const sim of (data.similar?.results || []).slice(0, 10)) {
        const simType: "movie" | "tv" =
          sim.media_type === "tv" || (sim.media_type !== "movie" && seed.mediaType === "tv")
            ? "tv"
            : "movie";
        upsertSeedCandidate(sim, simType, seed, rating, "similar");
      }
    }

    // Penalize genres, keywords & similar candidates from disliked items
    for (const { seed, data } of dislikedDetailsList) {
      if (!data) continue;
      const badRating = typeof seed.rating === "number" ? seed.rating : 4;
      const badPenalty = Math.max(2, Math.round((dislikeThreshold + 1 - badRating) * 2));

      const dataGenres: any[] = data.genres || [];
      if (dataGenres.some((g) => g.id === 16)) {
        dislikedAnimatedCount++;
        animatedRatingSum += badRating;
        animatedRatingCount++;
      }

      for (const g of dataGenres) {
        const existing = genreWeights.get(g.id) || { id: g.id, name: g.name, weight: 0 };
        existing.weight -= badPenalty;
        genreWeights.set(g.id, existing);
      }

      const kwList = data.keywords?.keywords || data.keywords?.results || [];
      for (const kw of kwList.slice(0, 12)) {
        const existing = keywordWeights.get(kw.id) || { id: kw.id, name: kw.name, count: 0 };
        existing.count -= badPenalty;
        keywordWeights.set(kw.id, existing);
      }

      for (const badRec of [
        ...(data.recommendations?.results || []).slice(0, 12),
        ...(data.similar?.results || []).slice(0, 8),
      ]) {
        const badType: "movie" | "tv" =
          badRec.media_type === "tv" || (badRec.media_type !== "movie" && seed.mediaType === "tv")
            ? "tv"
            : "movie";
        dislikedOverlapSet.add(`${badType}_${badRec.id}`);
      }
    }

    // Refined Animation check (#5): there are fewer animated movies than live-action,
    // so don't require high absolute count — if the user positively rated >= 1 animated title
    // without a net-negative animation average, do not penalize animation.
    const avgAnimatedRating =
      animatedRatingCount > 0 ? animatedRatingSum / animatedRatingCount : 0;
    const userLikesAnimation =
      positiveAnimatedCount >= 1 &&
      dislikedAnimatedCount <= positiveAnimatedCount &&
      avgAnimatedRating >= 7.0;

    // Sort top positive genres, keywords, directors & actors
    const sortedGenres = Array.from(genreWeights.values())
      .filter((g) => g.weight > 0)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 6);

    const sortedKeywords = Array.from(keywordWeights.values())
      .filter((k) => k.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const sortedDirectors = Array.from(directorWeights.values())
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5);

    const sortedActors = Array.from(actorWeights.values())
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 6);

    // 3. Social Collaborative Filtering via CineCircle Friends (safe session lookup)
    try {
      const session = await getServerSession(authOptions);
      if (session?.user?.email) {
        const dbUser = await findUserByEmail(session.user.email);
        const currentUserId = dbUser?.id || (session.user as any)?.id;
        if (currentUserId) {
          const community = await getAllCommunityData(
            currentUserId,
            dbUser?.name || session.user.name || undefined
          );

          const myRatingMap = new Map<string, number>();
          for (const w of watchedItems) {
            myRatingMap.set(
              `${w.mediaType}_${w.tmdbId}`,
              typeof w.rating === "number" ? w.rating : userAvgRating
            );
          }

          // Group friends' watched items
          const friendWatchedMap = new Map<
            string,
            {
              name: string;
              items: {
                key: string;
                tmdbId: number;
                mediaType: "movie" | "tv";
                title: string;
                rating: number;
              }[];
            }
          >();

          for (const st of community.mediaStatuses) {
            if (st.userId === currentUserId || st.status !== "WATCHED") continue;
            const entry = friendWatchedMap.get(st.userId) || {
              name: st.userName,
              items: [],
            };
            entry.items.push({
              key: `${st.mediaType}_${st.tmdbId}`,
              tmdbId: st.tmdbId,
              mediaType: st.mediaType,
              title: st.title,
              rating: typeof st.rating === "number" ? st.rating : 7.5,
            });
            friendWatchedMap.set(st.userId, entry);
          }

          const friendSimilarityMap = new Map<string, number>();
          for (const [fId, fData] of friendWatchedMap.entries()) {
            let sharedCount = 0;
            let agreementSum = 0;
            for (const item of fData.items) {
              const myR = myRatingMap.get(item.key);
              if (myR !== undefined) {
                sharedCount++;
                agreementSum += 1 - Math.abs(myR - item.rating) / 9;
              }
            }
            if (sharedCount >= 2) {
              const rawSim = agreementSum / sharedCount;
              const confidence = Math.min(1, sharedCount / 4);
              friendSimilarityMap.set(fId, rawSim * confidence);
            } else if (sharedCount === 1) {
              friendSimilarityMap.set(fId, (agreementSum * 0.45));
            }
          }

          // Collect top unseen friend endorsements
          const friendCandidateQueue = new Map<
            string,
            {
              tmdbId: number;
              mediaType: "movie" | "tv";
              title: string;
              endorsements: FriendEndorsement[];
              priority: number;
            }
          >();

          const addFriendEndorsement = (
            tmdbId: number,
            mediaType: "movie" | "tv",
            title: string,
            endorsement: FriendEndorsement
          ) => {
            if (targetMediaType !== "ALL" && mediaType !== targetMediaType) return;
            const cKey = `${mediaType}_${tmdbId}`;
            if (watchedSet.has(cKey) || isExcludedByWatchlist(mediaType, tmdbId)) return;

            const existingCand = candidatesMap.get(cKey);
            if (existingCand) {
              if (!existingCand.friendEndorsements.some((e) => e.friendName === endorsement.friendName)) {
                existingCand.friendEndorsements.push(endorsement);
              }
              return;
            }

            const q = friendCandidateQueue.get(cKey) || {
              tmdbId,
              mediaType,
              title,
              endorsements: [],
              priority: 0,
            };
            if (!q.endorsements.some((e) => e.friendName === endorsement.friendName)) {
              q.endorsements.push(endorsement);
              q.priority +=
                endorsement.similarity * endorsement.rating +
                (endorsement.isExplicitRec ? 4 : 0);
            }
            friendCandidateQueue.set(cKey, q);
          };

          // From friends' high-rated WATCHED items
          for (const [fId, fData] of friendWatchedMap.entries()) {
            const sim = friendSimilarityMap.get(fId) || 0;
            if (sim < 0.45) continue;
            for (const item of fData.items) {
              if (item.rating >= 8) {
                addFriendEndorsement(item.tmdbId, item.mediaType, item.title, {
                  friendName: fData.name,
                  rating: item.rating,
                  similarity: sim,
                  isExplicitRec: false,
                });
              }
            }
          }

          // From friends' explicit CineCircle Recommendations
          for (const rec of community.recommendations) {
            if (rec.userId === currentUserId || rec.rating < 8) continue;
            const sim = friendSimilarityMap.get(rec.userId) ?? 0.55;
            addFriendEndorsement(rec.tmdbId, rec.mediaType, rec.title, {
              friendName: rec.userName,
              rating: rec.rating,
              similarity: sim,
              isExplicitRec: true,
            });
          }

          // Fetch TMDB metadata for top 8 unseen friend-only candidates
          const topFriendOnly = Array.from(friendCandidateQueue.values())
            .sort((a, b) => b.priority - a.priority)
            .slice(0, 8);

          await Promise.all(
            topFriendOnly.map(async (fc) => {
              const details = await fetchSeedData({
                tmdbId: fc.tmdbId,
                mediaType: fc.mediaType,
              });
              if (!details) return;
              if ((details.vote_count || 0) < 50 || (details.vote_average || 0) < 6.0) return;

              candidatesMap.set(`${fc.mediaType}_${fc.tmdbId}`, {
                raw: details,
                mediaType: fc.mediaType,
                seedSources: [],
                fromDiscoverSub: false,
                fromKeywordDiscover: false,
                matchedPeople: [],
                friendEndorsements: fc.endorsements,
              });
            })
          );
        }
      }
    } catch (socialErr) {
      console.warn("Social collaborative filtering skipped:", socialErr);
    }

    // 4. Build TMDB Provider filter string for user's active subscriptions in DE
    const tmdbProviderIds = new Set<number>();
    userSubscriptions.forEach((subKey) => {
      const ids = SUB_KEY_TO_TMDB_PROVIDER_IDS[subKey] || [];
      ids.forEach((id) => tmdbProviderIds.add(id));
    });
    const providerFilterString = Array.from(tmdbProviderIds).join("|");

    // 5. Discover additional high-match candidates on user's subscriptions in DE
    const topRawGenreIds = sortedGenres.map((g) => g.id);
    const movieGenreIds = mapGenreIdsForMediaType(topRawGenreIds, "movie").slice(0, 3);
    const tvGenreIds = mapGenreIdsForMediaType(topRawGenreIds, "tv").slice(0, 3);
    const topKeywordIds = sortedKeywords.slice(0, 4).map((k) => k.id);
    const discoverPage = String((refreshCounter % 3) + 1);

    const discoverPromises: Promise<void>[] = [];

    const addDiscoverQuery = (
      type: "movie" | "tv",
      params: Record<string, string>,
      options?: {
        isKeywordQuery?: boolean;
        matchedPerson?: { id: number; name: string; role: "director" | "actor" };
      }
    ) => {
      if (targetMediaType !== "ALL" && targetMediaType !== type) return;
      const excludedNoiseGenres: string[] = [];
      if (!userLikesAnimation) excludedNoiseGenres.push("16");
      if (type === "tv") {
        // Exclude Kids/Reality/Soap/Talk from generic TV discover unless in user's top genres
        for (const gid of [10762, 10764, 10766, 10767]) {
          if (!topRawGenreIds.includes(gid)) excludedNoiseGenres.push(String(gid));
        }
      }

      const query = new URLSearchParams({
        api_key: TMDB_API_KEY,
        language: "de-DE",
        watch_region: "DE",
        sort_by: "popularity.desc",
        "vote_count.gte": type === "movie" ? "1000" : "500",
        "vote_average.gte": "7.3",
        page: discoverPage,
        ...params,
      });
      if (excludedNoiseGenres.length > 0 && !params.without_genres) {
        query.set("without_genres", excludedNoiseGenres.join(","));
      }
      if (providerFilterString) {
        query.set("with_watch_providers", providerFilterString);
        query.set("with_watch_monetization_types", "flatrate|free");
      }

      discoverPromises.push(
        fetch(`${TMDB_BASE_URL}/discover/${type}?${query.toString()}`, {
          next: { revalidate: 3600 },
        })
          .then((r) => (r.ok ? r.json() : { results: [] }))
          .then((data) => {
            for (const item of (data.results || []).slice(0, 15)) {
              const cKey = `${type}_${item.id}`;
              if (watchedSet.has(cKey)) continue;
              if (isExcludedByWatchlist(type, item.id)) continue;

              const existing = candidatesMap.get(cKey);
              if (existing) {
                if (providerFilterString) existing.fromDiscoverSub = true;
                if (options?.isKeywordQuery) existing.fromKeywordDiscover = true;
                if (
                  options?.matchedPerson &&
                  !existing.matchedPeople.some((p) => p.id === options.matchedPerson!.id)
                ) {
                  existing.matchedPeople.push(options.matchedPerson);
                }
              } else {
                candidatesMap.set(cKey, {
                  raw: item,
                  mediaType: type,
                  seedSources: [],
                  fromDiscoverSub: Boolean(providerFilterString),
                  fromKeywordDiscover: Boolean(options?.isKeywordQuery),
                  matchedPeople: options?.matchedPerson ? [options.matchedPerson] : [],
                  friendEndorsements: [],
                });
              }
            }
          })
          .catch(() => {})
      );
    };

    // Genre Discover: prefer AND-combinations (comma) & popular/highly-voted hits over low-vote outliers
    if (movieGenreIds.length > 0) {
      addDiscoverQuery("movie", {
        with_genres: movieGenreIds.slice(0, 2).join(","),
        sort_by: "popularity.desc",
        "vote_count.gte": "1000",
        "vote_average.gte": "7.3",
      });
      if (movieGenreIds.length >= 3) {
        addDiscoverQuery("movie", {
          with_genres: [movieGenreIds[0], movieGenreIds[2]].join(","),
          sort_by: "vote_count.desc",
          "vote_count.gte": "1500",
          "vote_average.gte": "7.4",
        });
      }
    } else {
      addDiscoverQuery("movie", {});
    }

    if (tvGenreIds.length > 0) {
      if (tvGenreIds.length >= 2) {
        addDiscoverQuery("tv", {
          with_genres: tvGenreIds.slice(0, 2).join(","),
          sort_by: "popularity.desc",
          "vote_count.gte": "500",
          "vote_average.gte": "7.3",
        });
      }
      addDiscoverQuery("tv", {
        with_genres: tvGenreIds.slice(0, 2).join("|"),
        sort_by: "vote_count.desc",
        "vote_count.gte": "800",
        "vote_average.gte": "7.5",
      });
    } else {
      addDiscoverQuery("tv", {});
    }

    // Keyword Discover for BOTH Movie & TV
    if (topKeywordIds.length > 0) {
      addDiscoverQuery(
        "movie",
        {
          with_keywords: topKeywordIds.join("|"),
          sort_by: "popularity.desc",
          "vote_count.gte": "600",
          "vote_average.gte": "7.1",
        },
        { isKeywordQuery: true }
      );
      addDiscoverQuery(
        "tv",
        {
          with_keywords: topKeywordIds.join("|"),
          sort_by: "popularity.desc",
          "vote_count.gte": "400",
          "vote_average.gte": "7.2",
        },
        { isKeywordQuery: true }
      );
    }

    // People Discover (Top Favorite Directors & Actors)
    const topPeople: { id: number; name: string; role: "director" | "actor"; weight: number }[] = [
      ...sortedDirectors.slice(0, 2).map((d) => ({ ...d, role: "director" as const })),
      ...sortedActors.slice(0, 2).map((a) => ({ ...a, role: "actor" as const })),
    ].filter((p) => p.weight >= 3.5);

    for (const person of topPeople.slice(0, 3)) {
      addDiscoverQuery(
        "movie",
        {
          with_people: String(person.id),
          "vote_count.gte": "300",
          "vote_average.gte": "7.0",
          page: "1",
        },
        { matchedPerson: { id: person.id, name: person.name, role: person.role } }
      );
    }

    await Promise.all(discoverPromises);

    // 6. Score candidates (initial pass before DE Watch Provider enrichment)
    const maxPositiveGenreWeight = Math.max(...sortedGenres.map((g) => g.weight), 1);

    const scoreCandidate = (
      entry: CandidateEntry,
      availableProvidersDE?: RecommendedMediaItem["availableProvidersDE"]
    ) => {
      const {
        raw,
        mediaType,
        seedSources,
        fromKeywordDiscover,
        matchedPeople,
        friendEndorsements,
      } = entry;
      const cKey = `${mediaType}_${raw.id}`;
      const itemGenreIds: number[] =
        raw.genre_ids || (raw.genres ? raw.genres.map((g: any) => g.id) : []);

      // Also check credits on raw if it came from full details (e.g. friend-only candidates)
      const combinedPeople = [...matchedPeople];
      if (raw.credits) {
        for (const c of raw.credits.crew || []) {
          if (c.job === "Director" && directorWeights.has(c.id)) {
            if (!combinedPeople.some((p) => p.id === c.id)) {
              combinedPeople.push({ id: c.id, name: c.name, role: "director" });
            }
          }
        }
        for (const a of (raw.credits.cast || []).slice(0, 5)) {
          if (actorWeights.has(a.id)) {
            if (!combinedPeople.some((p) => p.id === a.id)) {
              combinedPeople.push({ id: a.id, name: a.name, role: "actor" });
            }
          }
        }
      }

      // A. Genre Affinity Score (-8 to 26 points)
      let genrePoints = 0;
      const matchedGenreNames: string[] = [];
      for (const gid of itemGenreIds) {
        const gw = genreWeights.get(gid);
        if (gw) {
          if (gw.weight > 0) {
            genrePoints += (gw.weight / maxPositiveGenreWeight) * 11.5;
            const meta = ALL_GENRES_MAP[gid];
            matchedGenreNames.push(`${meta?.emoji || "🎬"} ${meta?.name || gw.name}`);
          } else {
            genrePoints += Math.max(-4, gw.weight * 0.8);
          }
        }
      }
      genrePoints = Math.min(26, Math.max(-8, genrePoints));

      // B. Collaborative Seed Overlap & Kombi-Matches Score (0 to 30 points)
      let seedPoints = 0;
      const recSeeds = seedSources.filter((s) => s.sourceKind === "recommendations");
      const isComboMatch = seedSources.length >= 2 && (recSeeds.length >= 1 || seedSources.length >= 3);

      if (seedSources.length > 0) {
        const bestSeedRating = Math.max(...seedSources.map((s) => s.rating));
        const hasRecSeed = recSeeds.length > 0;
        const baseScale = hasRecSeed ? 1 : 0.65;
        const base = (10 + Math.max(0, bestSeedRating - 7) * 2) * baseScale;
        const comboBonus = isComboMatch
          ? 10 + Math.min(10, (seedSources.length - 2) * 5)
          : 0;
        seedPoints = Math.min(30, base + comboBonus);
      }

      // C. People (Director/Cast) & Keyword Discover Affinity (0 to 14 points)
      let peopleKeywordPoints = 0;
      for (const p of combinedPeople) {
        peopleKeywordPoints += p.role === "director" ? 6 : 4;
      }
      if (fromKeywordDiscover) {
        peopleKeywordPoints += 5;
      }
      peopleKeywordPoints = Math.min(14, peopleKeywordPoints);

      // D. Bayesian Quality Score (0 to 14 points)
      const voteAvg = raw.vote_average || 7.0;
      const voteCount = raw.vote_count || 0;
      const mPrior = mediaType === "movie" ? 800 : 300;
      const cPrior = 6.9;
      const bayesianRating =
        (voteCount / (voteCount + mPrior)) * voteAvg + (mPrior / (voteCount + mPrior)) * cPrior;
      const qualityPoints = Math.min(14, Math.max(0, (bayesianRating - 6.1) * 5.0));

      // E. Social Friend Collaborative Match (0 to 12 points)
      let socialPoints = 0;
      const sortedEndorsements = [...friendEndorsements].sort(
        (a, b) => b.similarity * b.rating - a.similarity * a.rating
      );
      if (sortedEndorsements.length > 0) {
        const topF = sortedEndorsements[0];
        socialPoints = Math.min(
          12,
          topF.similarity * 8 + (topF.rating >= 9 ? 2 : 1) + (sortedEndorsements.length > 1 ? 2 : 0)
        );
      }

      // F. Actual DE Subscription Bonus (0 to 5 points — uses real provider check when available)
      let subBonus = 0;
      if (availableProvidersDE) {
        subBonus = availableProvidersDE.some((p) => p.isMySub) ? 5 : 0;
      } else if (entry.fromDiscoverSub) {
        subBonus = 3;
      }

      // G. Penalties (Disliked Overlap + Refined Animation Mismatch)
      let penalty = 0;
      if (dislikedOverlapSet.has(cKey) && seedSources.length < 2) {
        penalty += 14;
      }
      if (itemGenreIds.includes(16) && !userLikesAnimation) {
        penalty += 16;
      }

      const jitter = deterministicJitter(raw.id, refreshCounter);
      const rawTotal = Math.round(
        genrePoints +
          seedPoints +
          peopleKeywordPoints +
          qualityPoints +
          socialPoints +
          subBonus -
          penalty +
          jitter
      );

      // Pure generic discover fillers (no seed overlap, no friend endorsement, no director/actor match)
      // should not inflate past 74% so true personalized matches always sit above fillers.
      const hasPersonalOverlap =
        seedSources.length > 0 ||
        sortedEndorsements.length > 0 ||
        combinedPeople.length > 0 ||
        fromKeywordDiscover;
      const maxAllowed = hasPersonalOverlap ? 99 : 74;
      const matchScore = Math.min(maxAllowed, Math.max(45, rawTotal));

      // Human-readable Reasons
      const reasons: string[] = [];
      if (isComboMatch) {
        const seedNames = seedSources
          .slice(0, 2)
          .map((s) => s.title)
          .join(" & ");
        reasons.push(`🔥 Kombi-Match: Weil dir sowohl ${seedNames} gefallen haben`);
      } else if (sortedEndorsements.length > 0 && seedSources.length === 0) {
        const topF = sortedEndorsements[0];
        reasons.push(
          topF.isExplicitRec
            ? `💬 Von ${topF.friendName} empfohlen (${topF.rating}★)`
            : `👥 ${topF.friendName} (${Math.round(topF.similarity * 100)}% Match) gab ${topF.rating}★`
        );
      } else if (seedSources.length === 1) {
        reasons.push(`Weil dir ${seedSources[0].title} (${seedSources[0].rating}★) gefallen hat`);
      }

      if (sortedEndorsements.length > 0 && seedSources.length > 0) {
        const topF = sortedEndorsements[0];
        reasons.push(
          `👥 Auch von ${topF.friendName} mit ${topF.rating}★ bewertet (${Math.round(topF.similarity * 100)}% Geschmacks-Match)`
        );
      }

      if (combinedPeople.length > 0) {
        const p = combinedPeople[0];
        reasons.push(
          p.role === "director"
            ? `🎬 Regie/Creator-Favorit: ${p.name}`
            : `⭐ Mit deinem Cast-Favoriten ${p.name}`
        );
      }

      if (matchedGenreNames.length > 0) {
        reasons.push(`Top-Match für ${matchedGenreNames.slice(0, 2).join(" & ")}`);
      }
      if (fromKeywordDiscover && sortedKeywords.length > 0) {
        reasons.push(
          `Themen-Match (${sortedKeywords
            .slice(0, 2)
            .map((k) => k.name)
            .join(", ")})`
        );
      }

      const dateStr = raw.release_date || raw.first_air_date || "";

      return {
        id: raw.id,
        mediaType,
        title: raw.title || raw.name || "Unbekannter Titel",
        originalTitle: raw.original_title || raw.original_name,
        overview: raw.overview || "",
        posterPath: raw.poster_path || null,
        backdropPath: raw.backdrop_path || null,
        releaseYear: dateStr ? dateStr.slice(0, 4) : "",
        voteAverage: Math.round((raw.vote_average || 0) * 10) / 10,
        voteCount: raw.vote_count || 0,
        genreIds: itemGenreIds,
        genres: resolveItemGenres(mediaType, itemGenreIds),
        matchScore,
        reasons,
        seedTitles: seedSources.map((s) => s.title),
        isComboMatch,
        raw,
        entry,
      };
    };

    const preScored = Array.from(candidatesMap.values()).map((entry) => scoreCandidate(entry));

    preScored.sort((a, b) => {
      const aBonus = a.isComboMatch ? 5 : 0;
      const bBonus = b.isComboMatch ? 5 : 0;
      return b.matchScore + bBonus - (a.matchScore + aBonus) || b.voteAverage - a.voteAverage;
    });

    // 7. Pre-select diversified pool of up to 72 candidates BEFORE subscription filtering
    // Reserve priority slots for personalized seed/friend/people matches before generic discover fillers
    const prePool: typeof preScored = [];
    const prePoolKeys = new Set<string>();
    const preFranchiseCounts = new Map<string, number>();
    const preSingleSeedCounts = new Map<string, number>();

    const tryAddToPrePool = (cand: (typeof preScored)[0], maxPerSeed: number) => {
      const key = `${cand.mediaType}_${cand.id}`;
      if (prePoolKeys.has(key)) return false;

      const fKey = getFranchiseKey(cand.title, cand.raw);
      if ((preFranchiseCounts.get(fKey) || 0) >= 1) return false;

      if (cand.seedTitles.length === 1) {
        const seed = cand.seedTitles[0];
        if ((preSingleSeedCounts.get(seed) || 0) >= maxPerSeed) return false;
      }

      prePool.push(cand);
      prePoolKeys.add(key);
      preFranchiseCounts.set(fKey, (preFranchiseCounts.get(fKey) || 0) + 1);
      if (cand.seedTitles.length === 1) {
        const seed = cand.seedTitles[0];
        preSingleSeedCounts.set(seed, (preSingleSeedCounts.get(seed) || 0) + 1);
      }
      return true;
    };

    // Priority 1: Kombi-Matches
    for (const cand of preScored) {
      if (prePool.length >= 72) break;
      if (cand.isComboMatch) tryAddToPrePool(cand, 99);
    }
    // Priority 2: Personalized single-seed, friend-endorsed, or favorite-people matches (up to 56 slots)
    for (const cand of preScored) {
      if (prePool.length >= 56) break;
      if (
        cand.seedTitles.length > 0 ||
        cand.entry.friendEndorsements.length > 0 ||
        cand.entry.matchedPeople.length > 0
      ) {
        tryAddToPrePool(cand, 2);
      }
    }
    // Priority 3: Fill remaining slots up to 72 (relaxed seed cap + discover fillers)
    for (const cand of preScored) {
      if (prePool.length >= 72) break;
      tryAddToPrePool(cand, 4);
    }

    // 8. Enrich pre-pool with exact DE Watch Providers & compute final score with real subBonus
    const enrichedAndRescored = await Promise.all(
      prePool.map(async (cand) => {
        const rawProviders = await fetchDEProviders(cand.mediaType, cand.id);
        const mappedProviders = rawProviders.map((p: any) => {
          const norm = normalizeProviderKey(p.provider_name);
          return {
            providerId: p.provider_id,
            providerName: norm.displayName || p.provider_name,
            logoPath: p.logo_path,
            isMySub: userSubscriptions.includes(norm.key),
          };
        });

        const seenNames = new Set<string>();
        const dedupedProviders = mappedProviders.filter((p: any) => {
          if (seenNames.has(p.providerName)) return false;
          seenNames.add(p.providerName);
          return true;
        });

        const finalScored = scoreCandidate(cand.entry, dedupedProviders);
        return {
          id: finalScored.id,
          mediaType: finalScored.mediaType,
          title: finalScored.title,
          originalTitle: finalScored.originalTitle,
          overview: finalScored.overview,
          posterPath: finalScored.posterPath,
          backdropPath: finalScored.backdropPath,
          releaseYear: finalScored.releaseYear,
          voteAverage: finalScored.voteAverage,
          voteCount: finalScored.voteCount,
          genreIds: finalScored.genreIds,
          genres: finalScored.genres,
          matchScore: finalScored.matchScore,
          reasons: finalScored.reasons,
          seedTitles: finalScored.seedTitles,
          isComboMatch: finalScored.isComboMatch,
          availableProvidersDE: dedupedProviders,
        } satisfies RecommendedMediaItem;
      })
    );

    // 9. Filter by onlyMySubscriptions if enabled and user has subscriptions configured
    let filteredResults = enrichedAndRescored;
    if (onlyMySubscriptions && userSubscriptions.length > 0) {
      const subFiltered = enrichedAndRescored.filter((item) =>
        item.availableProvidersDE.some((p) => p.isMySub)
      );
      if (subFiltered.length > 0) {
        filteredResults = subFiltered;
      }
    }

    filteredResults.sort((a, b) => {
      const aHasSub = a.availableProvidersDE.some((p) => p.isMySub) ? 1 : 0;
      const bHasSub = b.availableProvidersDE.some((p) => p.isMySub) ? 1 : 0;
      if (onlyMySubscriptions && bHasSub !== aHasSub) return bHasSub - aHasSub;
      const aBonus = a.isComboMatch ? 5 : 0;
      const bBonus = b.isComboMatch ? 5 : 0;
      return b.matchScore + bBonus - (a.matchScore + aBonus) || b.voteAverage - a.voteAverage;
    });

    // 10. Genre-Diversified Final Selection (MMR-inspired soft cap of max 6 per primary genre)
    const finalResults: RecommendedMediaItem[] = [];
    const selectedKeySet = new Set<string>();
    const primaryGenreCounts = new Map<number, number>();
    const finalSingleSeedCounts = new Map<string, number>();

    // Pass A: Enforce soft genre diversity cap (max 6 per primary genre) & single-seed cap (max 2)
    for (const item of filteredResults) {
      if (finalResults.length >= 18) break;
      const key = `${item.mediaType}_${item.id}`;
      if (selectedKeySet.has(key)) continue;

      const primaryGenre = item.genreIds[0];
      if (primaryGenre !== undefined && (primaryGenreCounts.get(primaryGenre) || 0) >= 6) {
        continue;
      }
      if (item.seedTitles.length === 1) {
        const s = item.seedTitles[0];
        if ((finalSingleSeedCounts.get(s) || 0) >= 2) continue;
      }

      finalResults.push(item);
      selectedKeySet.add(key);
      if (primaryGenre !== undefined) {
        primaryGenreCounts.set(primaryGenre, (primaryGenreCounts.get(primaryGenre) || 0) + 1);
      }
      if (item.seedTitles.length === 1) {
        const s = item.seedTitles[0];
        finalSingleSeedCounts.set(s, (finalSingleSeedCounts.get(s) || 0) + 1);
      }
    }

    // Pass B: Fill remaining slots up to 18 if soft genre/seed caps left room
    if (finalResults.length < 18) {
      for (const item of filteredResults) {
        if (finalResults.length >= 18) break;
        const key = `${item.mediaType}_${item.id}`;
        if (selectedKeySet.has(key)) continue;
        finalResults.push(item);
        selectedKeySet.add(key);
      }
    }

    const tasteSummary: TasteSummary = {
      topGenres: sortedGenres.map((g) => ({
        id: g.id,
        name: ALL_GENRES_MAP[g.id]?.name || g.name,
        emoji: ALL_GENRES_MAP[g.id]?.emoji || "🎬",
        weight: Math.round(g.weight),
      })),
      topKeywords: sortedKeywords.map((k) => ({
        ...k,
        count: Math.round(k.count),
      })),
      favoriteDirectors: sortedDirectors.map((d) => d.name),
      favoriteActors: sortedActors.slice(0, 4).map((a) => a.name),
      seedCount: profilePositiveItems.length,
    };

    return NextResponse.json({
      recommendations: finalResults,
      tasteSummary,
    });
  } catch (err) {
    console.error("Recommendation engine error:", err);
    return NextResponse.json(
      { error: "Fehler beim Berechnen der persönlichen Empfehlungen" },
      { status: 500 }
    );
  }
}
