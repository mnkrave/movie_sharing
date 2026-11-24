"use client";

import { useEffect, useRef } from "react";
import { useMedia } from "./MediaContext";

export function ServiceWorkerRegister() {
  const { showToast, refreshCommunity } = useMedia();
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    // 1. Register Service Worker reliably even if Next.js hydrates after window "load"
    const registerSw = () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          reg.addEventListener("updatefound", () => {
            const installingWorker = reg.installing;
            if (!installingWorker) return;
            installingWorker.addEventListener("statechange", () => {
              if (
                installingWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                showToast("Neue Version von CineCircle verfügbar.", {
                  type: "info",
                  actionLabel: "Aktualisieren",
                  onAction: () => window.location.reload(),
                  durationMs: 8000,
                });
              }
            });
          });
        })
        .catch((err) => {
          console.warn("Service Worker Registration fehlgeschlagen:", err);
        });
    };

    let boundLoad = false;
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      if (document.readyState === "complete") {
        registerSw();
      } else {
        boundLoad = true;
        window.addEventListener("load", registerSw);
      }
    }

    // 2. Online / Offline connection listeners
    const handleOnline = () => {
      if (wasOfflineRef.current) {
        showToast("Wieder online! Filmdaten werden synchronisiert.", {
          type: "success",
        });
        refreshCommunity();
        wasOfflineRef.current = false;
      }
    };

    const handleOffline = () => {
      wasOfflineRef.current = true;
      showToast("Keine Internetverbindung. Deine gespeicherte Merkliste bleibt sichtbar.", {
        type: "info",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      if (boundLoad) window.removeEventListener("load", registerSw);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [showToast, refreshCommunity]);

  return null;
}
