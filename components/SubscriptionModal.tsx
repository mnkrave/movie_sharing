"use client";

import React, { useState, useEffect } from "react";
import { POPULAR_SUBSCRIPTIONS } from "@/lib/tmdb";
import { Bell, Check, Tv, X, Filter } from "lucide-react";
import { useMedia } from "./MediaContext";
import { useSession } from "next-auth/react";
import { BottomSheetDialog } from "./BottomSheetDialog";
import { useWatchlistAlerts } from "@/lib/useWatchlistAlerts";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSubscriptions: string[];
  onSave: (subs: string[]) => void;
}

export function SubscriptionModal({
  isOpen,
  onClose,
  selectedSubscriptions,
  onSave,
}: SubscriptionModalProps) {
  const [current, setCurrent] = useState<string[]>(selectedSubscriptions);
  const { onlyMySubs, toggleOnlyMySubs } = useMedia();
  const { data: session } = useSession();
  const { watchlistAlerts, savingAlerts, toggleWatchlistAlerts } = useWatchlistAlerts({
    enabled: isOpen && Boolean(session?.user),
  });

  useEffect(() => {
    setCurrent(selectedSubscriptions);
  }, [selectedSubscriptions, isOpen]);

  if (!isOpen) return null;

  const toggle = (key: string) => {
    if (current.includes(key)) {
      setCurrent(current.filter((k) => k !== key));
    } else {
      setCurrent([...current, key]);
    }
  };

  const handleSave = () => {
    onSave(current);
    onClose();
  };

  return (
    <BottomSheetDialog
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel="Deine Streaming-Abos"
      maxWidthClass="max-w-lg"
      panelClassName="bg-[#0f1422] border-0 sm:border sm:border-slate-800 max-h-[90dvh]"
    >
      <div className="flex flex-col flex-1 min-h-0 p-5 sm:p-6 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:pb-6 relative overflow-hidden">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800/60 transition"
          aria-label="Schließen"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
            <Tv className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Deine Streaming-Abos</h3>
            <p className="text-sm text-slate-400">
              Wähle aus, welche Abos du hast. Wir heben dann Filme hervor, die du kostenlos streamen kannst.
            </p>
          </div>
        </div>

        {/* Global Filter Switcher */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-slate-800 my-4">
          <div className="text-xs pr-2">
            <p className="font-bold text-white flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-amber-400" />
              Standard-Filter: Nur was ich habe
            </p>
            <p className="text-slate-400 mt-0.5">
              Blendet bei Filmen & Serien automatisch alle Anbieter aus, die du nicht hast.
            </p>
          </div>
          <button
            type="button"
            onClick={toggleOnlyMySubs}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border flex-shrink-0 ${
              onlyMySubs
                ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
            }`}
          >
            {onlyMySubs ? "AKTIV (AN)" : "AUS"}
          </button>
        </div>

        {session?.user && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-slate-800 mb-3">
            <div className="text-xs pr-2">
              <p className="font-bold text-white flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                Watchlist-E-Mail-Alarm
              </p>
              <p className="text-slate-400 mt-0.5">
                Benachrichtigt dich per Mail, sobald ein Watchlist-Titel neu in deinen Abos startet.
              </p>
            </div>
            <button
              type="button"
              disabled={savingAlerts}
              onClick={toggleWatchlistAlerts}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border flex-shrink-0 ${
                watchlistAlerts
                  ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                  : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
              }`}
            >
              {watchlistAlerts ? "AN" : "AUS"}
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2.5 my-5 max-h-[55dvh] overflow-y-auto overscroll-contain pr-1 flex-1">
          {POPULAR_SUBSCRIPTIONS.map((sub) => {
            const isSelected = current.includes(sub.key);
            return (
              <button
                key={sub.key}
                type="button"
                onClick={() => toggle(sub.key)}
                className={`flex items-center justify-between p-3 rounded-xl border text-left transition min-w-0 ${
                  isSelected
                    ? "bg-amber-500/15 border-amber-500/60 text-white shadow-sm"
                    : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: sub.color }}
                  />
                  <span className="text-sm font-medium truncate">{sub.label}</span>
                </div>
                {isSelected && (
                  <Check className="w-4 h-4 text-amber-400 flex-shrink-0 ml-1" />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setCurrent([])}
            className="min-h-[40px] sm:min-h-0 text-xs text-slate-400 hover:text-white underline"
          >
            Alle abwählen
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] sm:min-h-0 px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Abbrechen
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="min-h-[44px] sm:min-h-0 px-5 py-2 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-black transition shadow-lg shadow-amber-500/20"
            >
              Speichern ({current.length})
            </button>
          </div>
        </div>
      </div>
    </BottomSheetDialog>
  );
}
