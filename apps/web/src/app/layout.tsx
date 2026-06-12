import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/modules/auth/AuthProvider";
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
        <AuthProvider>
          <SiteHeader />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">{children}</main>
          <footer className="border-t border-zinc-900 py-6 text-center text-xs text-zinc-600">
            Nexus Noir — la ville regarde ses lecteurs droit dans les yeux.
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
