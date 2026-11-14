import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { MediaProvider } from "@/components/MediaContext";
import { Navbar } from "@/components/Navbar";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#07090e",
};

export const metadata: Metadata = {
  title: "CineCircle – Filme & Serien mit Freunden teilen & VPN-Streaming",
  description:
    "Teile Filme & Serien mit deinen Freunden, entdecke Top-Listen (IMDb/TMDB), Oscar-Gewinner und finde per VPN weltweit heraus, wo dein Lieblingsfilm läuft.",
  applicationName: "CineCircle",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CineCircle",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "64x64", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="dark">
      <body className="bg-[#07090e] text-slate-100 min-h-dvh flex flex-col antialiased selection:bg-amber-500 selection:text-black">
        <Providers>
          <MediaProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <footer className="border-t border-slate-900 bg-[#05070a] pt-10 pb-[calc(2.5rem+env(safe-area-inset-bottom))] mt-20 text-center text-xs text-slate-500">
              <div className="max-w-7xl mx-auto px-4 space-y-2">
                <p className="font-semibold text-slate-400">
                  CineCircle – Entwickelt für Freunde & Film-Liebhaber
                </p>
                <p>
                  Filmdaten & Streaming-Anbieter bereitgestellt durch{" "}
                  <a
                    href="https://www.themoviedb.org/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 hover:underline"
                  >
                    TMDB
                  </a>{" "}
                  & JustWatch. Dieses Produkt nutzt die TMDB API, ist jedoch nicht von TMDB zertifiziert.
                </p>
              </div>
            </footer>
          </MediaProvider>
        </Providers>
      </body>
    </html>
  );
}
