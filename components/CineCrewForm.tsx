"use client";

import React, { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { isSamePerson } from "@/lib/auth-match";

const CREW_EMOJIS = ["🛋️", "🍿", "✨", "🍻", "🔥", "🍕", "🎬"] as const;

interface CineCrewFormProps {
  mode: "create" | "edit";
  surface?: "card" | "dark-sheet";
  initialName?: string;
  initialEmoji?: string;
  initialMembers?: string[];
  friends: Array<{ id: string; name: string }>;
  currentUserName?: string | null;
  onSubmit: (data: { name: string; emoji: string; memberNames: string[] }) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

function normalizeMembers(members: string[], selfName?: string | null): string[] {
  const result: string[] = [];
  for (const raw of members) {
    const isSelf = isSamePerson(raw, selfName);
    const canonical = isSelf && selfName ? selfName : raw;
    const exists = result.some(
      (existing) =>
        (isSelf && isSamePerson(existing, selfName)) ||
        existing.toLowerCase() === canonical.toLowerCase()
    );
    if (!exists) result.push(canonical);
  }
  return result;
}

export function CineCrewForm({
  mode,
  surface = "card",
  initialName = "",
  initialEmoji = "🛋️",
  initialMembers,
  friends,
  currentUserName,
  onSubmit,
  onCancel,
  onDelete,
}: CineCrewFormProps) {
  const selfName = currentUserName || "Ich";
  const [name, setName] = useState(initialName);
  const [emoji, setEmoji] = useState(initialEmoji);
  const [selectedMembers, setSelectedMembers] = useState<string[]>(() =>
    initialMembers
      ? normalizeMembers(initialMembers, currentUserName)
      : currentUserName
      ? [currentUserName]
      : []
  );
  const [customInput, setCustomInput] = useState("");

  useEffect(() => {
    if (mode === "create" && currentUserName && selectedMembers.length === 0) {
      setSelectedMembers([currentUserName]);
    }
  }, [mode, currentUserName]);

  const isDarkSheet = surface === "dark-sheet";
  const labelCls = isDarkSheet
    ? "block text-xs font-bold text-slate-300 mb-1.5"
    : "block text-xs font-bold text-foreground mb-1.5";
  const inputCls = isDarkSheet
    ? "w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-400"
    : "w-full px-3.5 py-2 rounded-xl bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary";
  const customInputCls = isDarkSheet
    ? "flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
    : "flex-1 px-3 py-1.5 rounded-xl bg-input border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary";

  const toggleMember = (memberName: string) => {
    const isTargetMe = isSamePerson(memberName, selfName);
    setSelectedMembers((prev) => {
      if (isTargetMe) {
        const hasMe = prev.some((m) => isSamePerson(m, selfName));
        return hasMe ? prev.filter((m) => !isSamePerson(m, selfName)) : [...prev, selfName];
      }
      return prev.some((m) => m.toLowerCase() === memberName.toLowerCase())
        ? prev.filter((m) => m.toLowerCase() !== memberName.toLowerCase())
        : [...prev, memberName];
    });
  };

  const handleAddCustomMember = () => {
    const trimmed = customInput.trim().replace(/^@/, "");
    if (!trimmed) return;
    const isTargetMe = isSamePerson(trimmed, selfName);
    const canonical = isTargetMe ? selfName : trimmed;
    setSelectedMembers((prev) => {
      if (isTargetMe && prev.some((m) => isSamePerson(m, selfName))) return prev;
      if (prev.some((m) => m.toLowerCase() === canonical.toLowerCase())) return prev;
      return [...prev, canonical];
    });
    setCustomInput("");
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || selectedMembers.length === 0) return;
    onSubmit({ name: trimmedName, emoji, memberNames: selectedMembers });
  };

  const memberChipClass = (active: boolean) => {
    if (isDarkSheet) {
      return active
        ? "bg-emerald-500 text-black border-emerald-400"
        : "bg-slate-900 text-slate-300 border-slate-800";
    }
    return active
      ? "bg-primary text-primary-foreground border-primary"
      : "bg-muted text-foreground border-border";
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      className={
        isDarkSheet
          ? "space-y-4"
          : "p-5 rounded-2xl bg-card border border-primary/40 space-y-4 animate-in fade-in"
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="sm:col-span-2">
          <label className={labelCls}>
            {mode === "create" ? "Gruppenname (z. B. Familie, WG-Couch)" : "Gruppenname"}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={mode === "create" ? "z. B. Freitagabend" : "z. B. Familie, WG-Couch"}
            className={inputCls}
            required
          />
        </div>
        <div>
          <label className={labelCls}>Icon</label>
          <div className="flex flex-wrap items-center gap-1.5">
            {CREW_EMOJIS.map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => setEmoji(em)}
                className={`${
                  isDarkSheet ? "w-8 h-8" : "w-9 h-9"
                } rounded-xl text-base flex items-center justify-center border transition cursor-pointer ${
                  emoji === em
                    ? isDarkSheet
                      ? "bg-amber-500/20 border-amber-400 scale-105"
                      : "bg-primary-soft border-primary"
                    : isDarkSheet
                    ? "bg-slate-900 border-slate-800 hover:border-slate-700"
                    : "bg-muted border-border"
                }`}
              >
                {em}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className={labelCls}>
          Mitglieder ({selectedMembers.length} {mode === "create" ? "gewählt" : "ausgewählt"})
        </label>
        <div className="flex flex-wrap gap-1.5">
          {selfName && (
            <button
              type="button"
              onClick={() => toggleMember(selfName)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${memberChipClass(
                selectedMembers.some((m) => isSamePerson(m, selfName))
              )}`}
            >
              @{selfName} (Du)
            </button>
          )}
          {friends
            .filter((f) => !isSamePerson(f.name, selfName))
            .map((f) => {
              const active = selectedMembers.some(
                (m) => m.toLowerCase() === f.name.toLowerCase()
              );
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => toggleMember(f.name)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${memberChipClass(
                    active
                  )}`}
                >
                  @{f.name}
                </button>
              );
            })}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddCustomMember();
              }
            }}
            placeholder={
              mode === "create"
                ? "Weiteres Mitglied per Name hinzufügen..."
                : "Weiteres Mitglied per Name..."
            }
            className={customInputCls}
          />
          <button
            type="button"
            onClick={handleAddCustomMember}
            disabled={!customInput.trim()}
            className={
              isDarkSheet
                ? "px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-bold text-white transition cursor-pointer"
                : "px-3 py-1.5 rounded-xl bg-muted hover:bg-muted/80 disabled:opacity-40 text-xs font-bold text-foreground border border-border transition cursor-pointer"
            }
          >
            Hinzufügen
          </button>
        </div>
      </div>

      <div
        className={
          mode === "edit"
            ? "flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80"
            : "flex justify-end gap-2"
        }
      >
        {mode === "edit" && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="w-full sm:w-auto justify-center px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Gruppe löschen</span>
          </button>
        )}

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className={
              isDarkSheet
                ? "px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition cursor-pointer"
                : "px-4 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            }
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={!name.trim() || selectedMembers.length === 0}
            className={
              isDarkSheet
                ? "px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold text-xs transition cursor-pointer"
                : "px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-40 text-primary-foreground font-bold text-xs cursor-pointer"
            }
          >
            {mode === "create" ? "Gruppe speichern" : "Speichern"}
          </button>
        </div>
      </div>
    </form>
  );
}
