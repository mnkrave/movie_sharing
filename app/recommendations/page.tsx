"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AiMovieAdvisor } from "@/components/AiMovieAdvisor";
import { AlgorithmRecommendations } from "@/components/AlgorithmRecommendations";
import { Sparkles, SlidersHorizontal } from "lucide-react";

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Open Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-text">
            Für deinen nächsten Abend
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            Empfehlungen
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Beschreib deinen Abend im KI-Berater oder nutze deinen persönlichen Algorithmus abgestimmt auf Geschmack und Abos.
          </p>
        </div>

        {/* Clean Segmented Tabs */}
        <div
          role="tablist"
          aria-label="Empfehlungs-Modus"
          className="inline-flex items-center gap-1 p-1 rounded-xl bg-muted border border-border self-start md:self-auto"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "ai"}
            onClick={() => handleSelectMode("ai")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer ${
              mode === "ai"
                ? "bg-card text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground border border-transparent"
            }`}
          >
            <Sparkles className="w-4 h-4 text-primary-text" aria-hidden="true" />
            <span>KI-Berater</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={mode === "algorithm"}
            onClick={() => handleSelectMode("algorithm")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer ${
              mode === "algorithm"
                ? "bg-card text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground border border-transparent"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-primary-text" aria-hidden="true" />
            <span>Algorithmus</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="animate-in fade-in duration-200">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-muted-foreground animate-pulse">
          Lade Empfehlungen…
        </div>
      }
    >
      <RecommendationsContent />
    </Suspense>
  );
}
