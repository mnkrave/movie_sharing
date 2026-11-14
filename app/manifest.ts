import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CineCircle – Filme & Serien mit Freunden",
    short_name: "CineCircle",
    description:
      "Teile Filme & Serien mit deinen Freunden, entdecke Top-Listen (IMDb/TMDB), Oscar-Gewinner und finde per VPN weltweit heraus, wo dein Lieblingsfilm läuft.",
    start_url: "/",
    display: "standalone",
    background_color: "#07090e",
    theme_color: "#07090e",
    lang: "de",
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
