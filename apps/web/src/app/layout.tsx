import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono, Syne, Bebas_Neue } from "next/font/google";
import { AuthProvider } from "@/modules/auth/AuthProvider";
import { BadgeNotificationProvider } from "@/components/BadgeNotificationProvider";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";

export const metadata: Metadata = {
  title: {
    default: "Nexus Noir",
    template: "%s — Nexus Noir",
  },
  description: "Archives de l'univers Nexus Noir. Des nouvelles retrouvées dans une ville malade.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    siteName: "Nexus Noir",
    locale: "fr_FR",
    type: "website",
    images: [{ url: "/og-default.jpg", alt: "Nexus Noir" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@nexus_noir",
  },
  alternates: {
    types: {
      "application/rss+xml": `${siteUrl}/rss.xml`,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} ${syne.variable} ${bebasNeue.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <BadgeNotificationProvider>
            <SiteHeader />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">{children}</main>
            <footer className="mt-16 border-t border-nn-border/40">
              <div className="mx-auto max-w-6xl px-4 sm:px-6">
                {/* Séparateur accent */}
                <div className="mb-8 h-px w-16 bg-nn-red-dark" />
                <div className="flex flex-col gap-6 pb-10 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <span className="font-title text-lg tracking-[0.18em] text-nn-muted">NEXUS NOIR</span>
                    <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-nn-border">
                      La ville regarde ses lecteurs droit dans les yeux.<br />
                      Elle n&apos;a jamais prétendu être juste.
                    </p>
                  </div>
                  <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-widest text-nn-border">
                    <Link href="/" className="hover:text-nn-muted transition-colors">Nouvelles</Link>
                    <Link href="/series" className="hover:text-nn-muted transition-colors">Séries</Link>
                    <Link href="/univers" className="hover:text-nn-muted transition-colors">Univers</Link>
                    <Link href="/rss.xml" className="hover:text-nn-red transition-colors">RSS</Link>
                  </nav>
                </div>
              </div>
            </footer>
          </BadgeNotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
