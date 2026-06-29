import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HouseKit — 집의 이력서",
  description: "디지털 주택 기록부",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-gray-900">
              <span className="text-2xl">🏠</span>
              <span>HouseKit</span>
            </Link>
            <Link
              href="/houses/new"
              className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              + 주택 등록
            </Link>
          </div>
        </header>
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
