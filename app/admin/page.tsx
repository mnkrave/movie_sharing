"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
} from "lucide-react";

interface WhitelistEntry {
  id: string;
  email: string;
  createdAt: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [whitelist, setWhitelist] = useState<WhitelistEntry[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [lastInviteLink, setLastInviteLink] = useState<string | null>(null);
  const [emailSentNotice, setEmailSentNotice] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isAdmin =
    session?.user?.email?.toLowerCase() === "lukasreinle0@gmail.com" ||
    (session?.user as any)?.role === "ADMIN";

  const fetchAdminData = async () => {
    try {
      const [wlRes, usersRes] = await Promise.all([
        fetch("/api/admin/whitelist"),
        fetch("/api/admin/users"),
      ]);
      if (wlRes.ok) {
        const wlData = await wlRes.json();
        setWhitelist(wlData);
      }
      if (usersRes.ok) {
        const uData = await usersRes.json();
        setUsers(uData);
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

  const handleRemove = async (email: string) => {
    if (!confirm(`Möchtest du ${email} wirklich von der Whitelist entfernen?`)) return;
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Header */}
      <div className="flex items-center gap-4 p-8 rounded-3xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-[#0e1424] border border-amber-500/30 shadow-xl">
        <div className="p-3.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/40">
          <Shield className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Admin-Dashboard & Freundes-Whitelist
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Schalte die E-Mail-Adressen deiner Freunde frei und erstelle personalisierte Einladungslinks.
          </p>
        </div>
      </div>

      {/* Invite Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
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
            <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
              <span>Personalisierter Einladungslink generiert!</span>
              {emailSentNotice && (
                <span className="text-emerald-400">✓ Einladungs-E-Mail via Resend verschickt</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={lastInviteLink}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 font-mono"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(lastInviteLink)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 whitespace-nowrap"
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
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
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

      {/* Registered Users Overview */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" />
          <span>Registrierte Freunde ({users.length})</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 uppercase tracking-wider text-slate-500 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">E-Mail</th>
                <th className="py-3 px-4">Rolle</th>
                <th className="py-3 px-4 text-center">Gesehen</th>
                <th className="py-3 px-4 text-center">Watchlist</th>
                <th className="py-3 px-4 text-center">Tipps</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-bold text-white">{u.name}</td>
                  <td className="py-3 px-4 text-slate-400">{u.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === "ADMIN"
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-emerald-400">
                    {u.watchedCount}
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-sky-400">
                    {u.watchlistCount}
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-rose-400">
                    {u.recommendationsCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
