import { NextResponse } from "next/server";
import {
  ALL_GENRES_MAP,
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
  seedCount: number;
}

interface SeedInput {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  rating?: number | null;
}

// Cache seed lookups in memory for fast repeat filtering
const seedCache = new Map<string, any>();
const providerCache = new Map<string, any>();

async function fetchSeedData(item: SeedInput) {
  const key = `${item.mediaType}_${item.tmdbId}`;
  if (seedCache.has(key)) return seedCache.get(key);

  try {
    const url = `${TMDB_BASE_URL}/${item.mediaType}/${item.tmdbId}?api_key=${TMDB_API_KEY}&language=de-DE&append_to_response=keywords,recommendations,credits`;
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
  if (providerCache.has(key)) return providerCache.get(key);

  try {
    const url = `${TMDB_BASE_URL}/${mediaType}/${id}/watch/providers?api_key=${TMDB_API_KEY}`;
    const res = await fetch(url, { next: { revalidate: 43200 } });
    if (!res.ok) return [];
    const data = await res.json();
    const de = data.results?.DE;
    const flatrateAndFree = [...(de?.flatrate || []), ...(de?.free || [])];
    // Deduplicate by provider_id
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

  // Fallback: title prefix (before colon or dash e.g. "Mission: Impossible - Fallout" -> "mission")
  const mainPart = t.split(/[:\-\–]/)[0].trim().replace(/[^a-z0-9\s]/g, "");
  const words = mainPart.split(/\s+/).filter((w) => w.length > 2);
  if (words.length > 0) {
    return `title_${words.slice(0, 2).join("_")}`;
  }

  return `title_${t.slice(0, 15)}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const watchedItems: SeedInput[] = body.watchedItems || [];
    const watchlistIds: number[] = body.watchlistIds || [];
    const userSubscriptions: string[] = body.subscriptions || body.userSubscriptions || [];
    const onlyMySubscriptions: boolean = body.onlyMySubscriptions ?? true;
    const targetMediaType: "ALL" | "movie" | "tv" = body.mediaTypeFilter || body.mediaType || "ALL";
    const excludeWatchlist: boolean = body.excludeWatchlist ?? false;

    const watchedSet = new Set(watchedItems.map((i) => `${i.mediaType}_${i.tmdbId}`));
    const watchlistSet = new Set(watchlistIds);

    // 1. Sort watched items by rating descending to pick the strongest positive seeds
    const sortedWatched = [...watchedItems].sort((a, b) => {
      const rA = typeof a.rating === "number" ? a.rating : 7.5;
      const rB = typeof b.rating === "number" ? b.rating : 7.5;
      return rB - rA;
    });

    const positiveSeeds = sortedWatched
      .filter((i) => (typeof i.rating === "number" ? i.rating >= 7 : true))
      .slice(0, 12);

    const dislikedSeeds = sortedWatched.filter(
      (i) => typeof i.rating === "number" && i.rating <= 5
    );

    // 2. Fetch TMDB seed data (genres, keywords, recommendations, directors)
    const seedDetailsList = await Promise.all(
      positiveSeeds.map(async (seed) => ({
        seed,
        data: await fetchSeedData(seed),
      }))
    );

    const genreWeights = new Map<number, { id: number; name: string; weight: number }>();
    const keywordWeights = new Map<number, { id: number; name: string; count: number }>();
    const directorSet = new Set<string>();

    // Candidate map: key `${mediaType}_${id}`
    const candidatesMap = new Map<
      string,
      {
        raw: any;
        mediaType: "movie" | "tv";
        seedSources: { title: string; rating: number }[];
        fromDiscoverSub: boolean;
        fromKeywordDiscover: boolean;
      }
    >();

    for (const { seed, data } of seedDetailsList) {
      if (!data) continue;
      const rating = typeof seed.rating === "number" ? seed.rating : 8;
      // Weight multiplier: 10★ -> 5, 9★ -> 4, 8★ -> 3, 7★ -> 2
      const weightDelta = Math.max(1, rating - 5);

      // Accumulate Genre Weights
      for (const g of data.genres || []) {
        const existing = genreWeights.get(g.id) || { id: g.id, name: g.name, weight: 0 };
        existing.weight += weightDelta;
        genreWeights.set(g.id, existing);
      }

      // Accumulate Keywords (movies use keywords.keywords, tv uses keywords.results)
      const kwList = data.keywords?.keywords || data.keywords?.results || [];
      for (const kw of kwList.slice(0, 14)) {
        const existing = keywordWeights.get(kw.id) || { id: kw.id, name: kw.name, count: 0 };
        existing.count += weightDelta;
        keywordWeights.set(kw.id, existing);
      }

      // Accumulate Director / Creator
      const directorObj =
        seed.mediaType === "movie"
          ? (data.credits?.crew || []).find((c: any) => c.job === "Director")
          : (data.created_by || [])[0];
      if (directorObj?.name && rating >= 8) {
        directorSet.add(directorObj.name);
      }

      // Collect Collaborative Recommendations from this seed (take up to 20 to find more cross-seed Kombi-matches!)
      const recs = data.recommendations?.results || [];
      for (const rec of recs.slice(0, 20)) {
        const recType: "movie" | "tv" =
          rec.media_type === "tv" || seed.mediaType === "tv" ? "tv" : "movie";
        if (targetMediaType !== "ALL" && recType !== targetMediaType) continue;

        const cKey = `${recType}_${rec.id}`;
        if (watchedSet.has(cKey)) continue;
        if (excludeWatchlist && watchlistSet.has(rec.id)) continue;
        if ((rec.vote_count || 0) < 150 || (rec.vote_average || 0) < 6.4) continue;

        const existing = candidatesMap.get(cKey);
        if (existing) {
          if (!existing.seedSources.some((s) => s.title === seed.title)) {
            existing.seedSources.push({ title: seed.title, rating });
          }
        } else {
          candidatesMap.set(cKey, {
            raw: rec,
            mediaType: recType,
            seedSources: [{ title: seed.title, rating }],
            fromDiscoverSub: false,
            fromKeywordDiscover: false,
          });
        }
      }
    }

    // Penalize genres from disliked items (rating <= 5)
    for (const bad of dislikedSeeds.slice(0, 4)) {
      const data = await fetchSeedData(bad);
      if (!data) continue;
      for (const g of data.genres || []) {
        const existing = genreWeights.get(g.id);
        if (existing) {
          existing.weight = Math.max(1, existing.weight - 2);
        }
      }
    }

    // Sort top genres and keywords
    const sortedGenres = Array.from(genreWeights.values())
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 6);

    const sortedKeywords = Array.from(keywordWeights.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Check if user genuinely watches and likes animated content
    const animWeight = genreWeights.get(16)?.weight || 0;
    const userLikesAnimation = animWeight >= 12;

    // 3. Build TMDB Provider filter string for user's active subscriptions in DE
    const tmdbProviderIds = new Set<number>();
    userSubscriptions.forEach((subKey) => {
      const ids = SUB_KEY_TO_TMDB_PROVIDER_IDS[subKey] || [];
      ids.forEach((id) => tmdbProviderIds.add(id));
    });
    const providerFilterString = Array.from(tmdbProviderIds).join("|");

    // 4. Discover additional high-match candidates directly on user's subscriptions in DE
    const topMovieGenreIds = sortedGenres
      .filter((g) => ALL_GENRES_MAP[g.id])
      .slice(0, 3)
      .map((g) => g.id);

    const topKeywordIds = sortedKeywords.slice(0, 4).map((k) => k.id);

    const discoverPromises: Promise<void>[] = [];

    const addDiscoverQuery = (
      type: "movie" | "tv",
      params: Record<string, string>,
      isKeywordQuery = false
    ) => {
      if (targetMediaType !== "ALL" && targetMediaType !== type) return;
      const query = new URLSearchParams({
        api_key: TMDB_API_KEY,
        language: "de-DE",
        watch_region: "DE",
        sort_by: "vote_average.desc",
        "vote_count.gte": type === "movie" ? "700" : "350",
        "vote_average.gte": "7.3",
        ...params,
      });
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
              if (excludeWatchlist && watchlistSet.has(item.id)) continue;

              const existing = candidatesMap.get(cKey);
              if (existing) {
                existing.fromDiscoverSub = true;
                if (isKeywordQuery) existing.fromKeywordDiscover = true;
              } else {
                candidatesMap.set(cKey, {
                  raw: item,
                  mediaType: type,
                  seedSources: [],
                  fromDiscoverSub: Boolean(providerFilterString),
                  fromKeywordDiscover: isKeywordQuery,
                });
              }
            }
          })
          .catch(() => {})
      );
    };

    // Query 1: Movies matching Top Genres on User's Subscriptions
    if (topMovieGenreIds.length > 0) {
      addDiscoverQuery("movie", {
        with_genres: topMovieGenreIds.slice(0, 2).join(","),
      });
      addDiscoverQuery("movie", {
        with_genres: topMovieGenreIds.join("|"),
        sort_by: "popularity.desc",
        "vote_average.gte": "7.4",
      });
      addDiscoverQuery("tv", {
        with_genres: topMovieGenreIds.join("|"),
        "vote_count.gte": "400",
      });
    } else {
      addDiscoverQuery("movie", {});
      addDiscoverQuery("tv", {});
    }

    // Query 2: Movies matching Top Keywords on User's Subscriptions
    if (topKeywordIds.length > 0) {
      addDiscoverQuery(
        "movie",
        {
          with_keywords: topKeywordIds.join("|"),
          "vote_count.gte": "400",
        },
        true
      );
    }

    await Promise.all(discoverPromises);

    // 5. Score all candidates using our Improved Hybrid Taste Formula
    const maxGenreWeight = Math.max(...sortedGenres.map((g) => g.weight), 1);

    const scoredCandidates = Array.from(candidatesMap.values()).map((entry) => {
      const { raw, mediaType, seedSources, fromDiscoverSub, fromKeywordDiscover } = entry;
      const itemGenreIds: number[] =
        raw.genre_ids || (raw.genres ? raw.genres.map((g: any) => g.id) : []);

      // A. Genre Affinity Score (0 - 36 points)
      let genrePoints = 0;
      const matchedGenreNames: string[] = [];
      for (const gid of itemGenreIds) {
        const gw = genreWeights.get(gid);
        if (gw) {
          genrePoints += (gw.weight / maxGenreWeight) * 16;
          matchedGenreNames.push(`${ALL_GENRES_MAP[gid]?.emoji || "🎬"} ${gw.name}`);
        }
      }
      genrePoints = Math.min(36, genrePoints);

      // B. Collaborative Seed Overlap & Kombi-Matches Score (0 - 45 points)
      let seedPoints = 0;
      const isComboMatch = seedSources.length >= 2;

      if (seedSources.length > 0) {
        const bestSeedRating = Math.max(...seedSources.map((s) => s.rating));
        const base = 14 + (bestSeedRating - 7) * 2;
        // Big Kombi-Match bonus: 2 seeds -> +16, 3+ seeds -> +26 points!
        const comboBonus = isComboMatch ? 16 + (seedSources.length - 2) * 10 : 0;
        seedPoints = base + comboBonus;
      }
      if (fromKeywordDiscover) {
        seedPoints += 6;
      }
      seedPoints = Math.min(45, seedPoints);

      // C. Global Quality & Popularity Score (0 - 18 points)
      const voteAvg = raw.vote_average || 7.0;
      const qualityPoints = Math.min(18, Math.max(0, (voteAvg - 6.0) * 4.5));

      // D. Subscription Bonus (0 - 5 points)
      const subBonus = fromDiscoverSub ? 5 : 2;

      // E. Tone / Animation Mismatch Penalty:
      // If user watched live-action movies and candidate is animated (e.g. Batman: Year One for The Dark Knight),
      // penalize it heavily unless user has high animation taste!
      let penalty = 0;
      const isCandidateAnimated = itemGenreIds.includes(16);
      if (isCandidateAnimated && !userLikesAnimation) {
        penalty += 18;
      }

      const rawTotal = Math.round(genrePoints + seedPoints + qualityPoints + subBonus - penalty);
      const matchScore = Math.min(99, Math.max(65, rawTotal));

      // Build human-readable reasons (Highlighting true Kombi-Matches!)
      const reasons: string[] = [];
      if (isComboMatch) {
        const seedNames = seedSources
          .slice(0, 2)
          .map((s) => `${s.title}`)
          .join(" & ");
        reasons.push(`🔥 Kombi-Match: Weil dir sowohl ${seedNames} gefallen haben`);
      } else if (seedSources.length === 1) {
        reasons.push(`Weil dir ${seedSources[0].title} (${seedSources[0].rating}★) gefallen hat`);
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
        fromDiscoverSub,
        raw,
      };
    });

    // Sort by matchScore (with Kombi-Match priority) and quality
    scoredCandidates.sort((a, b) => {
      const aBonus = a.isComboMatch ? 6 : 0;
      const bBonus = b.isComboMatch ? 6 : 0;
      return (b.matchScore + bBonus) - (a.matchScore + aBonus) || b.voteAverage - a.voteAverage;
    });

    // 6. Diversified Selection:
    // - STRICT Franchise Capping: Maximum 1 movie per franchise across the entire recommendation pool!
    //   (Prevents 6 Batman movies, 2 Rush Hours, 2 Minions, etc.)
    // - Single-Seed Capping: Maximum 1 recommendation stemming exclusively from any single seed movie
    // - Kombi-Matches (matching 2+ seeds) are prioritized and exempt from single-seed limits!
    const selectedPool: typeof scoredCandidates = [];
    const franchiseCounts = new Map<string, number>();
    const singleSeedCounts = new Map<string, number>();

    const canAddCandidate = (cand: (typeof scoredCandidates)[0], maxPerSeed = 1): boolean => {
      const fKey = getFranchiseKey(cand.title, cand.raw);
      // Strictly max 1 per franchise across the entire list!
      if ((franchiseCounts.get(fKey) || 0) >= 1) return false;

      // If single-seed (matches only 1 seed movie), enforce seed cap
      if (cand.seedTitles.length === 1) {
        const seed = cand.seedTitles[0];
        if ((singleSeedCounts.get(seed) || 0) >= maxPerSeed) return false;
      }
      return true;
    };

    const addCandidate = (cand: (typeof scoredCandidates)[0]) => {
      selectedPool.push(cand);
      const fKey = getFranchiseKey(cand.title, cand.raw);
      franchiseCounts.set(fKey, (franchiseCounts.get(fKey) || 0) + 1);
      if (cand.seedTitles.length === 1) {
        const seed = cand.seedTitles[0];
        singleSeedCounts.set(seed, (singleSeedCounts.get(seed) || 0) + 1);
      }
    };

    // Pass 1: Kombi-Matches (matching 2 or more watched movies!)
    for (const cand of scoredCandidates) {
      if (selectedPool.length >= 36) break;
      if (cand.isComboMatch && canAddCandidate(cand, 99)) {
        addCandidate(cand);
      }
    }

    // Pass 2: Best diverse single-seed & discover candidates (max 1 single-seed per watched movie)
    for (const cand of scoredCandidates) {
      if (selectedPool.length >= 36) break;
      if (selectedPool.some((s) => s.id === cand.id && s.mediaType === cand.mediaType)) continue;

      if (canAddCandidate(cand, 1)) {
        addCandidate(cand);
      }
    }

    // Pass 3: If pool has room, allow up to 2 single-seed matches per watched movie (still strictly max 1 per franchise!)
    if (selectedPool.length < 36) {
      for (const cand of scoredCandidates) {
        if (selectedPool.length >= 36) break;
        if (selectedPool.some((s) => s.id === cand.id && s.mediaType === cand.mediaType)) continue;

        if (canAddCandidate(cand, 2)) {
          addCandidate(cand);
        }
      }
    }

    // Pass 4: Fill remaining from discover or whatever is left while still respecting franchise cap!
    if (selectedPool.length < 36) {
      for (const cand of scoredCandidates) {
        if (selectedPool.length >= 36) break;
        if (selectedPool.some((s) => s.id === cand.id && s.mediaType === cand.mediaType)) continue;

        const fKey = getFranchiseKey(cand.title, cand.raw);
        if ((franchiseCounts.get(fKey) || 0) >= 1) continue;
        addCandidate(cand);
      }
    }

    // 7. Enrich top pool with exact DE Watch Providers
    const enrichedPool: RecommendedMediaItem[] = await Promise.all(
      selectedPool.map(async (cand) => {
        const rawProviders = await fetchDEProviders(cand.mediaType, cand.id);
        const availableProvidersDE = rawProviders.map((p: any) => {
          const norm = normalizeProviderKey(p.provider_name);
          const isMySub = userSubscriptions.includes(norm.key);
          return {
            providerId: p.provider_id,
            providerName: norm.displayName || p.provider_name,
            logoPath: p.logo_path,
            isMySub,
          };
        });

        // Deduplicate by display name
        const seenNames = new Set<string>();
        const dedupedProviders = availableProvidersDE.filter((p: any) => {
          if (seenNames.has(p.providerName)) return false;
          seenNames.add(p.providerName);
          return true;
        });

        return {
          ...cand,
          availableProvidersDE: dedupedProviders,
        };
      })
    );

    // 8. Filter by onlyMySubscriptions if enabled and user has subscriptions configured
    let finalResults = enrichedPool;
    if (onlyMySubscriptions && userSubscriptions.length > 0) {
      const subFiltered = enrichedPool.filter((item) =>
        item.availableProvidersDE.some((p) => p.isMySub)
      );
      if (subFiltered.length > 0) {
        finalResults = subFiltered;
      }
    }

    // Re-sort so items on user's subscriptions with highest matchScore are first, preserving Kombi priority
    finalResults.sort((a, b) => {
      const aHasSub = a.availableProvidersDE.some((p) => p.isMySub) ? 1 : 0;
      const bHasSub = b.availableProvidersDE.some((p) => p.isMySub) ? 1 : 0;
      if (onlyMySubscriptions && bHasSub !== aHasSub) return bHasSub - aHasSub;
      const aBonus = a.isComboMatch ? 6 : 0;
      const bBonus = b.isComboMatch ? 6 : 0;
      return (b.matchScore + bBonus) - (a.matchScore + aBonus) || b.voteAverage - a.voteAverage;
    });

    const tasteSummary: TasteSummary = {
      topGenres: sortedGenres.map((g) => ({
        id: g.id,
        name: g.name,
        emoji: ALL_GENRES_MAP[g.id]?.emoji || "🎬",
        weight: g.weight,
      })),
      topKeywords: sortedKeywords,
      favoriteDirectors: Array.from(directorSet).slice(0, 5),
      seedCount: positiveSeeds.length,
    };

    return NextResponse.json({
      recommendations: finalResults.slice(0, 18),
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
