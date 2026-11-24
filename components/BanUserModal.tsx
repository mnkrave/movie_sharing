"use client";

import React, { useState, useEffect } from "react";
import { Ban, X, AlertTriangle } from "lucide-react";
import { BottomSheetDialog } from "./BottomSheetDialog";

export interface BanTargetUser {
  id: string;
  name: string;
  email: string;
}

interface BanUserModalProps {
  target: BanTargetUser | null;
  submitting: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function BanUserModal({ target, submitting, onClose, onConfirm }: BanUserModalProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (target) setReason("");
  }, [target]);

  if (!target) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    onConfirm(reason.trim());
  };

  return (
    <BottomSheetDialog
      isOpen={Boolean(target)}
      onClose={() => {
        if (!submitting) onClose();
      }}
      ariaLabel={`Nutzer ${target.name} sperren`}
      maxWidthClass="max-w-md"
      panelClassName="bg-slate-950 border border-rose-500/40 sm:rounded-3xl p-5 sm:p-6 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:pb-6 shadow-2xl space-y-4 text-white"
    >
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center flex-shrink-0">
            <Ban className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 id="ban-user-modal-heading" className="text-base font-black text-white truncate">
              {target.name} sperren?
            </h3>
            <p className="text-xs text-slate-400 truncate">{target.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          aria-label="Schließen"
          className="min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/25 text-xs text-rose-200 flex items-start gap-2 leading-relaxed">
        <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <span>
          Der Nutzer wird sofort abgemeldet, kann sich nicht mehr einloggen und alle seine noch offenen Einladungen werden automatisch widerrufen.
        </span>
      </div>

      <form onSubmit={handleSubmit} aria-labelledby="ban-user-modal-heading" className="space-y-4">
        <div>
          <label htmlFor="ban-reason-input" className="block text-xs font-bold text-slate-300 mb-1.5">
            Grund (optional, nur für Admin sichtbar)
          </label>
          <textarea
            id="ban-reason-input"
            name="reason"
            rows={3}
            maxLength={300}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="z. B. Unerwünschte Einladungen oder Spam"
            className="w-full rounded-xl bg-slate-900 border border-slate-700 focus:border-rose-400 px-3 py-2 text-sm sm:text-xs text-white placeholder-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
          />
          <p className="text-[11px] text-slate-500 mt-1 text-right">{reason.length}/300</p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="min-h-[44px] sm:min-h-0 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="min-h-[44px] sm:min-h-0 px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs shadow-lg shadow-rose-500/20 disabled:opacity-50 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Ban className="w-3.5 h-3.5" />
            <span>{submitting ? "Wird gesperrt..." : "Nutzer jetzt sperren"}</span>
          </button>
        </div>
      </form>
    </BottomSheetDialog>
  );
}
