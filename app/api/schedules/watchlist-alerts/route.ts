import { handleSchedule } from "@vercel/schedules";
import { runWatchlistStreamingCheck } from "@/lib/watchlist-alerts";

export const maxDuration = 60;

export const POST = handleSchedule(async (metadata) => {
  console.log(
    `[WatchlistAlerts] Running schedule "${metadata.name}" (${metadata.executionId}) at ${metadata.scheduledAt.toISOString()}`
  );
  const summary = await runWatchlistStreamingCheck({ dryRun: false });
  console.log("[WatchlistAlerts] Completed:", JSON.stringify(summary));
});
