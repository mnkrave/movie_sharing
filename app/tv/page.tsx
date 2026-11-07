import { getTopRatedTv } from "@/lib/tmdb";
import { TvListClient } from "./TvListClient";
import { Tv } from "lucide-react";

export const revalidate = 3600; // Cache 1 hour

export default async function TvPage() {
  // Fetch Top 120 series (6 pages)
  const series = await getTopRatedTv(6);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-[#0e1424] border border-cyan-500/30 shadow-2xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/40 uppercase tracking-wider">
          <Tv className="w-4 h-4 text-cyan-400" />
          Serien-Bestenliste
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Top bewertete Serien aller Zeiten
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
          Von bahnbrechenden Meisterwerken wie Breaking Bad, Chernobyl und Arcane bis zu packenden
          Dauerbrennern wie Game of Thrones und Avatar. Klicke auf ein Serienplakat, um zu sehen,
          auf welchen Streaming-Diensten alle Staffeln verfügbar sind.
        </p>
      </div>

      {/* Interactive Client Component */}
      <TvListClient initialSeries={series} />
    </div>
  );
}
