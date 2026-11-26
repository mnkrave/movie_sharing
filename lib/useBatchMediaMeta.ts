"use client";

import { useEffect, useRef, useState } from "react";
import type { BatchMediaMeta } from "@/app/api/tmdb/batch-genres/route";

export function useBatchMediaMeta(
  items: Array<{ tmdbId: number; mediaType: "movie" | "tv" }>
) {
  const [metaMap, setMetaMap] = useState<Record<string, BatchMediaMeta>>({});
  const [loadingMeta, setLoadingMeta] = useState(false);
  const requestedKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (items.length === 0) return;

    const seenInBatch = new Set<string>();
    const missing: Array<{ id: number; type: "movie" | "tv" }> = [];

    for (const item of items) {
      const key = `${item.mediaType}_${item.tmdbId}`;
      if (requestedKeysRef.current.has(key) || seenInBatch.has(key)) continue;
      seenInBatch.add(key);
      requestedKeysRef.current.add(key);
      missing.push({ id: item.tmdbId, type: item.mediaType });
    }

    if (missing.length === 0) return;

    let active = true;
    setLoadingMeta(true);

    fetch("/api/tmdb/batch-genres", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: missing }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (
          active &&
          data?.meta &&
          typeof data.meta === "object" &&
          Object.keys(data.meta).length > 0
        ) {
          setMetaMap((prev) => ({ ...prev, ...data.meta }));
        }
      })
      .catch((err) => console.error("Failed to fetch batch metadata:", err))
      .finally(() => {
        if (active) setLoadingMeta(false);
      });

    return () => {
      active = false;
    };
  }, [items]);

  return { metaMap, loadingMeta };
}
