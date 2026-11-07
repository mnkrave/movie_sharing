"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { CHARACTER_AVATARS, CharacterAvatar } from "@/lib/avatars";
import type { PersonSearchResult } from "@/lib/tmdb";
import {
  X,
  Sparkles,
  Check,
  Search,
  Link as LinkIcon,
  RotateCcw,
  Film,
  Tv,
  Clapperboard,
  User,
  Shield,
  Loader2,
} from "lucide-react";

interface AvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string | null;
  userName?: string;
  onSave: (avatarUrl: string | null) => Promise<void>;
}

type TabType = "all" | "series" | "movies" | "scifi_heroes" | "directors" | "search" | "custom";

export function AvatarPickerModal({
  isOpen,
  onClose,
  currentAvatar,
  userName = "Kino-Fan",
  onSave,
}: AvatarPickerModalProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(currentAvatar);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PersonSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSelectedAvatar(currentAvatar);
  }, [currentAvatar, isOpen]);

  // TMDB Person Live Search
  useEffect(() => {
    if (!searchQuery.trim() || activeTab !== "search") {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `/api/tmdb/search?type=person&q=${encodeURIComponent(searchQuery.trim())}`
        );
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
        }
      } catch (err) {
        console.error("Person search failed:", err);
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, activeTab]);

  if (!isOpen) return null;

  const filteredAvatars = CHARACTER_AVATARS.filter((avatar) => {
    if (activeTab === "all") return true;
    return avatar.category === activeTab;
  });

  const handleApplyCustomUrl = () => {
    if (customUrl.trim().startsWith("http")) {
      setSelectedAvatar(customUrl.trim());
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(selectedAvatar);
      onClose();
    } catch (err) {
      console.error("Failed to save avatar:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-3xl rounded-3xl bg-[#0b0f19] border border-slate-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>Wähle dein Profilbild</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Legendäre Charaktere aus Filmen & Serien oder freie Schauspielersuche
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Avatar Banner & Tabs */}
        <div className="px-5 sm:px-6 py-4 bg-slate-950/60 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-amber-500/60 shadow-lg shadow-amber-500/20 bg-slate-900 flex-shrink-0 flex items-center justify-center">
              {selectedAvatar ? (
                <Image
                  src={selectedAvatar}
                  alt={userName}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-black font-black text-xl">
                  {userName.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-white">Aktuelle Vorschau</p>
              <p className="text-[11px] text-slate-400">
                {selectedAvatar ? "Charakter-Avatar aktiv" : "Standard-Buchstabe"}
              </p>
              {selectedAvatar && (
                <button
                  type="button"
                  onClick={() => setSelectedAvatar(null)}
                  className="text-[11px] text-rose-400 hover:underline flex items-center gap-1 mt-0.5"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Bild entfernen (Standard)</span>
                </button>
              )}
            </div>
          </div>

          {/* Legal / TMDB note */}
          <div className="text-[11px] text-slate-400 bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 flex items-center gap-2 max-w-sm">
            <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              Offizielle TMDB-Character-Bilder für private Profile in CineCircle.
            </span>
          </div>
        </div>

        {/* Category Pills Navigation */}
        <div className="px-5 sm:px-6 pt-3 pb-2 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: "all", label: "Alle", icon: Film },
            { id: "series", label: "Serien", icon: Tv },
            { id: "movies", label: "Filme", icon: Clapperboard },
            { id: "scifi_heroes", label: "Sci-Fi & Helden", icon: Sparkles },
            { id: "directors", label: "Regie", icon: User },
            { id: "search", label: "TMDB Suche", icon: Search },
            { id: "custom", label: "Eigene URL", icon: LinkIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  active
                    ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                    : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* 1. Predefined Grid (All / Series / Movies / Sci-Fi / Directors) */}
          {activeTab !== "search" && activeTab !== "custom" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
              {filteredAvatars.map((avatar) => {
                const isSelected = selectedAvatar === avatar.imageUrl;
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar.imageUrl)}
                    className={`group relative p-2.5 rounded-2xl border text-left transition flex items-center gap-3 ${
                      isSelected
                        ? "bg-amber-500/15 border-amber-500 shadow-lg shadow-amber-500/15"
                        : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-slate-950 border border-slate-700/60">
                      <Image
                        src={avatar.imageUrl}
                        alt={avatar.name}
                        fill
                        sizes="48px"
                        className="object-cover group-hover:scale-105 transition"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate group-hover:text-amber-400 transition">
                        {avatar.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {avatar.roleOrMovie}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-md">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* 2. TMDB Person Live Search */}
          {activeTab === "search" && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Schauspieler oder Regisseur suchen (z. B. Tom Cruise, Ryan Gosling, Christoph Waltz)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-hidden focus:border-amber-500/60 transition"
                  autoFocus
                />
                {searching && (
                  <Loader2 className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-amber-400 animate-spin" />
                )}
              </div>

              {searchQuery.trim() === "" ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Tippe den Namen eines beliebigen Stars ein, um offizielle TMDB-Fotos zu finden.
                </div>
              ) : searchResults.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {searchResults.map((person) => {
                    const fullImg = `https://image.tmdb.org/t/p/w300${person.profilePath}`;
                    const isSelected = selectedAvatar === fullImg;
                    return (
                      <button
                        key={person.id}
                        type="button"
                        onClick={() => setSelectedAvatar(fullImg)}
                        className={`group relative p-2.5 rounded-2xl border text-left transition flex items-center gap-3 ${
                          isSelected
                            ? "bg-amber-500/15 border-amber-500 shadow-lg shadow-amber-500/15"
                            : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900"
                        }`}
                      >
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-slate-950 border border-slate-700/60">
                          <Image
                            src={fullImg}
                            alt={person.name}
                            fill
                            sizes="48px"
                            className="object-cover group-hover:scale-105 transition"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white truncate group-hover:text-amber-400 transition">
                            {person.name}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            {person.knownFor || "Schauspieler"}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-md">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : !searching ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Keine Personen mit Foto für &quot;{searchQuery}&quot; gefunden.
                </div>
              ) : null}
            </div>
          )}

          {/* 3. Custom Image URL */}
          {activeTab === "custom" && (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 max-w-xl mx-auto text-center">
              <LinkIcon className="w-8 h-8 text-amber-400 mx-auto opacity-80" />
              <div>
                <h3 className="text-sm font-bold text-white">Eigene Bild-URL einfügen</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Füge einen direkten Link zu einem Bild (.jpg, .png, .webp) ein.
                </p>
              </div>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://example.com/mein-bild.jpg"
                  className="flex-1 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-hidden focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleApplyCustomUrl}
                  disabled={!customUrl.trim().startsWith("http")}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition disabled:opacity-50"
                >
                  Vorschau
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-[#0a0d16] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            Abbrechen
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-black text-xs shadow-lg shadow-amber-500/25 transition disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Speichert...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Profilbild speichern</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
