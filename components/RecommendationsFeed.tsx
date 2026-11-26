"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import {
  Check,
  Film,
  Globe2,
  MessageSquare,
  Pencil,
  Plus,
  RotateCcw,
  Sparkles,
  Star,
  ThumbsUp,
  Trash2,
  Tv,
  User,
  Users,
} from "lucide-react";
import { useMedia } from "@/components/MediaContext";
import { RecommendationThread } from "@/components/RecommendationThread";
import { MobileFilterBar } from "@/components/MobileFilterBar";
import { isCurrentUserMatch } from "@/lib/auth-match";
import { useBatchMediaMeta } from "@/lib/useBatchMediaMeta";
import type { AppRecommendation } from "@/lib/store";

type MediaTypeFilter = "ALL" | "movie" | "tv";
type AuthorFilter = "ALL" | "FRIENDS" | "TARGETED" | "MINE";

const GENRE_TAGS = [
  { key: "ALL", label: "Alle Genres & Tags" },
  { key: "Action", label: "💥 Action" },
  { key: "Abenteuer", label: "🗺️ Abenteuer" },
  { key: "Animation", label: "✨ Animation" },
  { key: "Comedy", label: "😂 Comedy / Komödie" },
  { key: "Krimi", label: "🕵️ Krimi" },
  { key: "Drama", label: "🎭 Drama" },
  { key: "Fantasy", label: "🧙‍♂️ Fantasy" },
  { key: "Horror", label: "🩸 Horror" },
  { key: "Sci-Fi", label: "🚀 Sci-Fi" },
  { key: "Thriller", label: "😱 Thriller" },
  { key: "Doku", label: "🎥 Doku" },
  { key: "Mindfuck", label: "🤯 Mindfuck" },
  { key: "Muss", label: "🔥 Must-Watch" },
  { key: "Oscar", label: "🏆 Oscar" },
] as const;

interface RecommendationsFeedProps {
  variant?: "full" | "compact";
  defaultOnlyStreamable?: boolean;
  onFindFriends?: () => void;
}

