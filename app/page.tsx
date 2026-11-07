import { getTopRatedMovies, getTopRatedTv, getTrendingAll, getOscarWinnersList } from "@/lib/tmdb";
import { HomeContentClient } from "@/components/HomeContentClient";
import { HomeHero } from "@/components/HomeHero";

export const revalidate = 3600; // Cache 1 hour

export default async function HomePage() {
  const [topMovies, topTv, trending] = await Promise.all([
    getTopRatedMovies(2),
    getTopRatedTv(2),
    getTrendingAll(),
  ]);

  const oscarWinners = getOscarWinnersList().slice(0, 10);
  const heroItem = trending[0] || topMovies[0];

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Showcase Section with Poster & Clickable Details */}
      {heroItem && <HomeHero heroItem={heroItem} />}

      {/* Main Content with Top-Right Switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <HomeContentClient
          topMovies={topMovies}
          topTv={topTv}
          trending={trending}
          oscarWinners={oscarWinners}
        />
      </div>
    </div>
  );
}
