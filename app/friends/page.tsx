"use client";

import React, { useState } from "react";
import { useMedia } from "@/components/MediaContext";
import { useSession } from "next-auth/react";
import {
  Users,
  Tv,
  Check,
  Bookmark,
  Sparkles,
  UserPlus,
  Plus,
  Trash2,
  Wand2,
} from "lucide-react";
import { POPULAR_SUBSCRIPTIONS } from "@/lib/tmdb";
import Link from "next/link";

export default function FriendsPage() {
  const { data: session } = useSession();
  const { communityData, friendGroups, addFriendGroup, deleteFriendGroup } = useMedia();

  const [showGroupCreator, setShowGroupCreator] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupEmoji, setGroupEmoji] = useState("🛋️");
  const [selectedMembers, setSelectedMembers] = useState<string[]>(["Lukas"]);

  const toggleMember = (name: string) => {
    setSelectedMembers((prev) =>
      prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name]
    );
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || selectedMembers.length === 0) return;
    addFriendGroup(groupName, groupEmoji, selectedMembers);
    setGroupName("");
    setShowGroupCreator(false);
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-8 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-[#0e1424] border border-indigo-500/20 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" />
            Freundeskreis
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Deine Freunde & Abos
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Sieh nach, welche Streaming-Abos deine Freunde besitzen und wie viele Filme sie schon geschaut haben.
          </p>
        </div>

        {isAdmin ? (
          <Link
            href="/admin"
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition shadow-lg shadow-amber-500/20"
          >
            <UserPlus className="w-4 h-4" />
            <span>Freunde einladen (Admin)</span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(window.location.origin + "/register");
              alert("Einladungslink in die Zwischenablage kopiert! Schicke ihn deinen Freunden.");
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Einladungslink kopieren</span>
          </button>
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
              Erstelle feste Gruppen (z. B. „WG-Couch“, „Date Night“) und nutze sie im{" "}
              <Link href="/profile" className="text-emerald-400 hover:underline font-semibold">
                KI-Filmberater
              </Link>{" "}
              mit Befehlen wie{" "}
              <code className="px-1.5 py-0.5 rounded bg-slate-950 text-amber-300">
                Heute mit WG-Couch was Lustiges unter 120 Min
              </code>
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
                  Gruppenname (z. B. WG-Couch, Männerabend, Familie)
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="z. B. WG-Couch"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-400"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Icon wählen</label>
                <div className="flex items-center gap-1.5">
                  {["🛋️", "🍿", "✨", "🍻", "🔥", "🍕"].map((em) => (
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
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Wer gehört zur Gruppe? ({selectedMembers.length} gewählt)
              </label>
              <div className="flex flex-wrap gap-2">
                {communityData.friends.map((f) => {
                  const active = selectedMembers.includes(f.name);
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => toggleMember(f.name)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                        active
                          ? "bg-emerald-500 text-black border-emerald-400"
                          : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <Check className={`w-3.5 h-3.5 ${active ? "opacity-100" : "opacity-0"}`} />
                      <span>{f.name}</span>
                    </button>
                  );
                })}
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
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs"
              >
                Gruppe speichern
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {friendGroups.map((grp) => (
            <div
              key={grp.id}
              className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 flex flex-col justify-between gap-3"
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
                <button
                  type="button"
                  onClick={() => deleteFriendGroup(grp.id)}
                  title="Gruppe löschen"
                  className="text-slate-500 hover:text-rose-400 transition p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
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
                href={`/profile?prompt=${encodeURIComponent(
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
      </div>

      {/* Friends Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {communityData.friends.map((friend) => (
          <div
            key={friend.id}
            className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition shadow-lg space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-amber-500 flex items-center justify-center text-black font-black text-lg shadow-md">
                  {friend.name.slice(0, 1)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {friend.name}
                    {friend.role === "ADMIN" && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold border border-amber-500/30">
                        Admin
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500">{friend.email}</p>
                </div>
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
        ))}
      </div>
    </div>
  );
}
