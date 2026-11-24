"use client";

import React from "react";
import { MediaItem, formatGermanReleaseDate } from "@/lib/tmdb";
import { formatWatchedSeasons } from "@/lib/seasons";
import { useMedia } from "./MediaContext";
import { useSession } from "next-auth/react";
import Image from "next/image";
import {
  Star,
  Award,
  Film,
  Tv,
  Check,
  Plus,
  Sparkles,
  BookmarkPlus,
  BookmarkCheck,
  Eye,
} from "lucide-react";

const getFirstName = (name?: string | null) => {
  const trimmed = name?.trim();
  return trimmed ? trimmed.split(/\s+/)[0] : "Freund";
};

interface MediaCardProps {
  item: MediaItem;
  priority?: boolean;
}

export function MediaCard({ item, priority = false }: MediaCardProps) {
  const { openMediaModal, communityData, updateMediaStatus, openRatingModal, showToast } = useMedia();
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

  // Watched & Watching (TV only): Me vs Friends
  const allWatched = communityData.mediaStatuses.filter(
    (m) => m.tmdbId === item.id && m.mediaType === item.mediaType && m.status === "WATCHED"
  );
  const myWatched = allWatched.find((m) => isMe(m.userId, m.userName, (m as any).userEmail));
  const otherFriendsWatched = allWatched.filter(
    (m) => !isMe(m.userId, m.userName, (m as any).userEmail)
  );

  const allWatching =
    item.mediaType === "tv"
      ? communityData.mediaStatuses.filter(
          (m) => m.tmdbId === item.id && m.mediaType === "tv" && m.status === "WATCHING"
        )
      : [];
  const myWatching = allWatching.find((m) => isMe(m.userId, m.userName, (m as any).userEmail));
  const otherFriendsWatching = allWatching.filter(
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
      showToast("Bitte logge dich ein, um deine Liste zu speichern!", {
        type: "info",
        actionLabel: "Einloggen",
        actionHref: "/login",
      });
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
      showToast("Bitte logge dich ein, um deine Liste zu speichern!", {
        type: "info",
        actionLabel: "Einloggen",
        actionHref: "/login",
      });
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
      currentStatus: myStatusObj?.status,
      watchedSeasons: myStatusObj?.watchedSeasons,
      totalSeasons: myStatusObj?.totalSeasons,
    });
  };

  return (
    <div
      onClick={() => openMediaModal(item)}
      className="group relative cursor-pointer flex flex-col h-full transition duration-300 [@media(hover:hover)]:hover:-translate-y-1.5 active:opacity-95 focus:outline-none"
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

          {/* TMDB / IMDb Rating or Upcoming Badge */}
          {item.isUpcoming ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[10px] shadow-lg">
              <Sparkles className="w-3 h-3 fill-slate-950" />
              <span>{item.releaseDate ? formatGermanReleaseDate(item.releaseDate) : "Upcoming"}</span>
            </span>
          ) : item.voteAverage > 0 ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md text-amber-400 font-extrabold text-xs border border-white/10 shadow">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>{item.voteAverage}</span>
            </span>
          ) : null}
        </div>

        {/* Friend Badges on bottom of poster (on narrow mobile < sm show only the highest-priority badge to keep posters legible) */}
        <div className="absolute bottom-2 left-2 right-2 flex flex-col gap-1 pointer-events-none">
          {/* Recommendation Badge */}
          {(myRec || otherFriendsRecs.length > 0) && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-600/90 text-white text-[11px] font-bold backdrop-blur-md shadow truncate">
              <Sparkles className="w-3 h-3 flex-shrink-0" />
              <span className="truncate sm:hidden">
                {myRec && otherFriendsRecs.length === 0
                  ? "Dein Tipp"
                  : myRec && otherFriendsRecs.length > 0
                  ? `Du & ${getFirstName(otherFriendsRecs[0].userName)}`
                  : otherFriendsRecs.length === 1
                  ? `Tipp: ${getFirstName(otherFriendsRecs[0].userName)}`
                  : `Tipp: ${getFirstName(otherFriendsRecs[0].userName)} +${otherFriendsRecs.length - 1}`}
              </span>
              <span className="truncate hidden sm:inline">
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

          {/* Currently Watching Badge (TV only) */}
          {(myWatching || otherFriendsWatching.length > 0) && (
            <span
              className={`${
                myRec || otherFriendsRecs.length > 0 ? "hidden sm:flex" : "flex"
              } items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/90 text-black text-[10px] font-bold backdrop-blur-md shadow truncate`}
            >
              <Tv className="w-3 h-3 flex-shrink-0" />
              <span className="truncate sm:hidden">
                {myWatching
                  ? myWatching.watchedSeasons?.length
                    ? formatWatchedSeasons(myWatching.watchedSeasons, myWatching.totalSeasons)
                    : "Schaue ich"
                  : otherFriendsWatching.length === 1
                  ? getFirstName(otherFriendsWatching[0].userName)
                  : `${otherFriendsWatching.length} Freunde`}
              </span>
              <span className="truncate hidden sm:inline">
                {myWatching
                  ? `Schaue ich${myWatching.watchedSeasons?.length ? ` (${formatWatchedSeasons(myWatching.watchedSeasons, myWatching.totalSeasons)})` : ""}`
                  : otherFriendsWatching.length === 1
                  ? `${otherFriendsWatching[0].userName} schaut gerade`
                  : `${otherFriendsWatching.length} Freunde schauen gerade`}
              </span>
            </span>
          )}

          {/* Watched Badge */}
          {(myWatched || otherFriendsWatched.length > 0) && (
            <span
              className={`${
                myRec || otherFriendsRecs.length > 0 || myWatching || otherFriendsWatching.length > 0
                  ? "hidden sm:flex"
                  : "flex"
              } items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600/90 text-white text-[10px] font-semibold backdrop-blur-md shadow truncate`}
            >
              <Check className="w-3 h-3 flex-shrink-0" />
              <span className="truncate sm:hidden">
                {myWatched && otherFriendsWatched.length === 0
                  ? item.mediaType === "tv" && myStatusObj?.watchedSeasons && myStatusObj.totalSeasons && myStatusObj.watchedSeasons.length < myStatusObj.totalSeasons
                    ? formatWatchedSeasons(myStatusObj.watchedSeasons, myStatusObj.totalSeasons)
                    : "Gesehen"
                  : myWatched && otherFriendsWatched.length > 0
                  ? `Du +${otherFriendsWatched.length}`
                  : otherFriendsWatched.length === 1
                  ? getFirstName(otherFriendsWatched[0].userName)
                  : `${otherFriendsWatched.length} Freunde`}
              </span>
              <span className="truncate hidden sm:inline">
                {myWatched && otherFriendsWatched.length === 0
                  ? item.mediaType === "tv" && myStatusObj?.watchedSeasons && myStatusObj.totalSeasons && myStatusObj.watchedSeasons.length < myStatusObj.totalSeasons
                    ? `Gesehen (${formatWatchedSeasons(myStatusObj.watchedSeasons, myStatusObj.totalSeasons)})`
                    : "Gesehen"
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

        {/* Quick action buttons (Hover overlay on pointer devices; avoids iOS double-tap quirk on touch) */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden [@media(hover:hover)]:flex items-center justify-center gap-3">
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
              myStatusObj?.status === "WATCHING"
                ? "Aktuell am Schauen (Staffeln / Bewertung anpassen)"
                : myStatusObj?.status === "WATCHED"
                ? "Gesehen zurücknehmen"
                : "Als gesehen markieren"
            }
            className={`p-3 rounded-full transition-all duration-200 shadow-lg ${
              myStatusObj?.status === "WATCHING"
                ? "bg-cyan-400 text-black hover:bg-cyan-300 scale-110 shadow-cyan-500/30 ring-2 ring-cyan-300/50"
                : myStatusObj?.status === "WATCHED"
                ? "bg-emerald-500 text-black hover:bg-emerald-400 scale-110 shadow-emerald-500/30 ring-2 ring-emerald-400/50"
                : "bg-slate-800/90 text-white hover:bg-slate-700 hover:scale-110"
            }`}
          >
            {myStatusObj?.status === "WATCHING" ? (
              <Tv className="w-5 h-5" />
            ) : (
              <Check className="w-5 h-5 stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>

      {/* Title & Metadata */}
      <div className="mt-2.5 px-0.5 flex-1 flex flex-col">
        <h3 className="text-sm font-semibold text-white truncate group-hover:text-amber-400 transition">
          {item.title}
        </h3>
        <div className="flex items-center justify-between mt-0.5 text-xs text-slate-400">
          <span className={item.isUpcoming ? "text-amber-300 font-semibold text-[11px]" : ""}>
            {item.isUpcoming
              ? item.releaseDate
                ? `Kinostart ${item.releaseDate.slice(0, 4)}`
                : "Upcoming"
              : item.releaseYear || "–"}
          </span>
          <span className="uppercase text-[10px] tracking-wider text-slate-500 font-mono">
            {item.mediaType === "tv" ? "Serie" : "Film"}
          </span>
        </div>

        {/* Touch-only quick action icons (keeps desktop hover cards clean while avoiding truncated labels on narrow phones) */}
        <div className="flex [@media(hover:hover)]:hidden items-center gap-2 mt-auto pt-2.5">
          <button
            type="button"
            onClick={handleQuickWatchlist}
            title={
              myStatusObj?.status === "WATCHLIST"
                ? "Von Merkliste entfernen"
                : "Auf Merkliste setzen"
            }
            aria-label={
              myStatusObj?.status === "WATCHLIST"
                ? "Von Merkliste entfernen"
                : "Auf Merkliste setzen"
            }
            className={`flex-1 min-w-0 min-h-[44px] py-2 px-2 rounded-xl flex items-center justify-center transition active:scale-[0.97] ${
              myStatusObj?.status === "WATCHLIST"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-slate-900 text-slate-200 border border-slate-800 active:bg-slate-800"
            }`}
          >
            {myStatusObj?.status === "WATCHLIST" ? (
              <BookmarkCheck className="w-[18px] h-[18px]" />
            ) : (
              <BookmarkPlus className="w-[18px] h-[18px]" />
            )}
          </button>

          <button
            type="button"
            onClick={handleQuickWatched}
            title={
              myStatusObj?.status === "WATCHING" || myStatusObj?.status === "WATCHED"
                ? "Status oder Bewertung bearbeiten"
                : "Als gesehen markieren"
            }
            aria-label={
              myStatusObj?.status === "WATCHING" || myStatusObj?.status === "WATCHED"
                ? "Status oder Bewertung bearbeiten"
                : "Als gesehen markieren"
            }
            className={`flex-1 min-w-0 min-h-[44px] py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition active:scale-[0.97] ${
              myStatusObj?.status === "WATCHING"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : myStatusObj?.status === "WATCHED"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-slate-900 text-slate-200 border border-slate-800 active:bg-slate-800"
            }`}
          >
            {myStatusObj?.status === "WATCHING" ? (
              <Tv className="w-[18px] h-[18px]" />
            ) : myStatusObj?.status === "WATCHED" && myWatched?.rating ? (
              <>
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 flex-shrink-0" />
                <span className="tabular-nums">{myWatched.rating}</span>
              </>
            ) : myStatusObj?.status === "WATCHED" ? (
              <Check className="w-[18px] h-[18px] stroke-[2.5]" />
            ) : (
              <Eye className="w-[18px] h-[18px]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
