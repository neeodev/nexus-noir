"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { bookmarkApi } from "@/modules/bookmarks/api";
import { useAuthContext } from "@/modules/auth/store";
import { BookmarkButton } from "@/modules/bookmarks/BookmarkButton";
import type { StoryListItem } from "@/lib/api";

type Page = { data: StoryListItem[]; current_page: number; last_page: number; total: number };

export default function FavorisPage() {
  const { status } = useAuthContext();
  const [page, setPage] = useState<Page | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") return;
    setLoading(true);
    bookmarkApi.list(currentPage)
      .then(setPage)
      .finally(() => setLoading(false));
  }, [status, currentPage]);

  if (status === "guest") {
    return (
      <div className="mx-auto max-w-2xl">
        <p className="text-zinc-500">
          <Link href="/connexion" className="text-red-400 hover:underline">Connectez-vous</Link> pour accéder à vos favoris.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 border-l-2 border-red-900/50 pl-5">
        <h1 className="text-2xl font-bold text-zinc-100">Favoris</h1>
        <p className="mt-1 text-sm text-zinc-500">Vos nouvelles mises en favori.</p>
      </div>

      {loading && <p className="text-sm text-zinc-600">Chargement…</p>}

      {!loading && page && (
        <>
          {page.data.length === 0 && (
            <p className="text-sm text-zinc-600">
              Aucune nouvelle en favori.{" "}
              <Link href="/" className="text-zinc-400 hover:underline">Parcourir les archives</Link>
            </p>
          )}

          <ul className="divide-y divide-zinc-900">
            {page.data.map((story) => (
              <li key={story.slug} className="flex items-start justify-between gap-4 py-5">
                <div className="min-w-0">
                  <Link href={`/nouvelles/${story.slug}`}
                    className="block font-medium text-zinc-100 hover:text-red-400 transition-colors line-clamp-1">
                    {story.title}
                  </Link>
                  {story.summaryShort && (
                    <p className="mt-1 text-sm text-zinc-500 line-clamp-2">{story.summaryShort}</p>
                  )}
                  <p className="mt-1 text-xs text-zinc-600">
                    {story.readingTime} min · {story.wordCount} mots
                  </p>
                </div>
                <BookmarkButton slug={story.slug} />
              </li>
            ))}
          </ul>

          {page.last_page > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <button disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="text-xs text-zinc-500 disabled:opacity-30 hover:text-zinc-300">
                ← Précédent
              </button>
              <span className="text-xs text-zinc-600">{currentPage} / {page.last_page}</span>
              <button disabled={currentPage === page.last_page}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="text-xs text-zinc-500 disabled:opacity-30 hover:text-zinc-300">
                Suivant →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
