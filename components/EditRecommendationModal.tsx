"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useMedia } from "./MediaContext";
import type { AppRecommendation } from "@/lib/store";
import { BottomSheetDialog } from "./BottomSheetDialog";
import {
  X,
  Star,
  MessageSquare,
  Tag,
  Users,
  Trash2,
  Save,
  Check,
  Film,
  Tv,
  AlertCircle,
} from "lucide-react";

interface EditRecommendationModalProps {
  isOpen: boolean;
  recommendation: AppRecommendation | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const PRESET_TAGS = [
  "🔥 Absolutes Muss",
  "🏆 Oscar-Meisterwerk",
  "🍿 Popcorn-Kino",
  "💥 Action",
  "😂 Comedy",
  "🤯 Mindfuck",
  "😱 Thriller",
  "🩸 Horror",
  "🎭 Drama",
  "🚀 Sci-Fi",
  "😭 Zieht Taschentücher",
];

const RATING_LABELS: Record<number, string> = {
  10: "10/10 • Ultimatives Meisterwerk 🔥",
  9: "9/10 • Absolut genial & packend",
  8: "8/10 • Richtig starker Film",
  7: "7/10 • Gute Unterhaltung",
  6: "6/10 • Ganz nett für zwischendurch",
  5: "5/10 • Durchschnittlich",
  4: "4/10 • Eher enttäuschend",
  3: "3/10 • Ziemlich schwach",
  2: "2/10 • Reine Zeitverschwendung",
  1: "1/10 • Absoluter Totalausfall",
};

export function EditRecommendationModal({
  isOpen,
  recommendation,
  onClose,
  onSuccess,
}: EditRecommendationModalProps) {
  const {
    updateRecommendation,
    deleteRecommendation,
    confirmDialog,
    showToast,
    friendGroups,
    communityData,
  } = useMedia();

  const [rating, setRating] = useState<number>(9);
  const [comment, setComment] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [recAudience, setRecAudience] = useState<"ALL" | "TARGETED">("ALL");
  const [selectedTargetGroups, setSelectedTargetGroups] = useState<string[]>([]);
  const [selectedTargetFriends, setSelectedTargetFriends] = useState<{ id: string; name: string }[]>([]);
  const [saving, setSaving] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  // Sync state when recommendation changes
  useEffect(() => {
    if (recommendation) {
      setRating(recommendation.rating || 9);
      setComment(recommendation.comment || "");
      setTags(recommendation.tags && recommendation.tags.length > 0 ? recommendation.tags : ["🔥 Absolutes Muss"]);

      const isTargeted =
        recommendation.targetType &&
        recommendation.targetType !== "ALL" &&
        ((recommendation.targetNames && recommendation.targetNames.length > 0) ||
          (recommendation.targetGroupIds && recommendation.targetGroupIds.length > 0));

      if (isTargeted) {
        setRecAudience("TARGETED");
        setSelectedTargetGroups(recommendation.targetGroupIds || []);
        const friendsFromRec = (recommendation.targetNames || [])
          .filter((t) => !t.startsWith("@"))
          .map((name, idx) => ({
            id: recommendation.targetUserIds?.[idx] || `user_${idx}`,
            name,
          }));
        setSelectedTargetFriends(friendsFromRec);
      } else {
        setRecAudience("ALL");
        setSelectedTargetGroups([]);
        setSelectedTargetFriends([]);
      }
    }
  }, [recommendation]);

  if (!isOpen || !recommendation) return null;

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleTargetGroup = (group: { id: string; name: string }) => {
    setSelectedTargetGroups((prev) =>
      prev.includes(group.id) ? prev.filter((id) => id !== group.id) : [...prev, group.id]
    );
  };

  const toggleTargetFriend = (friend: { id: string; name: string }) => {
    setSelectedTargetFriends((prev) => {
      const exists = prev.some((f) => f.id === friend.id || f.name === friend.name);
      if (exists) {
        return prev.filter((f) => f.id !== friend.id && f.name !== friend.name);
      } else {
        return [...prev, friend];
      }
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const targetType = recAudience === "ALL" ? "ALL" : "CUSTOM";
      const targetGroupIds = recAudience === "TARGETED" ? selectedTargetGroups : [];
      const targetUserIds: string[] = [];
      const targetNames: string[] = [];

      if (recAudience === "TARGETED") {
        for (const gId of selectedTargetGroups) {
          const grp = friendGroups.find((g) => g.id === gId);
          if (grp) targetNames.push(`@${grp.name}`);
        }
        for (const f of selectedTargetFriends) {
          if (!f.id.startsWith("custom_")) {
            targetUserIds.push(f.id);
          }
          targetNames.push(f.name);
        }
      }

      await updateRecommendation({
        recommendationId: recommendation.id,
        rating,
        comment: comment.trim(),
        tags,
        targetType,
        targetNames,
        targetGroupIds,
        targetUserIds,
      });

      showToast("Empfehlung erfolgreich aktualisiert!", { type: "success" });
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Error updating recommendation:", err);
      showToast("Fehler beim Aktualisieren der Empfehlung", { type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = await confirmDialog({
      title: "Empfehlung löschen?",
      message: `Möchtest du deine Empfehlung für "${recommendation.title}" wirklich unwiderruflich aus dem Feed entfernen?`,
      confirmLabel: "Ja, löschen",
      dangerous: true,
    });

    if (!confirmed) return;

    try {
      setDeleting(true);
      await deleteRecommendation(recommendation.id);
      showToast("Empfehlung wurde gelöscht", { type: "info" });
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Error deleting recommendation:", err);
      showToast("Fehler beim Löschen der Empfehlung", { type: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const posterUrl = recommendation.posterPath
    ? recommendation.posterPath.startsWith("http")
      ? recommendation.posterPath
      : `https://image.tmdb.org/t/p/w342${recommendation.posterPath}`
    : null;

  return (
    <BottomSheetDialog
      isOpen={isOpen}
      onClose={onClose}
      ariaLabelledBy="edit-rec-title"
      maxWidthClass="max-w-xl"
      panelClassName="bg-slate-950 border-0 sm:border sm:border-slate-800 max-h-[92dvh]"
    >
        {/* Header with media banner */}
        <div className="relative p-5 sm:p-6 border-b border-slate-800/80 bg-gradient-to-b from-slate-900 to-slate-950 flex items-start gap-4">
          {posterUrl ? (
            <div className="relative w-16 h-24 sm:w-20 sm:h-28 rounded-xl overflow-hidden shrink-0 border border-slate-700/60 shadow-lg bg-slate-900">
              <Image
                src={posterUrl}
                alt={recommendation.title}
                fill
                sizes="(max-width: 640px) 64px, 80px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl shrink-0 bg-slate-800 flex items-center justify-center text-slate-500 border border-slate-700">
              {recommendation.mediaType === "tv" ? <Tv className="w-6 h-6" /> : <Film className="w-6 h-6" />}
            </div>
          )}

          <div className="flex-1 min-w-0 pr-8">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 mb-1">
              <span>Empfehlung bearbeiten</span>
            </div>
            <h2
              id="edit-rec-title"
              className="text-lg sm:text-xl font-black text-white truncate"
              title={recommendation.title}
            >
              {recommendation.title}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {recommendation.mediaType === "tv" ? "Serie" : "Film"}
              {recommendation.releaseYear ? ` • ${recommendation.releaseYear}` : ""}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="absolute top-3 right-3 sm:top-4 sm:right-4 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center p-2 rounded-full text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6 space-y-6">
          {/* Rating Slider & Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Deine Bewertung</span>
              </label>
              <span className="text-sm font-black text-amber-400">
                {rating} / 10
              </span>
            </div>

            {/* Quick 1-10 selector buttons */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1 sm:gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
                const isSelected = rating === score;
                return (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setRating(score)}
                    className={`py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                      isSelected
                        ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30 scale-105"
                        : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                    }`}
                  >
                    {score}
                  </button>
                );
              })}
            </div>

            <p className="text-[11px] text-slate-400 italic">
              {RATING_LABELS[rating] || `${rating}/10`}
            </p>
          </div>

          {/* Comment / Review */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-bold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <span>Dein Fazit / Notiz an Freunde</span>
              </span>
              <span className="text-[11px] text-slate-500 font-normal">
                {comment.length} Zeichen
              </span>
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Was macht diesen Titel so besonders? Warum sollte man ihn unbedingt sehen..."
              className="w-full px-3.5 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 transition resize-none"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-emerald-400" />
              <span>Stimmung & Tags wählen</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_TAGS.map((tag) => {
                const active = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      active
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm"
                        : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Audience */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <label className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-sky-400" />
              <span>Zielgruppe der Empfehlung</span>
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRecAudience("ALL")}
                className={`p-3 rounded-2xl text-left border transition ${
                  recAudience === "ALL"
                    ? "bg-sky-500/15 border-sky-500/50 text-sky-300"
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Alle Freunde</span>
                  {recAudience === "ALL" && <Check className="w-3.5 h-3.5 text-sky-400" />}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">Sichtbar im öffentlichen Freunde-Feed</p>
              </button>

              <button
                type="button"
                onClick={() => setRecAudience("TARGETED")}
                className={`p-3 rounded-2xl text-left border transition ${
                  recAudience === "TARGETED"
                    ? "bg-purple-500/15 border-purple-500/50 text-purple-300"
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Gezielt</span>
                  {recAudience === "TARGETED" && <Check className="w-3.5 h-3.5 text-purple-400" />}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">Bestimmte Gruppen oder Freunde</p>
              </button>
            </div>

            {recAudience === "TARGETED" && (
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 animate-fadeIn">
                {friendGroups.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Gruppen auswählen:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {friendGroups.map((grp) => {
                        const isSelected = selectedTargetGroups.includes(grp.id);
                        return (
                          <button
                            key={grp.id}
                            type="button"
                            onClick={() => toggleTargetGroup(grp)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                              isSelected
                                ? "bg-purple-500/25 text-purple-200 border border-purple-500/50"
                                : "bg-slate-800 text-slate-400 border border-slate-700/60 hover:text-white"
                            }`}
                          >
                            @{grp.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {communityData.friends.length > 0 ? (
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Freunde auswählen:
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                      {communityData.friends.map((friend) => {
                        const isSelected = selectedTargetFriends.some(
                          (f) => f.id === friend.id || f.name === friend.name
                        );
                        return (
                          <button
                            key={friend.id}
                            type="button"
                            onClick={() => toggleTargetFriend(friend)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                              isSelected
                                ? "bg-amber-500/25 text-amber-200 border border-amber-500/50"
                                : "bg-slate-800 text-slate-400 border border-slate-700/60 hover:text-white"
                            }`}
                          >
                            {friend.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    Keine gespeicherten Freunde gefunden. Du kannst Freunde im Feed hinzufügen.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="p-4 sm:p-5 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-5 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving || deleting}
            className="min-h-[44px] sm:min-h-0 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-500/25 transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Empfehlung</span> Löschen
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={saving || deleting}
              className="min-h-[44px] sm:min-h-0 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition"
            >
              Abbrechen
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || deleting}
              className="min-h-[44px] sm:min-h-0 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black text-black bg-amber-500 hover:bg-amber-400 shadow-lg shadow-amber-500/20 transition flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Speichern...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Änderungen speichern</span>
                </>
              )}
            </button>
          </div>
        </div>
    </BottomSheetDialog>
  );
}
