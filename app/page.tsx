import { getTopRatedMovies, getTopRatedTv, getTrendingAll, getOscarWinnersList } from "@/lib/tmdb";
import { MediaCard } from "@/components/MediaCard";
import { Sparkles, Award, Film, Tv, Flame, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const revalidate = 3600; // Cache 1 hour

export default async function HomePage() {
  const [topMovies, topTv, trending] = await Promise.all([
    getTopRatedMovies(2),
    getTopRatedTv(1),
    getTrendingAll(),
  ]);

  const oscarWinners = getOscarWinnersList().slice(0, 10);
  const heroItem = trending[0] || topMovies[0];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Showcase Section */}
      {heroItem && (
        <section className="relative h-[480px] sm:h-[560px] w-full overflow-hidden bg-slate-950">
          {heroItem.backdropPath && (
            <Image
              src={`https://image.tmdb.org/t/p/original${heroItem.backdropPath}`}
              alt={heroItem.title}
              fill
              priority
              fetchPriority="high"
              sizes="100vw"
              className="object-cover object-top opacity-50"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07090e] via-[#07090e]/60 to-transparent" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-12 sm:pb-16 max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold tracking-wide uppercase">
                <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                Trending diese Woche
              </span>
              <span className="text-slate-400 text-xs font-semibold">
                {heroItem.releaseYear} • {heroItem.voteAverage} ★ TMDB
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              {heroItem.title}
            </h1>

            <p className="mt-3 text-sm sm:text-base text-slate-300 line-clamp-3 leading-relaxed max-w-2xl">
              {heroItem.overview}
            </p>

            <div className="flex items-center gap-3 mt-6">
              <Link
                href={`/feed`}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm transition shadow-lg shadow-amber-500/25 hover:scale-105"
              >
                <Sparkles className="w-4 h-4" />
                <span>Freunde-Empfehlungen</span>
              </Link>
              <Link
                href={`/oscars`}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-white font-semibold text-sm border border-slate-700/80 backdrop-blur-md transition"
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span>Oscar-Gewinner</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Main Content Containers */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* ROW 1: Oscar-Gewinner Highlights */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Oscar-Gewinner & Bester Film
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Prämierte Meisterwerke von Oppenheimer bis Parasite – klicke auf einen Film für den weltweiten Streaming-Finder!
                </p>
              </div>
            </div>
            <Link
              href="/oscars"
              className="flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 transition"
            >
              <span>Alle ansehen</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {oscarWinners.map((item, idx) => (
              <MediaCard key={item.id} item={item} priority={idx < 5} />
            ))}
          </div>
        </section>

        {/* ROW 2: Top Filme (IMDb / TMDB) */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-2xl border border-sky-500/20">
                <Film className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Top bewertete Filme (IMDb & TMDB)
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Die ewigen Klassiker & höchstbewerteten Filme aller Zeiten.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {topMovies.slice(0, 15).map((item) => (
              <MediaCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        {/* ROW 3: Top Serien */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-2xl border border-cyan-500/20">
                <Tv className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Top bewertete Serien
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Meisterhafte TV-Serien mit weltweiten Streaming-Optionen.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {topTv.slice(0, 10).map((item) => (
              <MediaCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        {/* ROW 4: Aktuell im Trend */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Aktuell im Trend
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Die meistgesehenen & diskutierten Filme und Serien dieser Woche.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {trending.slice(1, 11).map((item) => (
              <MediaCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
