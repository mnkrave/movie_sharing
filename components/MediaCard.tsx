"use client";

import React from "react";
import { MediaItem } from "@/lib/tmdb";
import { useMedia } from "./MediaContext";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Star, Award, Film, Tv, Check, Plus, Sparkles } from "lucide-react";

interface MediaCardProps {
  item: MediaItem;
  priority?: boolean;
}

export function MediaCard({ item, priority = false }: MediaCardProps) {
  const { openMediaModal, communityData, updateMediaStatus, openRatingModal } = useMedia();
  const { data: session } = useSession();

  const myUserId = (session?.user as any)?.id;
  const myName = session?.user?.name;
  const myEmail = session?.user?.email?.toLowerCase();

  const isMe = (userId?: string | null, userName?: string | null, userEmail?: string | null) => {
    if (myUserId && userId && userId === myUserId) return true;
    if (myName && userName && userName.toLowerCase() === myName.toLowerCase()) return true;
    if (myEmail && userEmail && userEmail.toLowerCase() === myEmail) return true;
    return false;
  };

  // Watched: Me vs Friends
  const allWatched = communityData.mediaStatuses.filter(
    (m) => m.tmdbId === item.id && m.mediaType === item.mediaType && m.status === "WATCHED"
  );
  const myWatched = allWatched.find((m) => isMe(m.userId, m.userName, (m as any).userEmail));
  const otherFriendsWatched = allWatched.filter(
    (m) => !isMe(m.userId, m.userName, (m as any).userEmail)
  );

  // Recommendations: Me vs Friends
  const allRecs = communityData.recommendations.filter(
    (r) => r.tmdbId === item.id && r.mediaType === item.mediaType
  );
  const myRec = allRecs.find((r) => isMe(r.userId, r.userName, (r as any).userEmail));
  const otherFriendsRecs = allRecs.filter(
    (r) => !isMe(r.userId, r.userName, (r as any).userEmail)
  );

  const myStatusObj = communityData.mediaStatuses.find(
    (m) =>
      m.tmdbId === item.id &&
      m.mediaType === item.mediaType &&
      isMe(m.userId, m.userName, (m as any).userEmail)
  );

  const handleQuickWatchlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session) {
      alert("Bitte logge dich ein, um deine Liste zu speichern!");
      return;
    }
    updateMediaStatus({
      tmdbId: item.id,
      mediaType: item.mediaType,
      title: item.title,
      posterPath: item.posterPath,
      releaseYear: item.releaseYear,
      status: myStatusObj?.status === "WATCHLIST" ? "NONE" : "WATCHLIST",
    });
  };

  const handleQuickWatched = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session) {
      alert("Bitte logge dich ein, um deine Liste zu speichern!");
      return;
    }
    openRatingModal({
      tmdbId: item.id,
      mediaType: item.mediaType,
      title: item.title,
      posterPath: item.posterPath,
      releaseYear: item.releaseYear,
      currentRating: myStatusObj?.rating,
      isWatched: myStatusObj?.status === "WATCHED",
    });
  };

  return (
    <div
      onClick={() => openMediaModal(item)}
      className="group relative cursor-pointer flex flex-col transition duration-300 hover:-translate-y-1.5 focus:outline-none"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openMediaModal(item);
        }
      }}
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800/80 shadow-md group-hover:shadow-2xl group-hover:border-amber-500/40 transition duration-300">
        {item.posterPath ? (
          <Image
            src={`https://image.tmdb.org/t/p/w500${item.posterPath}`}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
            priority={priority}
            className="object-cover group-hover:scale-105 transition duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-slate-600 bg-slate-900">
            {item.mediaType === "tv" ? <Tv className="w-8 h-8 mb-2" /> : <Film className="w-8 h-8 mb-2" />}
            <span className="text-xs">{item.title}</span>
          </div>
        )}

        {/* Gradient shadow overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition" />

        {/* Top Badges (Rank, Oscar, Friend recommendation) */}
        <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-1 pointer-events-none">
          <div className="flex flex-col gap-1 items-start">
            {item.rank && (
              <span className="px-2 py-0.5 rounded-lg bg-black/75 backdrop-blur-md text-[11px] font-black text-white border border-white/10 shadow">
                #{item.rank}
              </span>
            )}
            {item.oscarInfo && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/90 text-black text-[11px] font-extrabold shadow-lg">
                <Award className="w-3 h-3 fill-black" />
                <span>{item.oscarInfo.oscarsWon} Oscars</span>
              </span>
            )}
          </div>

          {/* TMDB / IMDb Rating */}
          {item.voteAverage > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md text-amber-400 font-extrabold text-xs border border-white/10 shadow">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>{item.voteAverage}</span>
            </span>
          )}
        </div>

        {/* Friend Badges on bottom of poster */}
        <div className="absolute bottom-2 left-2 right-2 flex flex-col gap-1 pointer-events-none">
          {/* Recommendation Badge */}
          {(myRec || otherFriendsRecs.length > 0) && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-600/90 text-white text-[11px] font-bold backdrop-blur-md shadow truncate">
              <Sparkles className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">
                {myRec && otherFriendsRecs.length === 0
                  ? "Von dir empfohlen"
                  : myRec && otherFriendsRecs.length > 0
                  ? `Von dir & ${otherFriendsRecs[0].userName} empfohlen`
                  : otherFriendsRecs.length === 1
                  ? `Tipp von ${otherFriendsRecs[0].userName}`
                  : `Tipp von ${otherFriendsRecs[0].userName} (+${otherFriendsRecs.length - 1})`}
              </span>
            </span>
          )}

          {/* Watched Badge */}
          {(myWatched || otherFriendsWatched.length > 0) && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600/90 text-white text-[10px] font-semibold backdrop-blur-md shadow truncate">
              <Check className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">
                {myWatched && otherFriendsWatched.length === 0
                  ? "Gesehen"
                  : myWatched && otherFriendsWatched.length > 0
                  ? `Gesehen (+ ${otherFriendsWatched.length} ${
                      otherFriendsWatched.length === 1 ? "Freund" : "Freunde"
                    })`
                  : otherFriendsWatched.length === 1
                  ? `${otherFriendsWatched[0].userName} hat ihn gesehen`
                  : `${otherFriendsWatched.length} Freunde haben ihn gesehen`}
              </span>
            </span>
          )}
        </div>

        {/* Quick action buttons (Hover overlay) */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleQuickWatchlist}
            title={
              myStatusObj?.status === "WATCHLIST"
                ? "Auf Merkliste (klicken zum Entfernen)"
                : "Auf Merkliste setzen"
            }
            className={`p-3 rounded-full transition-all duration-200 shadow-lg ${
              myStatusObj?.status === "WATCHLIST"
                ? "bg-emerald-500 text-black hover:bg-emerald-400 scale-110 shadow-emerald-500/30 ring-2 ring-emerald-400/50"
                : "bg-slate-800/90 text-white hover:bg-slate-700 hover:scale-110"
            }`}
          >
            {myStatusObj?.status === "WATCHLIST" ? (
              <Check className="w-5 h-5 stroke-[2.5]" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
          </button>

          <button
            type="button"
            onClick={handleQuickWatched}
            title={
              myStatusObj?.status === "WATCHED"
                ? "Gesehen zurücknehmen"
                : "Als gesehen markieren"
            }
            className={`p-3 rounded-full transition-all duration-200 shadow-lg ${
              myStatusObj?.status === "WATCHED"
                ? "bg-emerald-500 text-black hover:bg-emerald-400 scale-110 shadow-emerald-500/30 ring-2 ring-emerald-400/50"
                : "bg-slate-800/90 text-white hover:bg-slate-700 hover:scale-110"
            }`}
          >
            <Check className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Title & Metadata */}
      <div className="mt-2.5 px-0.5">
        <h3 className="text-sm font-semibold text-white truncate group-hover:text-amber-400 transition">
          {item.title}
        </h3>
        <div className="flex items-center justify-between mt-0.5 text-xs text-slate-400">
          <span>{item.releaseYear || "–"}</span>
          <span className="uppercase text-[10px] tracking-wider text-slate-500 font-mono">
            {item.mediaType === "tv" ? "Serie" : "Film"}
          </span>
        </div>
      </div>
    </div>
  );
}