export function RecommendationsFeed({
  variant = "full",
  defaultOnlyStreamable = true,
  onFindFriends,
}: RecommendationsFeedProps) {
  const { data: session } = useSession();
  const {
    communityData,
    upvoteRecommendation,
    deleteRecommendation,
    openMediaModal,
    openSearch,
    userSubscriptions,
    currentUserAvatar,
    confirmDialog,
  } = useMedia();

  const [filterType, setFilterType] = useState<MediaTypeFilter>("ALL");
  const [authorFilter, setAuthorFilter] = useState<AuthorFilter>("FRIENDS");
  const [hideWatched, setHideWatched] = useState<boolean>(true);
  const [onlyStreamable, setOnlyStreamable] = useState<boolean>(defaultOnlyStreamable);
  const [selectedTag, setSelectedTag] = useState<string>("ALL");
  const [openThreadIds, setOpenThreadIds] = useState<Set<string>>(new Set());

  const { metaMap } = useBatchMediaMeta(communityData.recommendations);

  const myUserId = (session?.user as any)?.id as string | undefined;
  const myName = session?.user?.name;
  const myEmail = session?.user?.email?.toLowerCase();

  const isMe = (userId?: string | null, userName?: string | null, userEmail?: string | null) =>
    isCurrentUserMatch(
      { userId: myUserId, name: myName, email: myEmail },
      { userId, userName, userEmail }
    );

  const hasMyWatched = (tmdbId: number, mediaType: "movie" | "tv") =>
    communityData.mediaStatuses.some(
      (m) =>
        m.tmdbId === tmdbId &&
        m.mediaType === mediaType &&
        m.status === "WATCHED" &&
        isMe(m.userId, m.userName, (m as any).userEmail)
    );

  const isStreamableOnMySubs = (tmdbId: number, mediaType: "movie" | "tv") => {
    const meta = metaMap[`${mediaType}_${tmdbId}`];
    // If metadata not yet fetched from TMDB, don't hide prematurely
    if (!meta) return true;
    if (!meta.providersDE || meta.providersDE.length === 0) return false;
    if (userSubscriptions.length === 0) return meta.hasFlatrateDE ?? false;
    return userSubscriptions.some((sub) => meta.providersDE?.includes(sub));
  };

  const toggleThread = (recId: string) => {
    setOpenThreadIds((prev) => {
      const next = new Set(prev);
      if (next.has(recId)) next.delete(recId);
      else next.add(recId);
      return next;
    });
  };

  const handleDeleteRec = async (rec: AppRecommendation) => {
    const confirmed = await confirmDialog({
      title: "Empfehlung entfernen?",
      message: `Möchtest du deine Empfehlung für „${rec.title}“ wirklich entfernen?`,
      confirmLabel: "Entfernen",
      dangerous: true,
    });
    if (confirmed) deleteRecommendation(rec.id);
  };

  const movieCount = communityData.recommendations.filter((r) => r.mediaType === "movie").length;
  const tvCount = communityData.recommendations.filter((r) => r.mediaType === "tv").length;
  const myRecCount = communityData.recommendations.filter((r) =>
    isMe(r.userId, r.userName, (r as any).userEmail)
  ).length;
  const friendsRecCount = communityData.recommendations.length - myRecCount;
  const targetedToMeCount = communityData.recommendations.filter((r) => {
    if (isMe(r.userId, r.userName, (r as any).userEmail)) return false;
    return (
      r.targetType !== "ALL" &&
      ((r.targetNames && r.targetNames.length > 0) ||
        (r.targetGroupIds && r.targetGroupIds.length > 0))
    );
  }).length;

  const filteredRecommendations = useMemo(() => {
    return communityData.recommendations.filter((rec) => {
      if (filterType !== "ALL" && rec.mediaType !== filterType) return false;

      const isMine = isMe(rec.userId, rec.userName, (rec as any).userEmail);
      if (authorFilter === "MINE" && !isMine) return false;
      if (authorFilter === "FRIENDS" && isMine) return false;
      if (authorFilter === "TARGETED") {
        if (isMine) return false;
        const hasTarget =
          rec.targetType !== "ALL" &&
          ((rec.targetNames && rec.targetNames.length > 0) ||
            (rec.targetGroupIds && rec.targetGroupIds.length > 0));
        if (!hasTarget) return false;
      }

      if (hideWatched && hasMyWatched(rec.tmdbId, rec.mediaType)) return false;
      if (onlyStreamable && !isStreamableOnMySubs(rec.tmdbId, rec.mediaType)) return false;

      if (variant === "full" && selectedTag !== "ALL") {
        const query = selectedTag.toLowerCase();
        const hasTag = rec.tags.some((t) => t.toLowerCase().includes(query));
        const inComment = rec.comment ? rec.comment.toLowerCase().includes(query) : false;
        if (!hasTag && !inComment) return false;
      }

      return true;
    });
  }, [
    communityData.recommendations,
    communityData.mediaStatuses,
    filterType,
    authorFilter,
    hideWatched,
    onlyStreamable,
    selectedTag,
    variant,
    myUserId,
    myName,
    myEmail,
    metaMap,
    userSubscriptions,
  ]);

  const resetFilters = () => {
    setFilterType("ALL");
    setAuthorFilter("ALL");
    setHideWatched(false);
    setOnlyStreamable(false);
    setSelectedTag("ALL");
  };

  const openMedia = (rec: AppRecommendation) =>
    openMediaModal({
      id: rec.tmdbId,
      mediaType: rec.mediaType,
      title: rec.title,
      posterPath: rec.posterPath,
    });

  if (variant === "compact") {
    const hasActiveCompactFilter =
      hideWatched || onlyStreamable || authorFilter !== "ALL" || filterType !== "ALL";

    return (
      <section className="space-y-4 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            Was dein Filmkreis empfiehlt
          </h2>
          <button
            type="button"
            onClick={() => openSearch()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold transition self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Titel empfehlen</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-card border border-border text-xs">
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-muted border border-border">
            {(
              [
                { key: "FRIENDS", label: "Freunde" },
                { key: "TARGETED", label: "An mich" },
                { key: "MINE", label: "Meine" },
                { key: "ALL", label: "Alle" },
              ] as const
            ).map((a) => (
              <button
                key={a.key}
                type="button"
                onClick={() => setAuthorFilter(a.key)}
                className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                  authorFilter === a.key
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-muted border border-border">
            {(
              [
                { key: "ALL", label: "Alle" },
                { key: "movie", label: "Filme" },
                { key: "tv", label: "Serien" },
              ] as const
            ).map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilterType(f.key)}
                className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                  filterType === f.key
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setHideWatched((p) => !p)}
            className={`px-2.5 py-1.5 rounded-lg font-semibold border transition cursor-pointer ${
              hideWatched
                ? "bg-primary-soft border-primary/35 text-primary-text"
                : "bg-background border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Ungesehen
          </button>

          <button
            type="button"
            onClick={() => setOnlyStreamable((p) => !p)}
            className={`px-2.5 py-1.5 rounded-lg font-semibold border transition cursor-pointer ${
              onlyStreamable
                ? "bg-primary-soft border-primary/35 text-primary-text"
                : "bg-background border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Im Abo
          </button>
        </div>

        {filteredRecommendations.length === 0 ? (
          <div className="p-10 rounded-2xl bg-card border border-dashed border-border text-center space-y-3">
            <Sparkles className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="text-sm font-bold text-foreground">
              Noch keine passenden Empfehlungen im Feed
            </p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Passe die Filter oben an oder lade Freunde in deinen Filmkreis ein.
            </p>
            <div className="flex flex-wrap justify-center gap-2 pt-1">
              {hasActiveCompactFilter && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-3.5 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold border border-border cursor-pointer"
                >
                  Alle Filter zurücksetzen
                </button>
              )}
              {onFindFriends && (
                <button
                  type="button"
                  onClick={onFindFriends}
                  className="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold cursor-pointer"
                >
                  Freunde finden
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRecommendations.map((rec) => {
              const isMyOwn = isMe(rec.userId, rec.userName, (rec as any).userEmail);
              const isUpvoted = rec.upvoterIds.includes(myUserId || "");
              const itemMeta = metaMap[`${rec.mediaType}_${rec.tmdbId}`];

              return (
                <article
                  key={rec.id}
                  className="p-4 rounded-2xl bg-card border border-border hover:border-border-strong transition space-y-3 shadow-xs"
                >
                  <div className="flex items-start gap-3.5">
                    <button
                      type="button"
                      onClick={() => openMedia(rec)}
                      className="relative w-14 h-20 rounded-lg overflow-hidden bg-muted border border-border flex-shrink-0 cursor-pointer"
                    >
                      {rec.posterPath ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w185${rec.posterPath}`}
                          alt={rec.title}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Film className="w-5 h-5" />
                        </div>
                      )}
                    </button>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 text-xs">
                          <Link
                            href={
                              isMyOwn
                                ? "/profile"
                                : `/friends/${encodeURIComponent(rec.userId || rec.userName)}`
                            }
                            className="font-bold text-foreground hover:text-primary-text transition truncate"
                          >
                            {rec.userName}
                          </Link>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-muted-foreground">
                            {new Date(rec.createdAt).toLocaleDateString("de-DE")}
                          </span>
                          {rec.targetNames && rec.targetNames.length > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-primary-soft text-primary-text text-[10px] font-semibold">
                              Für {rec.targetNames.join(", ")}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="px-2 py-0.5 rounded-md bg-primary-soft text-primary-text font-bold text-xs">
                            {rec.rating}/10
                          </span>
                          <button
                            type="button"
                            onClick={() => openMedia(rec)}
                            className="px-2.5 py-1 rounded-lg hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition cursor-pointer"
                          >
                            Mehr
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => openMedia(rec)}
                        className="text-left text-sm sm:text-base font-bold text-foreground hover:text-primary-text transition block"
                      >
                        {rec.title}{" "}
                        {rec.releaseYear && (
                          <span className="text-xs font-normal text-muted-foreground">
                            ({rec.releaseYear})
                          </span>
                        )}
                      </button>

                      {rec.comment && (
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          „{rec.comment}“
                        </p>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {itemMeta?.providerLogosDE?.slice(0, 3).map((p) => {
                            const inMySubs = userSubscriptions.includes(p.key);
                            return (
                              <span
                                key={p.key}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                                  inMySubs
                                    ? "bg-primary-soft border-primary/35 text-primary-text"
                                    : "bg-muted border-border text-muted-foreground"
                                }`}
                              >
                                <span>{p.name}</span>
                              </span>
                            );
                          })}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => toggleThread(rec.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted hover:bg-muted/80 text-xs font-medium text-muted-foreground hover:text-foreground transition cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{rec.replies?.length || 0}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => upvoteRecommendation(rec.id)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                              isUpvoted
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>{rec.upvoterIds.length}</span>
                          </button>

                          {isMyOwn && (
                            <button
                              type="button"
                              onClick={() => handleDeleteRec(rec)}
                              aria-label="Empfehlung entfernen"
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {openThreadIds.has(rec.id) && (
                    <div className="pt-2 border-t border-border">
                      <RecommendationThread
                        recommendationId={rec.id}
                        recAuthorName={rec.userName}
                        recAuthorId={rec.userId}
                        replies={rec.replies}
                        onClose={() => toggleThread(rec.id)}
                      />
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    );
  }

  const feedActiveFilters =
    (filterType !== "ALL" ? 1 : 0) +
    (authorFilter !== "ALL" ? 1 : 0) +
    (hideWatched ? 1 : 0) +
    (onlyStreamable ? 1 : 0) +
    (selectedTag !== "ALL" ? 1 : 0);

  const feedSummaryParts = [
    authorFilter === "FRIENDS"
      ? "Von Freunden"
      : authorFilter === "TARGETED"
      ? "An mich"
      : authorFilter === "MINE"
      ? "Meine"
      : "Alle",
    hideWatched ? "Ungesehen" : null,
    onlyStreamable ? "Im Abo" : null,
    selectedTag !== "ALL" ? selectedTag : null,
  ].filter(Boolean);

  return (
    <>
      <MobileFilterBar
        summary={feedSummaryParts.join(" · ")}
        activeCount={feedActiveFilters}
        resultLabel={`${filteredRecommendations.length} Tipps`}
        onReset={resetFilters}
      >
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3.5">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full sm:w-auto min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 w-full sm:w-auto min-w-0">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">
                  Format:
                </span>
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 overflow-x-auto scrollbar-none max-w-full">
                  <button
                    type="button"
                    onClick={() => setFilterType("ALL")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex-shrink-0 ${
                      filterType === "ALL"
                        ? "bg-rose-500 text-white shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Alle ({communityData.recommendations.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType("movie")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex-shrink-0 ${
                      filterType === "movie"
                        ? "bg-amber-500 text-black shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Filme ({movieCount})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType("tv")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex-shrink-0 ${
                      filterType === "tv"
                        ? "bg-cyan-500 text-black shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Tv className="w-3.5 h-3.5" />
                    <span>Serien ({tvCount})</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 w-full sm:w-auto min-w-0">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">
                  Ansicht:
                </span>
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 overflow-x-auto scrollbar-none max-w-full">
                  <button
                    type="button"
                    onClick={() => setAuthorFilter("FRIENDS")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex-shrink-0 ${
                      authorFilter === "FRIENDS"
                        ? "bg-rose-500 text-white shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Von Freunden ({friendsRecCount})</span>
                  </button>

                  {targetedToMeCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setAuthorFilter("TARGETED")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex-shrink-0 ${
                        authorFilter === "TARGETED"
                          ? "bg-purple-500 text-black shadow font-extrabold"
                          : "text-purple-300 hover:text-white"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>An mich & Gruppen ({targetedToMeCount})</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setAuthorFilter("ALL")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex-shrink-0 ${
                      authorFilter === "ALL"
                        ? "bg-slate-800 text-white shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Alle ({communityData.recommendations.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuthorFilter("MINE")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex-shrink-0 ${
                      authorFilter === "MINE"
                        ? "bg-amber-500 text-black shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Meine ({myRecCount})</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-400 font-medium">
              {filteredRecommendations.length}{" "}
              {filteredRecommendations.length === 1 ? "Empfehlung" : "Empfehlungen"} gefunden
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
                Filter:
              </span>

              <button
                type="button"
                onClick={() => setHideWatched(!hideWatched)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                  hideWatched
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-sm"
                    : "bg-slate-950/60 border-slate-800 text-slate-500 hover:text-slate-300"
                }`}
                title="Filtert Titel heraus, die du bereits selbst gesehen hast"
              >
                <Check
                  className={`w-3.5 h-3.5 ${hideWatched ? "text-emerald-400" : "text-slate-600"}`}
                />
                <span>Noch nicht gesehen</span>
              </button>

              <button
                type="button"
                onClick={() => setOnlyStreamable(!onlyStreamable)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                  onlyStreamable
                    ? "bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-sm"
                    : "bg-slate-950/60 border-slate-800 text-slate-500 hover:text-slate-300"
                }`}
                title="Zeigt nur Empfehlungen, die du mit deinen Streaming-Abos sofort schauen kannst"
              >
                <Tv
                  className={`w-3.5 h-3.5 ${onlyStreamable ? "text-amber-400" : "text-slate-600"}`}
                />
                <span>
                  Im Abo streambar
                  {userSubscriptions.length > 0 && ` (${userSubscriptions.length} Abos)`}
                </span>
              </button>
            </div>

            {(hideWatched || onlyStreamable) && (
              <span className="text-[11px] text-slate-500 font-mono">
                ⚡ Standard-Filter aktiv
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none scroll-fade-x pt-2 border-t border-slate-800/60">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mr-1 flex-shrink-0">
              Genre / Typ:
            </span>
            {GENRE_TAGS.map((tag) => (
              <button
                key={tag.key}
                type="button"
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
      </MobileFilterBar>

      {filteredRecommendations.length > 0 ? (
        <div className="space-y-6">
          {filteredRecommendations.map((rec) => {
            const isUpvoted = rec.upvoterIds.includes(myUserId || "");
            const isMyOwn = isMe(rec.userId, rec.userName, (rec as any).userEmail);
            const isWatchedByMe = hasMyWatched(rec.tmdbId, rec.mediaType);
            const itemMeta = metaMap[`${rec.mediaType}_${rec.tmdbId}`];
            const authorImg = isMyOwn
              ? currentUserAvatar || rec.userImage
              : rec.userImage ||
                communityData.friends.find(
                  (f) => f.name === rec.userName || f.id === rec.userId
                )?.image;

            return (
              <div
                key={rec.id}
                className={`p-4 sm:p-6 rounded-3xl border transition shadow-lg grid grid-cols-[5.25rem_1fr] sm:grid-cols-[7rem_1fr] gap-x-3.5 sm:gap-x-5 gap-y-3 ${
                  isMyOwn
                    ? "bg-gradient-to-br from-slate-900/90 to-[#121828] border-amber-500/30"
                    : "bg-slate-900/70 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div
                  onClick={() => openMedia(rec)}
                  className="w-full aspect-[2/3] sm:row-span-2 rounded-2xl overflow-hidden bg-slate-800 cursor-pointer relative shadow-md group self-start"
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
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition hidden [@media(hover:hover)]:flex items-center justify-center text-white text-[10px] font-bold">
                    Öffnen
                  </div>
                </div>

                <div className="col-start-2 min-w-0 flex flex-col justify-center sm:justify-start">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-1.5">
                    <Link
                      href={
                        isMyOwn
                          ? "/profile"
                          : `/friends/${encodeURIComponent(rec.userId || rec.userName)}`
                      }
                      className="flex items-start sm:items-center gap-2.5 group hover:opacity-95 transition-opacity min-w-0 flex-1"
                      title={isMyOwn ? "Dein Profil aufrufen" : `Profil von ${rec.userName} ansehen`}
                    >
                      {authorImg ? (
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-amber-500/40 flex-shrink-0 shadow group-hover:border-amber-400 transition-colors">
                          <Image
                            src={authorImg}
                            alt={rec.userName}
                            fill
                            sizes="32px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-black font-extrabold text-xs shadow flex-shrink-0 group-hover:ring-2 group-hover:ring-amber-400 transition-all ${
                            isMyOwn
                              ? "bg-amber-400"
                              : "bg-gradient-to-tr from-amber-500 to-rose-500"
                          }`}
                        >
                          {rec.userName.slice(0, 1)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors truncate max-w-full">
                            {rec.userName}
                          </span>
                          {isMyOwn && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold border border-amber-500/30">
                              Du
                            </span>
                          )}
                          {isWatchedByMe && (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-semibold border border-emerald-500/30">
                              Von dir gesehen ✓
                            </span>
                          )}
                          {rec.targetNames && rec.targetNames.length > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-bold border border-purple-500/30">
                              <Sparkles className="w-2.5 h-2.5 text-purple-400 flex-shrink-0" />
                              <span>
                                {rec.targetNames.some((t) => t.startsWith("@"))
                                  ? `Für ${rec.targetNames.join(", ")}`
                                  : isMyOwn
                                  ? `An ${rec.targetNames.join(", ")}`
                                  : "Speziell für dich!"}
                              </span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-medium border border-slate-700">
                              <Users className="w-2.5 h-2.5 text-slate-500 flex-shrink-0" />
                              <span>Alle Freunde</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          {new Date(rec.createdAt).toLocaleDateString("de-DE")}
                        </span>
                      </div>
                    </Link>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-extrabold text-xs sm:text-sm">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{rec.rating}/10</span>
                      </div>
                      {isMyOwn && (
                        <div className="flex items-center gap-1.5 sm:gap-0.5 ml-1">
                          <button
                            type="button"
                            onClick={() => openMedia(rec)}
                            aria-label="Empfehlung bearbeiten"
                            className="min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center p-2 sm:p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition"
                            title="Empfehlung bearbeiten"
                          >
                            <Pencil className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRec(rec)}
                            aria-label="Empfehlung entfernen"
                            className="min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center p-2 sm:p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition"
                            title="Empfehlung entfernen"
                          >
                            <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div onClick={() => openMedia(rec)} className="cursor-pointer group inline-block">
                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-400 transition flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span>{rec.title}</span>
                      <span className="text-xs font-normal text-slate-400">
                        ({rec.releaseYear || "–"})
                      </span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {rec.mediaType === "tv" ? "Serie" : "Film"}
                      </span>
                    </h3>
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1 sm:col-start-2 flex flex-col justify-between space-y-3 min-w-0">
                  <div>
                    {rec.comment ? (
                      <p className="text-sm text-slate-300 leading-relaxed italic">
                        &quot;{rec.comment}&quot;
                      </p>
                    ) : null}

                    {itemMeta?.providerLogosDE && itemMeta.providerLogosDE.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-2">
                        <span className="text-[11px] text-slate-400 font-medium">Stream:</span>
                        {itemMeta.providerLogosDE.map((p) => {
                          const inMySubs = userSubscriptions.includes(p.key);
                          return (
                            <span
                              key={p.key}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${
                                inMySubs
                                  ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                                  : "bg-slate-800 border-slate-700 text-slate-300"
                              }`}
                            >
                              {p.logo && (
                                <Image
                                  src={`https://image.tmdb.org/t/p/w92${p.logo}`}
                                  alt={p.name}
                                  width={14}
                                  height={14}
                                  className="rounded"
                                />
                              )}
                              <span>{p.name}</span>
                              {inMySubs && <span className="text-amber-400 font-bold">✓</span>}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {rec.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
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

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => openMedia(rec)}
                      className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition"
                    >
                      <Globe2 className="w-3.5 h-3.5" />
                      <span>Wo streamen? (DE & VPN prüfen)</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleThread(rec.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                          (rec.replies && rec.replies.length > 0) || openThreadIds.has(rec.id)
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/35 hover:bg-purple-500/30"
                            : "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        }`}
                        title="Diskussion / Antworten anzeigen"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>
                          {rec.replies && rec.replies.length > 0
                            ? `${rec.replies.length} ${rec.replies.length === 1 ? "Antwort" : "Antworten"}`
                            : "Antworten"}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => upvoteRecommendation(rec.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                          isUpvoted
                            ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                            : "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        }`}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${isUpvoted ? "fill-white" : ""}`} />
                        <span>{rec.upvoterIds.length}</span>
                      </button>
                    </div>
                  </div>

                  {openThreadIds.has(rec.id) && (
                    <RecommendationThread
                      recommendationId={rec.id}
                      recAuthorName={rec.userName}
                      recAuthorId={rec.userId}
                      replies={rec.replies}
                      onClose={() => toggleThread(rec.id)}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <MessageSquare className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {authorFilter === "FRIENDS" && friendsRecCount === 0
                ? "Noch keine Empfehlungen von deinen Freunden"
                : "Keine Empfehlungen für diesen Filter"}
            </h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto mt-1">
              {authorFilter === "FRIENDS" && friendsRecCount === 0
                ? "Sobald deine Freunde Filme oder Serien empfehlen, erscheinen sie hier. Du kannst auch alle oder deine eigenen Empfehlungen ansehen."
                : "Passe die Filter an oder deaktiviere 'Noch nicht gesehen' / 'Im Abo streambar', um mehr Titel zu sehen."}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            {authorFilter === "FRIENDS" && (
              <>
                <button
                  type="button"
                  onClick={() => setAuthorFilter("ALL")}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
                >
                  Alle Empfehlungen ansehen ({communityData.recommendations.length})
                </button>
                {myRecCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setAuthorFilter("MINE")}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition"
                  >
                    Meine Empfehlungen ansehen ({myRecCount})
                  </button>
                )}
              </>
            )}

            {(hideWatched || onlyStreamable || filterType !== "ALL" || selectedTag !== "ALL") && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-bold transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Filter zurücksetzen</span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
