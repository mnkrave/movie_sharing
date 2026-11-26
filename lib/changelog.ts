export interface ReleaseHighlight {
  emoji?: string;
  title: string;
  description: string;
}

export interface ReleaseNote {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  summary?: string;
  highlights: ReleaseHighlight[];
}

/**
 * Chronological release notes (newest entry first).
 * Leave empty until a user-facing release should trigger the "What's New" popup.
 */
export const RELEASES: ReleaseNote[] = [];

export function getLatestRelease(): ReleaseNote | null {
  return RELEASES[0] ?? null;
}

export function isValidReleaseId(id: string): boolean {
  return RELEASES.some((release) => release.id === id);
}
