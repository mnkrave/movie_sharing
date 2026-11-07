"use client";

import React, { useState } from "react";
import { MediaItem } from "@/lib/tmdb";
import { MediaCard } from "@/components/MediaCard";
import { Award, Film, Tv, Flame, ArrowRight } from "lucide-react";
import Link from "next/link";

interface HomeContentClientProps {
  topMovies: MediaItem[];
  topTv: MediaItem[];
  trending: MediaItem[];
  oscarWinners: MediaItem[];
}

export function HomeContentClient({
  topMovies,
  topTv,
  trending,
  oscarWinners,
}: HomeContentClientProps) {
  const [filterMode, setFilterMode] = useState<"ALL" | "movie" | "tv">("ALL");

  const displayedTrending = trending.filter((item) => {
    if (filterMode === "ALL") return true;
    return item.mediaType === filterMode;
  });

  return (
    <div className="space-y-12">
      {/* Top Filter Bar with Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl">
        <div className="space-y-0.5">
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            {filterMode === "movie" && (
              <>
                <Film className="w-5 h-5 text-amber-400" />
                <span>Top Filme & Kino-Highlights</span>
              </>
            )}
            {filterMode === "tv" && (
              <>
                <Tv className="w-5 h-5 text-cyan-400" />
                <span>Top Serien & TV-Meisterwerke</span>
              </>
            )}
            {filterMode === "ALL" && <span>🍿 Filme & Serien entdecken</span>}
          </h2>
          <p className="text-xs text-slate-400">
            {filterMode === "movie"
              ? "Zeigt nur Filme: Oscar-Gewinner, IMDb Top 250 und Kinotrends"
              : filterMode === "tv"
              ? "Zeigt nur Serien: Staffel-Highlights, TV-Bestenlisten und Serientrends"
              : "Alles auf einen Blick – wähle rechts oben, um die Ansicht auf nur Filme oder Serien umzuschalten"}
          </p>
        </div>

        {/* Segmented Control Switcher (Filme / Serien / Alle) */}
        <div className="p-1 rounded-2xl bg-black/60 border border-slate-700/80 backdrop-blur-md flex items-center shadow-lg self-end sm:self-auto">
          <button
            onClick={() => setFilterMode("movie")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
              filterMode === "movie"
                ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Filme</span>
          </button>

          <button
            onClick={() => setFilterMode("tv")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
              filterMode === "tv"
                ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Serien</span>
          </button>

          <button
            onClick={() => setFilterMode("ALL")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              filterMode === "ALL"
                ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>Alle</span>
          </button>
        </div>
      </div>

      {/* SECTION: Oscar-Gewinner (Nur bei ALL oder movie) */}
      {(filterMode === "ALL" || filterMode === "movie") && (
        <section className="space-y-5 animate-in fade-in duration-300">
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
      )}

      {/* SECTION: Top 250 Filme (Nur bei ALL oder movie) */}
      {(filterMode === "ALL" || filterMode === "movie") && (
        <section className="space-y-5 animate-in fade-in duration-300">
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
            <Link
              href="/movies"
              className="flex items-center gap-1 text-xs font-bold text-sky-400 hover:text-sky-300 transition"
            >
              <span>Ganze Top 250 ansehen</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {topMovies.slice(0, 15).map((item) => (
              <MediaCard key={item.id} item={item} />
            ))}
          </div>

          <div className="flex justify-center pt-2">
            <Link
              href="/movies"
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-sky-400 hover:text-sky-300 font-bold text-xs border border-slate-800 hover:border-sky-500/40 transition shadow-md"
            >
              <Film className="w-4 h-4" />
              <span>Ganze Top 250 Liste entdecken</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </section>
      )}

      {/* SECTION: Top Serien (Nur bei ALL oder tv) */}
      {(filterMode === "ALL" || filterMode === "tv") && (
        <section className="space-y-5 animate-in fade-in duration-300">
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
            <Link
              href="/tv"
              className="flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition"
            >
              <span>Alle Top-Serien ansehen</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {topTv.slice(0, 15).map((item) => (
              <MediaCard key={item.id} item={item} />
            ))}
          </div>

          <div className="flex justify-center pt-2">
            <Link
              href="/tv"
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 font-bold text-xs border border-slate-800 hover:border-cyan-500/40 transition shadow-md"
            >
              <Tv className="w-4 h-4" />
              <span>Alle Top-Serien entdecken</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </section>
      )}

      {/* SECTION: Aktuell im Trend (Gefiltert nach Modus) */}
      <section className="space-y-5 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                {filterMode === "movie"
                  ? "Aktuelle Film-Trends"
                  : filterMode === "tv"
                  ? "Aktuelle Serien-Trends"
                  : "Aktuell im Trend"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Die meistgesehenen & diskutierten Titel dieser Woche.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {displayedTrending.slice(0, 15).map((item) => (
            <MediaCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
