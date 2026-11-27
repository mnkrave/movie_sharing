"use client";

import React, { useId } from "react";
import { Lock } from "lucide-react";
import type { BadgeTier } from "@/lib/badges";

interface BadgeEmblemProps {
  badgeKey: string;
  tier: BadgeTier;
  unlocked: boolean;
  size?: "sm" | "md" | "lg";
  recentlyUnlocked?: boolean;
}

const SIZE_MAP = {
  sm: { box: "w-11 h-11", icon: "w-5 h-5" },
  md: { box: "w-14 h-14", icon: "w-6 h-6" },
  lg: { box: "w-[74px] h-[74px]", icon: "w-8 h-8" },
} as const;

const TIER_PALETTE: Record<
  BadgeTier,
  {
    gradStart: string;
    gradMid?: string;
    gradEnd: string;
    stroke: string;
    enamel: string;
    rimShadow: string;
    glow?: string;
  }
> = {
  bronze: {
    gradStart: "#CD7F32",
    gradEnd: "#8C4A19",
    stroke: "#E8A86B",
    enamel: "#1A120B",
    rimShadow: "rgba(205, 127, 50, 0.35)",
  },
  silver: {
    gradStart: "#E2E8F0",
    gradEnd: "#64748B",
    stroke: "#CBD5E1",
    enamel: "#111722",
    rimShadow: "rgba(203, 213, 225, 0.32)",
  },
  gold: {
    gradStart: "#FDE047",
    gradMid: "#EAB308",
    gradEnd: "#A16207",
    stroke: "#FACC15",
    enamel: "#171307",
    rimShadow: "rgba(250, 204, 21, 0.38)",
  },
  platinum: {
    gradStart: "#E0E7FF",
    gradMid: "#818CF8",
    gradEnd: "#38BDF8",
    stroke: "#93C5FD",
    enamel: "#0D1020",
    rimShadow: "rgba(129, 140, 248, 0.45)",
    glow: "rgba(129, 140, 248, 0.22)",
  },
};

