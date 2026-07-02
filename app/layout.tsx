import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import BottomNav from "@/app/components/BottomNav";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1d4ed8",
};

export const metadata: Metadata = {
  title: "HouseKit",
  description: "집의 이력서 — 디지털 주택 기록부",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HouseKit",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={geistSans.variable}>
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icon-512.png" />
      </head>
      <body style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
        <main style={{ flex: 1, width: "100%", maxWidth: 430, margin: "0 auto", paddingBottom: 80, boxSizing: "border-box", minWidth: 0 }}>
          {children}
        </main>

        <BottomNav />

        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css" />

        <Analytics />
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').catch(function() {});
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
