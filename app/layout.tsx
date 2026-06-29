import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HouseKit",
  description: "집의 이력서 — 디지털 주택 기록부",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={geistSans.variable}>
      <body style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
        <main style={{ flex: 1, maxWidth: 430, width: "100%", margin: "0 auto", paddingBottom: 80 }}>
          {children}
        </main>

        <nav style={{
          position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: 430,
          background: "rgba(10,10,15,0.92)", backdropFilter: "blur(12px)",
          borderTop: "0.5px solid #1e1e28",
          display: "flex", justifyContent: "space-around", alignItems: "center",
          padding: "10px 0 20px",
          zIndex: 100,
        }}>
          {[
            { href: "/", icon: "ti-home-2", label: "홈" },
            { href: "/houses/new", icon: "ti-plus", label: "등록" },
            { href: "#", icon: "ti-bell", label: "알림" },
            { href: "#", icon: "ti-chart-bar", label: "분석" },
          ].map(({ href, icon, label }) => (
            <Link key={label} href={href} style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 3, textDecoration: "none", color: "#555",
            }}>
              <i className={`ti ${icon}`} style={{ fontSize: 22 }} aria-hidden="true" />
              <span style={{ fontSize: 10 }}>{label}</span>
            </Link>
          ))}
        </nav>

        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css" />
      </body>
    </html>
  );
}
