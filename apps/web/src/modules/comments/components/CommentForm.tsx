"use client";

import { useState } from "react";
import { ApiError } from "@/lib/http";
import { useBadgeNotify } from "@/components/BadgeNotificationProvider";
import { commentsApi } from "../api";

export function CommentForm({
  slug,
  parentId,
  onPosted,
  onCancel,
  placeholder = "Laisse un murmure…",
  autoFocus = false,
}: {
  slug: string;
  parentId?: number;
  onPosted: () => void;
  onCancel?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const notify = useBadgeNotify();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await commentsApi.post(slug, body.trim(), parentId);
      if (result.newBadges?.length) {
        notify(result.newBadges);
      }
      setBody("");
      onPosted();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de l'envoi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder}
        rows={parentId ? 2 : 3}
        autoFocus={autoFocus}
        className="w-full resize-y rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-red-900/70"
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={submitting || !body.trim()}
          className="rounded-md bg-red-900 px-3 py-1.5 text-sm font-medium text-zinc-100 transition-colors hover:bg-red-800 disabled:opacity-40"
        >
          {submitting ? "…" : parentId ? "Répondre" : "Publier"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs uppercase tracking-widest text-zinc-500 hover:text-zinc-300"
          >
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}
