import { getTopRatedTv } from "@/lib/tmdb";
import { TvListClient } from "./TvListClient";
import { Tv } from "lucide-react";

export const revalidate = 3600; // Cache 1 hour

export default async function TvPage() {
  // Fetch Top 120 series (6 pages)
  const series = await getTopRatedTv(6);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2 max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-text flex items-center gap-1.5">
          <Tv className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Serien-Bestenliste</span>
        </p>
        <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
          Top 250 Serien
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Von bahnbrechenden Meisterwerken wie Breaking Bad und Chernobyl bis zu packenden Dauerbrennern. Klicke auf ein Serienplakat für weltweite Streaming-Optionen.
        </p>
      </div>

      {/* Interactive Client Component */}
      <TvListClient initialSeries={series} />
    </div>
  );
}
