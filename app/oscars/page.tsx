"use client";

import React, { useState } from "react";
import { getOscarWinnersList } from "@/lib/tmdb";
import { MediaCard } from "@/components/MediaCard";
import { Award, Trophy, Filter, Star } from "lucide-react";

export default function OscarsPage() {
  const allWinners = getOscarWinnersList();
  const [selectedDecade, setSelectedDecade] = useState<string>("ALL");

  const filteredWinners = allWinners.filter((item) => {
    if (!item.oscarInfo) return true;
    const year = item.oscarInfo.ceremonyYear;
    if (selectedDecade === "2020s") return year >= 2020;
    if (selectedDecade === "2010s") return year >= 2010 && year < 2020;
    if (selectedDecade === "2000s") return year >= 2000 && year < 2010;
    if (selectedDecade === "1990s") return year >= 1990 && year < 2000;
    if (selectedDecade === "classic") return year < 1990;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-[#0c101c] border border-amber-500/30 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40 uppercase tracking-wider">
            <Trophy className="w-4 h-4 text-amber-400" />
            Academy Awards – Bester Film
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Oscar-Gewinner & Meisterwerke
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Die von der Academy of Motion Picture Arts and Sciences prämierten Filme. Klicke auf
            einen Film, um zu sehen, wie viele Oscars er gewonnen hat und über welchen VPN-Server du
            ihn direkt auf Netflix, Prime & Co. streamen kannst!
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { key: "ALL", label: "Alle Jahrzehnte" },
          { key: "2020s", label: "2020er Jahre" },
          { key: "2010s", label: "2010er Jahre" },
          { key: "2000s", label: "2000er Jahre" },
          { key: "1990s", label: "1990er Jahre" },
          { key: "classic", label: "Klassiker" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedDecade(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedDecade === tab.key
                ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
        {filteredWinners.map((item, idx) => (
          <div key={item.id} className="flex flex-col">
            <MediaCard item={item} priority={idx < 5} />
            {item.oscarInfo && (
              <div className="mt-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] space-y-1">
                <div className="flex items-center justify-between text-amber-400 font-bold">
                  <span>Oscar {item.oscarInfo.ceremonyYear}</span>
                  <span>{item.oscarInfo.oscarsWon} Oscars gew.</span>
                </div>
                <p className="text-slate-400 line-clamp-1">{item.oscarInfo.categoryHighlight}</p>
                <p className="text-slate-500 text-[10px]">Regie: {item.oscarInfo.director}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
