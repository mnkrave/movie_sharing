"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useMedia } from "@/components/MediaContext";
import {
  Shield,
  UserPlus,
  Mail,
  Trash2,
  Copy,
  Check,
  Users,
  AlertCircle,
  ExternalLink,
  Layers,
  X,
  Bell,
  Send,
  Play,
  Search,
  Star,
  Film,
  MessageSquare,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Eye,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { AppUserWithStats } from "@/lib/store";

const USER_COLLATOR = new Intl.Collator("de", { numeric: true, sensitivity: "base" });

interface WhitelistEntry {
  id: string;
  email: string;
  createdAt: string;
}

type UserSortKey =
  | "name"
  | "watchedCount"
  | "avgRating"
  | "watchingCount"
  | "watchlistCount"
  | "recommendationsCount"
  | "lastActivityAt";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const { confirmDialog, customCollections, approveCustomCollection, showToast } = useMedia();
  const [whitelist, setWhitelist] = useState<WhitelistEntry[]>([]);
  const [users, setUsers] = useState<AppUserWithStats[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [userSortKey, setUserSortKey] = useState<UserSortKey>("watchedCount");
  const [userSortDir, setUserSortDir] = useState<"ascending" | "descending">("descending");
  const [sortAnnouncement, setSortAnnouncement] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [lastInviteLink, setLastInviteLink] = useState<string | null>(null);
  const [emailSentNotice, setEmailSentNotice] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendingEmail, setResendingEmail] = useState<string | null>(null);
  const [alertStats, setAlertStats] = useState<{
    configured: boolean;
    fromEmail: string;
    watchlistEntries: number;
    uniqueWatchlistTitles: number;
    trackedSnapshots: number;
  } | null>(null);
  const [alertRunning, setAlertRunning] = useState<string | null>(null);
  const [alertSummary, setAlertSummary] = useState<any>(null);

  const isAdmin =
    session?.user?.email?.toLowerCase() === "lukasreinle0@gmail.com" ||
    (session?.user as any)?.role === "ADMIN";

  const platformTotals = useMemo(() => {
    let watched = 0;
    let rated = 0;
    let tips = 0;
    for (const u of users) {
      watched += u.watchedCount || 0;
      rated += u.ratedCount || 0;
      tips += u.recommendationsCount || 0;
    }
    return { watched, rated, tips };
  }, [users]);

  const sortedFilteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    const factor = userSortDir === "ascending" ? 1 : -1;
    return users
      .filter(
        (u) =>
          !q ||
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      )
      .sort((a, b) => {
        if (userSortKey === "name") {
          return factor * USER_COLLATOR.compare(a.name, b.name);
        }
        if (userSortKey === "lastActivityAt") {
          const tA = new Date(a.lastActivityAt || a.createdAt || 0).getTime();
          const tB = new Date(b.lastActivityAt || b.createdAt || 0).getTime();
          return factor * (tA - tB);
        }
        const vA = Number(a[userSortKey] ?? -1);
        const vB = Number(b[userSortKey] ?? -1);
        return factor * (vA - vB);
      });
  }, [users, userSearch, userSortKey, userSortDir]);

  const handleSortUsers = (key: UserSortKey, label: string) => {
    const nextDir: "ascending" | "descending" =
      userSortKey === key
        ? userSortDir === "ascending"
          ? "descending"
          : "ascending"
        : key === "name"
        ? "ascending"
        : "descending";
    setUserSortKey(key);
    setUserSortDir(nextDir);
    setSortAnnouncement(
      `Sortiert nach ${label}, ${nextDir === "ascending" ? "aufsteigend" : "absteigend"}, ${sortedFilteredUsers.length} Nutzer`
    );
  };

  const fetchAdminData = async () => {
    try {
      const [wlRes, usersRes, alertsRes] = await Promise.all([
        fetch("/api/admin/whitelist"),
        fetch("/api/admin/users"),
        fetch("/api/admin/watchlist-alerts"),
      ]);
      if (wlRes.ok) {
        const wlData = await wlRes.json();
        setWhitelist(wlData);
      }
      if (usersRes.ok) {
        const uData = await usersRes.json();
        setUsers(uData);
      }
      if (alertsRes.ok) {
        const aData = await alertsRes.json();
        setAlertStats(aData);
      }
    } catch (err) {
      console.error("Admin fetch error:", err);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  const handleAddWhitelist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/whitelist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Fehler beim Hinzufügen.");
      } else {
        setWhitelist(data.whitelist || []);
        setLastInviteLink(data.inviteLink);
        setEmailSentNotice(data.emailSent);
        setNewEmail("");
      }
    } catch {
      setError("Netzwerkfehler.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendInvite = async (email: string) => {
    setResendingEmail(email);
    try {
      const res = await fetch("/api/admin/whitelist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, resendOnly: true }),
      });
      const data = await res.json();
      if (res.ok && data.emailSent) {
        showToast(`Einladungs-Mail an ${email} verschickt!`, { type: "success" });
      } else {
        showToast(data.emailError || "Mail konnte nicht gesendet werden.", { type: "error" });
      }
    } catch {
      showToast("Netzwerkfehler beim Mailversand.", { type: "error" });
    } finally {
      setResendingEmail(null);
    }
  };

  const handleWatchlistAlertAction = async (action: "dry_run" | "run_live" | "send_test") => {
    setAlertRunning(action);
    try {
      const res = await fetch("/api/admin/watchlist-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Aktion fehlgeschlagen.", { type: "error" });
        return;
      }
      if (action === "send_test") {
        showToast(`Test-Watchlist-Mail (${data.itemCount} Titel) an dich gesendet!`, {
          type: "success",
        });
      } else {
        setAlertSummary(data.summary);
        fetchAdminData();
        showToast(
          action === "dry_run"
            ? `Vorschau: ${data.summary.uniqueTitlesChecked} Titel geprüft, ${data.summary.usersMatched} Treffer.`
            : `Live-Check fertig: ${data.summary.emailsSent} Mail(s) versendet.`,
          { type: "success" }
        );
      }
    } catch {
      showToast("Netzwerkfehler beim Watchlist-Check.", { type: "error" });
    } finally {
      setAlertRunning(null);
    }
  };

  const handleRemove = async (email: string) => {
    const confirmed = await confirmDialog({
      title: "E-Mail von Whitelist entfernen?",
      message: `Möchtest du ${email} wirklich von der Whitelist entfernen?`,
      confirmLabel: "Entfernen",
      dangerous: true,
    });
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/admin/whitelist?email=${encodeURIComponent(email)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const data = await res.json();
        setWhitelist(data.whitelist || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(text);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  if (status === "loading") {
    return <div className="p-12 text-center text-xs text-slate-500">Authentifizierung prüfen...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white">Zugriff verweigert</h2>
        <p className="text-sm text-slate-400">
          Dieser Bereich ist exklusiv für Lukas (Super-Admin) reserviert.
        </p>
      </div>
    );
  }

  const sortableColumns: Array<{ key: UserSortKey; label: string; align?: "left" | "center" }> = [
    { key: "name", label: "Nutzer", align: "left" },
    { key: "watchedCount", label: "Gesehen", align: "center" },
    { key: "avgRating", label: "Ø ★", align: "center" },
    { key: "watchingCount", label: "Aktiv", align: "center" },
    { key: "watchlistCount", label: "Watchlist", align: "center" },
    { key: "recommendationsCount", label: "Tipps", align: "center" },
    { key: "lastActivityAt", label: "Aktivität", align: "center" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Header */}
      <div className="space-y-5 p-5 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-[#0e1424] border border-amber-500/30 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="p-3 sm:p-3.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/40 self-start sm:self-auto">
            <Shield className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Admin-Dashboard & Nutzer-Übersicht
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Sieh dir alle Nutzerprofile, Bewertungen & Watchlists an, verwalte Einladungen und gib öffentliche Kollektionen frei.
            </p>
          </div>
        </div>

        {/* Platform KPI Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {[
            { label: "Nutzer", value: users.length, icon: Users, color: "text-indigo-400" },
            { label: "Gesehen", value: platformTotals.watched, icon: Film, color: "text-emerald-400" },
            { label: "Bewertungen", value: platformTotals.rated, icon: Star, color: "text-amber-400", fill: true },
            { label: "Tipps", value: platformTotals.tips, icon: MessageSquare, color: "text-rose-400" },
          ].map(({ label, value, icon: Icon, color, fill }) => (
            <div
              key={label}
              className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center space-y-0.5"
            >
              <div className={`flex items-center justify-center gap-1.5 ${color}`}>
                <Icon className={`w-4 h-4 ${fill ? "fill-amber-400" : ""}`} />
                <span className="text-xl font-black">{value}</span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Registered Users & Profiles Overview */}
      <div className="p-5 sm:p-8 rounded-3xl bg-slate-900/70 border border-indigo-500/25 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 id="admin-users-heading" className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <span>Alle Nutzer & Profile ({users.length})</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Klicke auf einen Nutzer, um alle gesehenen Filme, Bewertungen, Merklisten, Tipps & Kollektionen einzusehen.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="search"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Nutzer suchen..."
              aria-label="Registrierte Nutzer filtern"
              className="w-full bg-slate-950/90 border border-slate-800 focus:border-amber-400 rounded-xl py-2 pl-9 pr-8 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            {userSearch && (
              <button
                type="button"
                onClick={() => setUserSearch("")}
                aria-label="Suche leeren"
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <p role="status" className="sr-only">
          {sortAnnouncement}
        </p>

        <div
          role="region"
          aria-labelledby="admin-users-heading"
          tabIndex={0}
          className="overflow-x-auto rounded-2xl border border-slate-800/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          <table className="w-full min-w-[740px] text-left text-xs text-slate-300">
            <caption className="sr-only">
              Übersicht aller registrierten Nutzer mit Profil-Links und Statistiken
            </caption>
            <thead className="bg-slate-950/70 uppercase tracking-wider text-slate-500 border-b border-slate-800">
              <tr>
                {sortableColumns.map((col) => {
                  const isSorted = userSortKey === col.key;
                  const alignClass = col.align === "center" ? "justify-center" : "justify-start";
                  return (
                    <th
                      key={col.key}
                      scope="col"
                      aria-sort={isSorted ? userSortDir : undefined}
                      className="p-0"
                    >
                      <button
                        type="button"
                        onClick={() => handleSortUsers(col.key, col.label)}
                        className={`w-full min-h-[40px] py-3 px-3.5 flex items-center gap-1 ${alignClass} font-bold uppercase tracking-wider transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-400 cursor-pointer ${
                          isSorted ? "text-amber-300" : "text-slate-400"
                        }`}
                      >
                        <span>{col.label}</span>
                        {isSorted ? (
                          userSortDir === "ascending" ? (
                            <ArrowUp className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                          ) : (
                            <ArrowDown className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-40 flex-shrink-0" aria-hidden="true" />
                        )}
                      </button>
                    </th>
                  );
                })}
                <th scope="col" className="py-3 px-3.5 text-right font-bold text-slate-400">
                  Profil
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sortedFilteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Keine passenden Nutzer gefunden.
                  </td>
                </tr>
              ) : (
                sortedFilteredUsers.map((u) => {
                  const profileHref = `/admin/users/${encodeURIComponent(u.id)}`;
                  const activityDate = u.lastActivityAt || u.createdAt;
                  return (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition">
                      <th scope="row" className="py-3 px-3.5 font-normal text-left">
                        <Link
                          href={profileHref}
                          className="flex items-center gap-2.5 group min-w-0"
                        >
                          {u.image ? (
                            <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-slate-700 group-hover:border-amber-400/60 flex-shrink-0">
                              <Image src={u.image} alt={u.name} fill sizes="32px" className="object-cover" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-amber-500 flex items-center justify-center text-black font-black text-xs flex-shrink-0">
                              {u.name.slice(0, 1)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white group-hover:text-amber-300 transition truncate">
                                {u.name}
                              </span>
                              {u.role === "ADMIN" && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                                  ADMIN
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 truncate max-w-[200px]">
                              {u.email}
                            </p>
                          </div>
                        </Link>
                      </th>
                      <td className="py-3 px-3.5 text-center">
                        <span className="font-bold text-emerald-400">{u.watchedCount}</span>
                        {typeof u.ratedCount === "number" && (
                          <span className="block text-[10px] text-slate-500">{u.ratedCount} ★</span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-center font-bold text-amber-300">
                        {u.avgRating ? `${u.avgRating} ★` : "–"}
                      </td>
                      <td className="py-3 px-3.5 text-center font-semibold text-cyan-400">
                        {u.watchingCount || 0}
                      </td>
                      <td className="py-3 px-3.5 text-center font-semibold text-sky-400">
                        {u.watchlistCount}
                      </td>
                      <td className="py-3 px-3.5 text-center font-semibold text-rose-400">
                        {u.recommendationsCount}
                      </td>
                      <td className="py-3 px-3.5 text-center text-slate-400 whitespace-nowrap">
                        <time dateTime={activityDate}>
                          {new Date(activityDate).toLocaleDateString("de-DE")}
                        </time>
                      </td>
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <Link
                          href={profileHref}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-black border border-amber-500/35 font-bold text-[11px] transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ansehen</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Public Collections Approval Queue */}
      {customCollections.filter((c) => c.visibility === "PUBLIC").length > 0 && (
        <div className="p-5 sm:p-8 rounded-3xl bg-slate-900/70 border border-amber-500/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <span>
                Öffentliche Freunde-Kollektionen & Freigaben (
                {
                  customCollections.filter(
                    (c) => c.visibility === "PUBLIC" && c.approvalStatus === "PENDING"
                  ).length
                }{" "}
                offen)
              </span>
            </h3>
            <Link
              href="/collections"
              className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>Zu allen Kollektionen</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {customCollections
              .filter((c) => c.visibility === "PUBLIC")
              .map((col) => (
                <div
                  key={col.id}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/collections/${col.id}`}
                        className="text-sm font-black text-white hover:text-amber-400 transition"
                      >
                        {col.emoji} {col.name}
                      </Link>
                      <span className="text-xs text-slate-400">
                        von <strong className="text-slate-200">@{col.ownerName}</strong> ({col.movies.length} Titel)
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          col.approvalStatus === "APPROVED"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : col.approvalStatus === "REJECTED"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        }`}
                      >
                        {col.approvalStatus === "APPROVED"
                          ? "✓ Freigegeben"
                          : col.approvalStatus === "REJECTED"
                          ? "Abgelehnt"
                          : "⏳ Wartet auf Freigabe"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">{col.description}</p>
                    <p className="text-[11px] text-slate-500">
                      Enthält: {col.movies.map((m) => m.title).join(", ")}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {col.approvalStatus !== "APPROVED" && (
                      <button
                        type="button"
                        onClick={async () => {
                          await approveCustomCollection(col.id, "APPROVED");
                          showToast(`„${col.name}“ öffentlich freigegeben!`, { type: "success" });
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Approve</span>
                      </button>
                    )}
                    {col.approvalStatus !== "REJECTED" && (
                      <button
                        type="button"
                        onClick={async () => {
                          await approveCustomCollection(col.id, "REJECTED");
                          showToast(`Öffentliche Freigabe für „${col.name}“ entzogen.`, {
                            type: "info",
                          });
                        }}
                        className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 font-bold text-xs border border-rose-500/30 flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Ablehnen</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Invite Form */}
      <div className="p-5 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-amber-400" />
          <span>Freund freischalten & einladen</span>
        </h3>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAddWhitelist} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="E-Mail deines Freundes (z. B. freund@gmail.com)"
              className="w-full bg-slate-950/90 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !newEmail.trim()}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition shadow-lg shadow-amber-500/20 disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? "Wird freigeschaltet..." : "Freischalten & Link generieren"}
          </button>
        </form>

        {lastInviteLink && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 mt-4 animate-in fade-in">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-amber-300 font-bold">
              <span>Personalisierter Einladungslink generiert!</span>
              {emailSentNotice && (
                <span className="text-emerald-400">✓ Einladungs-E-Mail via Resend verschickt</span>
              )}
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                readOnly
                value={lastInviteLink}
                className="w-full min-w-0 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 font-mono"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(lastInviteLink)}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 whitespace-nowrap"
              >
                {copiedLink === lastInviteLink ? (
                  <>
                    <Check className="w-4 h-4 text-black" /> Kopiert!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Link kopieren
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Whitelisted Emails Table */}
      <div className="p-5 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Mail className="w-5 h-5 text-sky-400" />
          <span>Freigeschaltete E-Mails ({whitelist.length})</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 uppercase tracking-wider text-slate-500 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">E-Mail</th>
                <th className="py-3 px-4">Freigeschaltet am</th>
                <th className="py-3 px-4 text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {whitelist.map((item) => {
                const inviteUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/register?email=${encodeURIComponent(item.email)}`;
                return (
                  <tr key={item.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-medium text-white flex items-center gap-2">
                      <span>{item.email}</span>
                      {item.email.toLowerCase() === "lukasreinle0@gmail.com" && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">
                          Admin
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(item.createdAt).toLocaleDateString("de-DE")}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handleResendInvite(item.email)}
                        disabled={resendingEmail === item.email}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-[11px] disabled:opacity-50"
                      >
                        <Send className="w-3 h-3" />
                        <span>{resendingEmail === item.email ? "Sendet..." : "Mail"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(inviteUrl)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                      >
                        {copiedLink === inviteUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Link</span>
                      </button>
                      {item.email.toLowerCase() !== "lukasreinle0@gmail.com" && (
                        <button
                          type="button"
                          onClick={() => handleRemove(item.email)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[11px]"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Watchlist Streaming Alerts Panel */}
      <div className="p-5 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              <span>Watchlist-Streaming-Alarm (Resend)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Prüft täglich um 08:00 Uhr, ob Watchlist-Titel ohne Anbieter neu in den Abos deiner Freunde starten.
            </p>
          </div>
          {alertStats && (
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-bold self-start sm:self-auto ${
                alertStats.configured
                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                  : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
              }`}
            >
              {alertStats.configured ? `✓ Aktiv (${alertStats.fromEmail})` : "RESEND_API_KEY fehlt"}
            </span>
          )}
        </div>

        {alertStats && (
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="text-lg font-black text-white">{alertStats.watchlistEntries}</div>
              <div className="text-[11px] text-slate-400">Watchlist-Einträge</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="text-lg font-black text-amber-400">{alertStats.uniqueWatchlistTitles}</div>
              <div className="text-[11px] text-slate-400">Einzigartige Titel</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="text-lg font-black text-sky-400">{alertStats.trackedSnapshots}</div>
              <div className="text-[11px] text-slate-400">Provider-Snapshots</div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            disabled={alertRunning !== null}
            onClick={() => handleWatchlistAlertAction("send_test")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{alertRunning === "send_test" ? "Sendet..." : "Test-Mail an mich senden"}</span>
          </button>
          <button
            type="button"
            disabled={alertRunning !== null}
            onClick={() => handleWatchlistAlertAction("dry_run")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{alertRunning === "dry_run" ? "Prüft..." : "Vorschau (Dry-Run)"}</span>
          </button>
          <button
            type="button"
            disabled={alertRunning !== null}
            onClick={() => handleWatchlistAlertAction("run_live")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs transition disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{alertRunning === "run_live" ? "Läuft..." : "Jetzt prüfen & Mails senden"}</span>
          </button>
        </div>

        {alertSummary && (
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1.5">
            <div className="font-bold text-white">
              Ergebnis ({alertSummary.dryRun ? "Vorschau – nichts verändert" : "Live-Lauf"}):
            </div>
            <div>
              Geprüfte Titel: <strong>{alertSummary.uniqueTitlesChecked}</strong> · Neue Baselines:{" "}
              <strong>{alertSummary.newBaselinesCreated}</strong> · Neu im Stream (vorher 0):{" "}
              <strong>{alertSummary.titlesTransitionedFromNone}</strong> · Mails gesendet:{" "}
              <strong className="text-emerald-400">{alertSummary.emailsSent}</strong>
            </div>
            {Array.isArray(alertSummary.matches) && alertSummary.matches.length > 0 && (
              <ul className="list-disc list-inside text-slate-400 pt-1">
                {alertSummary.matches.slice(0, 10).map((m: any, idx: number) => (
                  <li key={idx}>
                    {m.userEmail}: <strong className="text-slate-200">{m.title}</strong> ({m.providers.join(", ")})
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
