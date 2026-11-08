"use client";

import React, { useState, useEffect } from "react";
import { useMedia } from "./MediaContext";
import { useSession } from "next-auth/react";
import type {
  AiRecommendedPick,
  AiParsedIntent,
} from "@/app/api/ai/recommend/route";
import {
  Sparkles,
  Send,
  Users,
  Clock,
  Star,
  Film,
  Check,
  Plus,
  Wand2,
  UserPlus,
  X,
  MessageSquareText,
  Zap,
} from "lucide-react";
import Image from "next/image";

const QUICK_SUGGESTIONS = [
  {
    icon: "🛋️",
    label: "WG-Filmabend",
    tag: "Lustig & Max. 120m",
    prompt: "Heute will ich mit WG-Couch einen Film schauen der sehr lustig ist und maximal 120 Minuten geht",
  },
  {
    icon: "⚡",
    label: "Slash-Befehl",
    tag: "/match @WG-Couch",
    prompt: "/match @WG-Couch max:120min humor:hoch",
  },
  {
    icon: "🧠",
    label: "Mindfuck-Thriller",
    tag: "Netflix & Plottwist",
    prompt: "Suche einen packenden Mindfuck-Thriller für @Max und mich auf Netflix",
  },
  {
    icon: "🍷",
    label: "Date Night",
    tag: "Abenteuer ohne Horror",
    prompt: "Date Night mit @Sarah: Ein bildgewaltiges Abenteuer ohne Horror",
  },
  {
    icon: "🍿",
    label: "Popcorn Action",
    tag: "Sci-Fi & Blockbuster",
    prompt: "Empfiehl einen bildgewaltigen Sci-Fi-Action-Blockbuster mit Top-Bewertung für heute Abend",
  },
];

