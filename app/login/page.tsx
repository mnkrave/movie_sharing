"use client";

import React, { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Film, Lock, Mail, AlertCircle, LogIn, Eye, EyeOff } from "lucide-react";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { clearOfflineWatchlist } from "@/lib/offline-watchlist";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const nav = window.navigator as Navigator & { standalone?: boolean };
    setIsStandalone(
      Boolean(nav.standalone) || window.matchMedia("(display-mode: standalone)").matches
    );
    const errParam = new URLSearchParams(window.location.search).get("error");
    if (errParam === "AccountBanned" || errParam === "ACCOUNT_BANNED") {
      setError(
        "Dein Account wurde vom Admin gesperrt. Bei Fragen wende dich bitte an den Administrator."
      );
    } else if (errParam === "AccessDenied") {
      setError(
        "Zugriff verweigert: Deine E-Mail ist noch nicht eingeladen oder die Einladung ist abgelaufen."
      );
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      clearOfflineWatchlist();
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error === "ACCOUNT_BANNED") {
        setError(
          "Dein Account wurde vom Admin gesperrt. Bei Fragen wende dich bitte an den Administrator."
        );
      } else if (res?.error) {
        setError(
          "Anmeldung fehlgeschlagen. Bitte prüfe deine Zugangsdaten oder ob deine E-Mail freigeschaltet ist."
        );
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Ein unerwarteter Fehler ist aufgetreten.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80dvh] flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="bg-[#0e1422] border border-slate-800 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-black font-black mx-auto shadow-lg shadow-amber-500/20">
            <Film className="w-6 h-6 fill-black" />
          </div>
          <h1 className="text-2xl font-black text-white">Willkommen bei CineCircle</h1>
          <p className="text-xs text-slate-400">
            Filme & Serien mit deinen Freunden teilen & weltweite Streams entdecken.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col gap-6">
          {/* Google OAuth Login (shown below E-Mail form in installed Home-Screen PWA where OAuth leaves app) */}
          <div className={isStandalone ? "order-3 space-y-3" : "order-1 space-y-3"}>
            <GoogleSignInButton />
            {isStandalone && (
              <p className="text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 leading-relaxed">
                Hinweis für die Home-Screen-App: Für den direkten Login ohne Browser-Wechsel nutze am besten E-Mail &amp; Passwort oben.
              </p>
            )}
          </div>

          <div className="order-2 flex items-center gap-3">
            <div className="h-px bg-slate-800 flex-1" />
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-mono">
              {isStandalone ? "Oder mit Google" : "Oder mit E-Mail"}
            </span>
            <div className="h-px bg-slate-800 flex-1" />
          </div>

          {/* Credentials Login Form */}
          <form onSubmit={handleSubmit} className={isStandalone ? "order-1 space-y-4" : "order-3 space-y-4"}>
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-slate-300 mb-1.5">
                E-Mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-email"
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
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Passwort
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  enterKeyHint="done"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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
              disabled={loading}
              className="w-full min-h-[44px] sm:min-h-0 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {loading ? "Wird angemeldet..." : "Einloggen"}
            </button>
          </form>
        </div>

        <div className="pt-2 text-center text-xs text-slate-400">
          Noch keinen Account?{" "}
          <Link href="/register" className="text-amber-400 font-semibold hover:underline">
            Hier registrieren
          </Link>
        </div>
      </div>
    </div>
  );
}
