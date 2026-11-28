"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import {
  Users,
  UsersRound,
  Check,
  UserPlus,
  Plus,
  Trash2,
  Wand2,
  Search,
  Clock,
  Shield,
  X,
  AlertCircle,
  Pencil,
  ChevronRight,
  Mail,
} from "lucide-react";
import { POPULAR_SUBSCRIPTIONS } from "@/lib/tmdb";
import { isValidEmailAddress, SUPER_ADMIN_EMAIL } from "@/lib/constants";
import { isCurrentUserMatch, isSamePerson } from "@/lib/auth-match";
import { useMedia, FriendGroup } from "@/components/MediaContext";
import { PullToRefresh } from "@/components/PullToRefresh";
import { BottomSheetDialog } from "@/components/BottomSheetDialog";
import { FriendInviteSection } from "@/components/FriendInviteSection";
import { RecommendationsFeed } from "@/components/RecommendationsFeed";
import { CineCrewForm } from "@/components/CineCrewForm";
import Link from "next/link";
import Image from "next/image";

type SocialTab = "feed" | "contacts" | "crews" | "find";
type FindSubTab = "search" | "invite";

function FriendsContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const {
    communityData,
    friendGroups,
    addFriendGroup,
    updateFriendGroup,
    deleteFriendGroup,
    currentUserAvatar,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    searchUsers,
    refreshCommunity,
    showToast,
    confirmDialog,
  } = useMedia();

  const myUserId = (session?.user as any)?.id || "";
  const myName = session?.user?.name || "Ich";
  const myEmail = session?.user?.email?.toLowerCase() || "";

  const isMe = (name?: string | null) => isSamePerson(name, session?.user?.name || myName);

  const urlTab = searchParams.get("tab");
  const [socialTab, setSocialTab] = useState<SocialTab>(() => {
    if (urlTab === "contacts" || urlTab === "crews" || urlTab === "find" || urlTab === "feed") {
      return urlTab;
    }
    return "feed";
  });

  useEffect(() => {
    if (urlTab === "contacts" || urlTab === "crews" || urlTab === "find" || urlTab === "feed") {
      setSocialTab(urlTab);
    }
  }, [urlTab]);

  // Contacts filter
  const [contactFilter, setContactFilter] = useState("");

  // Find friends state
  const [findSubTab, setFindSubTab] = useState<FindSubTab>("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [prefillInviteEmail, setPrefillInviteEmail] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [submittingTarget, setSubmittingTarget] = useState<string | null>(null);
  const [removingFriendId, setRemovingFriendId] = useState<string | null>(null);

  // CineCrews state
  const [showGroupCreator, setShowGroupCreator] = useState(false);
  const [editingGroup, setEditingGroup] = useState<FriendGroup | null>(null);

  // Debounced user search
  useEffect(() => {
    const q = searchQuery.trim().replace(/^@+/, "");
    if (q.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const users = await searchUsers(q);
        setSearchResults(users);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, searchUsers]);

  const handleSendRequest = async (target: string) => {
    if (!target.trim()) return;
    setSubmittingTarget(target);
    setFeedback(null);

    const res = await sendFriendRequest(target);
    setSubmittingTarget(null);

    if (res.success) {
      setFeedback({ type: "success", message: res.message || "Freundschaftsanfrage gesendet!" });
      const clean = searchQuery.trim().replace(/^@+/, "");
      if (clean.length >= 2) {
        const users = await searchUsers(clean);
        setSearchResults(users);
      }
    } else {
      setFeedback({ type: "error", message: res.error || "Fehler beim Senden der Anfrage." });
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    const res = await acceptFriendRequest(requestId);
    if (!res.success) {
      setFeedback({ type: "error", message: res.error || "Fehler beim Annehmen der Anfrage." });
    } else {
      setFeedback({ type: "success", message: "Freundschaftsanfrage angenommen!" });
      const clean = searchQuery.trim().replace(/^@+/, "");
      if (clean.length >= 2) {
        const users = await searchUsers(clean);
        setSearchResults(users);
      }
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    const res = await declineFriendRequest(requestId);
    if (!res.success) {
      setFeedback({ type: "error", message: res.error || "Fehler beim Ablehnen der Anfrage." });
    } else {
      setFeedback({ type: "success", message: "Anfrage abgelehnt." });
    }
  };

  const handleRemoveFriend = async (friendId: string, friendName: string) => {
    const confirmed = await confirmDialog({
      title: "Freundschaft beenden?",
      message: `Möchtest du die Freundschaft mit ${friendName} wirklich beenden?`,
      confirmLabel: "Freund entfernen",
      dangerous: true,
    });
    if (!confirmed) return;
    setRemovingFriendId(friendId);
    const res = await removeFriend(friendId);
    setRemovingFriendId(null);
    if (!res.success) {
      setFeedback({ type: "error", message: res.error || "Fehler beim Entfernen." });
    } else {
      setFeedback({ type: "success", message: `Freundschaft mit ${friendName} beendet.` });
    }
  };

  const handleCreateGroup = (data: { name: string; emoji: string; memberNames: string[] }) => {
    addFriendGroup(data.name, data.emoji, data.memberNames);
    setShowGroupCreator(false);
    setFeedback({
      type: "success",
      message: `CineCrew „${data.name}“ angelegt!`,
    });
  };

  const handleSaveEdit = (data: { name: string; emoji: string; memberNames: string[] }) => {
    if (!editingGroup) return;
    updateFriendGroup(editingGroup.id, data.name, data.emoji, data.memberNames);
    setFeedback({
      type: "success",
      message: `CineCrew „${data.name}“ aktualisiert!`,
    });
    setEditingGroup(null);
  };

  const getSubMeta = (key: string) =>
    POPULAR_SUBSCRIPTIONS.find((s) => s.key === key) || {
      key,
      label: key,
      color: "#94a3b8",
    };

  const isAdmin =
    session?.user?.email?.toLowerCase() === SUPER_ADMIN_EMAIL ||
    (session?.user as any)?.role === "ADMIN";

  const pendingReceived = communityData.friendRequests?.pendingReceived || [];
  const pendingSent = communityData.friendRequests?.pendingSent || [];
  const myFriends = communityData.friends || [];

  const filteredFriends = useMemo(() => {
    const q = contactFilter.trim().toLowerCase();
    if (!q) return myFriends;
    return myFriends.filter(
      (f) => f.name?.toLowerCase().includes(q) || f.email?.toLowerCase().includes(q)
    );
  }, [myFriends, contactFilter]);

  const openFindPeople = (sub: FindSubTab = "search", emailPrefill = "") => {
    setSocialTab("find");
    setFindSubTab(sub);
    if (emailPrefill) setPrefillInviteEmail(emailPrefill);
  };

  return (
    <PullToRefresh
      onRefresh={async () => {
        await refreshCommunity();
        showToast("Freunde aktualisiert!", { type: "success" });
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Open Editorial Header (Flowstep Freunden) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-text">
              Dein Filmkreis
            </p>
            <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
              Freunde
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Seht, bewertet und plant gemeinsam. Nur direkt befreundete Kontakte sehen deine Listen und Empfehlungen.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => openFindPeople("search")}
              className="inline-flex items-center gap-2 min-h-[42px] px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs transition shadow-sm cursor-pointer"
            >
              <Search className="w-4 h-4" aria-hidden="true" />
              <span>Freunde finden</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSocialTab("crews");
                setShowGroupCreator(true);
              }}
              className="inline-flex items-center gap-2 min-h-[42px] px-4 py-2 rounded-xl bg-card hover:bg-muted text-foreground border border-border font-semibold text-xs transition cursor-pointer"
            >
              <UsersRound className="w-4 h-4" aria-hidden="true" />
              <span>CineCrew erstellen</span>
            </button>
            {isAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 min-h-[42px] px-3.5 py-2 rounded-xl bg-card hover:bg-muted text-primary-text border border-border font-semibold text-xs transition"
              >
                <Shield className="w-4 h-4" aria-hidden="true" />
                <span>Admin</span>
              </Link>
            )}
          </div>
        </div>

        {/* Feedback Banner */}
        {feedback && (
          <div
            className={`p-4 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 animate-in fade-in ${
              feedback.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-700 dark:text-emerald-300"
                : "bg-rose-500/10 border-rose-500/35 text-rose-700 dark:text-rose-300"
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === "success" ? (
                <Check className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-muted-foreground hover:text-foreground p-1 cursor-pointer"
              aria-label="Hinweis schließen"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Pending Incoming Friend Requests */}
        {pendingReceived.length > 0 && (
          <div className="p-5 rounded-2xl bg-card border border-primary/40 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-primary-text">
              <UserPlus className="w-4 h-4" aria-hidden="true" />
              <h2 className="text-sm font-bold">
                Ausstehende Freundschaftsanfragen ({pendingReceived.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pendingReceived.map((req) => (
                <div
                  key={req.requestId}
                  className="p-3.5 rounded-xl bg-muted/60 border border-border flex flex-wrap sm:flex-nowrap items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {req.user.image ? (
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border border-border flex-shrink-0">
                        <Image
                          src={req.user.image}
                          alt={req.user.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary-soft text-primary-text flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {req.user.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                        {req.user.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">{req.user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleAcceptRequest(req.requestId)}
                      className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Annehmen</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeclineRequest(req.requestId)}
                      className="px-2.5 py-1.5 rounded-lg bg-card hover:bg-muted text-muted-foreground text-xs font-semibold border border-border transition cursor-pointer"
                    >
                      Ablehnen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Segmented Tabs */}
        <div
          role="tablist"
          aria-label="Freunde-Bereiche"
          className="inline-flex items-center gap-1 p-1 rounded-xl bg-muted border border-border overflow-x-auto max-w-full"
        >
          {[
            { id: "feed" as const, label: "Feed" },
            { id: "contacts" as const, label: `Kontakte (${myFriends.length})` },
            { id: "crews" as const, label: `CineCrews (${friendGroups.length})` },
            { id: "find" as const, label: "Freunde finden" },
          ].map((tab) => {
            const active = socialTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSocialTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
                  active
                    ? "bg-card text-foreground shadow-sm border border-border"
                    : "text-muted-foreground hover:text-foreground border border-transparent"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: FEED (Flowstep 2-Column Layout) */}
        {socialTab === "feed" && (
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8 items-start">
            <RecommendationsFeed
              variant="compact"
              defaultOnlyStreamable={false}
              onFindFriends={() => openFindPeople("search")}
            />

            {/* Right Sidebar (Flowstep: Deine CineCrews + Noch niemanden gefunden?) */}
            <aside className="space-y-4">
              <div className="p-5 rounded-2xl bg-card border border-border space-y-4 shadow-xs">
                <h3 className="text-sm font-bold text-foreground">Deine CineCrews</h3>
                {friendGroups.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Noch keine Gruppen angelegt. Erstelle eine Crew für gemeinsame Filmabende.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {friendGroups.slice(0, 4).map((grp, idx) => (
                      <Link
                        key={`crew-${idx}`}
                        href={`/recommendations?tab=ai&prompt=${encodeURIComponent(
                          `Heute will ich mit ${grp.name} einen Film schauen`
                        )}`}
                        className="flex items-center justify-between gap-3 group"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground group-hover:text-primary-text transition truncate">
                            {grp.emoji} {grp.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {grp.memberNames.length} Mitglieder
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      </Link>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setSocialTab("crews")}
                  className="w-full py-2 px-3 rounded-xl bg-background hover:bg-muted border border-border text-xs font-semibold text-foreground transition cursor-pointer"
                >
                  Alle CineCrews
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-card border border-border space-y-3 shadow-xs">
                <h3 className="text-sm font-bold text-foreground">Noch niemanden gefunden?</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Lade Freunde direkt per E-Mail ein und teile eure Watchlists.
                </p>
                <button
                  type="button"
                  onClick={() => openFindPeople("invite")}
                  className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold transition cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Per E-Mail einladen</span>
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* TAB 2: KONTAKTE */}
        {socialTab === "contacts" && (
          <div className="max-w-3xl space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-primary-text absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={contactFilter}
                onChange={(e) => setContactFilter(e.target.value)}
                placeholder="Kontakte filtern (Name oder E-Mail)…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-input border border-border focus:border-primary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>

            {filteredFriends.length === 0 ? (
              <div className="p-10 rounded-2xl bg-card border border-dashed border-border text-center space-y-3">
                <Users className="w-8 h-8 text-muted-foreground mx-auto" />
                <p className="text-sm font-bold text-foreground">
                  {myFriends.length === 0
                    ? "Noch keine Freunde vernetzt"
                    : "Kein Kontakt passt zu deiner Suche"}
                </p>
                <button
                  type="button"
                  onClick={() => openFindPeople("search")}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold cursor-pointer"
                >
                  Freunde finden
                </button>
              </div>
            ) : (
              <div className="rounded-2xl bg-card border border-border divide-y divide-border overflow-hidden shadow-xs">
                {filteredFriends.map((friend) => {
                  const friendIsMe = isCurrentUserMatch(
                    { userId: myUserId, name: myName, email: myEmail },
                    { userId: friend.id, userName: friend.name, userEmail: friend.email }
                  );
                  const friendImg = friendIsMe ? currentUserAvatar || friend.image : friend.image;
                  const isRemoving = removingFriendId === friend.id;

                  return (
                    <div
                      key={friend.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        {friendImg ? (
                          <div className="relative w-11 h-11 rounded-full overflow-hidden border border-border flex-shrink-0">
                            <Image
                              src={friendImg}
                              alt={friend.name}
                              fill
                              sizes="44px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-primary-soft text-primary-text flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {friend.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/friends/${friend.id}`}
                              className="text-sm font-bold text-foreground hover:text-primary-text transition truncate"
                            >
                              {friend.name}
                            </Link>
                            {friend.role === "ADMIN" && (
                              <span className="text-[10px] bg-primary-soft text-primary-text px-2 py-0.5 rounded-full font-bold">
                                Admin
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {friend.watchedCount} gesehen · {friend.watchlistCount} Watchlist ·{" "}
                            {friend.recommendationsCount} Tipps
                          </p>
                          {friend.subscriptions && friend.subscriptions.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {friend.subscriptions.map((subKey: string) => {
                                const meta = getSubMeta(subKey);
                                return (
                                  <span
                                    key={subKey}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] bg-muted text-muted-foreground border border-border"
                                  >
                                    <span
                                      className="w-1.5 h-1.5 rounded-full"
                                      style={{ backgroundColor: meta.color }}
                                    />
                                    <span>{meta.label}</span>
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                        <Link
                          href={`/friends/${friend.id}`}
                          className="px-3 py-1.5 rounded-lg bg-background hover:bg-muted border border-border text-xs font-semibold text-foreground transition"
                        >
                          Profil
                        </Link>
                        {!friendIsMe && (
                          <button
                            type="button"
                            disabled={isRemoving}
                            onClick={() => handleRemoveFriend(friend.id, friend.name)}
                            className="px-3 py-1.5 rounded-lg bg-background hover:bg-rose-500/10 border border-border hover:border-rose-500/40 text-xs font-semibold text-muted-foreground hover:text-rose-500 transition cursor-pointer"
                          >
                            Entfernen
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CINECREWS */}
        {socialTab === "crews" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-foreground">
                  Deine Filmabend-Gruppen (CineCrews)
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Erstelle feste Gruppen aus deinen Kontakten für gemeinsame KI-Filmabende.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowGroupCreator(!showGroupCreator)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs transition self-start cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Neue CineCrew</span>
              </button>
            </div>

            {showGroupCreator && (
              <CineCrewForm
                mode="create"
                surface="card"
                friends={myFriends}
                currentUserName={session?.user?.name || myName}
                onSubmit={handleCreateGroup}
                onCancel={() => setShowGroupCreator(false)}
              />
            )}

            {friendGroups.length === 0 ? (
              <div className="p-10 rounded-2xl bg-card border border-dashed border-border text-center space-y-2">
                <p className="text-sm font-bold text-foreground">
                  Noch keine CineCrews angelegt.
                </p>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Klicke oben auf „Neue CineCrew“, um Gruppen für gemeinsame Filmabende anzulegen.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {friendGroups.map((grp) => (
                  <div
                    key={grp.id}
                    className="p-5 rounded-2xl bg-card border border-border flex flex-col justify-between gap-4 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-2xl">{grp.emoji}</span>
                        <div className="min-w-0">
                          <h3 className="text-base font-bold text-foreground truncate">
                            {grp.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {grp.memberNames.length} Mitglieder
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingGroup(grp)}
                          title="Gruppe bearbeiten"
                          className="text-muted-foreground hover:text-primary-text transition p-1.5 rounded-lg hover:bg-muted cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            const confirmed = await confirmDialog({
                              title: "Gruppe löschen?",
                              message: `Gruppe „${grp.name}“ wirklich löschen?`,
                              confirmLabel: "Löschen",
                              dangerous: true,
                            });
                            if (confirmed) deleteFriendGroup(grp.id);
                          }}
                          title="Gruppe löschen"
                          className="text-muted-foreground hover:text-rose-500 transition p-1.5 rounded-lg hover:bg-muted cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {grp.memberNames.map((mName) => {
                        const isCurrentUser = isMe(mName);
                        return (
                          <span
                            key={mName}
                            className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                              isCurrentUser
                                ? "bg-primary-soft text-primary-text font-semibold"
                                : "bg-muted text-foreground"
                            }`}
                          >
                            @{isCurrentUser ? `${session?.user?.name || mName} (Du)` : mName}
                          </span>
                        );
                      })}
                    </div>

                    <Link
                      href={`/recommendations?tab=ai&prompt=${encodeURIComponent(
                        `Heute will ich mit ${grp.name} einen Film schauen`
                      )}`}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold transition"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Mit @{grp.name} matchen</span>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: FREUNDE FINDEN (Modeled on Flowstep Leute finden) */}
        {socialTab === "find" && (
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-muted border border-border">
              <button
                type="button"
                onClick={() => setFindSubTab("search")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  findSubTab === "search"
                    ? "bg-card text-foreground shadow-xs border border-border"
                    : "text-muted-foreground hover:text-foreground border border-transparent"
                }`}
              >
                Auf CineCircle suchen
              </button>
              <button
                type="button"
                onClick={() => setFindSubTab("invite")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  findSubTab === "invite"
                    ? "bg-card text-foreground shadow-xs border border-border"
                    : "text-muted-foreground hover:text-foreground border border-transparent"
                }`}
              >
                E-Mail einladen
              </button>
            </div>

            {findSubTab === "search" ? (
              <div className="space-y-4">
                <div>
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                      <Search className="w-5 h-5 text-primary-text absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Name, @Handle oder E-Mail suchen"
                        className="w-full h-12 pl-11 pr-4 rounded-xl bg-card border border-border focus:border-primary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={!searchQuery.trim() || submittingTarget === searchQuery.trim()}
                      onClick={() => handleSendRequest(searchQuery.trim())}
                      className="h-12 px-5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs transition disabled:opacity-50 inline-flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>
                        {submittingTarget === searchQuery.trim() ? "Wird gesendet..." : "Anfrage senden"}
                      </span>
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Suche nach Namen oder E-Mail-Adresse (mind. 2 Zeichen)
                  </p>
                </div>

                {/* Search Results */}
                {isSearching && (
                  <div className="p-6 rounded-xl bg-card border border-border text-xs text-muted-foreground animate-pulse">
                    Suche nach Nutzern…
                  </div>
                )}

                {!isSearching && searchResults.length > 0 && (
                  <div className="rounded-xl bg-card border border-border divide-y divide-border overflow-hidden">
                    {searchResults.map((user) => {
                      const isSubmitting =
                        submittingTarget === user.email || submittingTarget === user.id;

                      return (
                        <div
                          key={user.id}
                          className="p-4 flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            {user.image ? (
                              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-border flex-shrink-0">
                                <Image
                                  src={user.image}
                                  alt={user.name}
                                  fill
                                  sizes="40px"
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-muted text-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {user.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">
                                {user.name}
                              </p>
                              {user.email && (
                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                              )}
                              {typeof user.mutualWatchedCount === "number" &&
                                user.mutualWatchedCount > 0 && (
                                  <p className="text-[11px] text-primary-text font-medium mt-0.5">
                                    {user.mutualWatchedCount} gemeinsame{" "}
                                    {user.mutualWatchedCount === 1 ? "Film/Serie" : "Filme & Serien"}
                                  </p>
                                )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {user.relationship === "FRIENDS" ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                                <Check className="w-3.5 h-3.5" />
                                <span>Befreundet</span>
                              </span>
                            ) : user.relationship === "REQUEST_SENT" ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-semibold border border-border">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Gesendet</span>
                              </span>
                            ) : user.relationship === "REQUEST_RECEIVED" && user.requestId ? (
                              <button
                                type="button"
                                onClick={() => handleAcceptRequest(user.requestId)}
                                className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-bold text-xs cursor-pointer"
                              >
                                Annehmen
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => handleSendRequest(user.id)}
                                className="px-3 py-1.5 rounded-lg bg-background hover:bg-muted border border-border text-foreground font-semibold text-xs transition disabled:opacity-50 cursor-pointer"
                              >
                                {isSubmitting ? "..." : "Hinzufügen"}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {!isSearching &&
                  searchQuery.trim().replace(/^@+/, "").length >= 2 &&
                  searchResults.length === 0 && (
                    <div className="p-6 rounded-xl bg-card border border-border space-y-3">
                      <p className="text-sm font-semibold text-foreground">
                        Kein passendes CineCircle-Konto für „{searchQuery.trim()}“ gefunden.
                      </p>
                      {isValidEmailAddress(searchQuery.trim()) && (
                        <button
                          type="button"
                          onClick={() => openFindPeople("invite", searchQuery.trim())}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold transition cursor-pointer"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>„{searchQuery.trim()}“ per E-Mail einladen →</span>
                        </button>
                      )}
                    </div>
                  )}

                {pendingSent.length > 0 && (
                  <div className="pt-2 text-xs text-muted-foreground flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1 font-semibold text-foreground">
                      <Clock className="w-3.5 h-3.5 text-primary-text" />
                      <span>Ausstehende Anfragen:</span>
                    </span>
                    {pendingSent.map((s) => (
                      <span
                        key={s.requestId}
                        className="px-2.5 py-1 rounded-lg bg-card border border-border text-xs text-foreground"
                      >
                        @{s.user.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <FriendInviteSection initialEmail={prefillInviteEmail} />
            )}
          </div>
        )}

        {/* Edit Group Modal (uses existing BottomSheetDialog dark surface) */}
        {editingGroup && (
          <BottomSheetDialog
            isOpen={Boolean(editingGroup)}
            onClose={() => setEditingGroup(null)}
            ariaLabel="Gruppe bearbeiten"
            maxWidthClass="max-w-lg"
            panelClassName="bg-slate-950 border border-slate-800 sm:rounded-3xl p-5 sm:p-6 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:pb-6 shadow-2xl space-y-5 text-white max-h-[90dvh] overflow-y-auto overscroll-contain"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">CineCrew bearbeiten</h3>
                  <p className="text-xs text-slate-400">Passe Name, Icon und Mitglieder an</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingGroup(null)}
                aria-label="Schließen"
                className="min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <CineCrewForm
              key={editingGroup.id}
              mode="edit"
              surface="dark-sheet"
              initialName={editingGroup.name}
              initialEmoji={editingGroup.emoji || "🛋️"}
              initialMembers={editingGroup.memberNames}
              friends={myFriends}
              currentUserName={session?.user?.name || myName}
              onSubmit={handleSaveEdit}
              onCancel={() => setEditingGroup(null)}
              onDelete={async () => {
                const confirmed = await confirmDialog({
                  title: "Gruppe löschen?",
                  message: `Möchtest du die Gruppe „${editingGroup.name}“ wirklich löschen?`,
                  confirmLabel: "Gruppe löschen",
                  dangerous: true,
                });
                if (confirmed) {
                  deleteFriendGroup(editingGroup.id);
                  setEditingGroup(null);
                }
              }}
            />
          </BottomSheetDialog>
        )}
      </div>
    </PullToRefresh>
  );
}

export default function FriendsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-muted-foreground animate-pulse">
          Lade Freunde…
        </div>
      }
    >
      <FriendsContent />
    </Suspense>
  );
}