export function AiMovieAdvisor({ initialPrompt }: { initialPrompt?: string }) {
  const { data: session } = useSession();
  const {
    communityData,
    userSubscriptions,
    friendGroups,
    addFriendGroup,
    openMediaModal,
    openRatingModal,
    updateMediaStatus,
  } = useMedia();

  const [prompt, setPrompt] = useState(
    initialPrompt ||
      "Heute will ich mit WG-Couch einen Film schauen der sehr lustig ist und maximal 120 Minuten geht"
  );
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [resultSummary, setResultSummary] = useState<string | null>(null);
  const [parsedIntent, setParsedIntent] = useState<AiParsedIntent | null>(null);
  const [picks, setPicks] = useState<AiRecommendedPick[]>([]);
  const [usedModel, setUsedModel] = useState<string | null>(null);

  // Quick inline group creator modal
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupEmoji, setNewGroupEmoji] = useState("🛋️");
  const [newGroupMembers, setNewGroupMembers] = useState<string[]>(["Lukas"]);

  const myName = session?.user?.name || "Lukas";

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
      handleAskAi(initialPrompt);
    }
  }, [initialPrompt]);

  const toggleFriendChip = (name: string) => {
    setSelectedFriends((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const applyGroupToPrompt = (groupName: string, memberNames: string[]) => {
    setSelectedFriends(memberNames.filter((n) => n.toLowerCase() !== myName.toLowerCase()));
    if (!prompt.toLowerCase().includes(groupName.toLowerCase())) {
      setPrompt((prev) =>
        prev.trim()
          ? `${prev.trim()} (mit ${groupName})`
          : `Heute will ich mit ${groupName} einen Film schauen`
      );
    }
  };

  const handleAskAi = async (customPrompt?: string) => {
    const queryToUse = (customPrompt ?? prompt).trim();
    if (!queryToUse) return;

    setLoading(true);
    setError(null);

    const myUserId = (session?.user as any)?.id || "";
    const myWatchedStatuses = communityData.mediaStatuses.filter(
      (m) =>
        m.status === "WATCHED" &&
        ((myUserId && m.userId === myUserId) ||
          (myName && m.userName?.toLowerCase() === myName.toLowerCase()))
    );

    const userWatchedTmdbIds = myWatchedStatuses.map((m) => m.tmdbId);
    const userWatchedTitles = myWatchedStatuses.map((m) => m.title);

    try {
      const res = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: queryToUse,
          currentUserId: myUserId,
          currentUserName: myName,
          explicitParticipants: selectedFriends,
          friendGroups,
          mediaStatuses: communityData.mediaStatuses,
          friends: communityData.friends,
          userSubscriptions,
          userWatchedTmdbIds,
          userWatchedTitles,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Fehler bei der KI-Anfrage.");
      } else {
        const watchedSet = new Set(userWatchedTmdbIds);
        const filteredPicks = (data.picks || []).filter(
          (p: AiRecommendedPick) => !watchedSet.has(p.id)
        );

        setResultSummary(data.aiSummary);
        setParsedIntent(data.parsedIntent);
        setPicks(filteredPicks);
        setUsedModel(data.usedModel || "gemini-3.8-flash");
      }
    } catch {
      setError("Netzwerkfehler bei der Verbindung zum KI-Filmberater.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuickGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || newGroupMembers.length === 0) return;
    addFriendGroup(newGroupName, newGroupEmoji, newGroupMembers);
    setNewGroupName("");
    setShowNewGroup(false);
  };

  return (
    <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-[#0c1222] border border-purple-500/35 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Stufe 2 • KI-Filmberater & Gruppen-Matcher (Gemini Flash)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Frag CineBot: Was schauen wir heute Abend?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
            Schreibe einfach in normaler Sprache (z. B.{" "}
            <span className="text-amber-300 italic">
              „Heute will ich mit WG-Couch einen Film schauen der sehr lustig ist und maximal 120
              Minuten geht“
            </span>
            ) oder nutze <code className="text-purple-300">/match @Gruppe</code>. Die KI gleicht
            alle Geschmäcker, No-Gos, Watchlists und eure Streaming-Abos ab!
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowNewGroup(!showNewGroup)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition self-start"
        >
          <UserPlus className="w-3.5 h-3.5 text-purple-400" />
          <span>+ Freundesgruppe anlegen</span>
        </button>
      </div>

      {/* Inline Quick Group Creator */}
      {showNewGroup && (
        <form
          onSubmit={handleCreateQuickGroup}
          className="p-4 rounded-2xl bg-slate-950/90 border border-purple-500/40 space-y-3 animate-in fade-in"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-300">
              Neue Filmabend-Gruppe (CineCrew) speichern
            </span>
            <button
              type="button"
              onClick={() => setShowNewGroup(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Gruppenname (z. B. WG-Couch, Mädelsabend)..."
              className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-400"
              required
            />
            <div className="flex items-center gap-1">
              {["🛋️", "🍿", "✨", "🍻", "🔥"].map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setNewGroupEmoji(em)}
                  className={`w-8 h-8 rounded-lg text-sm border ${
                    newGroupEmoji === em
                      ? "bg-purple-500/20 border-purple-400"
                      : "bg-slate-900 border-slate-800"
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-400">Mitglieder:</span>
            {communityData.friends.map((f) => {
              const active = newGroupMembers.includes(f.name);
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() =>
                    setNewGroupMembers((prev) =>
                      prev.includes(f.name)
                        ? prev.filter((n) => n !== f.name)
                        : [...prev, f.name]
                    )
                  }
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                    active
                      ? "bg-purple-500 text-black border-purple-400"
                      : "bg-slate-900 text-slate-300 border-slate-800"
                  }`}
                >
                  @{f.name}
                </button>
              );
            })}
            <button
              type="submit"
              className="ml-auto px-4 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-black font-bold text-xs"
            >
              Gruppe speichern
            </button>
          </div>
        </form>
      )}

      {/* Quick Group & Friend Selector Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mr-1">
          <Users className="w-3.5 h-3.5 text-purple-400" />
          <span>Gruppen & Freunde einbinden:</span>
        </span>

        {friendGroups.map((grp) => (
          <button
            key={grp.id}
            type="button"
            onClick={() => applyGroupToPrompt(grp.name, grp.memberNames)}
            className="px-3 py-1 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-200 text-xs font-bold transition flex items-center gap-1.5"
            title={`Mitglieder: ${grp.memberNames.join(", ")}`}
          >
            <span>{grp.emoji}</span>
            <span>@{grp.name}</span>
            <span className="text-[10px] text-purple-400">({grp.memberNames.join(", ")})</span>
          </button>
        ))}

        {communityData.friends
          .filter((f) => f.name?.toLowerCase() !== myName.toLowerCase())
          .map((friend) => {
            const active = selectedFriends.includes(friend.name);
            return (
              <button
                key={friend.id}
                type="button"
                onClick={() => toggleFriendChip(friend.name)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition ${
                  active
                    ? "bg-amber-500 text-black border-amber-400 font-bold"
                    : "bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700"
                }`}
              >
                @{friend.name} {active && "✓"}
              </button>
            );
          })}
      </div>

      {/* Quick Vorschläge (Suggestions) Oben */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Vorschläge zum Ausprobieren:</span>
          </span>
          <span className="text-slate-400 text-[10px] hidden sm:inline">
            1 Klick zum sofortigen Starten
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_SUGGESTIONS.map((sug) => (
            <button
              key={sug.label}
              type="button"
              onClick={() => {
                setPrompt(sug.prompt);
                handleAskAi(sug.prompt);
              }}
              className="group px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-purple-950/60 border border-slate-800 hover:border-purple-400/50 text-left transition flex items-center gap-2 shadow-sm"
              title={sug.prompt}
            >
              <span className="text-sm">{sug.icon}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-200 group-hover:text-white">
                  {sug.label}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300 font-medium border border-purple-500/20">
                  {sug.tag}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Prompt Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAskAi();
        }}
        className="space-y-3"
      >
        <div className="relative flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MessageSquareText className="w-5 h-5 text-purple-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='z. B. "Heute will ich mit WG-Couch einen Film schauen der sehr lustig ist und maximal 120 Minuten geht"'
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-950/90 border border-slate-700/90 focus:border-purple-400 text-sm text-white placeholder-slate-500 focus:outline-none shadow-inner"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-amber-500 hover:from-purple-400 hover:to-amber-400 text-black font-black text-sm transition shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 disabled:opacity-50 flex-shrink-0"
          >
            <Wand2 className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "KI analysiert Profile..." : "KI-Match starten"}</span>
          </button>
        </div>
      </form>

      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="p-8 rounded-2xl bg-slate-950/60 border border-purple-500/20 text-center space-y-3 animate-pulse">
          <Wand2 className="w-8 h-8 text-purple-400 mx-auto animate-spin" />
          <p className="text-sm font-bold text-white">
            CineBot gleicht Geschmäcker, Bewertungen, Laufzeiten & Streaming-Abos ab...
          </p>
          <p className="text-xs text-slate-400">
            Bereits gesehene Filme der Gruppe werden automatisch ausgeschlossen.
          </p>
        </div>
      )}

      {/* AI Results Section */}
      {!loading && parsedIntent && (
        <div className="space-y-5 pt-2 animate-in fade-in">
          {/* Parsed Intent Badges & AI Mediator Summary */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-purple-500/30 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
                KI-Verständnis:
              </span>

              {parsedIntent.detectedGroupName && (
                <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-200 text-xs font-bold">
                  Gruppe: {parsedIntent.detectedGroupName}
                </span>
              )}

              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>Teilnehmer: {parsedIntent.detectedParticipants.join(", ")}</span>
              </span>

              {parsedIntent.mood && (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                  Stimmung: {parsedIntent.mood}
                </span>
              )}

              {parsedIntent.maxRuntimeMinutes && (
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Max. {parsedIntent.maxRuntimeMinutes} Min.</span>
                </span>
              )}

              {usedModel && (
                <span className="ml-auto px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
                  ⚡ {usedModel}
                </span>
              )}
            </div>

            {resultSummary && (
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed border-l-2 border-purple-400 pl-3">
                {resultSummary}
              </p>
            )}
          </div>

          {/* Enriched Movie/Series Cards with Per-Person Reasons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {picks.map((pick) => {
              const mySubs = pick.availableProvidersDE.filter((p) => p.isMySub);
              const displayProviders =
                mySubs.length > 0 ? mySubs : pick.availableProvidersDE.slice(0, 3);
              const currentUserId = (session?.user as any)?.id;
              const currentUserName = session?.user?.name;
              const isMatchUser = (m: any) =>
                (currentUserId && m.userId === currentUserId) ||
                (currentUserName && m.userName?.toLowerCase() === currentUserName.toLowerCase());

              const isOnWatchlist = communityData.mediaStatuses.some(
                (m) =>
                  m.tmdbId === pick.id &&
                  m.mediaType === pick.mediaType &&
                  m.status === "WATCHLIST" &&
                  isMatchUser(m)
              );

              const isWatched = communityData.mediaStatuses.some(
                (m) =>
                  m.tmdbId === pick.id &&
                  m.mediaType === pick.mediaType &&
                  m.status === "WATCHED" &&
                  isMatchUser(m)
              );

              return (
                <div
                  key={`${pick.mediaType}_${pick.id}`}
                  onClick={() =>
                    openMediaModal({
                      id: pick.id,
                      mediaType: pick.mediaType,
                      title: pick.title,
                      posterPath: pick.posterPath,
                      genreIds: pick.genreIds,
                    })
                  }
                  className="group cursor-pointer rounded-2xl bg-slate-950/85 border border-slate-800 hover:border-purple-500/50 overflow-hidden flex flex-col justify-between transition duration-300 hover:-translate-y-1 shadow-xl"
                >
                  <div className="p-4 flex gap-4">
                    {/* Poster Thumbnail */}
                    <div className="relative w-24 sm:w-28 aspect-[2/3] rounded-xl overflow-hidden bg-slate-900 flex-shrink-0 border border-slate-800">
                      {pick.posterPath ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w342${pick.posterPath}`}
                          alt={pick.title}
                          fill
                          sizes="120px"
                          className="object-cover group-hover:scale-105 transition duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <Film className="w-6 h-6" />
                        </div>
                      )}
                      <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-emerald-500 text-black font-black text-[10px] shadow">
                        {pick.matchScore}% Match
                      </div>
                    </div>

                    {/* Title, Runtime, Genres & Pitch */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-semibold">
                          <span>{pick.releaseYear}</span>
                          {pick.runtimeMinutes && (
                            <span className="flex items-center gap-0.5 text-amber-300">
                              <Clock className="w-3 h-3" />
                              {pick.runtimeMinutes} Min.
                            </span>
                          )}
                          <span className="flex items-center gap-0.5 text-amber-400 ml-auto">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {pick.voteAverage}
                          </span>
                        </div>
                        <h4 className="text-base font-black text-white group-hover:text-purple-300 transition leading-snug mt-0.5">
                          {pick.title}
                        </h4>
                      </div>

                      {/* Genres */}
                      {pick.genres.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {pick.genres.slice(0, 3).map((g) => (
                            <span
                              key={g.id}
                              className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-semibold"
                            >
                              {g.emoji} {g.name}
                            </span>
                          ))}
                        </div>
                      )}

                      <p className="text-xs text-slate-300 leading-snug">{pick.groupPitch}</p>

                      {/* Streaming Providers */}
                      {displayProviders.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {displayProviders.map((p) => (
                            <span
                              key={p.providerId}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                p.isMySub
                                  ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                                  : "bg-slate-900 border-slate-800 text-slate-400"
                              }`}
                            >
                              {p.logoPath && (
                                <Image
                                  src={`https://image.tmdb.org/t/p/w45${p.logoPath}`}
                                  alt={p.providerName}
                                  width={12}
                                  height={12}
                                  className="rounded-xs"
                                />
                              )}
                              <span>{p.providerName}</span>
                              {p.isMySub && <span>✓</span>}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Per-Person Reasons (Warum für jeden in der Gruppe?) */}
                  {pick.perPersonReasons.length > 0 && (
                    <div className="px-4 py-3 bg-slate-900/60 border-t border-slate-800/80 space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
                        Warum es jedem von euch gefällt:
                      </p>
                      {pick.perPersonReasons.map((pr, idx) => (
                        <div key={idx} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                          <span className="font-bold text-amber-400 flex-shrink-0">
                            @{pr.personName}:
                          </span>
                          <span className="text-slate-300">{pr.reason}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="p-3 bg-slate-950 border-t border-slate-800/80 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openRatingModal({
                          tmdbId: pick.id,
                          mediaType: pick.mediaType,
                          title: pick.title,
                          posterPath: pick.posterPath,
                          releaseYear: pick.releaseYear,
                          isWatched,
                        });
                      }}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                        isWatched
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : "bg-slate-900 hover:bg-emerald-500 hover:text-black text-slate-200 border-slate-800"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isWatched ? "Gesehen ✓" : "Gesehen?"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateMediaStatus({
                          tmdbId: pick.id,
                          mediaType: pick.mediaType,
                          title: pick.title,
                          posterPath: pick.posterPath,
                          releaseYear: pick.releaseYear,
                          status: isOnWatchlist ? "NONE" : "WATCHLIST",
                        });
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1 ${
                        isOnWatchlist
                          ? "bg-emerald-500 text-black border-emerald-400 shadow-sm shadow-emerald-500/20"
                          : "bg-slate-900 hover:bg-emerald-500 hover:text-black text-slate-200 border-slate-800"
                      }`}
                    >
                      {isOnWatchlist ? (
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                      <span>{isOnWatchlist ? "Merkliste ✓" : "Merkliste"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
