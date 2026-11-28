"use client";

import React from "react";
import { useMedia } from "@/components/MediaContext";
import { Sparkles, Plus } from "lucide-react";
import { PullToRefresh } from "@/components/PullToRefresh";
import { RecommendationsFeed } from "@/components/RecommendationsFeed";

export default function FeedPage() {
  const { refreshCommunity, openSearch, showToast } = useMedia();

  const handlePullRefresh = async () => {
    try {
      await refreshCommunity();
      showToast("Feed aktualisiert!", { type: "success" });
    } catch {
      showToast("Konnte Feed nicht aktualisieren.", { type: "error" });
    }
  };

  return (
    <div className="legacy-dark-surface min-h-[calc(100dvh-4rem)]">
      <PullToRefresh onRefresh={handlePullRefresh}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-10 space-y-6 md:space-y-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6 p-4 sm:p-8 rounded-3xl bg-gradient-to-br from-rose-950/40 via-slate-900 to-[#0e1320] border border-rose-500/20 shadow-xl">
            <div className="space-y-1 max-w-md">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Community-Feed
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Empfehlungen von Freunden
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Finde heraus, was deine Freunde gerade feiern und wo du es mit Streaming oder VPN schauen kannst.
              </p>
            </div>

            <div className="flex items-center justify-end w-full lg:w-auto">
              <button
                type="button"
                onClick={openSearch}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-black font-bold text-xs transition shadow-lg shadow-rose-500/20 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Titel empfehlen</span>
              </button>
            </div>
          </div>

          <RecommendationsFeed variant="full" defaultOnlyStreamable={true} />
        </div>
      </PullToRefresh>
    </div>
  );
}
