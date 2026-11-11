"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Users,
  Tv,
  Check,
  UserPlus,
  Plus,
  Trash2,
  Wand2,
  Search,
  UserCheck,
  Clock,
  Shield,
  X,
  AlertCircle,
  Sparkles,
  Pencil,
} from "lucide-react";
import { POPULAR_SUBSCRIPTIONS } from "@/lib/tmdb";
import { useMedia, FriendGroup } from "@/components/MediaContext";
import Link from "next/link";
import Image from "next/image";

export default function FriendsPage() {
  const { data: session } = useSession();
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
  } = useMedia();

  const myName = session?.user?.name || "Ich";

  // CineCrews state
  const [showGroupCreator, setShowGroupCreator] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupEmoji, setGroupEmoji] = useState("🛋️");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [newCustomMemberInput, setNewCustomMemberInput] = useState("");

  // Edit Group Modal state
  const [editingGroup, setEditingGroup] = useState<FriendGroup | null>(null);
  const [editGroupName, setEditGroupName] = useState("");
  const [editGroupEmoji, setEditGroupEmoji] = useState("🛋️");
  const [editSelectedMembers, setEditSelectedMembers] = useState<string[]>([]);
  const [editCustomMemberInput, setEditCustomMemberInput] = useState("");

  // Initialize selectedMembers with current user when available
  useEffect(() => {
    if (session?.user?.name && selectedMembers.length === 0) {
      setSelectedMembers([session.user.name]);
    }
  }, [session?.user?.name]);

  // Friend search & add state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [submittingTarget, setSubmittingTarget] = useState<string | null>(null);
  const [removingFriendId, setRemovingFriendId] = useState<string | null>(null);

  // Debounced search
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
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
  }, [searchQuery]);

  const handleSendRequest = async (target: string) => {
    if (!target.trim()) return;
    setSubmittingTarget(target);
    setFeedback(null);

    const res = await sendFriendRequest(target);
    setSubmittingTarget(null);

    if (res.success) {
      setFeedback({ type: "success", message: res.message || "Freundschaftsanfrage erfolgreich gesendet!" });
      // Refresh search results
      if (searchQuery.trim().length >= 2) {
        const users = await searchUsers(searchQuery.trim());
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
      if (searchQuery.trim().length >= 2) {
        const users = await searchUsers(searchQuery.trim());
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
      if (searchQuery.trim().length >= 2) {
        const users = await searchUsers(searchQuery.trim());
        setSearchResults(users);
      }
    }
  };

  const handleRemoveFriend = async (friendId: string, friendName: string) => {
    if (!confirm(`Möchtest du die Freundschaft mit ${friendName} wirklich beenden?`)) return;
    setRemovingFriendId(friendId);
    const res = await removeFriend(friendId);
    setRemovingFriendId(null);
    if (!res.success) {
      setFeedback({ type: "error", message: res.error || "Fehler beim Entfernen." });
    } else {
      setFeedback({ type: "success", message: `Freundschaft mit ${friendName} beendet.` });
      if (searchQuery.trim().length >= 2) {
        const users = await searchUsers(searchQuery.trim());
        setSearchResults(users);
      }
    }
  };

  const toggleMember = (name: string) => {
    setSelectedMembers((prev) =>
      prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name]
    );
  };

  const handleAddNewCustomMember = () => {
    const trimmed = newCustomMemberInput.trim().replace(/^@/, "");
    if (!trimmed) return;
    if (!selectedMembers.includes(trimmed)) {
      setSelectedMembers((prev) => [...prev, trimmed]);
    }
    setNewCustomMemberInput("");
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || selectedMembers.length === 0) return;
    addFriendGroup(groupName, groupEmoji, selectedMembers);
    setGroupName("");
    setNewCustomMemberInput("");
    setShowGroupCreator(false);
    setFeedback({
      type: "success",
      message: `Gruppe „${groupName.trim()}“ erfolgreich angelegt!`,
    });
  };

  // Group edit handlers
  const handleOpenEdit = (grp: FriendGroup) => {
    setEditingGroup(grp);
    setEditGroupName(grp.name);
    setEditGroupEmoji(grp.emoji || "🛋️");
    setEditSelectedMembers([...grp.memberNames]);
    setEditCustomMemberInput("");
  };

  const handleCloseEdit = () => {
    setEditingGroup(null);
    setEditCustomMemberInput("");
  };

  const toggleEditMember = (name: string) => {
    setEditSelectedMembers((prev) =>
      prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name]
    );
  };

  const handleAddEditCustomMember = () => {
    const trimmed = editCustomMemberInput.trim().replace(/^@/, "");
    if (!trimmed) return;
    if (!editSelectedMembers.includes(trimmed)) {
      setEditSelectedMembers((prev) => [...prev, trimmed]);
    }
    setEditCustomMemberInput("");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup) return;
    const trimmedName = editGroupName.trim();
    if (!trimmedName || editSelectedMembers.length === 0) return;
    updateFriendGroup(editingGroup.id, trimmedName, editGroupEmoji, editSelectedMembers);
    setFeedback({
      type: "success",
      message: `Gruppe „${trimmedName}“ erfolgreich aktualisiert!`,
    });
    setEditingGroup(null);
  };

  const getSubMeta = (key: string) => {
    return POPULAR_SUBSCRIPTIONS.find((s) => s.key === key) || {
      key,
      label: key,
      color: "#94a3b8",
    };
  };

  const isAdmin =
    session?.user?.email?.toLowerCase() === "lukasreinle0@gmail.com" ||
    (session?.user as any)?.role === "ADMIN";

  const pendingReceived = communityData.friendRequests?.pendingReceived || [];
  const pendingSent = communityData.friendRequests?.pendingSent || [];
  const myFriends = communityData.friends || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-8 rounded-3xl bg-gradient-to-br from-indigo-950/50 via-slate-900 to-[#0e1424] border border-indigo-500/25 shadow-xl">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" />
            Freundeskreis & Privatsphäre
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Deine Freunde & Abos
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            <span className="font-bold text-amber-300">🔒 Nur befreundete Personen</span> sehen deine Filme, Watchlists & Empfehlungen. Freunde und Familie sehen sich nicht untereinander, wenn sie nicht direkt miteinander befreundet sind.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-col gap-2">
          {isAdmin ? (
            <Link
              href="/admin"
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition shadow-lg shadow-amber-500/20"
            >
              <UserPlus className="w-4 h-4" />
              <span>Freunde einladen (Admin)</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(window.location.origin + "/register");
                alert("Einladungslink in die Zwischenablage kopiert! Schicke ihn deinen Freunden oder deiner Familie.");
              }}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>Einladungslink kopieren</span>
            </button>
          )}
        </div>
      </div>

      {/* Global Action Feedback Notice */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 animate-in fade-in ${
            feedback.type === "success"
              ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
              : "bg-rose-950/60 border-rose-500/40 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Pending Incoming Friend Requests Banner */}
      {pendingReceived.length > 0 && (
        <div className="p-6 rounded-3xl bg-amber-950/30 border border-amber-500/40 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-amber-300">
            <UserPlus className="w-5 h-5" />
            <h3 className="text-base font-black tracking-tight">
              Ausstehende Freundschaftsanfragen ({pendingReceived.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pendingReceived.map((req) => (
              <div
                key={req.requestId}
                className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/30 flex items-center justify-between gap-3 shadow"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {req.user.image ? (
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-amber-500/40 flex-shrink-0">
                      <Image
                        src={req.user.image}
                        alt={req.user.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-black font-black text-sm flex-shrink-0">
                      {req.user.name.slice(0, 1)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                      {req.user.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate">{req.user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleAcceptRequest(req.requestId)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition flex items-center gap-1 shadow"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Annehmen</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeclineRequest(req.requestId)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/60 hover:text-rose-300 text-slate-400 text-xs font-semibold border border-slate-800 transition"
                  >
                    Ablehnen
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friend Search & Add Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-indigo-400" />
            <span>Freund hinzufügen</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Suche nach dem Namen oder der E-Mail deiner Freunde oder Familienmitglieder, um euch gegenseitig zu vernetzen.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Name oder E-Mail eingeben (z. B. Max oder mama@...)"
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950/90 border border-slate-800 focus:border-indigo-400 text-sm text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
          <button
            type="button"
            disabled={!searchQuery.trim() || submittingTarget === searchQuery.trim()}
            onClick={() => handleSendRequest(searchQuery.trim())}
            className="px-5 py-2.5 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs transition disabled:opacity-50 flex items-center justify-center gap-1.5 shadow"
          >
            <UserPlus className="w-4 h-4" />
            <span>{submittingTarget === searchQuery.trim() ? "Wird gesendet..." : "Anfrage senden"}</span>
          </button>
        </div>

        {/* Live Search Results Dropdown/Box */}
        {searchResults.length > 0 && (
          <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2 animate-in fade-in">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 pt-1">
              Gefundene Personen:
            </p>
            <div className="space-y-1.5">
              {searchResults.map((user) => {
                const isSubmitting = submittingTarget === user.email || submittingTarget === user.id;

                return (
                  <div
                    key={user.id}
                    className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {user.image ? (
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                          <Image src={user.image} alt={user.name} fill sizes="32px" className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {user.name.slice(0, 1)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{user.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {user.relationship === "FRIENDS" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                          <Check className="w-3.5 h-3.5" />
                          <span>Befreundet</span>
                        </span>
                      ) : user.relationship === "REQUEST_SENT" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Anfrage gesendet</span>
                        </span>
                      ) : user.relationship === "REQUEST_RECEIVED" && user.requestId ? (
                        <button
                          type="button"
                          onClick={() => handleAcceptRequest(user.requestId)}
                          className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition"
                        >
                          Annehmen
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleSendRequest(user.email || user.name)}
                          className="px-3 py-1 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs transition disabled:opacity-50 flex items-center gap-1"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>{isSubmitting ? "..." : "Befreunden"}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pending Sent Requests */}
        {pendingSent.length > 0 && (
          <div className="pt-2 text-xs text-slate-400 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 font-semibold text-slate-300">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Ausstehende Anfragen von dir:</span>
            </span>
            {pendingSent.map((s) => (
              <span
                key={s.requestId}
                className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[11px] text-slate-300"
              >
                @{s.user.name} ⏳
              </span>
            ))}
          </div>
        )}
      </div>

      {/* CineCrews / Friend Groups for AI Group Match */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <span>🛋️ Deine Filmabend-Gruppen (CineCrews)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Erstelle feste Gruppen (z. B. „Familie“, „WG-Couch“, „Date Night“) aus deinen befreundeten Kontakten. Nutze sie im{" "}
              <Link href="/recommendations" className="text-emerald-400 hover:underline font-semibold">
                KI-Filmberater
              </Link>{" "}
              für gemeinsame Film-Matches.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowGroupCreator(!showGroupCreator)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition self-start"
          >
            <Plus className="w-4 h-4" />
            <span>Neue Gruppe anlegen</span>
          </button>
        </div>

        {showGroupCreator && (
          <form
            onSubmit={handleCreateGroup}
            className="p-5 rounded-2xl bg-slate-950/90 border border-emerald-500/30 space-y-4 animate-in fade-in"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Gruppenname (z. B. Familie, WG-Couch, Männerabend)
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="z. B. Familie"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-400"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Icon wählen</label>
                <div className="flex items-center gap-1.5">
                  {["🛋️", "🍿", "✨", "🍻", "🔥", "🍕", "👨‍👩‍👧‍👦"].map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setGroupEmoji(em)}
                      className={`w-9 h-9 rounded-xl text-base flex items-center justify-center border transition ${
                        groupEmoji === em
                          ? "bg-emerald-500/20 border-emerald-400 scale-105"
                          : "bg-slate-900 border-slate-800"
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-300">
                  Wer gehört zur Gruppe? ({selectedMembers.length} gewählt)
                </label>
                {selectedMembers.length === 0 && (
                  <span className="text-[11px] text-rose-400 font-semibold">
                    Mindestens 1 Mitglied erforderlich
                  </span>
                )}
              </div>

              {/* Selected chips */}
              {selectedMembers.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-900/60 border border-slate-800 mb-2.5">
                  {selectedMembers.map((m) => (
                    <span
                      key={m}
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold"
                    >
                      <span>@{m}</span>
                      <button
                        type="button"
                        onClick={() => toggleMember(m)}
                        className="hover:text-rose-400 transition"
                        title="Entfernen"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Friends & Self toggles */}
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {myName && (
                  <button
                    type="button"
                    onClick={() => toggleMember(myName)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition flex items-center gap-1 ${
                      selectedMembers.includes(myName)
                        ? "bg-emerald-500 text-black border-emerald-400"
                        : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <Check
                      className={`w-3.5 h-3.5 ${
                        selectedMembers.includes(myName) ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    <span>@{myName} (Du)</span>
                  </button>
                )}
                {myFriends.map((f) => {
                  const active = selectedMembers.includes(f.name);
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => toggleMember(f.name)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition flex items-center gap-1 ${
                        active
                          ? "bg-emerald-500 text-black border-emerald-400"
                          : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <Check className={`w-3.5 h-3.5 ${active ? "opacity-100" : "opacity-0"}`} />
                      <span>@{f.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Add custom member input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCustomMemberInput}
                  onChange={(e) => setNewCustomMemberInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddNewCustomMember();
                    }
                  }}
                  placeholder="Weiteres Mitglied per Name hinzufügen (z. B. Dennis)..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                />
                <button
                  type="button"
                  onClick={handleAddNewCustomMember}
                  disabled={!newCustomMemberInput.trim()}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-bold text-white transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Hinzufügen</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowGroupCreator(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={!groupName.trim() || selectedMembers.length === 0}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black font-bold text-xs"
              >
                Gruppe speichern
              </button>
            </div>
          </form>
        )}

        {friendGroups.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 text-center space-y-2">
            <p className="text-xs font-bold text-slate-300">
              Noch keine Filmabend-Gruppen angelegt.
            </p>
            <p className="text-[11px] text-slate-500 max-w-md mx-auto">
              Klicke oben auf „+ Gruppe anlegen“, um eigene Gruppen (z. B. deine Familie oder deine WG) für gemeinsame KI-Filmberatung zu erstellen.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {friendGroups.map((grp) => (
              <div
                key={grp.id}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 flex flex-col justify-between gap-3 shadow-md hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{grp.emoji}</span>
                    <div>
                      <h4 className="text-sm font-black text-white">{grp.name}</h4>
                      <p className="text-[11px] text-slate-400">
                        {grp.memberNames.length} Mitglieder
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(grp)}
                      title="Gruppe bearbeiten"
                      className="text-slate-400 hover:text-amber-400 transition p-1.5 rounded-lg hover:bg-slate-800/80"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Gruppe „${grp.name}“ wirklich löschen?`)) {
                          deleteFriendGroup(grp.id);
                        }
                      }}
                      title="Gruppe löschen"
                      className="text-slate-400 hover:text-rose-400 transition p-1.5 rounded-lg hover:bg-slate-800/80"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {grp.memberNames.map((mName) => (
                    <span
                      key={mName}
                      className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 font-semibold"
                    >
                      @{mName}
                    </span>
                  ))}
                </div>

                <Link
                  href={`/recommendations?tab=ai&prompt=${encodeURIComponent(
                    `Heute will ich mit ${grp.name} einen Film schauen`
                  )}`}
                  className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Mit @{grp.name} Film matchen</span>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Group Modal */}
      {editingGroup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={handleCloseEdit}
        >
          <div
            className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Gruppe bearbeiten</h3>
                  <p className="text-xs text-slate-400">Passe Name, Icon und Mitglieder an</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseEdit}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Group Name & Emoji */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Gruppenname
                  </label>
                  <input
                    type="text"
                    value={editGroupName}
                    onChange={(e) => setEditGroupName(e.target.value)}
                    placeholder="z. B. Familie, WG-Couch"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Icon
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {["🛋️", "🍿", "✨", "🍻", "🔥", "🍕", "👨‍👩‍👧‍👦", "🎬"].map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setEditGroupEmoji(em)}
                        className={`w-8 h-8 rounded-xl text-base flex items-center justify-center border transition ${
                          editGroupEmoji === em
                            ? "bg-amber-500/20 border-amber-400 scale-105"
                            : "bg-slate-900 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Members */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">
                    Mitglieder ({editSelectedMembers.length} ausgewählt)
                  </label>
                  {editSelectedMembers.length === 0 && (
                    <span className="text-[11px] text-rose-400 font-semibold">
                      Mindestens 1 Mitglied erforderlich
                    </span>
                  )}
                </div>

                {/* Selected Member Chips */}
                <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 min-h-[44px]">
                  {editSelectedMembers.map((m) => (
                    <span
                      key={m}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold"
                    >
                      <span>@{m}</span>
                      <button
                        type="button"
                        onClick={() => toggleEditMember(m)}
                        className="hover:text-rose-400 transition"
                        title="Entfernen"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {editSelectedMembers.length === 0 && (
                    <span className="text-xs text-slate-500 italic py-1">
                      Noch keine Mitglieder ausgewählt.
                    </span>
                  )}
                </div>

                {/* Quick Add from Friends */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-slate-400">
                    Aus deinen Kontakten hinzufügen / entfernen:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {/* Self option if not in list */}
                    {myName && (
                      <button
                        type="button"
                        onClick={() => toggleEditMember(myName)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition flex items-center gap-1 ${
                          editSelectedMembers.includes(myName)
                            ? "bg-emerald-500 text-black border-emerald-400"
                            : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <Check
                          className={`w-3 h-3 ${
                            editSelectedMembers.includes(myName) ? "opacity-100" : "opacity-0"
                          }`}
                        />
                        <span>@{myName} (Du)</span>
                      </button>
                    )}

                    {myFriends.map((f) => {
                      const active = editSelectedMembers.includes(f.name);
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => toggleEditMember(f.name)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition flex items-center gap-1 ${
                            active
                              ? "bg-emerald-500 text-black border-emerald-400"
                              : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          <Check className={`w-3 h-3 ${active ? "opacity-100" : "opacity-0"}`} />
                          <span>@{f.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom member input */}
                <div className="pt-2">
                  <span className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Oder weiteres Mitglied per Name hinzufügen:
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editCustomMemberInput}
                      onChange={(e) => setEditCustomMemberInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddEditCustomMember();
                        }
                      }}
                      placeholder="Name eingeben (z. B. Dennis, Mama)..."
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={handleAddEditCustomMember}
                      disabled={!editCustomMemberInput.trim()}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-bold text-white transition flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Hinzufügen</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Möchtest du die Gruppe „${editingGroup.name}“ wirklich löschen?`)) {
                      deleteFriendGroup(editingGroup.id);
                      setEditingGroup(null);
                    }
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Gruppe löschen</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCloseEdit}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    disabled={!editGroupName.trim() || editSelectedMembers.length === 0}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold text-xs shadow-lg shadow-amber-500/20 transition"
                  >
                    Änderungen speichern
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Friends Cards (Only Accepted Friends) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <span>Deine befreundeten Kontakte ({myFriends.length})</span>
          </h2>
          <span className="text-xs text-slate-400">
            {myFriends.length === 1 ? "1 Freund" : `${myFriends.length} Freunde`} vernetzt
          </span>
        </div>

        {myFriends.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">Noch keine Freunde vernetzt</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Nutze die Suchleiste oben oder schicke deinen Freunden und deiner Familie einen Einladungslink, um euch zu befreunden und eure Film-Listen zu teilen.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {myFriends.map((friend) => {
              const isMe =
                (session?.user?.email && friend.email?.toLowerCase() === session.user.email.toLowerCase()) ||
                ((session?.user as any)?.id && friend.id === (session?.user as any).id);
              const friendImg = isMe ? currentUserAvatar || friend.image : friend.image;
              const isRemoving = removingFriendId === friend.id;

              return (
                <div
                  key={friend.id}
                  className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition shadow-lg space-y-4 relative group"
                >
                  <div className="flex items-center justify-between gap-3">
                    <Link
                      href={`/friends/${friend.id}`}
                      className="flex items-center gap-3 min-w-0 group/link hover:opacity-90 transition"
                    >
                      {friendImg ? (
                        <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-amber-500/40 flex-shrink-0 shadow-md group-hover/link:border-amber-400 transition">
                          <Image
                            src={friendImg}
                            alt={friend.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-amber-500 flex items-center justify-center text-black font-black text-lg shadow-md flex-shrink-0">
                          {friend.name.slice(0, 1)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-white group-hover/link:text-amber-300 transition flex items-center gap-2 truncate">
                          <span>{friend.name}</span>
                          {friend.role === "ADMIN" && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold border border-amber-500/30">
                              Admin
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-slate-500 truncate">{friend.email}</p>
                      </div>
                    </Link>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link
                        href={`/friends/${friend.id}`}
                        className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-amber-500/15 border border-slate-800 hover:border-amber-500/40 text-[11px] font-bold text-amber-300 transition"
                      >
                        Profil ansehen →
                      </Link>

                      {!isMe && (
                        <button
                          type="button"
                          disabled={isRemoving}
                          onClick={() => handleRemoveFriend(friend.id, friend.name)}
                          className="p-2 rounded-xl bg-slate-950/80 hover:bg-rose-950/70 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 transition"
                          title="Freundschaft beenden"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-800/80 text-center">
                    <div>
                      <p className="text-base font-extrabold text-emerald-400">{friend.watchedCount}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">Gesehen</p>
                    </div>
                    <div>
                      <p className="text-base font-extrabold text-sky-400">{friend.watchlistCount}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">Watchlist</p>
                    </div>
                    <div>
                      <p className="text-base font-extrabold text-rose-400">
                        {friend.recommendationsCount}
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">Tipps</p>
                    </div>
                  </div>

                  {/* Subscriptions */}
                  <div>
                    <p className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                      <Tv className="w-3.5 h-3.5 text-amber-400" />
                      Aktive Streaming-Abos:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {friend.subscriptions && friend.subscriptions.length > 0 ? (
                        friend.subscriptions.map((subKey: string) => {
                          const meta = getSubMeta(subKey);
                          return (
                            <span
                              key={subKey}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-slate-800 text-slate-200 border border-slate-700"
                            >
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: meta.color }}
                              />
                              <span>{meta.label}</span>
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-xs text-slate-500">Keine Abos angegeben</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
