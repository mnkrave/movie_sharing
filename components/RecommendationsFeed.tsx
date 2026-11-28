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

  const isCompact = variant === "compact";

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

  const getAuthorImg = (rec: AppRecommendation, isMyOwn: boolean) =>
    isMyOwn
      ? currentUserAvatar || rec.userImage
      : rec.userImage ||
        communityData.friends.find((f) => f.name === rec.userName || f.id === rec.userId)?.image;

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

      if (!isCompact && selectedTag !== "ALL") {
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
    isCompact,
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

  const authorOptions: Array<{
    key: AuthorFilter;
    label: string;
    icon?: typeof Users;
    visible: boolean;
  }> = isCompact
    ? [
        { key: "FRIENDS", label: "Freunde", visible: true },
        { key: "TARGETED", label: "An mich", visible: true },
        { key: "MINE", label: "Meine", visible: true },
        { key: "ALL", label: "Alle", visible: true },
      ]
    : [
        { key: "FRIENDS", label: `Von Freunden (${friendsRecCount})`, icon: Users, visible: true },
        {
          key: "TARGETED",
          label: `An mich & Gruppen (${targetedToMeCount})`,
          icon: Sparkles,
          visible: targetedToMeCount > 0,
        },
        { key: "ALL", label: `Alle (${communityData.recommendations.length})`, visible: true },
        { key: "MINE", label: `Meine (${myRecCount})`, icon: User, visible: true },
      ];

  const mediaTypeOptions: Array<{
    key: MediaTypeFilter;
    label: string;
    icon?: typeof Film;
  }> = isCompact
    ? [
        { key: "ALL", label: "Alle" },
        { key: "movie", label: "Filme" },
        { key: "tv", label: "Serien" },
      ]
    : [
        { key: "ALL", label: `Alle (${communityData.recommendations.length})` },
        { key: "movie", label: `Filme (${movieCount})`, icon: Film },
        { key: "tv", label: `Serien (${tvCount})`, icon: Tv },
      ];

  const feedActiveFilters =
    (filterType !== "ALL" ? 1 : 0) +
    (authorFilter !== "ALL" ? 1 : 0) +
    (hideWatched ? 1 : 0) +
    (onlyStreamable ? 1 : 0) +
    (!isCompact && selectedTag !== "ALL" ? 1 : 0);

  const hasResettableFilter =
    hideWatched ||
    onlyStreamable ||
    filterType !== "ALL" ||
    (isCompact ? authorFilter !== "ALL" : selectedTag !== "ALL");

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

  const filterBarContent = isCompact ? (
    <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-card border border-border text-xs">
      <div className="flex items-center gap-1 p-0.5 rounded-lg bg-muted border border-border">
        {authorOptions
          .filter((a) => a.visible)
          .map((a) => (
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
        {mediaTypeOptions.map((f) => (
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
  ) : (
    <MobileFilterBar
      summary={feedSummaryParts.join(" · ")}
      activeCount={feedActiveFilters}
      resultLabel={`${filteredRecommendations.length} Tipps`}
      onReset={resetFilters}
    >
      <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3.5">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full sm:w-auto min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 w-full sm:w-auto min-w-0">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex-shrink-0">
                Format:
              </span>
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted border border-border overflow-x-auto scrollbar-none max-w-full">
                {mediaTypeOptions.map((f) => {
                  const Icon = f.icon;
                  const active = filterType === f.key;
                  return (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setFilterType(f.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex-shrink-0 cursor-pointer ${
                        active
                          ? "bg-primary text-primary-foreground shadow"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {Icon && <Icon className="w-3.5 h-3.5" />}
                      <span>{f.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 w-full sm:w-auto min-w-0">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex-shrink-0">
                Ansicht:
              </span>
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted border border-border overflow-x-auto scrollbar-none max-w-full">
                {authorOptions
                  .filter((a) => a.visible)
                  .map((a) => {
                    const Icon = a.icon;
                    const active = authorFilter === a.key;
                    return (
                      <button
                        key={a.key}
                        type="button"
                        onClick={() => setAuthorFilter(a.key)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex-shrink-0 cursor-pointer ${
                          active
                            ? "bg-primary text-primary-foreground shadow"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {Icon && <Icon className="w-3.5 h-3.5" />}
                        <span>{a.label}</span>
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground font-medium">
            {filteredRecommendations.length}{" "}
            {filteredRecommendations.length === 1 ? "Empfehlung" : "Empfehlungen"} gefunden
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mr-1">
              Filter:
            </span>

            <button
              type="button"
              onClick={() => setHideWatched(!hideWatched)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                hideWatched
                  ? "bg-primary-soft border-primary/40 text-primary-text shadow-sm"
                  : "bg-muted/70 border-border text-muted-foreground hover:text-foreground"
              }`}
              title="Filtert Titel heraus, die du bereits selbst gesehen hast"
            >
              <Check
                className={`w-3.5 h-3.5 ${hideWatched ? "text-primary-text" : "text-muted-foreground"}`}
              />
              <span>Noch nicht gesehen</span>
            </button>

            <button
              type="button"
              onClick={() => setOnlyStreamable(!onlyStreamable)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                onlyStreamable
                  ? "bg-primary-soft border-primary/40 text-primary-text shadow-sm"
                  : "bg-muted/70 border-border text-muted-foreground hover:text-foreground"
              }`}
              title="Zeigt nur Empfehlungen, die du mit deinen Streaming-Abos sofort schauen kannst"
            >
              <Tv
                className={`w-3.5 h-3.5 ${onlyStreamable ? "text-primary-text" : "text-muted-foreground"}`}
              />
              <span>
                Im Abo streambar
                {userSubscriptions.length > 0 && ` (${userSubscriptions.length} Abos)`}
              </span>
            </button>
          </div>

          {(hideWatched || onlyStreamable) && (
            <span className="text-[11px] text-muted-foreground font-mono">
              ⚡ Standard-Filter aktiv
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none scroll-fade-x pt-2 border-t border-border">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mr-1 flex-shrink-0">
            Genre / Typ:
          </span>
          {GENRE_TAGS.map((tag) => (
            <button
              key={tag.key}
              type="button"
              onClick={() => setSelectedTag(tag.key)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                selectedTag === tag.key
                  ? "bg-primary-soft text-primary-text border border-primary/40 font-bold"
                  : "bg-muted/70 text-muted-foreground border border-border hover:border-border-strong hover:text-foreground"
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>
    </MobileFilterBar>
  );

  const emptyStateNode = (
    <div
      className={`text-center bg-card border border-border space-y-3 ${
        isCompact ? "p-10 rounded-2xl border-dashed" : "p-12 rounded-3xl space-y-4"
      }`}
    >
      {isCompact ? (
        <Sparkles className="w-8 h-8 text-muted-foreground mx-auto" />
      ) : (
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
          <MessageSquare className="w-8 h-8" />
        </div>
      )}

      <div className={isCompact ? "space-y-1" : undefined}>
        <h3 className={isCompact ? "text-sm font-bold text-foreground" : "text-lg font-bold text-foreground"}>
          {!isCompact && authorFilter === "FRIENDS" && friendsRecCount === 0
            ? "Noch keine Empfehlungen von deinen Freunden"
            : isCompact
            ? "Noch keine passenden Empfehlungen im Feed"
            : "Keine Empfehlungen für diesen Filter"}
        </h3>
        <p
          className={`text-muted-foreground mx-auto ${
            isCompact ? "text-xs max-w-md" : "text-sm max-w-sm mt-1"
          }`}
        >
          {!isCompact && authorFilter === "FRIENDS" && friendsRecCount === 0
            ? "Sobald deine Freunde Filme oder Serien empfehlen, erscheinen sie hier. Du kannst auch alle oder deine eigenen Empfehlungen ansehen."
            : isCompact
            ? "Passe die Filter oben an oder lade Freunde in deinen Filmkreis ein."
            : "Passe die Filter an oder deaktiviere 'Noch nicht gesehen' / 'Im Abo streambar', um mehr Titel zu sehen."}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
        {!isCompact && authorFilter === "FRIENDS" && (
          <>
            <button
              type="button"
              onClick={() => setAuthorFilter("ALL")}
              className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground border border-border text-xs font-bold transition cursor-pointer"
            >
              Alle Empfehlungen ansehen ({communityData.recommendations.length})
            </button>
            {myRecCount > 0 && (
              <button
                type="button"
                onClick={() => setAuthorFilter("MINE")}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold transition cursor-pointer"
              >
                Meine Empfehlungen ansehen ({myRecCount})
              </button>
            )}
          </>
        )}

        {hasResettableFilter && (
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground border border-border text-xs font-semibold transition cursor-pointer"
          >
            {!isCompact && <RotateCcw className="w-3.5 h-3.5 text-primary-text" />}
            <span>{isCompact ? "Alle Filter zurücksetzen" : "Filter zurücksetzen"}</span>
          </button>
        )}

        {isCompact && onFindFriends && (
          <button
            type="button"
            onClick={onFindFriends}
            className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold cursor-pointer"
          >
            Freunde finden
          </button>
        )}
      </div>
    </div>
  );

  const cardsNode = (
    <div className={isCompact ? "space-y-3" : "space-y-6"}>
      {filteredRecommendations.map((rec) => {
        const isMyOwn = isMe(rec.userId, rec.userName, (rec as any).userEmail);
        const isUpvoted = rec.upvoterIds.includes(myUserId || "");
        const isWatchedByMe = hasMyWatched(rec.tmdbId, rec.mediaType);
        const itemMeta = metaMap[`${rec.mediaType}_${rec.tmdbId}`];
        const authorImg = getAuthorImg(rec, isMyOwn);
        const replyCount = rec.replies?.length || 0;
        const isThreadOpen = openThreadIds.has(rec.id);
        const authorHref = isMyOwn
          ? "/profile"
          : `/friends/${encodeURIComponent(rec.userId || rec.userName)}`;
        const providers = isCompact
          ? itemMeta?.providerLogosDE?.slice(0, 3) || []
          : itemMeta?.providerLogosDE || [];

        const targetLabel =
          rec.targetNames && rec.targetNames.length > 0
            ? isCompact
              ? `Für ${rec.targetNames.join(", ")}`
              : rec.targetNames.some((t) => t.startsWith("@"))
              ? `Für ${rec.targetNames.join(", ")}`
              : isMyOwn
              ? `An ${rec.targetNames.join(", ")}`
              : "Speziell für dich!"
            : null;

        return (
          <article
            key={rec.id}
            className={
              isCompact
                ? "p-4 rounded-2xl bg-card border border-border hover:border-border-strong transition shadow-xs grid grid-cols-[3.5rem_1fr] gap-x-3.5 gap-y-2"
                : `p-4 sm:p-6 rounded-3xl bg-card border transition shadow-lg grid grid-cols-[5.25rem_1fr] sm:grid-cols-[7rem_1fr] gap-x-3.5 sm:gap-x-5 gap-y-3 ${
                    isMyOwn
                      ? "border-primary/40"
                      : "border-border hover:border-border-strong"
                  }`
            }
          >
            {/* Poster */}
            <button
              type="button"
              onClick={() => openMedia(rec)}
              className={
                isCompact
                  ? "relative w-14 h-20 row-span-2 rounded-lg overflow-hidden bg-muted border border-border flex-shrink-0 cursor-pointer self-start"
                  : "w-full aspect-[2/3] sm:row-span-2 rounded-2xl overflow-hidden bg-muted border border-border cursor-pointer relative shadow-md group self-start"
              }
            >
              {rec.posterPath ? (
                <Image
                  src={`https://image.tmdb.org/t/p/${isCompact ? "w185" : "w342"}${rec.posterPath}`}
                  alt={rec.title}
                  fill
                  sizes={isCompact ? "56px" : "112px"}
                  className={
                    isCompact
                      ? "object-cover"
                      : "object-cover group-hover:scale-105 transition duration-300"
                  }
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Film className={isCompact ? "w-5 h-5" : "w-6 h-6"} />
                </div>
              )}
              {!isCompact && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition hidden [@media(hover:hover)]:flex items-center justify-center text-white text-[10px] font-bold">
                  Öffnen
                </div>
              )}
            </button>

            {/* Header + Title */}
            <div className={isCompact ? "min-w-0 space-y-1.5" : "col-start-2 min-w-0 flex flex-col justify-center sm:justify-start"}>
              <div className="flex flex-wrap items-start justify-between gap-2 mb-1.5">
                <Link
                  href={authorHref}
                  className="flex items-start sm:items-center gap-2.5 group hover:opacity-95 transition-opacity min-w-0 flex-1"
                  title={isMyOwn ? "Dein Profil aufrufen" : `Profil von ${rec.userName} ansehen`}
                >
                  {!isCompact &&
                    (authorImg ? (
                      <div className="relative w-8 h-8 rounded-full overflow-hidden border border-primary/40 flex-shrink-0 shadow group-hover:border-primary transition-colors">
                        <Image
                          src={authorImg}
                          alt={rec.userName}
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-extrabold text-xs shadow flex-shrink-0 group-hover:ring-2 group-hover:ring-primary transition-all">
                        {rec.userName.slice(0, 1)}
                      </div>
                    ))}

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="font-bold text-foreground group-hover:text-primary-text transition truncate max-w-full">
                        {rec.userName}
                      </span>
                      {!isCompact && isMyOwn && (
                        <span className="text-[10px] bg-primary-soft text-primary-text px-1.5 py-0.5 rounded font-bold border border-primary/30">
                          Du
                        </span>
                      )}
                      {!isCompact && isWatchedByMe && (
                        <span className="text-[10px] bg-primary-soft text-primary-text px-1.5 py-0.5 rounded font-semibold border border-primary/30">
                          Von dir gesehen ✓
                        </span>
                      )}
                      {isCompact && (
                        <>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-muted-foreground">
                            {new Date(rec.createdAt).toLocaleDateString("de-DE")}
                          </span>
                        </>
                      )}
                      {targetLabel ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-soft text-primary-text border border-primary/30 text-[10px] font-semibold">
                          {!isCompact && <Sparkles className="w-2.5 h-2.5 flex-shrink-0" />}
                          <span>{targetLabel}</span>
                        </span>
                      ) : (
                        !isCompact && (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-medium border border-border">
                            <Users className="w-2.5 h-2.5 flex-shrink-0" />
                            <span>Alle Freunde</span>
                          </span>
                        )
                      )}
                    </div>
                    {!isCompact && (
                      <span className="text-[11px] text-muted-foreground block mt-0.5">
                        {new Date(rec.createdAt).toLocaleDateString("de-DE")}
                      </span>
                    )}
                  </div>
                </Link>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span
                    className={`inline-flex items-center gap-1 font-extrabold ${
                      isCompact
                        ? "px-2 py-0.5 rounded-md bg-primary-soft text-primary-text text-xs"
                        : "px-2.5 py-1 rounded-xl bg-primary-soft border border-primary/30 text-primary-text text-xs sm:text-sm"
                    }`}
                  >
                    {!isCompact && <Star className="w-3.5 h-3.5 fill-current" />}
                    <span>{rec.rating}/10</span>
                  </span>

                  {isCompact && (
                    <button
                      type="button"
                      onClick={() => openMedia(rec)}
                      className="px-2.5 py-1 rounded-lg hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition cursor-pointer"
                    >
                      Mehr
                    </button>
                  )}

                  {!isCompact && isMyOwn && (
                    <div className="flex items-center gap-1.5 sm:gap-0.5 ml-1">
                      <button
                        type="button"
                        onClick={() => openMedia(rec)}
                        aria-label="Empfehlung bearbeiten"
                        className="min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center p-2 sm:p-1.5 rounded-lg text-muted-foreground hover:text-primary-text hover:bg-muted transition cursor-pointer"
                        title="Empfehlung bearbeiten"
                      >
                        <Pencil className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRec(rec)}
                        aria-label="Empfehlung entfernen"
                        className="min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center p-2 sm:p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                        title="Empfehlung entfernen"
                      >
                        <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => openMedia(rec)}
                className="text-left group inline-block cursor-pointer"
              >
                <h3
                  className={
                    isCompact
                      ? "text-sm sm:text-base font-bold text-foreground group-hover:text-primary-text transition"
                      : "text-base sm:text-lg font-bold text-foreground group-hover:text-primary-text transition flex flex-wrap items-center gap-x-2 gap-y-1"
                  }
                >
                  <span>{rec.title}</span>{" "}
                  {(rec.releaseYear || !isCompact) && (
                    <span className="text-xs font-normal text-muted-foreground">
                      ({rec.releaseYear || "–"})
                    </span>
                  )}
                  {!isCompact && (
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                      {rec.mediaType === "tv" ? "Serie" : "Film"}
                    </span>
                  )}
                </h3>
              </button>
            </div>

            {/* Body & Actions */}
            <div
              className={
                isCompact
                  ? "col-start-2 min-w-0 space-y-2.5"
                  : "col-span-2 sm:col-span-1 sm:col-start-2 flex flex-col justify-between space-y-3 min-w-0"
              }
            >
              <div>
                {rec.comment && (
                  <p
                    className={
                      isCompact
                        ? "text-xs sm:text-sm text-muted-foreground leading-relaxed"
                        : "text-sm text-muted-foreground leading-relaxed italic"
                    }
                  >
                    „{rec.comment}“
                  </p>
                )}

                {providers.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-2">
                    {!isCompact && (
                      <span className="text-[11px] text-muted-foreground font-medium">
                        Stream:
                      </span>
                    )}
                    {providers.map((p) => {
                      const inMySubs = userSubscriptions.includes(p.key);
                      return (
                        <span
                          key={p.key}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border font-semibold ${
                            isCompact ? "text-[10px]" : "text-[11px] rounded-lg"
                          } ${
                            inMySubs
                              ? "bg-primary-soft border-primary/35 text-primary-text"
                              : "bg-muted border-border text-muted-foreground"
                          }`}
                        >
                          {!isCompact && p.logo && (
                            <Image
                              src={`https://image.tmdb.org/t/p/w92${p.logo}`}
                              alt={p.name}
                              width={14}
                              height={14}
                              className="rounded"
                            />
                          )}
                          <span>{p.name}</span>
                          {!isCompact && inMySubs && <span className="font-bold">✓</span>}
                        </span>
                      );
                    })}
                  </div>
                )}

                {!isCompact && rec.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {rec.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-0.5 rounded-lg text-xs bg-muted text-foreground/85 border border-border"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div
                className={`flex flex-wrap items-center justify-between gap-2 ${
                  isCompact ? "pt-1" : "pt-3 border-t border-border"
                }`}
              >
                {!isCompact ? (
                  <button
                    type="button"
                    onClick={() => openMedia(rec)}
                    className="flex items-center gap-1.5 text-xs font-bold text-primary-text hover:underline transition cursor-pointer"
                  >
                    <Globe2 className="w-3.5 h-3.5" />
                    <span>Wo streamen? (DE &amp; VPN prüfen)</span>
                  </button>
                ) : (
                  <span />
                )}

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => toggleThread(rec.id)}
                    title="Diskussion / Antworten anzeigen"
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      !isCompact && (replyCount > 0 || isThreadOpen)
                        ? "bg-primary-soft text-primary-text border border-primary/35"
                        : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>
                      {isCompact
                        ? replyCount
                        : replyCount > 0
                        ? `${replyCount} ${replyCount === 1 ? "Antwort" : "Antworten"}`
                        : "Antworten"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => upvoteRecommendation(rec.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      isUpvoted
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${isUpvoted ? "fill-current" : ""}`} />
                    <span>{rec.upvoterIds.length}</span>
                  </button>

                  {isCompact && isMyOwn && (
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

            {isThreadOpen && (
              <div
                className={
                  isCompact
                    ? "col-span-2 pt-2 border-t border-border"
                    : "col-span-2 sm:col-span-1 sm:col-start-2"
                }
              >
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
  );

  if (isCompact) {
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

        {filterBarContent}
        {filteredRecommendations.length === 0 ? emptyStateNode : cardsNode}
      </section>
    );
  }

  return (
    <>
      {filterBarContent}
      {filteredRecommendations.length === 0 ? emptyStateNode : cardsNode}
    </>
  );
}
