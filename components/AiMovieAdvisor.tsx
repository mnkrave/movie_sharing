"use client";

import React, { useState, useEffect } from "react";
import { useMedia } from "./MediaContext";
import { useSession } from "next-auth/react";
import type {
  AiRecommendedPick,
  AiParsedIntent,
} from "@/app/api/ai/recommend/route";
import { isCurrentUserMatch, isSamePerson } from "@/lib/auth-match";
import {
  Sparkles,
  Users,
  Clock,
  Star,
  Film,
  Check,
  Bookmark,
  UserPlus,
  X,
} from "lucide-react";
import Image from "next/image";

const PROMPT_STARTERS = [
  {
    label: "Etwas für heute Abend",
    prompt: "Empfiehl mir einen packenden, gut bewerteten Film für heute Abend aus meinen Abos",
  },
  {
    label: "Ähnlich wie Interstellar",
    prompt: "Ich suche etwas Ähnliches wie Interstellar: große Ideen, emotional und visuell stark",
  },
  {
    label: "Filmabend mit Freunden",
    prompt: "Wir machen heute einen entspannten Filmabend mit Freunden: unterhaltsam, maximal 120 Minuten",
  },
  {
    label: "Packender Thriller",
    prompt: "Suche einen spannenden Mindfuck-Thriller mit starkem Plottwist auf meinen Streaming-Abos",
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

  const [prompt, setPrompt] = useState(initialPrompt || "");
  const [advisorMode, setAdvisorMode] = useState<"solo" | "crew">(() =>
    initialPrompt && friendGroups.some((g) => initialPrompt.toLowerCase().includes(g.name.toLowerCase()))
      ? "crew"
      : "solo"
  );
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [resultSummary, setResultSummary] = useState<string | null>(null);
  const [parsedIntent, setParsedIntent] = useState<AiParsedIntent | null>(null);
  const [picks, setPicks] = useState<AiRecommendedPick[]>([]);

  // Quick inline group creator
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupEmoji, setNewGroupEmoji] = useState("🛋️");
  const [newGroupMembers, setNewGroupMembers] = useState<string[]>([]);

  const myUserId = (session?.user as any)?.id || "";
  const myName = session?.user?.name || "Lukas Reinle";
  const myEmail = session?.user?.email;

  const isMe = (name?: string | null): boolean => isSamePerson(name, session?.user?.name || myName);

  useEffect(() => {
    if (session?.user?.name && newGroupMembers.length === 0) {
      setNewGroupMembers([session.user.name]);
    }
  }, [session?.user?.name]);

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
      handleAskAi(initialPrompt);
    }
  }, [initialPrompt]);

  const toggleFriendChip = (name: string) => {
    if (isMe(name)) return;
    setSelectedFriends((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const applyGroupToPrompt = (groupName: string, memberNames: string[]) => {
    setAdvisorMode("crew");
    setSelectedFriends(memberNames.filter((n) => !isMe(n)));
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

    const myWatchedStatuses = communityData.mediaStatuses.filter(
      (m) =>
        m.status === "WATCHED" &&
        isCurrentUserMatch(
          { userId: myUserId, name: session?.user?.name || myName, email: myEmail },
          { userId: m.userId, userName: m.userName, userEmail: (m as any).userEmail }
        )
    );

    const userWatchedTmdbIds = myWatchedStatuses.map((m) => m.tmdbId);
    const userWatchedKeys = myWatchedStatuses.map((m) => `${m.mediaType}_${m.tmdbId}`);
    const userWatchedTitles = myWatchedStatuses.map((m) => m.title);
    const cleanExplicitParticipants =
      advisorMode === "crew" ? selectedFriends.filter((n) => !isMe(n)) : [];

    try {
      const res = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: queryToUse,
          currentUserId: myUserId,
          currentUserName: session?.user?.name || myName,
          explicitParticipants: cleanExplicitParticipants,
          friendGroups,
          mediaStatuses: communityData.mediaStatuses,
          friends: communityData.friends,
          userSubscriptions,
          userWatchedTmdbIds,
          userWatchedKeys,
          userWatchedTitles,
        }),
      });

      let data: any = null;
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }

      if (!res.ok || !data || data.error) {
        setError(
          data?.error ||
            (res.status === 504 || res.status === 502
              ? "Die KI-Anfrage hat zu lange gedauert. Bitte versuche es noch einmal."
              : `Fehler bei der KI-Anfrage (HTTP ${res.status}). Bitte versuche es kurz erneut.`)
        );
      } else {
        const watchedKeySet = new Set(userWatchedKeys);
        const filteredPicks = (data.picks || []).filter(
          (p: AiRecommendedPick) => !watchedKeySet.has(`${p.mediaType}_${p.id}`)
        );

        setResultSummary(data.aiSummary);
        setParsedIntent(data.parsedIntent);
        setPicks(filteredPicks);
      }
    } catch (err: any) {
      setError(
        err?.message?.includes("aborted")
          ? "Die Verbindung zum Server wurde abgebrochen. Bitte versuche es erneut."
          : "Netzwerkfehler bei der Verbindung zum KI-Filmberater. Bitte versuche es gleich erneut."
      );
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
    <section className="space-y-8">
      {/* Two-Column Flowstep Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Dein Abend */}
        <div className="lg:col-span-5 rounded-2xl bg-card border border-border p-5 sm:p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-bold text-foreground">Dein Abend</h2>
            <button
              type="button"
              onClick={() => {
                setAdvisorMode("crew");
                setShowNewGroup(!showNewGroup);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-primary-text" aria-hidden="true" />
              <span>CineCrew anlegen</span>
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAskAi();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label htmlFor="ai-evening-prompt" className="block text-xs font-semibold text-foreground">
                Beschreib deinen Abend
              </label>
              <textarea
                id="ai-evening-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Zum Beispiel: Ein spannender Science-Fiction-Film mit starken Figuren, aber nicht zu düster …"
                rows={5}
                className="w-full min-h-[136px] resize-none rounded-xl bg-input border border-border focus:border-primary p-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none transition"
              />
            </div>

            {/* Prompt Starter Buttons */}
            <div className="flex flex-wrap gap-1.5">
              {PROMPT_STARTERS.map((starter) => (
                <button
                  key={starter.label}
                  type="button"
                  onClick={() => setPrompt(starter.prompt)}
                  className="px-3 py-1.5 rounded-lg bg-background hover:bg-muted border border-border text-xs font-medium text-foreground transition cursor-pointer"
                >
                  {starter.label}
                </button>
              ))}
            </div>

            {/* Minimal Mode Tabs: Allein / Mit CineCrew */}
            <div className="space-y-3">
              <div className="inline-flex items-center p-1 rounded-xl bg-muted border border-border">
                <button
                  type="button"
                  onClick={() => setAdvisorMode("solo")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    advisorMode === "solo"
                      ? "bg-card text-foreground shadow-xs border border-border"
                      : "text-muted-foreground hover:text-foreground border border-transparent"
                  }`}
                >
                  Allein
                </button>
                <button
                  type="button"
                  onClick={() => setAdvisorMode("crew")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    advisorMode === "crew"
                      ? "bg-card text-foreground shadow-xs border border-border"
                      : "text-muted-foreground hover:text-foreground border border-transparent"
                  }`}
                >
                  Mit CineCrew
                </button>
              </div>

              {advisorMode === "crew" && (
                <div className="p-3 rounded-xl bg-muted/60 border border-border space-y-2.5 animate-in fade-in">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {friendGroups.map((grp) => (
                      <button
                        key={grp.id}
                        type="button"
                        onClick={() => applyGroupToPrompt(grp.name, grp.memberNames)}
                        className="px-2.5 py-1 rounded-lg bg-primary-soft border border-primary/30 text-primary-text text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                      >
                        <span>{grp.emoji}</span>
                        <span>@{grp.name}</span>
                      </button>
                    ))}
                    {communityData.friends
                      .filter((f) => !isMe(f.name))
                      .map((friend) => {
                        const active = selectedFriends.includes(friend.name);
                        return (
                          <button
                            key={friend.id}
                            type="button"
                            onClick={() => toggleFriendChip(friend.name)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                              active
                                ? "bg-primary text-primary-foreground border-primary font-semibold"
                                : "bg-card text-foreground border-border hover:border-border-strong"
                            }`}
                          >
                            @{friend.name} {active && "✓"}
                          </button>
                        );
                      })}
                    {friendGroups.length === 0 && communityData.friends.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        Noch keine Freunde oder CineCrews verknüpft.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-sm transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
              <span>{loading ? "CineBot analysiert…" : "Empfehlungen finden"}</span>
            </button>
          </form>

          {/* Inline Quick Group Creator */}
          {showNewGroup && (
            <form
              onSubmit={handleCreateQuickGroup}
              className="p-4 rounded-xl bg-muted/60 border border-border space-y-3 animate-in fade-in"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Neue CineCrew speichern</span>
                <button
                  type="button"
                  onClick={() => setShowNewGroup(false)}
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                  aria-label="Schließen"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Gruppenname (z. B. WG-Couch)…"
                  className="flex-1 px-3 py-2 rounded-lg bg-input border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                  required
                />
                <div className="flex items-center gap-1">
                  {["🛋️", "🍿", "✨", "🍻", "🔥"].map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setNewGroupEmoji(em)}
                      className={`w-8 h-8 rounded-lg text-sm border cursor-pointer ${
                        newGroupEmoji === em
                          ? "bg-primary-soft border-primary"
                          : "bg-card border-border"
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
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
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                        active
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-foreground border-border"
                      }`}
                    >
                      @{f.name}
                    </button>
                  );
                })}
                <button
                  type="submit"
                  className="ml-auto px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground font-bold text-xs cursor-pointer"
                >
                  Speichern
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Column: Empty / Loading / Results */}
        <div className="lg:col-span-7 space-y-4">
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/35 text-xs sm:text-sm text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          {loading ? (
            <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-bold text-foreground">CineBot sucht passende Titel…</p>
                <p className="text-xs text-muted-foreground">
                  Bewertungen, Laufzeiten, No-Gos und Streaming-Abos werden abgeglichen.
                </p>
              </div>
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-24 rounded-xl bg-muted border border-border animate-pulse"
                  />
                ))}
              </div>
            </div>
          ) : !parsedIntent ? (
            <div className="rounded-2xl bg-card/50 border border-dashed border-border min-h-[380px] flex flex-col items-center justify-center text-center p-8 space-y-3">
              <div className="w-11 h-11 rounded-xl bg-muted border border-border flex items-center justify-center text-primary-text">
                <Sparkles className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="text-base font-bold text-foreground">Dein nächster Film wartet</h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-sm leading-relaxed">
                Je genauer du deinen Abend beschreibst, desto persönlicher wird die Auswahl.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl bg-card border border-border p-5 sm:p-6 space-y-5 shadow-xs animate-in fade-in">
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-foreground">
                    CineBot empfiehlt dir
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    {parsedIntent.detectedGroupName && (
                      <span className="px-2 py-0.5 rounded-md bg-primary-soft text-primary-text font-semibold">
                        {parsedIntent.detectedGroupName}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted border border-border text-muted-foreground font-medium">
                      <Users className="w-3 h-3" />
                      {parsedIntent.detectedParticipants.join(", ")}
                    </span>
                    {parsedIntent.maxRuntimeMinutes && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted border border-border text-muted-foreground font-medium">
                        <Clock className="w-3 h-3" />
                        Max. {parsedIntent.maxRuntimeMinutes} Min.
                      </span>
                    )}
                  </div>
                </div>
                {resultSummary && (
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {resultSummary}
                  </p>
                )}
              </div>

              {picks.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4">
                  Alle gefundenen Titel hast du bereits gesehen. Versuche eine andere Beschreibung.
                </p>
              ) : (
                <div className="space-y-3">
                  {picks.map((pick) => {
                    const mySubs = pick.availableProvidersDE.filter((p) => p.isMySub);
                    const displayProviders =
                      mySubs.length > 0 ? mySubs : pick.availableProvidersDE.slice(0, 3);
                    const currentUserIdentity = {
                      userId: myUserId,
                      name: session?.user?.name || myName,
                      email: myEmail,
                    };
                    const isMatchUser = (m: any) =>
                      isCurrentUserMatch(currentUserIdentity, {
                        userId: m.userId,
                        userName: m.userName,
                        userEmail: m.userEmail,
                      });

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
                        className="rounded-xl border border-border bg-background/60 p-3.5 hover:border-primary/40 transition space-y-3"
                      >
                        <div className="flex items-start gap-3.5">
                          {/* Poster */}
                          <button
                            type="button"
                            onClick={() =>
                              openMediaModal({
                                id: pick.id,
                                mediaType: pick.mediaType,
                                title: pick.title,
                                posterPath: pick.posterPath,
                                genreIds: pick.genreIds,
                              })
                            }
                            className="relative w-14 h-20 rounded-lg overflow-hidden bg-muted border border-border flex-shrink-0 cursor-pointer"
                          >
                            {pick.posterPath ? (
                              <Image
                                src={`https://image.tmdb.org/t/p/w342${pick.posterPath}`}
                                alt={pick.title}
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

                          {/* Info */}
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div className="min-w-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openMediaModal({
                                      id: pick.id,
                                      mediaType: pick.mediaType,
                                      title: pick.title,
                                      posterPath: pick.posterPath,
                                      genreIds: pick.genreIds,
                                    })
                                  }
                                  className="text-left text-sm sm:text-base font-bold text-foreground hover:text-primary-text transition cursor-pointer"
                                >
                                  {pick.title}
                                </button>
                                <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-1.5 mt-0.5">
                                  <span>{pick.releaseYear}</span>
                                  {pick.genres[0] && (
                                    <>
                                      <span>·</span>
                                      <span>{pick.genres[0].name}</span>
                                    </>
                                  )}
                                  {pick.runtimeMinutes && (
                                    <>
                                      <span>·</span>
                                      <span>{pick.runtimeMinutes} Min.</span>
                                    </>
                                  )}
                                  <span>·</span>
                                  <span className="inline-flex items-center gap-0.5 text-primary-text font-semibold">
                                    <Star className="w-3 h-3 fill-current" />
                                    {pick.voteAverage}
                                  </span>
                                </p>
                              </div>

                              <span className="px-2 py-0.5 rounded-md bg-primary-soft text-primary-text font-bold text-[11px] flex-shrink-0">
                                {pick.matchScore}% Match
                              </span>
                            </div>

                            {pick.seriesNote && (
                              <p className="text-[11px] text-primary-text font-medium">
                                {pick.seriesNote}
                              </p>
                            )}

                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {pick.groupPitch}
                            </p>

                            {displayProviders.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-0.5">
                                {displayProviders.map((p) => (
                                  <span
                                    key={p.providerId}
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                                      p.isMySub
                                        ? "bg-primary-soft border-primary/35 text-primary-text"
                                        : "bg-muted border-border text-muted-foreground"
                                    }`}
                                  >
                                    <span>{p.providerName}</span>
                                    {p.isMySub && <span>✓</span>}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Per-person reasons */}
                        {pick.perPersonReasons.length > 0 && (
                          <div className="pt-2 border-t border-border space-y-1">
                            {pick.perPersonReasons.map((pr, idx) => (
                              <p key={idx} className="text-[11px] text-muted-foreground">
                                <span className="font-semibold text-foreground">
                                  @{pr.personName}:
                                </span>{" "}
                                {pr.reason}
                              </p>
                            ))}
                          </div>
                        )}

                        {/* Row Actions */}
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() =>
                              updateMediaStatus({
                                tmdbId: pick.id,
                                mediaType: pick.mediaType,
                                title: pick.title,
                                posterPath: pick.posterPath,
                                releaseYear: pick.releaseYear,
                                status: isOnWatchlist ? "NONE" : "WATCHLIST",
                              })
                            }
                            aria-label={
                              isOnWatchlist
                                ? `${pick.title} von Merkliste entfernen`
                                : `${pick.title} zur Merkliste hinzufügen`
                            }
                            title={isOnWatchlist ? "Auf Merkliste" : "Auf Merkliste setzen"}
                            className={`p-2 rounded-lg border transition cursor-pointer ${
                              isOnWatchlist
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-card hover:bg-muted text-muted-foreground hover:text-foreground border-border"
                            }`}
                          >
                            <Bookmark className={`w-4 h-4 ${isOnWatchlist ? "fill-current" : ""}`} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openRatingModal({
                                tmdbId: pick.id,
                                mediaType: pick.mediaType,
                                title: pick.title,
                                posterPath: pick.posterPath,
                                releaseYear: pick.releaseYear,
                                isWatched,
                              })
                            }
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                              isWatched
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/35"
                                : "bg-card hover:bg-muted text-foreground border-border"
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{isWatched ? "Gesehen" : "Bewerten"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openMediaModal({
                                id: pick.id,
                                mediaType: pick.mediaType,
                                title: pick.title,
                                posterPath: pick.posterPath,
                                genreIds: pick.genreIds,
                              })
                            }
                            className="px-3 py-1.5 rounded-lg bg-card hover:bg-muted text-foreground border border-border text-xs font-semibold transition cursor-pointer"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Context Strip (Berücksichtigt werden) */}
      <div className="space-y-2.5 pt-2">
        <p className="text-xs font-semibold text-muted-foreground">Berücksichtigt werden</p>
        <div className="flex flex-wrap gap-2">
          <span className="px-2.5 py-1 rounded-full bg-muted border border-border text-xs font-medium text-foreground">
            Deine Bewertungen
          </span>
          <span className="px-2.5 py-1 rounded-full bg-muted border border-border text-xs font-medium text-foreground">
            Watchlist
          </span>
          <span className="px-2.5 py-1 rounded-full bg-muted border border-border text-xs font-medium text-foreground">
            Freundes-Feed
          </span>
          <span className="px-2.5 py-1 rounded-full bg-muted border border-border text-xs font-medium text-foreground">
            Streaming-Abos ({userSubscriptions.length})
          </span>
        </div>
      </div>
    </section>
  );
}
