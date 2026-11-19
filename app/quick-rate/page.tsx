import { getMostWatchedOnboardingMedia } from "@/lib/tmdb";
import { QuickRateClient } from "./QuickRateClient";

export const revalidate = 3600; // Cache 1 hour

export default async function QuickRatePage() {
  // Fetch ~280 of the most famous movies & series of all time sorted by vote count
  const initialItems = await getMostWatchedOnboardingMedia(10, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <QuickRateClient initialItems={initialItems} />
    </div>
  );
}
