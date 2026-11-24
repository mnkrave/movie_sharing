import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "CineCircle – Filme & Serien mit Freunden",
    short_name: "CineCircle",
    description:
      "Teile Filme & Serien mit deinen Freunden, entdecke Top-Listen (IMDb/TMDB), Oscar-Gewinner und finde per VPN weltweit heraus, wo dein Lieblingsfilm läuft.",
    start_url: "/",
    display: "standalone",
    background_color: "#07090e",
    theme_color: "#07090e",
    lang: "de",
    categories: ["entertainment", "social"],
    shortcuts: [
      {
        name: "Suche & Filter",
        short_name: "Suche",
        description: "Filme, Serien, Regie & Cast durchsuchen",
        url: "/search",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Freunde-Feed",
        short_name: "Feed",
        description: "Aktuelle Empfehlungen deiner Freunde ansehen",
        url: "/feed",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Meine Liste",
        short_name: "Liste",
        description: "Watchlist & gesehene Filme öffnen",
        url: "/my-list",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Schnell-Bewerten",
        short_name: "Bewerten",
        description: "Klassiker im Speed-Modus bewerten",
        url: "/quick-rate",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
    ],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
