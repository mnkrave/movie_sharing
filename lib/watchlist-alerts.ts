import {
  getWatchlistAlertContext,
  markWatchlistItemsAlerted,
  upsertStreamingSnapshot,
  type WatchlistAlertCandidate,
} from "./store";
import {
  fetchDeStreamingProviders,
  POPULAR_SUBSCRIPTIONS,
  type DeStreamingProvider,
} from "./tmdb";
import { sendWatchlistDigestEmail, type WatchlistDigestEmailItem } from "./email";

export interface WatchlistCheckSummary {
  dryRun: boolean;
  totalWatchlistEntries: number;
  uniqueTitlesChecked: number;
  newBaselinesCreated: number;
  titlesTransitionedFromNone: number;
  usersMatched: number;
  emailsSent: number;
  matches: Array<{
    userEmail: string;
    title: string;
    providers: string[];
  }>;
  errors: string[];
}

/**
 * Checks all active Watchlist titles against TMDB DE watch/providers.
 * Sends a grouped "Neu für deine Watchlist" digest email when a title transitions
 * from 0 DE streaming providers to at least one of a user's selected subscriptions.
 */
export async function runWatchlistStreamingCheck(options?: {
  dryRun?: boolean;
}): Promise<WatchlistCheckSummary> {
  const dryRun = Boolean(options?.dryRun);
  const { candidates, snapshots } = await getWatchlistAlertContext();

  const candidatesByTitle = new Map<string, WatchlistAlertCandidate[]>();
  for (const c of candidates) {
    const key = `${c.mediaType}:${c.tmdbId}`;
    const list = candidatesByTitle.get(key) || [];
    list.push(c);
    candidatesByTitle.set(key, list);
  }

  const titleEntries = Array.from(candidatesByTitle.entries());
  const digestByUser = new Map<
    string,
    {
      userId: string;
      userName: string;
      userEmail: string;
      mediaStatusIds: string[];
      items: WatchlistDigestEmailItem[];
    }
  >();

  let newBaselinesCreated = 0;
  let titlesTransitionedFromNone = 0;
  const matches: WatchlistCheckSummary["matches"] = [];
  const errors: string[] = [];

  const BATCH_SIZE = 5;
  for (let i = 0; i < titleEntries.length; i += BATCH_SIZE) {
    const batch = titleEntries.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async ([titleKey, watchers]) => {
        const sample = watchers[0];
        try {
          const previousProviders = snapshots.get(titleKey);
          const currentProviders: DeStreamingProvider[] = await fetchDeStreamingProviders(
            sample.tmdbId,
            sample.mediaType
          );
          const currentKeys = currentProviders.map((p) => p.key);

          if (!dryRun) {
            await upsertStreamingSnapshot(sample.tmdbId, sample.mediaType, currentKeys);
          }

          if (previousProviders === undefined) {
            newBaselinesCreated++;
            return;
          }

          // Only alert when the title previously had ZERO DE streaming providers
          if (previousProviders.length > 0 || currentProviders.length === 0) {
            return;
          }

          titlesTransitionedFromNone++;

          for (const w of watchers) {
            if (!w.watchlistAlertsEnabled || w.alertedAt) continue;

            const subSet = new Set(w.subscriptions);
            const matchedProviders = currentProviders.filter((p) => subSet.has(p.key));
            if (matchedProviders.length === 0) continue;

            matches.push({
              userEmail: w.userEmail,
              title: w.title,
              providers: matchedProviders.map((p) => p.displayName),
            });

            let userDigest = digestByUser.get(w.userId);
            if (!userDigest) {
              userDigest = {
                userId: w.userId,
                userName: w.userName,
                userEmail: w.userEmail,
                mediaStatusIds: [],
                items: [],
              };
              digestByUser.set(w.userId, userDigest);
            }

            userDigest.mediaStatusIds.push(w.mediaStatusId);
            userDigest.items.push({
              tmdbId: w.tmdbId,
              mediaType: w.mediaType,
              title: w.title,
              posterPath: w.posterPath,
              releaseYear: w.releaseYear,
              providers: matchedProviders,
            });
          }
        } catch (err: any) {
          errors.push(`${titleKey}: ${err?.message || "TMDB-Abruf fehlgeschlagen"}`);
        }
      })
    );
  }

  let emailsSent = 0;
  if (!dryRun && digestByUser.size > 0) {
    const alertedIds: string[] = [];
    await Promise.all(
      Array.from(digestByUser.values()).map(async (digest) => {
        const res = await sendWatchlistDigestEmail({
          to: digest.userEmail,
          userName: digest.userName,
          userId: digest.userId,
          items: digest.items,
        });
        if (res.sent) {
          emailsSent++;
          alertedIds.push(...digest.mediaStatusIds);
        } else if (res.error) {
          errors.push(`${digest.userEmail}: ${res.error}`);
        }
      })
    );
    await markWatchlistItemsAlerted(alertedIds);
  }

  return {
    dryRun,
    totalWatchlistEntries: candidates.length,
    uniqueTitlesChecked: titleEntries.length,
    newBaselinesCreated,
    titlesTransitionedFromNone,
    usersMatched: digestByUser.size,
    emailsSent,
    matches,
    errors,
  };
}

function toMockProvider(key: string): DeStreamingProvider {
  const sub = POPULAR_SUBSCRIPTIONS.find((s) => s.key === key);
  return {
    key,
    displayName: sub?.label ?? key,
    logoPath: null,
    color: sub?.color ?? "#f59e0b",
    streamType: "flatrate",
  };
}

/**
 * Sends a realistic test digest email to the admin using their own Watchlist items (or a sample movie).
 */
export async function sendTestWatchlistDigest(params: {
  userId: string;
  userName: string;
  userEmail: string;
}): Promise<{ sent: boolean; itemCount: number; error?: string }> {
  const { candidates } = await getWatchlistAlertContext();
  const ownWatchlist = candidates
    .filter((c) => c.userId === params.userId)
    .slice(0, 3);

  const items: WatchlistDigestEmailItem[] =
    ownWatchlist.length > 0
      ? ownWatchlist.map((c, idx) => ({
          tmdbId: c.tmdbId,
          mediaType: c.mediaType,
          title: c.title,
          posterPath: c.posterPath,
          releaseYear: c.releaseYear,
          providers:
            idx % 2 === 0
              ? [toMockProvider("disney")]
              : [toMockProvider("netflix"), toMockProvider("prime")],
        }))
      : [
          {
            tmdbId: 693134,
            mediaType: "movie",
            title: "Dune: Part Two",
            posterPath: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
            releaseYear: "2024",
            providers: [toMockProvider("disney")],
          },
        ];

  const res = await sendWatchlistDigestEmail({
    to: params.userEmail,
    userName: params.userName,
    userId: params.userId,
    items,
    isTest: true,
  });

  return { sent: res.sent, itemCount: items.length, error: res.error };
}
