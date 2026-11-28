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
export const RELEASES: ReleaseNote[] = [
  {
    id: "2026-11-28-redesign-und-badges",
    date: "2026-11-28",
    title: "CineCircle im neuen Look & mit Trophäenschrank",
    summary:
      "Wir haben das gesamte Design aufgeräumt, einen hellen Modus ergänzt und neue Auszeichnungen für deine Filmreise eingebaut.",
    highlights: [
      {
        emoji: "🎨",
        title: "Neues Design & Hell-/Dunkelmodus",
        description:
          "Wechsle jederzeit zwischen dem entspannten hellen Modus und dem dunklen Kino-Look – mit klarerer Navigation über Entdecken, Watchlist, Empfehlungen und Freunde.",
      },
      {
        emoji: "🔍",
        title: "Live-Suche & Filter direkt auf der Startseite",
        description:
          "Unterhalb von „Heute entdecken“ kannst du jetzt direkt nach Filmen, Serien, Genres, Regie, Cast und Bewertungen filtern oder einfach weitere Trends nachladen.",
      },
      {
        emoji: "✨",
        title: "Neues Profil, Empfehlungen & KI-Berater",
        description:
          "Watchlist und Kino-Lebenszeit sind jetzt eigene übersichtliche Profil-Bereiche, und der KI-Berater sowie Algorithmus-Tipps sitzen gebündelt unter Empfehlungen.",
      },
      {
        emoji: "🤝",
        title: "Verbesserte Freunde-Suche & Film-Match",
        description:
          "Finde neue Kontakte schneller inklusive gemeinsamer Filme und sieh auf Freunde-Profilen auf einen Blick euren Match-Score und eure besten Übereinstimmungen.",
      },
      {
        emoji: "🏆",
        title: "Trophäenschrank mit 37 Badges",
        description:
          "Sammle ab sofort Bronze-, Silber-, Gold- und Platin-Abzeichen – etwa für 1.000 Stunden Watchtime, Klassiker vor 1950 oder abgeschlossene Kollektionen – sichtbar in deinem Profil und bei Freunden.",
      },
    ],
  },
];

export function getLatestRelease(): ReleaseNote | null {
  return RELEASES[0] ?? null;
}

export function isValidReleaseId(id: string): boolean {
  return RELEASES.some((release) => release.id === id);
}
