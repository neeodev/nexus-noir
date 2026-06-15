"use client";

import { useEffect, useState, useCallback } from "react";
import { bookmarkApi } from "./api";
import { bookmarkStore } from "./store";
import { useAuthContext } from "@/modules/auth/store";

export function BookmarkButton({ slug }: { slug: string }) {
  const { user, status } = useAuthContext();
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sync avec le store
  useEffect(() => {
    setBookmarked(bookmarkStore.isBookmarked(slug));
    return bookmarkStore.subscribe(() => {
      setBookmarked(bookmarkStore.isBookmarked(slug));
    });
  }, [slug]);

  // Charger les slugs au premier montage si connecté et pas encore chargé
  useEffect(() => {
    if (status !== "authenticated" || bookmarkStore.loaded) return;
    bookmarkApi.slugs().then((res) => bookmarkStore.set(res.slugs)).catch(() => {});
  }, [status]);

  // Vider le store à la déconnexion
  useEffect(() => {
    if (status === "guest") bookmarkStore.clear();
  }, [status]);

  const handleToggle = useCallback(async () => {
    if (!user || loading) return;
    setLoading(true);
    // Optimiste
    const next = bookmarkStore.toggle(slug);
    try {
      const res = await bookmarkApi.toggle(slug);
      if (res.bookmarked !== next) bookmarkStore.toggle(slug); // rollback si désync
    } catch {
      bookmarkStore.toggle(slug); // rollback
    } finally {
      setLoading(false);
    }
  }, [user, slug, loading]);

  if (status === "loading" || status === "guest") return null;

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      title={bookmarked ? "Retirer des favoris" : "Ajouter aux favoris"}
      className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition-colors ${
        bookmarked
          ? "border-amber-800/60 bg-amber-950/30 text-amber-400 hover:border-amber-700"
          : "border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
      } disabled:opacity-50`}
    >
      <svg viewBox="0 0 24 24" fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}
        className="h-3.5 w-3.5">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
      </svg>
      {bookmarked ? "Favori" : "Favori"}
    </button>
  );
}
