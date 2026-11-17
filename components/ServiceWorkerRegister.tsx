"use client";

import { useEffect, useRef } from "react";
import { useMedia } from "./MediaContext";

export function ServiceWorkerRegister() {
  const { showToast, refreshCommunity } = useMedia();
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    // 1. Register Service Worker in browser
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            // Check for updates
            reg.addEventListener("updatefound", () => {
              const installingWorker = reg.installing;
              if (installingWorker) {
                installingWorker.addEventListener("statechange", () => {
                  if (
                    installingWorker.state === "installed" &&
                    navigator.serviceWorker.controller
                  ) {
                    // New version available
                    console.log("CineCircle Service Worker aktualisiert.");
                  }
                });
              }
            });
          })
          .catch((err) => {
            console.warn("Service Worker Registration fehlgeschlagen:", err);
          });
      });
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
      showToast("Keine Internetverbindung. Gespeicherte Inhalte bleiben sichtbar.", {
        type: "info",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [showToast, refreshCommunity]);

  return null;
}
