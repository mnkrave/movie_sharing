"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Film, Lock, Mail, User, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { clearOfflineWatchlist } from "@/lib/offline-watchlist";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registrierung fehlgeschlagen.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      clearOfflineWatchlist();
      // Auto login
      setTimeout(async () => {
        await signIn("credentials", {
          redirect: false,
          email,
          password,
        });
        router.push("/");
        router.refresh();
      }, 1000);
    } catch {
      setError("Ein Netzwerkfehler ist aufgetreten.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0e1422] border border-slate-800 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-black font-black mx-auto shadow-lg shadow-amber-500/20">
          <Film className="w-6 h-6 fill-black" />
        </div>
        <h1 className="text-2xl font-black text-white">Freundes-Account erstellen</h1>
        <p className="text-xs text-slate-400">
          Tritt dem Kreis bei und teile deine Lieblingsfilme & Serien.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>Account erfolgreich erstellt! Du wirst eingeloggt...</span>
        </div>
      )}

      <GoogleSignInButton label="Direkt mit Google anmelden" />

      <div className="flex items-center gap-3">
        <div className="h-px bg-slate-800 flex-1" />
        <span className="text-[11px] uppercase tracking-wider text-slate-500 font-mono">
          Oder mit Passwort
        </span>
        <div className="h-px bg-slate-800 flex-1" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="register-name" className="block text-xs font-semibold text-slate-300 mb-1.5">
            Dein Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="register-name"
              name="name"
              type="text"
              autoComplete="name"
              enterKeyHint="next"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z. B. Max"
              className="w-full min-h-[44px] sm:min-h-0 bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <div>
          <label htmlFor="register-email" className="block text-xs font-semibold text-slate-300 mb-1.5">
            E-Mail
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="register-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              enterKeyHint="next"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="deine@email.de"
              className="w-full min-h-[44px] sm:min-h-0 bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            * Hinweis: Deine E-Mail muss von einem Mitglied oder Admin eingeladen worden sein.
          </p>
        </div>

        <div>
          <label htmlFor="register-password" className="block text-xs font-semibold text-slate-300 mb-1.5">
            Passwort
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="register-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              enterKeyHint="done"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mindestens 6 Zeichen"
              className="w-full min-h-[44px] sm:min-h-0 bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-10 pr-11 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
              className="absolute right-1 top-1/2 -translate-y-1/2 min-w-[40px] min-h-[40px] sm:min-w-0 sm:min-h-0 p-2 text-slate-400 hover:text-white rounded-lg flex items-center justify-center transition"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || success}
          className="w-full min-h-[44px] sm:min-h-0 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition shadow-lg shadow-amber-500/20 disabled:opacity-50"
        >
          {loading ? "Wird erstellt..." : "Kostenlos registrieren"}
        </button>
      </form>

      <div className="pt-2 text-center text-xs text-slate-400">
        Bereits registriert?{" "}
        <Link href="/login" className="text-amber-400 font-semibold hover:underline">
          Hier einloggen
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-[80dvh] flex items-center justify-center px-4 py-8 sm:py-12">
      <Suspense fallback={<div className="text-white text-xs">Laden...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
