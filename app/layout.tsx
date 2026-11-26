import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Video } from "lucide-react";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { MediaProvider } from "@/components/MediaContext";
import { Navbar } from "@/components/Navbar";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#070a11" },
  ],
};

import { MobileBottomNav } from "@/components/MobileBottomNav";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { WhatsNewModal } from "@/components/WhatsNewModal";

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
    <html lang="de" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var s=localStorage.getItem("color-scheme");if(s==="light"||s==="dark"){document.querySelector('meta[name="color-scheme"]').setAttribute("content",s)}}catch(e){}`,
          }}
        />
      </head>
      <body className="bg-background text-foreground min-h-dvh flex flex-col antialiased selection:bg-primary selection:text-primary-foreground pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
        <Providers>
          <MediaProvider>
            <Navbar />
            <ServiceWorkerRegister />
            <WhatsNewModal />
            <main className="flex-1">{children}</main>
            <footer className="border-t border-border bg-card/50 py-8 mt-12 md:mt-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-muted-foreground">
                <div className="space-y-1.5">
                  <Link href="/" className="inline-flex items-center gap-2 font-black text-sm text-foreground">
                    <span className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                      <Video className="w-4 h-4 fill-current" aria-hidden="true" />
                    </span>
                    <span>CineCircle</span>
                  </Link>
                  <p>Entwickelt für Freunde und Film-Liebhaber.</p>
                </div>
                <p className="sm:text-right max-w-md">
                  Filmdaten & Streaming-Anbieter von{" "}
                  <a
                    href="https://www.themoviedb.org/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary-text font-medium hover:underline"
                  >
                    TMDB
                  </a>{" "}
                  & JustWatch · Nicht von TMDB zertifiziert.
                </p>
              </div>
            </footer>
            <MobileBottomNav />
          </MediaProvider>
        </Providers>
      </body>
    </html>
  );
}
