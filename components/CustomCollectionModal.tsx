"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useMedia } from "./MediaContext";
import type { AppCustomCollection, AppCustomCollectionMovie } from "@/lib/store";
import { SUPER_ADMIN_EMAIL } from "@/lib/constants";
import { BottomSheetDialog } from "./BottomSheetDialog";
import {
  X,
  Plus,
  Search,
  Film,
  Tv,
  Trash2,
  Lock,
  Users,
  Globe,
  Check,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Save,
  ShieldCheck,
  Star,
  Layers,
} from "lucide-react";

interface CustomCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCollection?: AppCustomCollection | null;
  onSuccess?: () => void;
}

const COLLECTION_EMOJIS = [
  "🎬",
  "🍿",
  "🏆",
  "🔥",
  "🤯",
  "⛩️",
  "🚀",
  "🕵️",
  "🩸",
  "😂",
  "💎",
  "❤️",
  "🎭",
  "🧙‍♂️",
];

export function CustomCollectionModal({
  isOpen,
  onClose,
  editingCollection,
  onSuccess,
}: CustomCollectionModalProps) {
  const { data: session } = useSession();
  const {
    saveCustomCollection,
    deleteCustomCollection,
    communityData,
    friendGroups,
    showToast,
    confirmDialog,
  } = useMedia();

  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("🎬");
  const [movies, setMovies] = useState<AppCustomCollectionMovie[]>([]);
  const [visibility, setVisibility] = useState<"PRIVATE" | "FRIENDS" | "PUBLIC">("FRIENDS");
  const [shareScope, setShareScope] = useState<"ALL" | "TARGETED">("ALL");
  const [selectedTargetGroups, setSelectedTargetGroups] = useState<string[]>([]);
  const [selectedTargetFriends, setSelectedTargetFriends] = useState<{ id: string; name: string }[]>([]);

  // TMDB Search & Quick-Add from user's watched movies
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showQuickAddFromWatched, setShowQuickAddFromWatched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const myUserId = (session?.user as any)?.id;
  const myName = session?.user?.name;
  const isAdmin =
    session?.user?.email?.toLowerCase() === SUPER_ADMIN_EMAIL ||
    (session?.user as any)?.role === "ADMIN";

  // My top watched items for 1-click quick-add
  const myTopWatched = useMemo(() => {
    return communityData.mediaStatuses
      .filter(
        (m) =>
          m.status === "WATCHED" &&
          ((myUserId && m.userId === myUserId) ||
            (myName && m.userName?.toLowerCase() === myName.toLowerCase()))
      )
      .sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }, [communityData.mediaStatuses, myUserId, myName]);

  useEffect(() => {
    if (editingCollection) {
      setName(editingCollection.name || "");
      setTagline(editingCollection.tagline || "");
      setDescription(editingCollection.description || "");
      setEmoji(editingCollection.emoji || "🎬");
      setMovies(editingCollection.movies || []);
      setVisibility(editingCollection.visibility || "FRIENDS");

      const isTargeted =
        editingCollection.targetType === "CUSTOM" &&
        ((editingCollection.targetGroupIds && editingCollection.targetGroupIds.length > 0) ||
          (editingCollection.targetNames && editingCollection.targetNames.length > 0));

      if (isTargeted) {
        setShareScope("TARGETED");
        setSelectedTargetGroups(editingCollection.targetGroupIds || []);
        const friendObjs = (editingCollection.targetNames || [])
          .filter((n) => !n.startsWith("@"))
          .map((n, idx) => ({
            id: editingCollection.targetUserIds?.[idx] || `f_${idx}`,
            name: n,
          }));
        setSelectedTargetFriends(friendObjs);
      } else {
        setShareScope("ALL");
        setSelectedTargetGroups([]);
        setSelectedTargetFriends([]);
      }
    } else {
      setName("");
      setTagline("");
      setDescription("");
      setEmoji("🎬");
      setMovies([]);
      setVisibility("FRIENDS");
      setShareScope("ALL");
      setSelectedTargetGroups([]);
      setSelectedTargetFriends([]);
    }
    setSearchQuery("");
    setSearchResults([]);
  }, [editingCollection, isOpen]);

  // Debounced TMDB search
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults((data.results || []).slice(0, 8));
        }
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 260);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (!isOpen) return null;

  const isMovieAdded = (id: number, mediaType?: string) => {
    return movies.some(
      (m) => m.id === id && (m.mediaType || "movie") === (mediaType || "movie")
    );
  };

  const handleAddMovie = (raw: {
    id: number;
    title: string;
    releaseYear?: string | null;
    posterPath?: string | null;
    backdropPath?: string | null;
    voteAverage?: number;
    mediaType?: "movie" | "tv";
  }) => {
    if (isMovieAdded(raw.id, raw.mediaType)) return;
    setMovies((prev) => [
      ...prev,
      {
        id: raw.id,
        title: raw.title,
        releaseYear: raw.releaseYear || "",
        posterPath: raw.posterPath || null,
        backdropPath: raw.backdropPath || null,
        voteAverage: raw.voteAverage || 8.0,
        mediaType: raw.mediaType || "movie",
      },
    ]);
  };

  const handleRemoveMovie = (id: number, mediaType?: string) => {
    setMovies((prev) =>
      prev.filter(
        (m) => !(m.id === id && (m.mediaType || "movie") === (mediaType || "movie"))
      )
    );
  };

  const handleMoveMovie = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= movies.length) return;
    setMovies((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
  };

  const toggleTargetGroup = (groupId: string) => {
    setSelectedTargetGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  const toggleTargetFriend = (friend: { id: string; name: string }) => {
    setSelectedTargetFriends((prev) => {
      const exists = prev.some((f) => f.id === friend.id || f.name === friend.name);
      return exists
        ? prev.filter((f) => f.id !== friend.id && f.name !== friend.name)
        : [...prev, friend];
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Bitte gib deiner Kollektion einen Namen!", { type: "error" });
      return;
    }
    if (movies.length === 0) {
      showToast("Bitte füge mindestens einen Film oder eine Serie hinzu!", { type: "error" });
      return;
    }

    setSaving(true);
    try {
      const targetType =
        visibility === "FRIENDS" && shareScope === "TARGETED" ? "CUSTOM" : "ALL";
      const targetGroupIds =
        visibility === "FRIENDS" && shareScope === "TARGETED" ? selectedTargetGroups : [];
      const targetUserIds: string[] = [];
      const targetNames: string[] = [];

      if (visibility === "FRIENDS" && shareScope === "TARGETED") {
        for (const gId of selectedTargetGroups) {
          const grp = friendGroups.find((g) => g.id === gId);
          if (grp) targetNames.push(`@${grp.name}`);
        }
        for (const f of selectedTargetFriends) {
          targetUserIds.push(f.id);
          targetNames.push(f.name);
        }
      }

      const ok = await saveCustomCollection({
        id: editingCollection?.id,
        name: name.trim(),
        tagline:
          tagline.trim() ||
          `${movies.length} handverlesene Titel von ${myName || "dir"}`,
        description:
          description.trim() ||
          `Persönliche Kollektion mit ${movies.length} ausgewählten Highlights.`,
        emoji,
        movies,
        visibility,
        targetType,
        targetNames,
        targetGroupIds,
        targetUserIds,
      });

      if (ok) {
        if (visibility === "PUBLIC" && !isAdmin) {
          showToast(
            "Kollektion gespeichert! Für deine Freunde ist sie sofort sichtbar – für alle anderen nach kurzer Freigabe durch Lukas.",
            { type: "success" }
          );
        } else {
          showToast(
            editingCollection
              ? "Kollektion erfolgreich aktualisiert!"
              : "Kollektion erfolgreich erstellt!",
            { type: "success" }
          );
        }
        onSuccess?.();
        onClose();
      } else {
        showToast("Fehler beim Speichern der Kollektion.", { type: "error" });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingCollection) return;
    const confirmed = await confirmDialog({
      title: "Kollektion löschen?",
      message: `Möchtest du die Kollektion „${editingCollection.name}“ wirklich unwiderruflich löschen?`,
      confirmLabel: "Ja, löschen",
      dangerous: true,
    });
    if (!confirmed) return;

    setDeleting(true);
    const ok = await deleteCustomCollection(editingCollection.id);
    setDeleting(false);
    if (ok) {
      showToast("Kollektion wurde gelöscht.", { type: "info" });
      onSuccess?.();
      onClose();
    }
  };

  return (
    <BottomSheetDialog
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel={editingCollection ? "Kollektion bearbeiten" : "Eigene Kollektion erstellen"}
      maxWidthClass="max-w-3xl"
      panelClassName="bg-slate-950 border-0 sm:border sm:border-slate-800 max-h-[92dvh]"
    >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-2xl">
              {emoji}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Layers className="w-3 h-3" />
                <span>{editingCollection ? "Kollektion bearbeiten" : "Eigene Kollektion erstellen"}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                {editingCollection ? editingCollection.name : "Deine persönliche Film- & Serien-Kollektion"}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center p-2 rounded-full bg-slate-800/70 hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-6 space-y-6">
          {/* 1. Name, Emoji, Tagline & Description */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-8">
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Name der Kollektion *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="z. B. Meine Top Anime-Klassiker, Beste Mindfuck-Thriller..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-400 text-sm text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Kurz-Untertitel (optional)
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="z. B. Gänsehaut garantiert"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-400 text-sm text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Emoji Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Icon wählen
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COLLECTION_EMOJIS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setEmoji(em)}
                    className={`w-9 h-9 rounded-xl text-base flex items-center justify-center border transition cursor-pointer ${
                      emoji === em
                        ? "bg-amber-500/25 border-amber-400 scale-105 shadow"
                        : "bg-slate-900 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Beschreibung / Warum empfiehlst du diese Kollektion?
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Erzähl deinen Freunden kurz, was diese Auswahl besonders macht..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-400 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* 2. Visibility & Sharing Settings */}
          <div className="space-y-3 pt-4 border-t border-slate-800/80">
            <label className="block text-xs sm:text-sm font-bold text-white">
              Wer darf diese Kollektion sehen?
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Option A: Private */}
              <button
                type="button"
                onClick={() => setVisibility("PRIVATE")}
                className={`p-3.5 rounded-2xl text-left border transition cursor-pointer ${
                  visibility === "PRIVATE"
                    ? "bg-slate-800 border-amber-500/60 text-white shadow-md"
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-300" />
                    <span>Nur für mich</span>
                  </span>
                  {visibility === "PRIVATE" && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Deine private Liste – für niemand anderen sichtbar.
                </p>
              </button>

              {/* Option B: Friends / Specific Groups */}
              <button
                type="button"
                onClick={() => setVisibility("FRIENDS")}
                className={`p-3.5 rounded-2xl text-left border transition cursor-pointer ${
                  visibility === "FRIENDS"
                    ? "bg-emerald-500/15 border-emerald-500/60 text-emerald-200 shadow-md"
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Mit Freunden teilen</span>
                  </span>
                  {visibility === "FRIENDS" && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Für alle deine Freunde oder gezielte Freundesgruppen.
                </p>
              </button>

              {/* Option C: Public (with Admin Approval) */}
              <button
                type="button"
                onClick={() => setVisibility("PUBLIC")}
                className={`p-3.5 rounded-2xl text-left border transition cursor-pointer ${
                  visibility === "PUBLIC"
                    ? "bg-purple-500/15 border-purple-500/60 text-purple-200 shadow-md"
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-purple-400" />
                    <span>Mit allen teilen</span>
                  </span>
                  {visibility === "PUBLIC" && <Check className="w-3.5 h-3.5 text-purple-400" />}
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Öffentlich für alle Nutzer (mit kurzer Freigabe durch Lukas).
                </p>
              </button>
            </div>

            {/* Sub-options when sharing with FRIENDS */}
            {visibility === "FRIENDS" && (
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShareScope("ALL")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      shareScope === "ALL"
                        ? "bg-emerald-500 text-black"
                        : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                    }`}
                  >
                    Alle meine Freunde
                  </button>
                  <button
                    type="button"
                    onClick={() => setShareScope("TARGETED")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      shareScope === "TARGETED"
                        ? "bg-purple-500 text-white"
                        : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                    }`}
                  >
                    Nur bestimmte Freunde / Gruppen
                  </button>
                </div>

                {shareScope === "TARGETED" && (
                  <div className="space-y-3 pt-2 border-t border-slate-800/80">
                    {friendGroups.length > 0 && (
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                          Freundesgruppen (CineCrews):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {friendGroups.map((grp) => {
                            const active = selectedTargetGroups.includes(grp.id);
                            return (
                              <button
                                key={grp.id}
                                type="button"
                                onClick={() => toggleTargetGroup(grp.id)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                                  active
                                    ? "bg-purple-500/25 border-purple-500/60 text-purple-200"
                                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                                }`}
                              >
                                {grp.emoji} @{grp.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {communityData.friends.length > 0 ? (
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                          Einzelne Freunde:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {communityData.friends.map((f) => {
                            const active = selectedTargetFriends.some(
                              (sf) => sf.id === f.id || sf.name === f.name
                            );
                            return (
                              <button
                                key={f.id}
                                type="button"
                                onClick={() => toggleTargetFriend({ id: f.id, name: f.name })}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                                  active
                                    ? "bg-amber-500/25 border-amber-500/60 text-amber-200"
                                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                                }`}
                              >
                                @{f.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">
                        Du hast noch keine Freunde verknüpft.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Info notice when PUBLIC is selected */}
            {visibility === "PUBLIC" && !isAdmin && (
              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-center gap-2.5 text-xs text-purple-200">
                <ShieldCheck className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span>
                  Deine Freunde sehen diese Kollektion <strong>sofort</strong>. Damit sie für alle Nutzer öffentlich erscheint, gibt Lukas sie kurz mit einem Klick frei.
                </span>
              </div>
            )}
          </div>

          {/* 3. Add Movies & Series Section */}
          <div className="space-y-3 pt-4 border-t border-slate-800/80">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <Film className="w-4 h-4 text-amber-400" />
                <span>Filme & Serien hinzufügen ({movies.length} ausgewählt)</span>
              </label>

              {myTopWatched.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowQuickAddFromWatched((prev) => !prev)}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {showQuickAddFromWatched
                      ? "Eigene Favoriten ausblenden"
                      : "Aus deiner Hall of Fame wählen"}
                  </span>
                </button>
              )}
            </div>

            {/* Quick-Add from user's watched Hall of Fame */}
            {showQuickAddFromWatched && myTopWatched.length > 0 && (
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-2">
                <p className="text-[11px] font-bold text-amber-300">
                  Klicke auf deine gesehenen Favoriten, um sie direkt hinzuzufügen:
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {myTopWatched.slice(0, 40).map((w) => {
                    const added = isMovieAdded(w.tmdbId, w.mediaType);
                    return (
                      <button
                        key={`${w.mediaType}_${w.tmdbId}`}
                        type="button"
                        onClick={() =>
                          added
                            ? handleRemoveMovie(w.tmdbId, w.mediaType)
                            : handleAddMovie({
                                id: w.tmdbId,
                                title: w.title,
                                releaseYear: w.releaseYear,
                                posterPath: w.posterPath,
                                voteAverage: w.rating || 8.5,
                                mediaType: w.mediaType,
                              })
                        }
                        className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
                          added
                            ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                            : "bg-slate-950 border-slate-800 text-slate-300 hover:border-amber-400"
                        }`}
                      >
                        {added ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                        <span className="truncate max-w-[160px]">{w.title}</span>
                        {w.rating && (
                          <span className="text-[10px] text-amber-400 font-bold">{w.rating}★</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Live TMDB Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="search"
                enterKeyHint="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Film oder Serie suchen, um sie zur Kollektion hinzuzufügen..."
                className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-400 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                  }}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Search Results */}
            {isSearching && (
              <p className="text-xs text-slate-400 animate-pulse px-1">Suche auf TMDB...</p>
            )}
            {searchResults.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 rounded-2xl bg-slate-900 border border-slate-800 max-h-60 overflow-y-auto">
                {searchResults.map((item) => {
                  const added = isMovieAdded(item.id, item.mediaType);
                  return (
                    <div
                      key={`${item.mediaType}_${item.id}`}
                      onClick={() =>
                        added
                          ? handleRemoveMovie(item.id, item.mediaType)
                          : handleAddMovie({
                              id: item.id,
                              title: item.title,
                              releaseYear: item.releaseYear,
                              posterPath: item.posterPath,
                              backdropPath: item.backdropPath,
                              voteAverage: item.voteAverage,
                              mediaType: item.mediaType,
                            })
                      }
                      className={`p-2 rounded-xl border flex items-center justify-between gap-2.5 cursor-pointer transition ${
                        added
                          ? "bg-emerald-950/40 border-emerald-500/40"
                          : "bg-slate-950/80 border-slate-800 hover:border-amber-500/40"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative w-9 h-12 rounded-lg overflow-hidden bg-slate-900 flex-shrink-0">
                          {item.posterPath ? (
                            <Image
                              src={`https://image.tmdb.org/t/p/w154${item.posterPath}`}
                              alt={item.title}
                              fill
                              sizes="36px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600">
                              <Film className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{item.title}</p>
                          <p className="text-[10px] text-slate-400">
                            {item.mediaType === "tv" ? "📺 Serie" : "🎬 Film"}
                            {item.releaseYear ? ` • ${item.releaseYear}` : ""}
                            {item.voteAverage ? ` • ${item.voteAverage}★` : ""}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 flex-shrink-0 ${
                          added
                            ? "bg-emerald-500 text-black"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {added ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Drin</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3" />
                            <span>Rein</span>
                          </>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Added Movies List (with reorder & remove) */}
            {movies.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                Noch keine Filme oder Serien in dieser Kollektion. Suche oben nach Titeln oder wähle sie aus deiner Hall of Fame!
              </div>
            ) : (
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {movies.map((m, idx) => (
                  <div
                    key={`${m.mediaType || "movie"}_${m.id}`}
                    className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-6 text-center font-mono text-xs font-black text-amber-400">
                        #{idx + 1}
                      </span>
                      <div className="relative w-8 h-11 rounded overflow-hidden bg-slate-950 flex-shrink-0">
                        {m.posterPath ? (
                          <Image
                            src={`https://image.tmdb.org/t/p/w154${m.posterPath}`}
                            alt={m.title}
                            fill
                            sizes="32px"
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{m.title}</p>
                        <p className="text-[10px] text-slate-400">
                          {m.mediaType === "tv" ? "Serie" : "Film"}
                          {m.releaseYear ? ` • ${m.releaseYear}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveMovie(idx, -1)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30"
                        title="Nach oben"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === movies.length - 1}
                        onClick={() => handleMoveMovie(idx, 1)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30"
                        title="Nach unten"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveMovie(m.id, m.mediaType)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30"
                        title="Entfernen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
            {editingCollection ? (
              <button
                type="button"
                disabled={deleting || saving}
                onClick={handleDelete}
                className="px-3.5 py-2.5 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Löschen</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-800 transition cursor-pointer"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={saving || deleting}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>
                  {saving
                    ? "Speichere..."
                    : editingCollection
                    ? "Änderungen speichern"
                    : "Kollektion erstellen"}
                </span>
              </button>
            </div>
          </div>
        </form>
    </BottomSheetDialog>
  );
}
