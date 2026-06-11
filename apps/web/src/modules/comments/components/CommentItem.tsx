"use client";

import { useState } from "react";
import { useAuth } from "@/modules/auth/hooks";
import { commentsApi, type Comment } from "../api";
import { CommentForm } from "./CommentForm";

function formatDate(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function CommentItem({
  comment,
  slug,
  depth,
  onChanged,
}: {
  comment: Comment;
  slug: string;
  depth: number;
  onChanged: () => void;
}) {
  const { isAuthenticated } = useAuth();
  const [replying, setReplying] = useState(false);
  const [busy, setBusy] = useState(false);

  const muted = comment.isDeleted || comment.isHidden;
  // L'indentation visuelle est plafonnée pour rester lisible sur mobile.
  const indent = Math.min(depth, 4);

  async function act(fn: () => Promise<unknown>) {
    setBusy(true);
    try {
      await fn();
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className={indent > 0 ? "border-l border-zinc-900 pl-4" : ""}
      style={indent > 0 ? { marginLeft: 4 } : undefined}
    >
      <div className="py-3">
        <div className="mb-1 flex flex-wrap items-center gap-x-2 text-xs text-zinc-600">
          {comment.isPinned && (
            <span className="rounded bg-red-950/60 px-1.5 py-0.5 text-red-300">📌 épinglé</span>
          )}
          <span className="text-zinc-400">{comment.author?.name ?? "—"}</span>
          <span>·</span>
          <span>{formatDate(comment.createdAt)}</span>
          {comment.isHidden && !comment.isDeleted && (
            <span className="text-amber-500/80">masqué</span>
          )}
        </div>

        <p className={`whitespace-pre-wrap text-sm ${muted ? "italic text-zinc-600" : "text-zinc-200"}`}>
          {comment.body}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
          {comment.can.reply && isAuthenticated && (
            <button
              type="button"
              onClick={() => setReplying((v) => !v)}
              className="uppercase tracking-widest text-zinc-500 hover:text-red-400"
            >
              {replying ? "Fermer" : "Répondre"}
            </button>
          )}
          {comment.can.moderate && (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => act(() => commentsApi.moderate(comment.id, { isPinned: !comment.isPinned }))}
                className="uppercase tracking-widest text-zinc-500 hover:text-amber-400 disabled:opacity-40"
              >
                {comment.isPinned ? "Désépingler" : "Épingler"}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => act(() => commentsApi.moderate(comment.id, { isHidden: !comment.isHidden }))}
                className="uppercase tracking-widest text-zinc-500 hover:text-amber-400 disabled:opacity-40"
              >
                {comment.isHidden ? "Afficher" : "Masquer"}
              </button>
            </>
          )}
          {comment.can.delete && (
            <button
              type="button"
              disabled={busy}
              onClick={() => act(() => commentsApi.remove(comment.id))}
              className="uppercase tracking-widest text-zinc-500 hover:text-red-400 disabled:opacity-40"
            >
              Supprimer
            </button>
          )}
        </div>

        {replying && (
          <div className="mt-3">
            <CommentForm
              slug={slug}
              parentId={comment.id}
              autoFocus
              placeholder="Ta réponse…"
              onCancel={() => setReplying(false)}
              onPosted={() => {
                setReplying(false);
                onChanged();
              }}
            />
          </div>
        )}
      </div>

      {comment.replies.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              slug={slug}
              depth={depth + 1}
              onChanged={onChanged}
            />
          ))}
        </div>
      )}
    </div>
  );
}
