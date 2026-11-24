import { getTopRatedMovies, getTopRatedTv, getTrendingAll, getOscarWinnersList } from "@/lib/tmdb";
import { HomeContentClient } from "@/components/HomeContentClient";
import { HomeHero } from "@/components/HomeHero";

export const revalidate = 3600; // Cache 1 hour

export default async function HomePage() {
  const [topMovies, topTv, trending] = await Promise.all([
    getTopRatedMovies(3),
    getTopRatedTv(3),
    getTrendingAll(2),
  ]);

  const allOscarWinners = getOscarWinnersList();
  const oscarWinners = allOscarWinners.slice(0, 10);

  // Prepare rich candidate pools for Hero Carousel & Dynamic Discovery Section
  const trendingMovies = trending.filter((item) => item.mediaType === "movie");
  const trendingTv = trending.filter((item) => item.mediaType === "tv");

  const fallbackMovies = [
    ...trendingMovies,
    ...allOscarWinners.slice(0, 15),
    ...topMovies.slice(0, 15),
  ];
  const fallbackTv = [...trendingTv, ...topTv.slice(0, 15)];

  return (
    <div className="space-y-8 sm:space-y-12 pb-6 md:pb-20">
      {/* Hero Showcase Carousel: Dynamic rotated selection + personalized matches */}
      <HomeHero
        initialGenericMovies={fallbackMovies}
        initialGenericTv={fallbackTv}
      />

      {/* Main Content with Top-Right Switcher & Dynamic First Block */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <HomeContentClient
          topMovies={topMovies}
          topTv={topTv}
          trending={trending}
          oscarWinners={oscarWinners}
          allOscarWinners={allOscarWinners}
        />
      </div>
    </div>
  );
}
