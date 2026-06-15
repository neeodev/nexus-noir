import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Archive introuvable",
};

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-start py-20">
      <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-red-900">
        Erreur 404
      </p>
      <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-100">
        Archive introuvable.
      </h1>
      <p className="mb-10 max-w-md text-base leading-relaxed text-zinc-500">
        Ce dossier n&apos;existe pas, ou il a été effacé avant que tu puisses le lire.
        Nexus Noir a ses secrets.
      </p>
      <Link
        href="/"
        className="text-xs uppercase tracking-widest text-zinc-600 transition-colors hover:text-red-500"
      >
        ← Retour aux archives
      </Link>
    </div>
  );
}
