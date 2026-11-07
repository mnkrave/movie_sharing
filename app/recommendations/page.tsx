"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AiMovieAdvisor } from "@/components/AiMovieAdvisor";
import { AlgorithmRecommendations } from "@/components/AlgorithmRecommendations";
import { Sparkles, Zap, Bot, Sliders } from "lucide-react";

function RecommendationsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get("tab") || searchParams.get("type");
  const promptParam = searchParams.get("prompt");

  const [mode, setMode] = useState<"ai" | "algorithm">(() => {
    if (tabParam === "matches" || tabParam === "algorithm") {
      return "algorithm";
    }
    return "ai";
  });

  useEffect(() => {
    if (tabParam === "matches" || tabParam === "algorithm") {
      setMode("algorithm");
    } else if (tabParam === "ai") {
      setMode("ai");
    }
  }, [tabParam]);

  const handleSelectMode = (newMode: "ai" | "algorithm") => {
    setMode(newMode);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", newMode);
    router.replace(`/recommendations?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wide">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Smarte Film- & Serien-Empfehlungen</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Deine persönlichen Empfehlungen
        </h1>
        <p className="text-sm sm:text-base text-slate-400">
          Entdecke neue Meisterwerke – wähle zwischen interaktiver KI-Beratung für dich und deine Freunde oder dem automatischen Algorithmus abgestimmt auf deine Abos & deinen Filmgeschmack.
        </p>

        {/* Central Switcher between KI and Algorithmus */}
        <div className="pt-3 flex justify-center">
          <div className="p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl inline-flex items-center gap-1.5 w-full max-w-md">
            <button
              type="button"
              onClick={() => handleSelectMode("ai")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                mode === "ai"
                  ? "bg-gradient-to-r from-amber-500 via-amber-400 to-rose-500 text-black shadow-lg shadow-amber-500/20 font-black"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>KI-Filmberater</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  mode === "ai" ? "bg-black/20 text-black" : "bg-purple-500/20 text-purple-300"
                }`}
              >
                Gemini
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectMode("algorithm")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                mode === "algorithm"
                  ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 font-black"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Algorithmus</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  mode === "algorithm" ? "bg-black/20 text-black" : "bg-emerald-500/20 text-emerald-300"
                }`}
              >
                Matches
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="animate-in fade-in duration-300">
        {mode === "ai" ? (
          <AiMovieAdvisor initialPrompt={promptParam || undefined} />
        ) : (
          <AlgorithmRecommendations />
        )}
      </div>
    </div>
  );
}

export default function RecommendationsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-slate-400 animate-pulse">
          Lade Empfehlungen...
        </div>
      }
    >
      <RecommendationsContent />
    </Suspense>
  );
}
