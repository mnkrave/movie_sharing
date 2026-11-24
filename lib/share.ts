/**
 * Shared mobile-first sharing & media deep-link helpers.
 * Uses the native Web Share API when available with graceful clipboard fallback.
 */

export type ShareOutcome = "shared" | "copied" | "cancelled" | "error";

export async function shareOrCopy(params: {
  title: string;
  text?: string;
  url: string;
}): Promise<ShareOutcome> {
  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({
        title: params.title,
        text: params.text,
        url: params.url,
      });
      return "shared";
    } catch (err: any) {
      if (err?.name === "AbortError") {
        return "cancelled";
      }
      // Fall through to clipboard fallback if Web Share fails
    }
  }

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(params.url);
      return "copied";
    } catch {
      return "error";
    }
  }

  return "error";
}

export function buildMediaShareUrl(mediaType: "movie" | "tv", id: number): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/?media=${mediaType}-${id}`;
}

const DEEP_LINK_RE = /^(movie|tv)-(\d{1,9})$/;

export function parseMediaDeepLink(
  rawParam: string | null | undefined
): { mediaType: "movie" | "tv"; id: number } | null {
  if (!rawParam) return null;
  const match = DEEP_LINK_RE.exec(rawParam.trim());
  if (!match) return null;
  const id = Number.parseInt(match[2], 10);
  if (!Number.isSafeInteger(id) || id <= 0) return null;
  return {
    mediaType: match[1] as "movie" | "tv",
    id,
  };
}
