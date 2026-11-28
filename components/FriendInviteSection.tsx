"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Mail,
  Send,
  Copy,
  Check,
  AlertCircle,
  ShieldCheck,
  Trash2,
  Share2,
} from "lucide-react";
import type {
  AppInviteApprovalRequest,
  AppWhitelistEntry,
  UserInviteQuota,
} from "@/lib/store";
import { isValidEmailAddress } from "@/lib/constants";
import { useMedia } from "./MediaContext";
import { shareOrCopy } from "@/lib/share";
import {
  ApprovalStatusBadge,
  getInviteEntryState,
  InviteStatusBadge,
} from "./InviteStatusBadge";

export function FriendInviteSection({ initialEmail = "" }: { initialEmail?: string }) {
  const { data: session, status } = useSession();
  const { confirmDialog, showToast } = useMedia();

  const [email, setEmail] = useState(initialEmail);

  useEffect(() => {
    if (initialEmail && initialEmail.trim()) {
      setEmail(initialEmail.trim());
    }
  }, [initialEmail]);
  const [hasEdited, setHasEdited] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [blockedApprovalEmail, setBlockedApprovalEmail] = useState<string | null>(null);
  const [requestingApproval, setRequestingApproval] = useState(false);
  const [statusAnnouncement, setStatusAnnouncement] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [invites, setInvites] = useState<AppWhitelistEntry[]>([]);
  const [approvalRequests, setApprovalRequests] = useState<AppInviteApprovalRequest[]>([]);
  const [quota, setQuota] = useState<UserInviteQuota | null>(null);
  const [loadingInvites, setLoadingInvites] = useState(false);
  const [lastResult, setLastResult] = useState<{
    email: string;
    inviteLink: string;
    emailSent: boolean;
    emailError?: string;
    adminNotified: boolean;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const loadInvites = useCallback(async () => {
    setLoadingInvites(true);
    try {
      const res = await fetch("/api/invites", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setInvites(Array.isArray(data.invites) ? data.invites : []);
        setApprovalRequests(Array.isArray(data.approvalRequests) ? data.approvalRequests : []);
        setQuota(data.quota || null);
      }
    } catch {
      // ignore network error on background load
    } finally {
      setLoadingInvites(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      loadInvites();
    }
  }, [status, loadInvites]);

  if (status !== "authenticated" || !session?.user) {
    return null;
  }

  const validateEmailValue = (raw: string): string | null => {
    const trimmed = raw.trim();
    if (!trimmed) {
      return "Bitte gib eine E-Mail-Adresse im Format freund@example.com ein.";
    }
    if (!isValidEmailAddress(trimmed)) {
      return "Bitte gib eine gültige E-Mail-Adresse im Format freund@example.com ein.";
    }
    return null;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setEmail(next);
    setHasEdited(true);
    if (serverError) {
      setServerError(null);
      setBlockedApprovalEmail(null);
    }
    if (fieldError && validateEmailValue(next) === null) {
      setFieldError(null);
    }
  };

  const handleEmailBlur = () => {
    if (!hasEdited || !email.trim()) return;
    const err = validateEmailValue(email);
    setFieldError(err);
    if (err) {
      setStatusAnnouncement(`Fehler: ${err}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const validationErr = validateEmailValue(email);
    if (validationErr) {
      setFieldError(validationErr);
      setStatusAnnouncement(`Fehler: ${validationErr}`);
      inputRef.current?.focus();
      return;
    }

    setFieldError(null);
    setServerError(null);
    setBlockedApprovalEmail(null);
    setSubmitting(true);

    try {
      const targetEmail = email.trim().toLowerCase();
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail }),
      });
      const data = await res.json();

      if (!res.ok) {
        const msg = data.error || "Einladung konnte nicht erstellt werden.";
        setServerError(msg);
        setBlockedApprovalEmail(data.canRequestAdminApproval ? targetEmail : null);
        setStatusAnnouncement(`Fehler: ${msg}`);
        inputRef.current?.focus();
        return;
      }

      setInvites(Array.isArray(data.invites) ? data.invites : invites);
      if (data.quota) setQuota(data.quota);
      setLastResult({
        email: data.invite?.email || email.trim().toLowerCase(),
        inviteLink: data.inviteLink,
        emailSent: Boolean(data.emailSent),
        emailError: data.emailError,
        adminNotified: Boolean(data.adminNotified),
      });
      setEmail("");
      setHasEdited(false);
      const toastMsg = data.emailSent
        ? `Einladung an ${data.invite?.email || email.trim()} verschickt!`
        : "E-Mail freigeschaltet! Du kannst den Einladungslink direkt teilen.";
      setStatusAnnouncement(toastMsg);
      showToast(toastMsg, { type: "success" });
    } catch {
      const msg = "Netzwerkfehler beim Versenden der Einladung.";
      setServerError(msg);
      setStatusAnnouncement(`Fehler: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestAdminApproval = async () => {
    if (!blockedApprovalEmail || requestingApproval) return;
    setRequestingApproval(true);
    try {
      const res = await fetch("/api/invites/request-approval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: blockedApprovalEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.error || "Freigabe-Anfrage konnte nicht gesendet werden.";
        setServerError(msg);
        setBlockedApprovalEmail(null);
        showToast(msg, { type: "error" });
        return;
      }
      if (Array.isArray(data.approvalRequests)) {
        setApprovalRequests(data.approvalRequests);
      }
      setServerError(null);
      setBlockedApprovalEmail(null);
      setEmail("");
      setHasEdited(false);
      const okMsg = `Freigabe-Anfrage für ${data.request?.targetEmail || blockedApprovalEmail} an den Admin gesendet!`;
      setStatusAnnouncement(okMsg);
      showToast(okMsg, { type: "success" });
    } catch {
      showToast("Netzwerkfehler beim Senden der Anfrage.", { type: "error" });
    } finally {
      setRequestingApproval(false);
    }
  };

  const handleRevoke = async (entry: AppWhitelistEntry) => {
    const confirmed = await confirmDialog({
      title: "Einladung zurückziehen?",
      message: `Möchtest du die offene Einladung für ${entry.email} wirklich zurückziehen? Die E-Mail kann sich danach nicht mehr registrieren.`,
      confirmLabel: "Zurückziehen",
      dangerous: true,
    });
    if (!confirmed) return;

    setRevokingId(entry.id);
    try {
      const res = await fetch(`/api/invites?id=${encodeURIComponent(entry.id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Einladung konnte nicht zurückgezogen werden.", { type: "error" });
        return;
      }
      setInvites(Array.isArray(data.invites) ? data.invites : []);
      if (data.quota) setQuota(data.quota);
      showToast(`Einladung für ${entry.email} zurückgezogen.`, { type: "info" });
    } catch {
      showToast("Netzwerkfehler beim Zurückziehen.", { type: "error" });
    } finally {
      setRevokingId(null);
    }
  };

  const handleCopyOrShare = async (link: string, key: string) => {
    const outcome = await shareOrCopy({
      title: "CineCircle Einladung",
      text: "Ich habe dich zu CineCircle eingeladen — erstelle hier deinen Account:",
      url: link,
    });
    if (outcome === "copied") {
      setCopiedKey(key);
      showToast("Einladungslink kopiert!", { type: "success" });
      setTimeout(() => setCopiedKey(null), 2200);
    } else if (outcome === "error") {
      showToast("Link konnte nicht kopiert werden.", { type: "error" });
    }
  };

  const describedBy = fieldError
    ? "friend-invite-hint friend-invite-error"
    : "friend-invite-hint";

  const nowMs = Date.now();

  return (
    <section
      id="invite-friends"
      aria-labelledby="friend-invite-heading"
      className="p-5 sm:p-6 rounded-2xl bg-card border border-border space-y-5 shadow-sm scroll-mt-24"
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="space-y-1">
          <h2
            id="friend-invite-heading"
            className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2"
          >
            <Mail className="w-4 h-4 text-primary-text" aria-hidden="true" />
            <span>Freunde per E-Mail einladen</span>
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
            Lade Freunde oder Familie ein. Sie erhalten sofort eine Einladungs-Mail, werden freigeschaltet und nach der Registrierung direkt als Freund vorgeschlagen.
          </p>
        </div>

        {quota && (
          <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
            {quota.isAdmin ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-soft border border-primary/30 text-[11px] font-bold text-primary-text">
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Admin · Ohne Limit</span>
              </span>
            ) : (
              <>
                <span className="px-2.5 py-1 rounded-full bg-muted border border-border text-[11px] font-semibold text-muted-foreground">
                  Heute: <strong className="text-foreground">{quota.used24h}/{quota.limit24h}</strong>
                </span>
                <span className="px-2.5 py-1 rounded-full bg-muted border border-border text-[11px] font-semibold text-muted-foreground">
                  Offen: <strong className="text-foreground">{quota.openPending}/{quota.maxOpenPending}</strong>
                </span>
                <span className="px-2.5 py-1 rounded-full bg-muted border border-border text-[11px] font-semibold text-muted-foreground">
                  30 Tage: <strong className="text-foreground">{quota.used30d}/{quota.limit30d}</strong>
                </span>
              </>
            )}
          </div>
        )}
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {statusAnnouncement}
      </p>

      <form
        method="post"
        noValidate
        onSubmit={handleSubmit}
        aria-labelledby="friend-invite-heading"
        className="space-y-3"
      >
        <div className="space-y-1">
          <label
            htmlFor="friend-invite-email"
            className="block text-xs font-bold text-foreground"
          >
            E-Mail-Adresse <span aria-hidden="true" className="text-primary-text">*</span>
          </label>
          <p id="friend-invite-hint" className="text-[11px] text-muted-foreground">
            Format: freund@example.com — Einladungen sind {quota?.inviteTtlDays ?? 14} Tage gültig.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-start">
          <div className="flex-1 space-y-1.5">
            <div className="relative">
              <Mail
                className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                ref={inputRef}
                id="friend-invite-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                enterKeyHint="send"
                required
                maxLength={254}
                value={email}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                aria-invalid={fieldError ? "true" : "false"}
                aria-describedby={describedBy}
                placeholder="freund@example.com"
                className={`w-full min-h-[48px] sm:min-h-0 bg-input border rounded-xl py-2.5 pl-10 pr-3 text-base sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition ${
                  fieldError
                    ? "border-rose-500 bg-rose-500/10"
                    : "border-border focus:border-primary user-invalid:border-rose-500"
                }`}
              />
            </div>

            {fieldError && (
              <p
                id="friend-invite-error"
                className="text-xs text-rose-600 dark:text-rose-300 flex items-center gap-1.5 font-medium"
              >
                <AlertCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" aria-hidden="true" />
                <span>{fieldError}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="min-h-[48px] sm:min-h-[42px] px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
            <span>{submitting ? "Wird eingeladen..." : "Einladung senden"}</span>
          </button>
        </div>

        {serverError && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/35 text-rose-700 dark:text-rose-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span>{serverError}</span>
            </div>
            {blockedApprovalEmail && (
              <button
                type="button"
                disabled={requestingApproval}
                onClick={handleRequestAdminApproval}
                className="min-h-[40px] sm:min-h-0 px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs transition whitespace-nowrap disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer flex-shrink-0"
              >
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                <span>
                  {requestingApproval ? "Wird angefragt..." : "Admin um Freigabe bitten"}
                </span>
              </button>
            )}
          </div>
        )}
      </form>

      {/* Latest Invite Link Confirmation */}
      {lastResult && (
        <div className="p-4 rounded-xl bg-primary-soft border border-primary/30 space-y-2.5 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-primary-text">
              Einladung für {lastResult.email} aktiviert!
            </span>
            <span className={lastResult.emailSent ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-muted-foreground"}>
              {lastResult.emailSent
                ? "✓ Einladungs-E-Mail verschickt"
                : "Hinweis: Mailversand inaktiv — teile den Link direkt"}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              readOnly
              aria-label="Persönlicher Einladungslink"
              value={lastResult.inviteLink}
              className="w-full min-w-0 bg-input border border-border rounded-xl px-3 py-2 text-xs text-foreground font-mono"
            />
            <button
              type="button"
              onClick={() => handleCopyOrShare(lastResult.inviteLink, "latest")}
              className="min-h-[44px] sm:min-h-0 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold whitespace-nowrap cursor-pointer"
            >
              {copiedKey === "latest" ? (
                <>
                  <Check className="w-4 h-4" aria-hidden="true" />
                  <span>Kopiert!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" aria-hidden="true" />
                  <span>Link teilen</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* User's Own Pending / Reviewed Admin Approval Requests */}
      {!loadingInvites && approvalRequests.length > 0 && (
        <div className="pt-3 border-t border-border space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Deine Admin-Freigabe-Anfragen ({approvalRequests.length})
          </h3>
          <div className="space-y-2">
            {approvalRequests.map((req) => (
              <div
                key={req.id}
                className="p-3 rounded-xl bg-muted/60 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="min-w-0 space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-foreground break-all">{req.targetEmail}</span>
                    <ApprovalStatusBadge status={req.status} variant="user" />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Limit: {req.blockedReason} · {new Date(req.createdAt).toLocaleDateString("de-DE")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User's Own Sent Invites List */}
      {!loadingInvites && invites.length > 0 && (
        <div className="pt-3 border-t border-border space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Deine gesendeten Einladungen ({invites.length})
          </h3>
          <div className="space-y-2">
            {invites.map((item) => {
              const { isRegistered, isExpired } = getInviteEntryState(item, nowMs);
              const inviteUrl =
                typeof window !== "undefined"
                  ? `${window.location.origin}/register?email=${encodeURIComponent(item.email)}`
                  : `/register?email=${encodeURIComponent(item.email)}`;

              return (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-muted/60 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-foreground break-all">{item.email}</span>
                      <InviteStatusBadge item={item} nowMs={nowMs} registeredIcon="user" />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Eingeladen am {new Date(item.createdAt).toLocaleDateString("de-DE")}
                    </p>
                  </div>

                  {!isRegistered && !isExpired && (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopyOrShare(inviteUrl, item.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-card hover:bg-muted border border-border text-foreground text-[11px] font-bold transition cursor-pointer"
                      >
                        {copiedKey === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                        )}
                        <span>Link</span>
                      </button>
                      <button
                        type="button"
                        disabled={revokingId === item.id}
                        onClick={() => handleRevoke(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-600 dark:text-rose-300 text-[11px] font-bold transition disabled:opacity-50 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{revokingId === item.id ? "..." : "Zurückziehen"}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
