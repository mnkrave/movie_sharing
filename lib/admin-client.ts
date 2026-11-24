import type { BanTargetUser } from "@/components/BanUserModal";

export interface UpdateUserBanResult {
  ok: boolean;
  cancelled?: boolean;
  bannedAt?: string | null;
  banReason?: string | null;
}

/**
 * Updates a user's ban state via `/api/admin/users/[id]`, including optional unban
 * confirmation, error handling, and pluralized revoked-invite toast feedback.
 */
export async function updateUserBanStatus(params: {
  user: BanTargetUser;
  isBanned: boolean;
  reason?: string;
  confirmDialog?: (opts: {
    title: string;
    message: string;
    confirmLabel?: string;
    dangerous?: boolean;
  }) => Promise<boolean>;
  showToast: (message: string, opts?: { type?: "success" | "error" | "info" }) => void;
  onStart?: () => void;
}): Promise<UpdateUserBanResult> {
  const { user, isBanned, reason, confirmDialog, showToast, onStart } = params;

  if (!isBanned && confirmDialog) {
    const confirmed = await confirmDialog({
      title: `${user.name} entsperren?`,
      message: `${user.name} (${user.email}) kann sich danach sofort wieder einloggen.`,
      confirmLabel: "Entsperren",
    });
    if (!confirmed) return { ok: false, cancelled: true };
  }

  onStart?.();

  try {
    const res = await fetch(`/api/admin/users/${encodeURIComponent(user.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isBanned, reason: reason || undefined }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      showToast(
        data.error ||
          (isBanned ? "Nutzer konnte nicht gesperrt werden." : "Nutzer konnte nicht entsperrt werden."),
        { type: "error" }
      );
      return { ok: false };
    }

    const revokedCount = Number(data.revokedInvitesCount || 0);
    const revokedText =
      isBanned && revokedCount > 0
        ? ` (${revokedCount} offene Einladung${revokedCount === 1 ? "" : "en"} widerrufen)`
        : "";
    showToast(
      isBanned ? `${user.name} wurde gesperrt${revokedText}.` : `${user.name} wurde entsperrt.`,
      { type: "success" }
    );

    return {
      ok: true,
      bannedAt: isBanned ? data.user?.bannedAt ?? new Date().toISOString() : null,
      banReason: isBanned ? data.user?.banReason ?? (reason || null) : null,
    };
  } catch {
    showToast("Netzwerkfehler beim Aktualisieren des Sperr-Status.", { type: "error" });
    return { ok: false };
  }
}
