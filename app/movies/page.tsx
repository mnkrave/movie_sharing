import { getTopRatedMovies } from "@/lib/tmdb";
import { MoviesListClient } from "./MoviesListClient";
import { Film } from "lucide-react";

export const revalidate = 3600; // Cache 1 hour

export default async function MoviesPage() {
  // Fetch Top 140 movies (7 pages)
  const movies = await getTopRatedMovies(7);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2 max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-text flex items-center gap-1.5">
          <Film className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Bestenliste</span>
        </p>
        <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
          Top 250 Filme
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Die höchstbewerteten Filme aller Zeiten nach IMDb & TMDB. Klicke auf ein Plakat für deutsche Streaming-Anbieter und den VPN-Finder.
        </p>
      </div>

      {/* Interactive Client Component (Search, Filter by Decade, Pagination) */}
      <MoviesListClient initialMovies={movies} />
    </div>
  );
}
