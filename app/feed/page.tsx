"use client";

import React, { useState, useMemo } from "react";
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
  User,
  Users,
} from "lucide-react";

export default function FeedPage() {
  const { data: session } = useSession();
  const { communityData, upvoteRecommendation, openMediaModal, openSearch } = useMedia();

  const [filterType, setFilterType] = useState<"ALL" | "movie" | "tv">("ALL");
  const [authorFilter, setAuthorFilter] = useState<"ALL" | "FRIENDS" | "MINE">("ALL");
  const [selectedTag, setSelectedTag] = useState<string>("ALL");

  const myUserId = (session?.user as any)?.id || "user_lukas";
  const myName = session?.user?.name;

  const movieCount = communityData.recommendations.filter((r) => r.mediaType === "movie").length;
  const tvCount = communityData.recommendations.filter((r) => r.mediaType === "tv").length;

  const myRecCount = communityData.recommendations.filter(
    (r) => r.userId === myUserId || (myName && r.userName === myName)
  ).length;

  const friendsRecCount = communityData.recommendations.length - myRecCount;

  const GENRE_TAGS = [
    { key: "ALL", label: "Alle Genres & Tags" },
    { key: "Action", label: "💥 Action" },
    { key: "Comedy", label: "😂 Comedy" },
    { key: "Horror", label: "🩸 Horror" },
    { key: "Drama", label: "🎭 Drama" },
    { key: "Sci-Fi", label: "🚀 Sci-Fi" },
    { key: "Thriller", label: "😱 Thriller" },
    { key: "Mindfuck", label: "🤯 Mindfuck" },
    { key: "Muss", label: "🔥 Must-Watch" },
    { key: "Oscar", label: "🏆 Oscar" },
  ];

  const filteredRecommendations = useMemo(() => {
    return communityData.recommendations.filter((rec) => {
      // 1. Media Type Filter (Film vs Serie)
      if (filterType !== "ALL" && rec.mediaType !== filterType) {
        return false;
      }

      // 2. Author Filter (Alle / Nur Freunde / Meine Empfehlungen)
      const isMine = rec.userId === myUserId || (myName && rec.userName === myName);
      if (authorFilter === "MINE" && !isMine) return false;
      if (authorFilter === "FRIENDS" && isMine) return false;

      // 3. Genre / Tag Filter
      if (selectedTag !== "ALL") {
        const query = selectedTag.toLowerCase();
        const hasTag = rec.tags.some((t) => t.toLowerCase().includes(query));
        const inComment = rec.comment.toLowerCase().includes(query);
        if (!hasTag && !inComment) return false;
      }

      return true;
    });
  }, [communityData.recommendations, filterType, authorFilter, selectedTag, myUserId, myName]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header with prominent Top-Right Switcher */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-rose-950/40 via-slate-900 to-[#0e1320] border border-rose-500/20 shadow-xl">
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

        {/* Top-Right Segmented Switcher & Action */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Segmented Switcher Filme vs Serien */}
          <div className="p-1 rounded-2xl bg-black/60 border border-slate-700/80 backdrop-blur-md flex items-center justify-center shadow-lg">
            <button
              onClick={() => setFilterType("movie")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                filterType === "movie"
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Filme</span>
              <span className="text-[10px] font-mono opacity-80">({movieCount})</span>
            </button>

            <button
              onClick={() => setFilterType("tv")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                filterType === "tv"
                  ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Serien</span>
              <span className="text-[10px] font-mono opacity-80">({tvCount})</span>
            </button>

            <button
              onClick={() => setFilterType("ALL")}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                filterType === "ALL"
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Alle</span>
              <span className="text-[10px] font-mono opacity-80 ml-1">
                ({communityData.recommendations.length})
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={openSearch}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-black font-bold text-xs transition shadow-lg shadow-rose-500/20 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Titel empfehlen</span>
          </button>
        </div>
      </div>

      {/* Filter Bar: Author Switcher & Genre Tags */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        {/* Author Switcher (Alle vs Freunde vs Eigene) */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Ansicht:
            </span>
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
              <button
                onClick={() => setAuthorFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  authorFilter === "ALL"
                    ? "bg-slate-800 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Alle ({communityData.recommendations.length})
              </button>

              <button
                onClick={() => setAuthorFilter("FRIENDS")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  authorFilter === "FRIENDS"
                    ? "bg-rose-500 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Von Freunden ({friendsRecCount})</span>
              </button>

              <button
                onClick={() => setAuthorFilter("MINE")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  authorFilter === "MINE"
                    ? "bg-amber-500 text-black shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Meine Empfehlungen ({myRecCount})</span>
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            {filteredRecommendations.length}{" "}
            {filteredRecommendations.length === 1 ? "Empfehlung" : "Empfehlungen"} gefunden
          </div>
        </div>

        {/* Genre & Tag Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-2 border-t border-slate-800/60">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mr-1 flex-shrink-0">
            Genre / Typ:
          </span>
          {GENRE_TAGS.map((tag) => (
            <button
              key={tag.key}
              onClick={() => setSelectedTag(tag.key)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedTag === tag.key
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold"
                  : "bg-slate-950/60 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feed List */}
      {filteredRecommendations.length > 0 ? (
        <div className="space-y-6">
          {filteredRecommendations.map((rec) => {
            const isUpvoted = rec.upvoterIds.includes(myUserId);
            const isMyOwn = rec.userId === myUserId || (myName && rec.userName === myName);
            return (
              <div
                key={rec.id}
                className={`p-5 sm:p-6 rounded-3xl border transition shadow-lg flex flex-col sm:flex-row gap-5 ${
                  isMyOwn
                    ? "bg-gradient-to-br from-slate-900/90 to-[#121828] border-amber-500/30"
                    : "bg-slate-900/70 border-slate-800 hover:border-slate-700"
                }`}
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
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-black font-extrabold text-xs shadow ${
                            isMyOwn
                              ? "bg-amber-400"
                              : "bg-gradient-to-tr from-amber-500 to-rose-500"
                          }`}
                        >
                          {rec.userName.slice(0, 1)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{rec.userName}</span>
                            {isMyOwn && (
                              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold border border-amber-500/30">
                                Du
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500">
                            {new Date(rec.createdAt).toLocaleDateString("de-DE")}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-extrabold text-sm">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{rec.rating}/10</span>
                      </div>
                    </div>

                    {/* Movie/TV Title */}
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
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {rec.mediaType === "tv" ? "Serie" : "Film"}
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
                      <span>Wo streamen? (DE & VPN prüfen)</span>
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
            <h3 className="text-lg font-bold text-white">Keine Empfehlungen in dieser Ansicht</h3>
            <p className="text-xs text-slate-500 mt-1">
              {authorFilter === "MINE"
                ? "Du hast noch keine eigenen Empfehlungen verfasst. Klicke auf 'Titel empfehlen', um deinen Freunden einen Tipp zu geben!"
                : "Keine Empfehlungen für die gewählten Filter gefunden."}
            </p>
          </div>
          <button
            onClick={openSearch}
            className="px-5 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs"
          >
            Titel suchen & empfehlen
          </button>
        </div>
      )}
    </div>
  );
}
