"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useMedia } from "@/components/MediaContext";
import { Bookmark, Check, Star, Film, Tv, Plus, LogIn } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function MyListPage() {
  const { data: session } = useSession();
  const { communityData, openMediaModal, updateMediaStatus, openSearch } = useMedia();
  const [activeTab, setActiveTab] = useState<"WATCHLIST" | "WATCHED">("WATCHLIST");

  const myUserId = (session?.user as any)?.id || "user_lukas";
  const myEmail = session?.user?.email?.toLowerCase();

  const myItems = communityData.mediaStatuses.filter(
    (m) =>
      (m.userId === myUserId || (session?.user?.name && m.userName === session.user.name)) &&
      m.status === activeTab
  );

  if (!session) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
          <Bookmark className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white">Melde dich an</h2>
        <p className="text-sm text-slate-400">
          Um deine persönliche Watchlist und deine bewerteten Filme zu speichern, melde dich kurz an.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm shadow-lg shadow-amber-500/20"
        >
          <LogIn className="w-4 h-4" />
          <span>Jetzt einloggen</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-8 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Meine Listen
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Behalte den Überblick über alles, was du noch sehen willst oder bereits bewertet hast.
          </p>
        </div>

        <button
          onClick={openSearch}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Titel hinzufügen</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <button
          onClick={() => setActiveTab("WATCHLIST")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === "WATCHLIST"
              ? "bg-sky-500 text-black shadow-lg shadow-sky-500/20"
              : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>
            Watchlist (
            {
              communityData.mediaStatuses.filter(
                (m) =>
                  (m.userId === myUserId || m.userName === session?.user?.name) &&
                  m.status === "WATCHLIST"
              ).length
            }
            )
          </span>
        </button>

        <button
          onClick={() => setActiveTab("WATCHED")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === "WATCHED"
              ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
              : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          }`}
        >
          <Check className="w-4 h-4" />
          <span>
            Bereits gesehen (
            {
              communityData.mediaStatuses.filter(
                (m) =>
                  (m.userId === myUserId || m.userName === session?.user?.name) &&
                  m.status === "WATCHED"
              ).length
            }
            )
          </span>
        </button>
      </div>

      {/* Grid of Saved Items */}
      {myItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {myItems.map((item) => (
            <div
              key={item.id}
              onClick={() =>
                openMediaModal({
                  id: item.tmdbId,
                  mediaType: item.mediaType,
                  title: item.title,
                  posterPath: item.posterPath,
                })
              }
              className="group relative cursor-pointer flex flex-col transition hover:-translate-y-1.5"
            >
              <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-md group-hover:shadow-xl transition">
                {item.posterPath ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w500${item.posterPath}`}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-300"
                    sizes="200px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600">
                    <Film className="w-8 h-8" />
                  </div>
                )}

                {item.rating && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md text-amber-400 font-extrabold text-xs border border-white/10 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{item.rating}/10</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-3 text-center">
                  <span className="text-xs font-bold text-white bg-amber-500/90 text-black px-3 py-1.5 rounded-xl shadow">
                    Details & VPN anzeigen
                  </span>
                </div>
              </div>

              <div className="mt-2 px-1 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white truncate group-hover:text-amber-400 transition">
                  {item.title}
                </h4>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateMediaStatus({
                      tmdbId: item.tmdbId,
                      mediaType: item.mediaType,
                      title: item.title,
                      status: "NONE",
                    });
                  }}
                  className="text-[11px] text-slate-500 hover:text-rose-400 ml-2"
                >
                  Entfernen
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-16 text-center rounded-3xl bg-slate-900/30 border border-slate-800/60 text-slate-400 space-y-4">
          <Bookmark className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">Hier ist noch nichts gespeichert</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeTab === "WATCHLIST"
              ? "Klicke bei einem beliebigen Film auf '+', um ihn für später auf deine Watchlist zu setzen."
              : "Markiere Filme als 'Gesehen' und bewerte sie, um deinen Freunden deine Highlights zu zeigen!"}
          </p>
          <button
            onClick={openSearch}
            className="px-5 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs shadow-lg shadow-amber-500/20"
          >
            Filme & Serien entdecken
          </button>
        </div>
      )}
    </div>
  );
}
