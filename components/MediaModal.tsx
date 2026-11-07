"use client";

import React, { useState, useEffect } from "react";
import { MediaDetails, CountryWatchData, GlobalProviderVpnMatch } from "@/lib/tmdb";
import { useMedia } from "./MediaContext";
import { useSession } from "next-auth/react";
import Image from "next/image";
import {
  X,
  Star,
  Film,
  Tv,
  Award,
  Globe2,
  Clock,
  Play,
  Check,
  Plus,
  Share2,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter,
} from "lucide-react";

interface MediaModalProps {
  media: {
    id: number;
    mediaType: "movie" | "tv";
    title?: string;
    posterPath?: string | null;
  };
  onClose: () => void;
}

export function MediaModal({ media, onClose }: MediaModalProps) {
  const { data: session } = useSession();
  const {
    communityData,
    updateMediaStatus,
    submitRecommendation,
    upvoteRecommendation,
    userSubscriptions,
    openSubscriptions,
  } = useMedia();

  const [details, setDetails] = useState<MediaDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"vpn" | "de" | "friends">("vpn");
  const [showTrailer, setShowTrailer] = useState(false);
  const [onlyMySubs, setOnlyMySubs] = useState(false);

  // Recommendation form state
  const [showRecForm, setShowRecForm] = useState(false);
  const [recRating, setRecRating] = useState(9);
  const [recComment, setRecComment] = useState("");
  const [recTags, setRecTags] = useState<string[]>(["🔥 Absolutes Muss"]);
  const [submittingRec, setSubmittingRec] = useState(false);

  // Status rating dialog
  const [userRatingInput, setUserRatingInput] = useState<number>(8);
  const [showRatingSelector, setShowRatingSelector] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetch(`/api/tmdb/details?id=${media.id}&type=${media.mediaType}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setDetails(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load details:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [media.id, media.mediaType]);

  // Friend data for this specific movie
  const friendsWatched = communityData.mediaStatuses.filter(
    (m) => m.tmdbId === media.id && m.mediaType === media.mediaType && m.status === "WATCHED"
  );
  const friendsWatchlist = communityData.mediaStatuses.filter(
    (m) => m.tmdbId === media.id && m.mediaType === media.mediaType && m.status === "WATCHLIST"
  );
  const friendsRecommendations = communityData.recommendations.filter(
    (r) => r.tmdbId === media.id && r.mediaType === media.mediaType
  );

  const myEmail = session?.user?.email?.toLowerCase();
  const myStatusObj = communityData.mediaStatuses.find(
    (m) =>
      m.tmdbId === media.id &&
      m.mediaType === media.mediaType &&
      (m.userId === (session?.user as any)?.id || m.userName === session?.user?.name)
  );

  const handleStatusChange = async (status: "WATCHED" | "WATCHLIST" | "NONE", rating?: number) => {
    if (!session) {
      alert("Bitte logge dich ein, um Filme auf deiner Liste zu speichern!");
      return;
    }
    await updateMediaStatus({
      tmdbId: media.id,
      mediaType: media.mediaType,
      title: details?.title || media.title || "Titel",
      posterPath: details?.posterPath || media.posterPath || null,
      releaseYear: details?.releaseYear || null,
      status,
      rating: rating ?? (status === "WATCHED" ? userRatingInput : undefined),
    });
    setShowRatingSelector(false);
  };

  const handleRecSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      alert("Bitte logge dich ein, um eine Empfehlung abzugeben!");
      return;
    }
    if (!recComment.trim()) return;

    setSubmittingRec(true);
    await submitRecommendation({
      tmdbId: media.id,
      mediaType: media.mediaType,
      title: details?.title || media.title || "Titel",
      posterPath: details?.posterPath || media.posterPath || null,
      backdropPath: details?.backdropPath || null,
      releaseYear: details?.releaseYear || null,
      rating: recRating,
      comment: recComment.trim(),
      tags: recTags,
    });
    setSubmittingRec(false);
    setRecComment("");
    setShowRecForm(false);
    setActiveTab("friends");
  };

  const toggleTag = (tag: string) => {
    if (recTags.includes(tag)) {
      setRecTags(recTags.filter((t) => t !== tag));
    } else {
      setRecTags([...recTags, tag]);
    }
  };

  // Filter VPN providers based on "onlyMySubs"
  const displayedVpnProviders = (details?.vpnProviders || []).filter((prov) => {
    if (!onlyMySubs) return true;
    return userSubscriptions.includes(prov.normalizedKey);
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#0b0f19] border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden relative my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 transition shadow-lg"
          aria-label="Schließen"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Container */}
        <div className="overflow-y-auto flex-1">
          {/* Hero Backdrop Banner */}
          <div className="relative h-64 sm:h-80 w-full bg-slate-900">
            {details?.backdropPath ? (
              <Image
                src={`https://image.tmdb.org/t/p/w1280${details.backdropPath}`}
                alt={details?.title || "Backdrop"}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 896px"
              />
            ) : media.posterPath ? (
              <Image
                src={`https://image.tmdb.org/t/p/w780${media.posterPath}`}
                alt="Poster"
                fill
                className="object-cover blur-sm opacity-60"
                sizes="(max-width: 1024px) 100vw, 896px"
              />
            ) : null}

            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/60 to-transparent" />

            {/* Trailer Play Button */}
            {details?.trailerKey && !showTrailer && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={() => setShowTrailer(true)}
                  className="flex items-center gap-2 px-5 py-3 rounded-full bg-amber-500/90 hover:bg-amber-400 text-black font-bold backdrop-blur-md shadow-2xl transition hover:scale-105"
                >
                  <Play className="w-5 h-5 fill-black" />
                  Trailer abspielen
                </button>
              </div>
            )}

            {/* Embedded Trailer Overlay */}
            {showTrailer && details?.trailerKey && (
              <div className="absolute inset-0 z-20 bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${details.trailerKey}?autoplay=1`}
                  title="Trailer"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                <button
                  onClick={() => setShowTrailer(false)}
                  className="absolute top-4 left-4 p-2 bg-black/70 text-white rounded-lg hover:bg-black"
                >
                  Trailer schließen
                </button>
              </div>
            )}

            {/* Oscar Banner if applicable */}
            {details?.oscarInfo && (
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-500/40 text-amber-300 text-xs font-semibold shadow-lg">
                <Award className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>
                  {details.oscarInfo.oscarsWon}x Oscar-Gewinner ({details.oscarInfo.ceremonyYear})
                </span>
              </div>
            )}
          </div>

          {/* Header Info & Actions */}
          <div className="px-6 -mt-16 relative z-10">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {/* Poster thumbnail */}
              <div className="w-28 sm:w-36 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-700/60 bg-slate-800 flex-shrink-0 relative hidden sm:block">
                {details?.posterPath || media.posterPath ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w342${details?.posterPath || media.posterPath}`}
                    alt="Poster"
                    fill
                    className="object-cover"
                    sizes="144px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600">
                    <Film className="w-8 h-8" />
                  </div>
                )}
              </div>

              {/* Title & Metadata */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                    {media.mediaType === "tv" ? "Serie" : "Film"}
                  </span>
                  {details?.releaseYear && (
                    <span className="text-sm text-slate-400 font-medium">{details.releaseYear}</span>
                  )}
                  {details?.runtime && (
                    <span className="flex items-center gap-1 text-sm text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {Math.floor(details.runtime / 60)}h {details.runtime % 60}m
                    </span>
                  )}
                  {details?.numberOfSeasons && (
                    <span className="text-sm text-slate-400">
                      {details.numberOfSeasons} {details.numberOfSeasons === 1 ? "Staffel" : "Staffeln"}
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {details?.title || media.title}
                </h2>
                {details?.tagline && (
                  <p className="text-sm italic text-slate-400 mt-1">&quot;{details.tagline}&quot;</p>
                )}

                {/* Ratings & Quick Badges */}
                <div className="flex flex-wrap items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-sm">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>{details?.voteAverage || "–"}/10</span>
                    <span className="text-xs text-amber-500/70 font-normal">TMDB / IMDb</span>
                  </div>

                  {friendsWatched.length > 0 && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                      <Check className="w-3.5 h-3.5" />
                      <span>{friendsWatched.length} Freunde gesehen</span>
                    </div>
                  )}

                  {friendsRecommendations.length > 0 && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{friendsRecommendations.length}x empfohlen</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action Bar (Watched, Watchlist, Recommend) */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 my-5 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  if (myStatusObj?.status === "WATCHED") {
                    handleStatusChange("NONE");
                  } else {
                    setShowRatingSelector(!showRatingSelector);
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                  myStatusObj?.status === "WATCHED"
                    ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                }`}
              >
                <Check className="w-4 h-4" />
                <span>
                  {myStatusObj?.status === "WATCHED"
                    ? `Gesehen (${myStatusObj.rating ? `${myStatusObj.rating}/10` : "✓"})`
                    : "Als gesehen markieren"}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleStatusChange(myStatusObj?.status === "WATCHLIST" ? "NONE" : "WATCHLIST")
                }
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                  myStatusObj?.status === "WATCHLIST"
                    ? "bg-sky-500 text-black shadow-lg shadow-sky-500/20"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>{myStatusObj?.status === "WATCHLIST" ? "Auf Watchlist ✓" : "Watchlist"}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowRecForm(!showRecForm)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-black transition shadow-lg shadow-rose-500/20 ml-auto"
              >
                <Sparkles className="w-4 h-4" />
                <span>Freunden empfehlen</span>
              </button>
            </div>

            {/* Quick Rating Selector Drawer */}
            {showRatingSelector && (
              <div className="p-4 mb-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 animate-in fade-in">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-emerald-300">
                    Wie fandest du den Film? ({userRatingInput}/10)
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setUserRatingInput(num)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                          userRatingInput === num
                            ? "bg-emerald-400 text-black scale-110"
                            : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-3">
                  <button
                    onClick={() => setShowRatingSelector(false)}
                    className="text-xs text-slate-400 px-3 py-1.5"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={() => handleStatusChange("WATCHED", userRatingInput)}
                    className="px-4 py-1.5 rounded-lg bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400"
                  >
                    Speichern
                  </button>
                </div>
              </div>
            )}

            {/* Recommendation Input Form */}
            {showRecForm && (
              <form
                onSubmit={handleRecSubmit}
                className="p-5 mb-5 rounded-2xl bg-gradient-to-b from-slate-900 to-[#0e1424] border border-amber-500/30 shadow-xl space-y-4 animate-in fade-in"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Empfehlung für deine Freunde verfassen
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowRecForm(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Deine Bewertung: <span className="text-amber-400 font-bold">{recRating}/10</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setRecRating(num)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                          recRating === num
                            ? "bg-amber-400 text-black ring-2 ring-amber-300"
                            : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Warum müssen deine Freunde das sehen?
                  </label>
                  <textarea
                    value={recComment}
                    onChange={(e) => setRecComment(e.target.value)}
                    rows={3}
                    placeholder="z. B. Überragende Schauspieler und ein Twist am Ende, den man nie kommen sieht. Auf Netflix Japan mit VPN verfügbar!"
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Kategorien / Tags:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "🔥 Absolutes Muss",
                      "🤯 Mindfuck",
                      "🍿 Popcorn-Kino",
                      "😭 Zieht Taschentücher",
                      "😂 Tränen gelacht",
                      "🏆 Oscar-Meisterwerk",
                      "😱 Pure Spannung",
                    ].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                          recTags.includes(tag)
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            : "bg-slate-800 text-slate-400 border border-transparent hover:border-slate-700"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRecForm(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    disabled={submittingRec || !recComment.trim()}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black transition disabled:opacity-50"
                  >
                    {submittingRec ? "Wird geteilt..." : "Jetzt für Freunde teilen"}
                  </button>
                </div>
              </form>
            )}

            {/* Content Tabs Switcher */}
            <div className="flex items-center gap-1 border-b border-slate-800 mb-6">
              <button
                onClick={() => setActiveTab("vpn")}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition ${
                  activeTab === "vpn"
                    ? "border-amber-400 text-amber-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Globe2 className="w-4 h-4" />
                <span>Globaler VPN Streaming-Finder</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono">
                  {details?.vpnProviders?.length || 0}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("de")}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition ${
                  activeTab === "de"
                    ? "border-amber-400 text-amber-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>🇩🇪 Streaming (DE)</span>
              </button>

              <button
                onClick={() => setActiveTab("friends")}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition ${
                  activeTab === "friends"
                    ? "border-rose-400 text-rose-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Freunde & Empfehlungen ({friendsRecommendations.length})</span>
              </button>
            </div>

            {/* TAB 1: Global VPN Finder */}
            {activeTab === "vpn" && (
              <div className="space-y-6 pb-8">
                {/* Info banner & subscription filter */}
                <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="text-xs text-slate-400">
                    <p className="font-semibold text-slate-200 text-sm mb-0.5">
                      🌐 Weltweite Streaming-Flatrates via VPN
                    </p>
                    Wenn ein Film in Deutschland nicht im Abo läuft, kannst du dich mit einem VPN
                    (z. B. Japan 🇯🇵 oder UK 🇬🇧) verbinden und direkt streamen.
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setOnlyMySubs(!onlyMySubs)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                        onlyMySubs
                          ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                          : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                      }`}
                    >
                      <Filter className="w-3.5 h-3.5" />
                      <span>Nur meine Abos ({userSubscriptions.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={openSubscriptions}
                      className="text-xs text-slate-400 hover:text-amber-400 underline"
                    >
                      Abos anpassen
                    </button>
                  </div>
                </div>

                {/* List of VPN Providers */}
                {displayedVpnProviders.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayedVpnProviders.map((provider) => {
                      const isMySub = userSubscriptions.includes(provider.normalizedKey);
                      return (
                        <div
                          key={provider.normalizedKey}
                          className={`p-4 rounded-2xl border transition relative overflow-hidden ${
                            isMySub
                              ? "bg-gradient-to-br from-slate-900/90 to-[#0e1628] border-amber-500/40 shadow-lg"
                              : "bg-slate-900/40 border-slate-800/80"
                          }`}
                        >
                          {isMySub && (
                            <div className="absolute top-0 right-0 bg-amber-500 text-black text-[10px] font-bold px-2.5 py-0.5 rounded-bl-lg uppercase tracking-wider">
                              Dein Abo ✓
                            </div>
                          )}

                          <div className="flex items-center gap-3 mb-3">
                            {provider.logoPath ? (
                              <Image
                                src={`https://image.tmdb.org/t/p/w92${provider.logoPath}`}
                                alt={provider.providerName}
                                width={36}
                                height={36}
                                className="rounded-xl shadow"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-xs font-bold text-white">
                                {provider.providerName.slice(0, 2)}
                              </div>
                            )}
                            <div>
                              <h4 className="text-white font-bold text-base">
                                {provider.providerName}
                              </h4>
                              <p className="text-xs text-slate-400">
                                In {provider.countries.length}{" "}
                                {provider.countries.length === 1 ? "Land" : "Ländern"} im
                                Flatrate-Stream
                              </p>
                            </div>
                          </div>

                          {/* Country Flags & Pills */}
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {provider.countries.map((c) => (
                              <span
                                key={c.code}
                                title={c.name}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-slate-800/80 border border-slate-700 text-slate-200"
                              >
                                <span className="text-sm">{c.flag}</span>
                                <span className="font-medium">{c.name}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 rounded-2xl bg-slate-900/30 border border-slate-800/50">
                    {onlyMySubs
                      ? "In deinen ausgewählten Abos ist dieser Film aktuell in keinem Land verfügbar."
                      : "Für diesen Titel wurden keine globalen Flatrate-Streams gefunden."}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Deutschland Streaming */}
            {activeTab === "de" && (
              <div className="space-y-6 pb-8">
                {/* Flatrate */}
                <div>
                  <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">
                    Abo-Flatrates (Kostenlos mit Abo)
                  </h4>
                  {details?.watchProvidersDE?.flatrate &&
                  details.watchProvidersDE.flatrate.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {details.watchProvidersDE.flatrate.map((p) => (
                        <div
                          key={p.provider_id}
                          className="flex items-center gap-2.5 p-2 pr-4 rounded-xl bg-slate-900 border border-slate-800 shadow"
                        >
                          <Image
                            src={`https://image.tmdb.org/t/p/w92${p.logo_path}`}
                            alt={p.provider_name}
                            width={32}
                            height={32}
                            className="rounded-lg"
                          />
                          <span className="text-sm font-medium text-white">{p.provider_name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">
                      Aktuell in Deutschland in keinem Streaming-Abo enthalten. Schau im Tab{" "}
                      <span
                        className="text-amber-400 cursor-pointer underline"
                        onClick={() => setActiveTab("vpn")}
                      >
                        Globaler VPN-Finder
                      </span>
                      , ob er im Ausland verfügbar ist!
                    </p>
                  )}
                </div>

                {/* Free / Mediatheken */}
                {details?.watchProvidersDE?.free && details.watchProvidersDE.free.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">
                      Kostenlos mit Werbung / Mediathek
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {details.watchProvidersDE.free.map((p) => (
                        <div
                          key={p.provider_id}
                          className="flex items-center gap-2.5 p-2 pr-4 rounded-xl bg-slate-900 border border-slate-800 shadow"
                        >
                          <Image
                            src={`https://image.tmdb.org/t/p/w92${p.logo_path}`}
                            alt={p.provider_name}
                            width={32}
                            height={32}
                            className="rounded-lg"
                          />
                          <span className="text-sm font-medium text-white">{p.provider_name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rent / Buy */}
                <div>
                  <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">
                    Leihen & Kaufen
                  </h4>
                  {details?.watchProvidersDE?.rent && details.watchProvidersDE.rent.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {details.watchProvidersDE.rent.map((p) => (
                        <div
                          key={p.provider_id}
                          className="flex items-center gap-2.5 p-2 pr-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300"
                        >
                          <Image
                            src={`https://image.tmdb.org/t/p/w92${p.logo_path}`}
                            alt={p.provider_name}
                            width={24}
                            height={24}
                            className="rounded"
                          />
                          <span>{p.provider_name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">Keine Kauf- oder Leihanbieter gefunden.</p>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: Friends & Recommendations */}
            {activeTab === "friends" && (
              <div className="space-y-6 pb-8">
                {/* Friends who watched / watchlist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" /> Bereits gesehen ({friendsWatched.length})
                    </h5>
                    {friendsWatched.length > 0 ? (
                      <div className="space-y-2">
                        {friendsWatched.map((fw) => (
                          <div
                            key={fw.id}
                            className="flex items-center justify-between text-sm py-1 border-b border-slate-800/40 last:border-0"
                          >
                            <span className="text-slate-200 font-medium">{fw.userName}</span>
                            {fw.rating && (
                              <span className="text-amber-400 font-bold text-xs bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                {fw.rating}/10 ★
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">Noch kein Freund als gesehen markiert.</p>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-2 flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5" /> Auf der Watchlist ({friendsWatchlist.length})
                    </h5>
                    {friendsWatchlist.length > 0 ? (
                      <div className="space-y-2">
                        {friendsWatchlist.map((fw) => (
                          <div
                            key={fw.id}
                            className="text-sm py-1 border-b border-slate-800/40 last:border-0 text-slate-200"
                          >
                            {fw.userName} möchte diesen Titel schauen
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">Noch auf keiner Freundes-Watchlist.</p>
                    )}
                  </div>
                </div>

                {/* Recommendations Feed */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Empfehlungen & Meinungen ({friendsRecommendations.length})
                    </h4>
                    <button
                      onClick={() => setShowRecForm(true)}
                      className="text-xs font-semibold text-amber-400 hover:text-amber-300"
                    >
                      + Eigene Empfehlung schreiben
                    </button>
                  </div>

                  {friendsRecommendations.length > 0 ? (
                    <div className="space-y-4">
                      {friendsRecommendations.map((rec) => {
                        const myUserId = (session?.user as any)?.id || "user_lukas";
                        const isUpvoted = rec.upvoterIds.includes(myUserId);
                        return (
                          <div
                            key={rec.id}
                            className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-rose-500 text-black font-bold flex items-center justify-center text-xs">
                                  {rec.userName.slice(0, 1)}
                                </div>
                                <div>
                                  <span className="text-sm font-bold text-white">{rec.userName}</span>
                                  <span className="text-[11px] text-slate-500 ml-2">
                                    {new Date(rec.createdAt).toLocaleDateString("de-DE")}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 text-amber-400 font-extrabold text-sm bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                                <Star className="w-3.5 h-3.5 fill-amber-400" />
                                {rec.rating}/10
                              </div>
                            </div>

                            <p className="text-sm text-slate-200 leading-relaxed">{rec.comment}</p>

                            {rec.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {rec.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 border border-slate-700"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center justify-end pt-2 border-t border-slate-800/60">
                              <button
                                type="button"
                                onClick={() => upvoteRecommendation(rec.id)}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                                  isUpvoted
                                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                    : "bg-slate-800/60 text-slate-400 hover:text-white"
                                }`}
                              >
                                <ThumbsUp className="w-3.5 h-3.5" />
                                <span>Hilfreich ({rec.upvoterIds.length})</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800/60">
                      <p className="text-sm text-slate-400 mb-3">
                        Noch keine Empfehlung für diesen Titel. Sei der Erste, der diesen Film den
                        Freunden ans Herz legt!
                      </p>
                      <button
                        onClick={() => setShowRecForm(true)}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition"
                      >
                        Jetzt empfehlen
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Overview & Crew */}
            <div className="border-t border-slate-800 pt-6 pb-8 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Handlung
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {details?.overview || "Keine Inhaltsangabe verfügbar."}
                </p>
              </div>

              {details?.director && (
                <div className="text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Regie:</span> {details.director}
                </div>
              )}

              {details?.cast && details.cast.length > 0 && (
                <div>
                  <h5 className="text-xs font-bold text-slate-400 mb-2">Besetzung:</h5>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-300">
                    {details.cast.map((actor) => (
                      <span key={actor.id} className="bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                        {actor.name} <span className="text-slate-500">({actor.character})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
