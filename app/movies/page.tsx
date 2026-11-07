import { getTopRatedMovies } from "@/lib/tmdb";
import { MoviesListClient } from "./MoviesListClient";
import { Film } from "lucide-react";

export const revalidate = 3600; // Cache 1 hour

export default async function MoviesPage() {
  // Fetch Top 140 movies (7 pages)
  const movies = await getTopRatedMovies(7);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-sky-950/40 via-slate-900 to-[#0e1424] border border-sky-500/30 shadow-2xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold border border-sky-500/40 uppercase tracking-wider">
          <Film className="w-4 h-4 text-sky-400" />
          Offizielle Bestenliste
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Top Filme aller Zeiten (IMDb & TMDB)
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
          Die ewigen Meisterwerke des Kinos – von Die Verurteilten und Der Pate bis zu modernen
          Klassikern wie Interstellar und The Dark Knight. Klicke auf ein Plakat, um deutsche
          Streaming-Anbieter und den weltweiten VPN-Finder zu öffnen.
        </p>
      </div>

      {/* Interactive Client Component (Search, Filter by Decade, Pagination) */}
      <MoviesListClient initialMovies={movies} />
    </div>
  );
}
