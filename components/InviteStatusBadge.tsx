"use client";

import React from "react";
import { Check, Clock, UserCheck } from "lucide-react";
import type { AppWhitelistEntry } from "@/lib/store";

export type ApprovalStatus = "NONE" | "PENDING" | "APPROVED" | "REJECTED";
type DisplayApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

/** Derives registration and expiration flags for an invite whitelist entry. */
export function getInviteEntryState(
  item: Pick<AppWhitelistEntry, "isRegistered" | "acceptedAt" | "expiresAt">,
  nowMs = Date.now()
) {
  const isRegistered = Boolean(item.isRegistered || item.acceptedAt);
  const isExpired =
    !isRegistered &&
    Boolean(item.expiresAt) &&
    new Date(item.expiresAt!).getTime() <= nowMs;
  return { isRegistered, isExpired };
}

interface InviteStatusBadgeProps {
  item: Pick<AppWhitelistEntry, "isRegistered" | "acceptedAt" | "expiresAt">;
  nowMs?: number;
  registeredIcon?: "user" | "check";
}

/** Renders the status pill (Registriert / Abgelaufen / Offen) for an invite entry. */
export function InviteStatusBadge({
  item,
  nowMs,
  registeredIcon = "check",
}: InviteStatusBadgeProps) {
  const { isRegistered, isExpired } = getInviteEntryState(item, nowMs);

  if (isRegistered) {
    const Icon = registeredIcon === "user" ? UserCheck : Check;
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
        <Icon className="w-3 h-3" aria-hidden="true" />
        <span>Registriert</span>
      </span>
    );
  }

  if (isExpired) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-bold">
        <span>Abgelaufen</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/35 text-amber-300 text-[10px] font-bold">
      <Clock className="w-3 h-3" aria-hidden="true" />
      <span>
        Offen
        {item.expiresAt ? ` · bis ${new Date(item.expiresAt).toLocaleDateString("de-DE")}` : ""}
      </span>
    </span>
  );
}

const APPROVAL_STYLES: Record<DisplayApprovalStatus, string> = {
  APPROVED: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
  REJECTED: "bg-rose-500/15 border-rose-500/30 text-rose-300",
  PENDING: "bg-amber-500/15 border-amber-500/35 text-amber-300",
};

const APPROVAL_LABELS: Record<"user" | "admin", Record<DisplayApprovalStatus, string>> = {
  user: {
    APPROVED: "✓ Vom Admin freigegeben",
    REJECTED: "Abgelehnt",
    PENDING: "⏳ Wartet auf Admin-Freigabe",
  },
  admin: {
    APPROVED: "✓ Freigegeben",
    REJECTED: "Abgelehnt",
    PENDING: "⏳ Wartet auf Freigabe",
  },
};

interface ApprovalStatusBadgeProps {
  status: ApprovalStatus;
  variant?: "user" | "admin";
}

/** Renders the review status pill for approval requests and public collections. */
export function ApprovalStatusBadge({ status, variant = "admin" }: ApprovalStatusBadgeProps) {
  const normalizedStatus: DisplayApprovalStatus = status === "NONE" ? "PENDING" : status;
  const toneClass = APPROVAL_STYLES[normalizedStatus];
  const label = APPROVAL_LABELS[variant][normalizedStatus];
  const variantClass =
    variant === "admin"
      ? "px-2 py-0.5 rounded-full text-[10px] font-black uppercase border"
      : "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border";

  return <span className={`${variantClass} ${toneClass}`}>{label}</span>;
}