function renderBadgeMotif(badgeKey: string) {
  switch (badgeKey) {
    // --- MEILENSTEINE & AUSDAUER ---
    case "watchtime-100h": // Kinoticket mit Abrisskante & Stern
      return (
        <>
          <path
            d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z"
            fill="currentColor"
            fillOpacity={0.15}
          />
          <path d="M15.5 6.5v11" strokeDasharray="1.8 2.2" />
          <path
            d="M9.5 9.2l.75 1.55 1.7.25-1.22 1.2.28 1.7-1.51-.8-1.51.8.29-1.7-1.23-1.2 1.7-.25.75-1.55Z"
            fill="currentColor"
            fillOpacity={0.15}
          />
        </>
      );

    case "club-50": // Kinosessel / Popcorn-Becher mit Filmstreifen
      return (
        <>
          <path
            d="M6.5 10h11l-1.3 9.5a1 1 0 0 1-1 .85H8.8a1 1 0 0 1-1-.85L6.5 10Z"
            fill="currentColor"
            fillOpacity={0.15}
          />
          <path d="M10.2 10l.5 10.2M13.8 10l-.5 10.2" />
          <path d="M7.2 10a2.2 2.2 0 0 1 .4-3.6 2.5 2.5 0 0 1 4.4-1.3 2.5 2.5 0 0 1 4.4 1.3 2.2 2.2 0 0 1 .4 3.6" />
        </>
      );

    case "club-100": // Römischer Zenturio-Helm mit Filmrolle
      return (
        <>
          <path
            d="M7 10c0-3 2.2-5 5-5s5 2 5 5v2c0 2.8-1.5 5.2-3.5 6.2L12 19l-1.5-.8C8.5 17.2 7 14.8 7 12v-2Z"
            fill="currentColor"
            fillOpacity={0.15}
          />
          <path d="M10 3.5c1.3-.7 2.7-.7 4 0l1 2H9l1-2Z" fill="currentColor" fillOpacity={0.15} />
          <path d="M8.5 11.5h7M12 11.5v5.5" />
        </>
      );

    case "club-250": // Goldene VIP-Eintrittskarte mit "250"-Prägung
      return (
        <>
          <rect x="2.5" y="6" width="19" height="12" rx="2" fill="currentColor" fillOpacity={0.15} />
          <path d="M6.2 10.2c0-.7.5-1.2 1.2-1.2s1.2.4 1.2 1.1c0 .9-1.2 1.7-2.4 2.9h2.5" />
          <path d="M13 9h-2.1l-.2 2c.4-.2.8-.3 1.2-.3.8 0 1.3.5 1.3 1.3s-.6 1.3-1.4 1.3c-.6 0-1.1-.2-1.3-.6" />
          <rect x="15.3" y="9" width="2.4" height="4.2" rx="1.2" />
        </>
      );

    case "club-500": // Walk-of-Fame-Stern auf Filmband-Sockel
      return (
        <>
          <rect x="3.5" y="16.5" width="17" height="4" rx="1" fill="currentColor" fillOpacity={0.15} />
          <path d="M7.5 16.5v4M12 16.5v4M16.5 16.5v4" />
          <path
            d="M12 3.5l1.95 4 4.4.65-3.18 3.1.75 4.4L12 13.55l-3.92 2.1.75-4.4-3.18-3.1 4.4-.65L12 3.5Z"
            fill="currentColor"
            fillOpacity={0.15}
          />
        </>
      );

    case "watchtime-500h": // Sanduhr mit Film-Frames als Sand
      return (
        <>
          <path d="M6.5 3.5h11M6.5 20.5h11" />
          <path
            d="M8 3.5v3.8c0 1.8 1.6 3.5 4 4.7 2.4-1.2 4-2.9 4-4.7V3.5H8Z"
            fill="currentColor"
            fillOpacity={0.15}
          />
          <path
            d="M8 20.5v-3.8c0-1.8 1.6-3.5 4-4.7 2.4 1.2 4 2.9 4 4.7v3.8H8Z"
            fill="currentColor"
            fillOpacity={0.15}
          />
          <rect x="10.5" y="16.2" width="3" height="2" rx="0.4" />
        </>
      );

    case "watchtime-1000h": // Projektor-Spule mit Lichtkegel & Unendlichkeit
      return (
        <>
          <circle cx="8" cy="8" r="3.5" fill="currentColor" fillOpacity={0.15} />
          <circle cx="8" cy="8" r="0.8" />
          <path d="M11.5 8l8.5-3.5v7L11.5 8Z" fill="currentColor" fillOpacity={0.15} />
          <path d="M6.2 17.5c0-1.3 1.1-2.2 2.3-2.2 1.5 0 2.5 1.3 3.5 2.2 1 .9 2 2.2 3.5 2.2 1.2 0 2.3-.9 2.3-2.2s-1.1-2.2-2.3-2.2c-1.5 0-2.5 1.3-3.5 2.2-1 .9-2 2.2-3.5 2.2-1.2 0-2.3-.9-2.3-2.2Z" />
        </>
      );

    case "series-binge": // Retro-TV mit Blitz & Zielflagge
      return (
        <>
          <path d="M8.5 4l3.5 3 3.5-3" />
          <rect x="3.5" y="7" width="17" height="12.5" rx="2.5" fill="currentColor" fillOpacity={0.15} />
          <path d="M11.8 9.8l-2.3 3.5h2.4l-1.2 3.5 3-3.9h-2.3l.4-3.1Z" fill="currentColor" fillOpacity={0.15} />
          <circle cx="17.5" cy="11" r="0.7" />
          <circle cx="17.5" cy="14" r="0.7" />
        </>
      );

    // --- KINO & GESCHICHTE ---
    case "pre-1950": // Art-Déco-Filmprojektor mit Handkurbel
      return (
        <>
          <circle cx="8" cy="7" r="2.8" fill="currentColor" fillOpacity={0.15} />
          <circle cx="14.5" cy="7" r="2.8" fill="currentColor" fillOpacity={0.15} />
          <rect x="6" y="10.5" width="10.5" height="7" rx="1.2" fill="currentColor" fillOpacity={0.15} />
          <path d="M16.5 12l4-1.5v5l-4-1.5M5.5 14H3.5v2.5M9 17.5L7.5 21M13.5 17.5L15 21" />
        </>
      );

    case "pre-1970": // Film-Regieklappe mit Archiv-Siegel
      return (
        <>
          <path d="M4 9.5L18.5 5.2l1.2 3.3L5.2 12.8 4 9.5Z" fill="currentColor" fillOpacity={0.15} />
          <path d="M8.2 8.2l1.5 3.1M13 6.8l1.5 3.1" />
          <rect x="4" y="11" width="16" height="9.5" rx="1.5" fill="currentColor" fillOpacity={0.15} />
          <circle cx="15" cy="16" r="2.2" />
        </>
      );

    case "oscar-10": // Stilisierte Statuette mit Lorbeerkranz
      return (
        <>
          <circle cx="12" cy="7" r="1.8" fill="currentColor" fillOpacity={0.15} />
          <path d="M9.5 10.5h5l-1 6h-3l-1-6Z" fill="currentColor" fillOpacity={0.15} />
          <path d="M8.5 19.5h7M6 7.5c-1.8 2.5-1.6 6.2.8 8.8M18 7.5c1.8 2.5 1.6 6.2-.8 8.8" />
        </>
      );

    case "oscar-25": // Doppelter Lorbeerkranz mit Tresor-Siegel
      return (
        <>
          <circle cx="12" cy="12" r="5" fill="currentColor" fillOpacity={0.15} />
          <path d="M12 9v6M9 12h6" />
          <path d="M5.2 6.5C3.4 9.5 3.5 14 6.2 17.5M18.8 6.5c1.8 3 1.7 7.5-1 11" />
          <path d="M7.5 4.2c-3 2.5-4.3 7-2.8 11.2M16.5 4.2c3 2.5 4.3 7 2.8 11.2" />
        </>
      );

    case "time-traveler": // Taschenuhr mit Filmperforation am Rand
      return (
        <>
          <path d="M10.5 3.2h3M12 3.2v2.1M16.5 5.8l1.2-1.2" />
          <circle cx="12" cy="13.2" r="7.2" fill="currentColor" fillOpacity={0.15} />
          <circle cx="12" cy="13.2" r="4.6" strokeDasharray="1.6 2.1" />
          <path d="M12 10.2v3l2.2 1.3" />
        </>
      );

    // --- COMMUNITY & KRITIK ---
    case "first-tip": // Papierflieger & Megafon mit Filmstern
      return (
        <>
          <path
            d="M3.5 11.5l16.5-7-4.5 15.5-4.5-5-7.5-3.5Z"
            fill="currentColor"
            fillOpacity={0.15}
          />
          <path d="M20 4.5l-9 10.5M11 15v4.5l2.5-2.5" />
        </>
      );

    case "curator-10": // Kuratoren-Monokel über Ausstellungs-Podest
      return (
        <>
          <circle cx="11" cy="9" r="4.2" fill="currentColor" fillOpacity={0.15} />
          <path d="M15.2 9v5.5c0 1.4.8 2.2 2 2.2" />
          <path d="M5 17.5h12v3H5v-3Z" fill="currentColor" fillOpacity={0.15} />
        </>
      );

    case "cine-circle-5": // Drei überlappende Tickets / Kino-Crew
      return (
        <>
          <circle cx="8" cy="8.5" r="2.2" fill="currentColor" fillOpacity={0.15} />
          <circle cx="16" cy="8.5" r="2.2" fill="currentColor" fillOpacity={0.15} />
          <circle cx="12" cy="7" r="2.5" fill="currentColor" fillOpacity={0.15} />
          <path d="M4.2 18c.5-2.2 2-3.5 3.8-3.5M19.8 18c-.5-2.2-2-3.5-3.8-3.5" />
          <path
            d="M7.5 19c.7-2.8 2.4-4.2 4.5-4.2s3.8 1.4 4.5 4.2H7.5Z"
            fill="currentColor"
            fillOpacity={0.15}
          />
        </>
      );

    case "tough-critic": // Waage mit geschärfter Schreibfeder
      return (
        <>
          <path d="M12 4v15.5M8.5 19.5h7M5 8h14" />
          <path
            d="M5 8l-2 4.5h4L5 8ZM19 8l-2 4.5h4L19 8Z"
            fill="currentColor"
            fillOpacity={0.15}
          />
          <path d="M10.2 5.8l3.6-2.4" />
        </>
      );

    case "masterpiece-hunter": // Juwelen-Lupe über 10-zackigem Stern
      return (
        <>
          <circle cx="10.5" cy="10.5" r="6" fill="currentColor" fillOpacity={0.15} />
          <path d="M15 15l5 5" />
          <path d="M10.5 7l.9 2.2 2.3.3-1.7 1.6.4 2.3-1.9-1.1-1.9 1.1.4-2.3-1.7-1.6 2.3-.3.9-2.2Z" />
        </>
      );

    // --- ALL 19 KOLLEKTIONEN ---
    case "collection-star-wars": // Gekreuzte Lichtschwerter vor Todesstern-Ring
      return (
        <>
          <circle cx="12" cy="12" r="6.8" fill="currentColor" fillOpacity={0.15} />
          <circle cx="9.6" cy="9.4" r="1.4" />
          <path d="M5.5 12h13" strokeOpacity={0.45} />
          <path d="M5 19l14-14M19 19L5 5" />
          <path d="M4.2 19.8l2.2-2.2M19.8 19.8l-2.2-2.2" strokeWidth={2.3} />
        </>
      );

    case "collection-mission-impossible": // Brennende Zündschnur in Agenten-Fadenkreuz
      return (
        <>
          <circle cx="12" cy="12" r="7" fill="currentColor" fillOpacity={0.15} />
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
          <path d="M8.5 15.5c1.5-2 3.5-1.5 5-3.5s1.2-3 2.5-4" />
          <path d="M16 6.2l1.4-1.4M17.8 8l1.4-.4M15.5 4.2l-.4 1.4" />
        </>
      );

    case "collection-fast-and-furious": // Tachometer am Limit mit Zielflagge
      return (
        <>
          <path
            d="M4.5 16.5a8.5 8.5 0 1 1 15 0"
            fill="currentColor"
            fillOpacity={0.15}
          />
          <path d="M12 15l5.2-5.2" />
          <circle cx="12" cy="15" r="1.5" />
          <path d="M7 9l1.2 1.2M12 7.2v1.6M17 9l-1.2 1.2" />
          <path d="M8 19.5h8" />
        </>
      );

    case "collection-marvel-mcu": // Sechseckiges Schild mit Energie-Kristallen
      return (
        <>
          <polygon
            points="12,3 19.5,7.5 19.5,16.5 12,21 4.5,16.5 4.5,7.5"
            fill="currentColor"
            fillOpacity={0.15}
          />
          <circle cx="12" cy="12" r="2.2" fill="currentColor" fillOpacity={0.15} />
          <path d="M12 6.8v1.2M16.5 9.4l-1 .6M16.5 14.6l-1-.6M12 17.2V16M7.5 14.6l1-.6M7.5 9.4l1 .6" />
        </>
      );

    case "collection-jason-bourne": // Fingerabdruck-Scan mit Visier & Pass-Stempel
      return (
        <>
          <path d="M4 7V4h3M17 4h3v3M4 17v3h3M17 20h3v-3" />
          <path d="M9 15.5c0-2.5 1.3-4.5 3-4.5s3 2 3 4.5" />
          <path d="M7.5 13c0-3 2-5.5 4.5-5.5s4.5 2.5 4.5 5.5" />
          <path d="M12 13v4" />
        </>
      );

    case "collection-quentin-tarantino": // Katana-Schwert gekreuzt mit Retro-Kamera
      return (
        <>
          <rect x="4" y="10" width="9" height="7" rx="1.2" fill="currentColor" fillOpacity={0.15} />
          <circle cx="6.5" cy="7.5" r="1.8" />
          <circle cx="10.8" cy="7.5" r="1.8" />
          <path d="M13 12l2.5-1.5v5L13 14" />
          <path d="M7 19.5L19.5 4.5M14.5 12l3 3" />
        </>
      );

    case "collection-indiana-jones": // Fedora-Hut mit Peitsche & Kompass
      return (
        <>
          <path
            d="M7 12.5c.8-4 2-6.5 5-6.5s4.2 2.5 5 6.5H7Z"
            fill="currentColor"
            fillOpacity={0.15}
          />
          <path d="M3.5 13.5c4.5 1.5 12.5 1.5 17 0" />
          <path d="M6.5 17c3.5 2.5 9.5 1.5 12-1.5" />
        </>
      );

    case "collection-james-bond": // Gunbarrel-Vignette mit eleganter Fliege
      return (
        <>
          <circle cx="12" cy="12" r="8" fill="currentColor" fillOpacity={0.15} />
          <circle cx="12" cy="12" r="5" strokeDasharray="3 2" />
          <path
            d="M8.5 10l3.5 2-3.5 2v-4Zm7 0l-3.5 2 3.5 2v-4Z"
            fill="currentColor"
            fillOpacity={0.15}
          />
        </>
      );

    case "collection-steven-spielberg": // Sichelmond-Silhouette mit Fahrrad-Vignette
      return (
        <>
          <path
            d="M15.5 5.2a7 7 0 1 0 3.3 10.6 5.6 5.6 0 0 1-3.3-10.6Z"
            fill="currentColor"
            fillOpacity={0.15}
          />
          <circle cx="8" cy="15.5" r="2" />
          <circle cx="14.5" cy="15.5" r="2" />
          <path d="M8 15.5l2.5-3.2h2.8l1.2 3.2M10.5 12.3l-.6-1.8" />
        </>
      );

    case "collection-christopher-nolan": // Drehender Kreisel über Zeit-Ringen
      return (
        <>
          <ellipse cx="12" cy="17.5" rx="7.5" ry="2.2" fill="currentColor" fillOpacity={0.15} />
          <path d="M12 4v2.5M7 9.5h10l-5 6.5-5-6.5Z" fill="currentColor" fillOpacity={0.15} />
          <path d="M9 9.5l3-3 3 3" />
        </>
      );

    case "collection-the-dark-knight": // Fledermaus-Silhouette vor Suchscheinwerfer
      return (
        <>
          <circle cx="12" cy="12" r="8" fill="currentColor" fillOpacity={0.15} />
          <path
            d="M5.5 12.5c1.5-2.5 3.5-2.8 4.8-1.4l.7-1.6 1 1 1-1 .7 1.6c1.3-1.4 3.3-1.1 4.8 1.4-2 .5-3.3 1.5-4 2.8-1-.8-1.8-.8-2.5 0-.7-.8-1.5-.8-2.5 0-.7-1.3-2-2.3-4-2.8Z"
            fill="currentColor"
            fillOpacity={0.15}
          />
        </>
      );

    case "collection-matrix": // Vertikaler Code-Regen mit weißem Hasen
      return (
        <>
          <path d="M6 4v5M6 12v3M18 5v6M18 14v4M9 4v3M15 4v3" strokeOpacity={0.55} />
          <path d="M9.5 10.5L9 5.5M14.5 10.5l.5-5" />
          <ellipse cx="12" cy="14.2" rx="4.2" ry="3.5" fill="currentColor" fillOpacity={0.15} />
          <circle cx="10.6" cy="13.5" r="0.6" />
          <circle cx="13.4" cy="13.5" r="0.6" />
        </>
      );

    case "collection-david-fincher": // Lupe über Puzzle-Teil & Noir-Filmstreifen
      return (
        <>
          <rect x="4" y="4.5" width="5" height="15" rx="1" fill="currentColor" fillOpacity={0.15} />
          <path d="M4 9.5h5M4 14.5h5" />
          <circle cx="14.5" cy="11" r="4.5" fill="currentColor" fillOpacity={0.15} />
          <path d="M17.8 14.3L20.5 17" />
        </>
      );

    case "collection-jurassic-park": // Bernsteintropfen mit T-Rex-Skelett
      return (
        <>
          <path
            d="M12 3.5c3.8 4.5 6 7.8 6 11a6 6 0 1 1-12 0c0-3.2 2.2-6.5 6-11Z"
            fill="currentColor"
            fillOpacity={0.15}
          />
          <path d="M9.5 12h4.2l1.3 1.8h-3.5M11 13.8V17M13.2 14.8l1.3 1.7" />
        </>
      );

    case "collection-harry-potter": // Blitz-Narbe über Brille mit Zauberstab
      return (
        <>
          <path d="M12.8 4l-2 3.2h2.2l-1.8 3" />
          <circle cx="8" cy="14.5" r="3" fill="currentColor" fillOpacity={0.15} />
          <circle cx="16" cy="14.5" r="3" fill="currentColor" fillOpacity={0.15} />
          <path d="M11 14.5h2M4.5 20L19.5 10.5" />
        </>
      );

    case "collection-lord-of-the-rings": // Gravierter Ring vor Berggipfel-Silhouette
      return (
        <>
          <path d="M4 17.5L9.5 9.5l3 4 2.5-3 5 7H4Z" fill="currentColor" fillOpacity={0.15} />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="3.8" strokeDasharray="2 1.6" />
        </>
      );

    case "collection-denis-villeneuve": // Sandwurm-Ring mit Dünen-Horizont
      return (
        <>
          <circle cx="12" cy="10.5" r="5.5" fill="currentColor" fillOpacity={0.15} />
          <circle cx="12" cy="10.5" r="2.6" />
          <path d="M3.5 18.5c4-2 8.5-2 17 0M6 16c3-1.2 6-1 9.5 0" />
        </>
      );

    case "collection-hayao-miyazaki": // Rußmännchen-Silhouette mit Ginkgo-Blatt
      return (
        <>
          <circle cx="11" cy="13" r="4.5" fill="currentColor" fillOpacity={0.15} />
          <path d="M11 7.2v1.3M6.5 13H5M17 13h-1.5M7.8 9.2l-.9-.9M14.2 9.2l.9-.9M7.8 16.8l-.9.9M14.2 16.8l.9.9" />
          <circle cx="9.6" cy="12.6" r="1" />
          <circle cx="12.4" cy="12.6" r="1" />
          <path d="M17 8.5c1.5-2.5 3.5-2 3.5 0s-1.8 2.5-3.5 0Z" fill="currentColor" fillOpacity={0.15} />
        </>
      );

    case "collection-john-wick": // Kontinental-Münze mit Sanduhr & Schild
      return (
        <>
          <circle cx="12" cy="12" r="8" fill="currentColor" fillOpacity={0.15} />
          <path d="M9.5 7.5h5L12 12l2.5 4.5h-5L12 12 9.5 7.5Z" fill="currentColor" fillOpacity={0.15} />
          <path d="M8 12h1.5M14.5 12H16" />
        </>
      );

    default:
      return (
        <path
          d="M12 4l2.2 4.5 5 .7-3.6 3.5.9 5L12 15.3l-4.5 2.4.9-5L4.8 9.2l5-.7L12 4Z"
          fill="currentColor"
          fillOpacity={0.15}
        />
      );
  }
}

