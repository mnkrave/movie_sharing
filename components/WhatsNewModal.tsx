"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Sparkles, X } from "lucide-react";
import { BottomSheetDialog } from "./BottomSheetDialog";
import { getLatestRelease } from "@/lib/changelog";

const SEEN_RELEASE_STORAGE_KEY = "cinecircle_seen_release_id";
const EXCLUDED_PATH_PREFIXES = ["/login", "/register", "/offline"];

function readSeenReleaseCache(): string | null {
  try {
    return localStorage.getItem(SEEN_RELEASE_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeSeenReleaseCache(releaseId: string) {
  try {
    localStorage.setItem(SEEN_RELEASE_STORAGE_KEY, releaseId);
  } catch {
    // ignore storage errors (e.g. private browsing restrictions)
  }
}

function persistReleaseSeen(releaseId: string) {
  writeSeenReleaseCache(releaseId);
  fetch("/api/user/release-seen", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ releaseId }),
  }).catch(() => {});
}

export function WhatsNewModal() {
  const latestRelease = getLatestRelease();
  const { status } = useSession();
  const pathname = usePathname() || "";
  const [isOpen, setIsOpen] = useState(false);

  const isExcludedRoute = EXCLUDED_PATH_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  useEffect(() => {
    if (!latestRelease || status !== "authenticated" || isExcludedRoute) {
      return;
    }

    if (readSeenReleaseCache() === latestRelease.id) {
      return;
    }

    const controller = new AbortController();

    fetch("/api/user/release-seen", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { lastSeenReleaseId?: string | null; createdAt?: string | null } | null) => {
        if (!data || controller.signal.aborted) return;

        if (data.lastSeenReleaseId === latestRelease.id) {
          writeSeenReleaseCache(latestRelease.id);
          return;
        }

        // Do not show release notes from before the user's account existed
        if (data.createdAt) {
          const accountCreatedMs = Date.parse(data.createdAt);
          const releaseEndOfDayMs = Date.parse(`${latestRelease.date}T23:59:59.999Z`);
          if (
            Number.isFinite(accountCreatedMs) &&
            Number.isFinite(releaseEndOfDayMs) &&
            accountCreatedMs > releaseEndOfDayMs
          ) {
            persistReleaseSeen(latestRelease.id);
            return;
          }
        }

        setIsOpen(true);
      })
      .catch(() => {});

    return () => {
      controller.abort();
    };
  }, [latestRelease, status, isExcludedRoute]);

  const handleDismiss = useCallback(() => {
    if (!latestRelease) return;
    setIsOpen(false);
    persistReleaseSeen(latestRelease.id);
  }, [latestRelease]);

  if (!latestRelease || !isOpen) return null;

  return (
    <BottomSheetDialog
      isOpen={isOpen}
      onClose={handleDismiss}
      ariaLabelledBy="whats-new-title"
      maxWidthClass="max-w-lg"
      panelClassName="bg-slate-950 border border-amber-500/30 sm:rounded-3xl p-5 sm:p-6 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:pb-6 shadow-2xl space-y-5 text-white"
    >
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 space-y-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
              Neu in CineCircle
            </span>
            <h2 id="whats-new-title" className="text-lg font-black text-white leading-snug">
              {latestRelease.title}
            </h2>
            {latestRelease.summary && (
              <p className="text-xs text-slate-400 leading-relaxed">
                {latestRelease.summary}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Neuigkeiten schließen"
          className="min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition flex-shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <ul className="space-y-2.5 max-h-[55dvh] overflow-y-auto pr-0.5">
        {latestRelease.highlights.map((item, idx) => (
          <li
            key={`${item.title}-${idx}`}
            className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800/90"
          >
            {item.emoji && (
              <span className="text-lg leading-none mt-0.5 flex-shrink-0" aria-hidden="true">
                {item.emoji}
              </span>
            )}
            <div className="min-w-0 space-y-0.5">
              <p className="text-sm font-bold text-white leading-snug">{item.title}</p>
              <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={handleDismiss}
          className="w-full sm:w-auto min-h-[44px] sm:min-h-0 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer"
        >
          Alles klar
        </button>
      </div>
    </BottomSheetDialog>
  );
}
