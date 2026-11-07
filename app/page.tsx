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

  // Prepare fallback generic items: 4 movies + 2 series
  const trendingMovies = trending.filter((item) => item.mediaType === "movie");
  const trendingTv = trending.filter((item) => item.mediaType === "tv");

  const fallbackMovies = [...trendingMovies, ...topMovies].slice(0, 4);
  const fallbackTv = [...trendingTv, ...topTv].slice(0, 2);

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Showcase Carousel: 4 Movies & 2 Series (2 generic + 4 match-based) */}
      <HomeHero
        initialGenericMovies={fallbackMovies}
        initialGenericTv={fallbackTv}
      />

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