export function BadgeEmblem({
  badgeKey,
  tier,
  unlocked,
  size = "md",
  recentlyUnlocked = false,
}: BadgeEmblemProps) {
  const uid = useId().replace(/:/g, "");
  const gradId = `badge-grad-${uid}`;
  const glowId = `badge-glow-${uid}`;
  const palette = TIER_PALETTE[tier];
  const dims = SIZE_MAP[size];

  return (
    <div
      className={`badge-medallion-stage relative inline-flex items-center justify-center shrink-0 ${dims.box} ${
        recentlyUnlocked ? "badge-unlock-anim" : ""
      }`}
    >
      {/* Platinum subtle background aura */}
      {unlocked && tier === "platinum" && (
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full blur-md pointer-events-none"
          style={{ backgroundColor: palette.glow }}
        />
      )}

      {/* Non-focusable visual medallion body carrying geometric shape + sheen */}
      <div
        className={`badge-medallion-body relative w-full h-full flex items-center justify-center ${
          unlocked ? "is-unlocked" : "grayscale opacity-35"
        }`}
        style={
          unlocked
            ? { filter: `drop-shadow(0 4px 10px ${palette.rimShadow})` }
            : undefined
        }
      >
        {/* Geometric Physical Frame SVG */}
        <svg
          viewBox="0 0 64 64"
          className="absolute inset-0 w-full h-full"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={palette.gradStart} />
              {palette.gradMid && <stop offset="50%" stopColor={palette.gradMid} />}
              <stop offset="100%" stopColor={palette.gradEnd} />
            </linearGradient>
            <radialGradient id={glowId} cx="32%" cy="22%" r="72%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.32" />
              <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
          </defs>

          {tier === "bronze" && (
            <>
              <circle cx="32" cy="32" r="29" fill={`url(#${gradId})`} stroke={palette.stroke} strokeWidth="1.5" />
              <circle cx="32" cy="32" r="24" fill={palette.enamel} stroke={palette.stroke} strokeOpacity="0.45" strokeWidth="1" />
              <circle cx="32" cy="32" r="28" fill={`url(#${glowId})`} />
            </>
          )}

          {tier === "silver" && (
            <>
              <path
                d="M32 4 L54 11 V31 C54 44.5 44.5 54 32 59.5 C19.5 54 10 44.5 10 31 V11 Z"
                fill={`url(#${gradId})`}
                stroke={palette.stroke}
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M32 9 L49 14.5 V30.5 C49 41.2 41.5 49 32 53.8 C22.5 49 15 41.2 15 30.5 V14.5 Z"
                fill={palette.enamel}
                stroke={palette.stroke}
                strokeOpacity="0.45"
                strokeWidth="1"
                strokeLinejoin="round"
              />
              <path
                d="M32 5 L53 11.5 V31 C53 44 44 53 32 58.5 C20 53 11 44 11 31 V11.5 Z"
                fill={`url(#${glowId})`}
              />
            </>
          )}

          {tier === "gold" && (
            <>
              <polygon
                points="21,4 43,4 60,21 60,43 43,60 21,60 4,43 4,21"
                fill={`url(#${gradId})`}
                stroke={palette.stroke}
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <polygon
                points="23,9 41,9 55,23 55,41 41,55 23,55 9,41 9,23"
                fill={palette.enamel}
                stroke={palette.stroke}
                strokeOpacity="0.5"
                strokeWidth="1"
                strokeLinejoin="round"
              />
              <polygon
                points="21,5 43,5 59,21 59,43 43,59 21,59 5,43 5,21"
                fill={`url(#${glowId})`}
              />
            </>
          )}

          {tier === "platinum" && (
            <>
              <polygon
                points="32,2.5 61.5,32 32,61.5 2.5,32"
                fill={`url(#${gradId})`}
                stroke={palette.stroke}
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <polygon
                points="32,8 56,32 32,56 8,32"
                fill={palette.enamel}
                stroke={palette.stroke}
                strokeOpacity="0.55"
                strokeWidth="1.1"
                strokeLinejoin="round"
              />
              <polygon
                points="19,19 45,19 45,45 19,45"
                fill="none"
                stroke={palette.stroke}
                strokeOpacity="0.22"
                strokeWidth="0.9"
              />
              <polygon
                points="32,3.5 60.5,32 32,60.5 3.5,32"
                fill={`url(#${glowId})`}
              />
            </>
          )}
        </svg>

        {/* Custom 24x24 Duo-Tone Emblem Motif */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`relative z-10 ${dims.icon}`}
          style={{ color: unlocked ? palette.stroke : "#94a3b8" }}
          aria-hidden="true"
        >
          {renderBadgeMotif(badgeKey)}
        </svg>
      </div>

      {/* Discreet Corner Padlock on Locked Silhouette Previews */}
      {!unlocked && (
        <span
          aria-hidden="true"
          className="absolute -bottom-0.5 -right-0.5 z-20 w-4 h-4 rounded-full bg-card border border-border shadow-xs flex items-center justify-center text-muted-foreground"
        >
          <Lock className="w-2.5 h-2.5" />
        </span>
      )}
    </div>
  );
}
