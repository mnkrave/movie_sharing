"use client";

import React, { useState } from "react";
import { useMedia } from "@/components/MediaContext";
import { useSession } from "next-auth/react";
import Image from "next/image";
import {
  Sparkles,
  Star,
  ThumbsUp,
  Globe2,
  Film,
  Tv,
  Plus,
  MessageSquare,
  Search,
} from "lucide-react";

export default function FeedPage() {
  const { data: session } = useSession();
  const { communityData, upvoteRecommendation, openMediaModal, openSearch } = useMedia();
  const [filterType, setFilterType] = useState<"ALL" | "movie" | "tv">("ALL");

  const recommendations = communityData.recommendations.filter((rec) => {
    if (filterType === "ALL") return true;
    return rec.mediaType === filterType;
  });

  const myUserId = (session?.user as any)?.id || "user_lukas";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-rose-950/40 via-slate-900 to-[#0e1320] border border-rose-500/20 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Community-Feed
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Empfehlungen von Freunden
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Finde heraus, welche Filme und Serien deine Freunde gerade feiern und wo du sie streamen kannst.
          </p>
        </div>

        <button
          type="button"
          onClick={openSearch}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-black font-bold text-xs transition shadow-lg shadow-rose-500/20 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Titel empfehlen</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterType("ALL")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            filterType === "ALL"
              ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
              : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          }`}
        >
          Alle ({communityData.recommendations.length})
        </button>
        <button
          onClick={() => setFilterType("movie")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            filterType === "movie"
              ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
              : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          }`}
        >
          Filme
        </button>
        <button
          onClick={() => setFilterType("tv")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            filterType === "tv"
              ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
              : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          }`}
        >
          Serien
        </button>
      </div>

      {/* Feed List */}
      {recommendations.length > 0 ? (
        <div className="space-y-6">
          {recommendations.map((rec) => {
            const isUpvoted = rec.upvoterIds.includes(myUserId);
            return (
              <div
                key={rec.id}
                className="p-5 sm:p-6 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition shadow-lg flex flex-col sm:flex-row gap-5"
              >
                {/* Poster Thumbnail */}
                <div
                  onClick={() =>
                    openMediaModal({
                      id: rec.tmdbId,
                      mediaType: rec.mediaType,
                      title: rec.title,
                      posterPath: rec.posterPath,
                    })
                  }
                  className="w-24 sm:w-28 aspect-[2/3] rounded-2xl overflow-hidden bg-slate-800 flex-shrink-0 cursor-pointer relative shadow-md group"
                >
                  {rec.posterPath ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w342${rec.posterPath}`}
                      alt={rec.title}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-300"
                      sizes="112px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <Film className="w-6 h-6" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[10px] font-bold">
                    Öffnen
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* User & Rating Header */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-black font-extrabold text-xs">
                          {rec.userName.slice(0, 1)}
                        </div>
                        <div>
                          <span className="text-sm font-bold text-white">{rec.userName}</span>
                          <span className="text-[11px] text-slate-500 ml-2">
                            {new Date(rec.createdAt).toLocaleDateString("de-DE")}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-extrabold text-sm">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{rec.rating}/10</span>
                      </div>
                    </div>

                    {/* Movie Title */}
                    <div
                      onClick={() =>
                        openMediaModal({
                          id: rec.tmdbId,
                          mediaType: rec.mediaType,
                          title: rec.title,
                          posterPath: rec.posterPath,
                        })
                      }
                      className="cursor-pointer group inline-block"
                    >
                      <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition flex items-center gap-2">
                        {rec.title}
                        <span className="text-xs font-normal text-slate-400">
                          ({rec.releaseYear || "–"})
                        </span>
                      </h3>
                    </div>

                    {/* Comment */}
                    <p className="text-sm text-slate-300 leading-relaxed mt-2 italic">
                      &quot;{rec.comment}&quot;
                    </p>

                    {/* Tags */}
                    {rec.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {rec.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-0.5 rounded-lg text-xs bg-slate-800 text-slate-300 border border-slate-700/80"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions (Upvote + Check Streaming Button) */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() =>
                        openMediaModal({
                          id: rec.tmdbId,
                          mediaType: rec.mediaType,
                          title: rec.title,
                          posterPath: rec.posterPath,
                        })
                      }
                      className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition"
                    >
                      <Globe2 className="w-3.5 h-3.5" />
                      <span>Wo streamen? (VPN prüfen)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => upvoteRecommendation(rec.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                        isUpvoted
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          : "bg-slate-800/60 text-slate-400 hover:text-white"
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Hilfreich ({rec.upvoterIds.length})</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 text-slate-400 space-y-4">
          <MessageSquare className="w-10 h-10 text-slate-600 mx-auto" />
          <div>
            <h3 className="text-lg font-bold text-white">Noch keine Empfehlungen vorhanden</h3>
            <p className="text-xs text-slate-500 mt-1">
              Suche nach deinem Lieblingsfilm und teile ihn mit deinen Freunden!
            </p>
          </div>
          <button
            onClick={openSearch}
            className="px-5 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs"
          >
            Film suchen & empfehlen
          </button>
        </div>
      )}
    </div>
  );
}
