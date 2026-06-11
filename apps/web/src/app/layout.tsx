import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Nexus Noir",
    template: "%s — Nexus Noir",
  },
  description:
    "Archives de l'univers Nexus Noir. Des nouvelles retrouvées dans une ville malade.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-zinc-900">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
            <Link
              href="/"
              className="font-mono text-sm uppercase tracking-[0.3em] text-zinc-300 hover:text-red-500"
            >
              Nexus Noir
            </Link>
            <span className="text-xs uppercase tracking-widest text-zinc-600">
              Archives
            </span>
          </div>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10">{children}</main>
        <footer className="border-t border-zinc-900 py-6 text-center text-xs text-zinc-600">
          Nexus Noir — la ville regarde ses lecteurs droit dans les yeux.
        </footer>
      </body>
    </html>
  );
}
