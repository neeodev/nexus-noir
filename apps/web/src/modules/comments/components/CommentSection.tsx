"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/modules/auth/hooks";
import { commentsApi, type Comment } from "../api";
import { CommentForm } from "./CommentForm";
import { CommentItem } from "./CommentItem";

function countAll(comments: Comment[]): number {
  return comments.reduce((sum, c) => sum + 1 + countAll(c.replies), 0);
}

export function CommentSection({ slug }: { slug: string }) {
  const { isAuthenticated, status } = useAuth();
  const [comments, setComments] = useState<Comment[] | null>(null);

  const refresh = useCallback(() => {
    commentsApi
      .list(slug)
      .then(setComments)
      .catch(() => setComments([]));
  }, [slug]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const total = comments ? countAll(comments) : 0;

  return (
    <section className="mt-12 border-t border-zinc-900 pt-6">
      <h2 className="mb-4 text-xs uppercase tracking-widest text-zinc-600">
        Murmures {comments && `· ${total}`}
      </h2>

      {status !== "loading" &&
        (isAuthenticated ? (
          <div className="mb-6">
            <CommentForm slug={slug} onPosted={refresh} />
          </div>
        ) : (
          <p className="mb-6 text-sm text-zinc-500">
            <Link href="/connexion" className="text-red-400 hover:text-red-300">
              Connecte-toi
            </Link>{" "}
            pour laisser un murmure.
          </p>
        ))}

      {comments === null ? (
        <p className="text-sm text-zinc-700">…</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-zinc-600">Aucun murmure pour l'instant.</p>
      ) : (
        <div className="divide-y divide-zinc-900/60">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              slug={slug}
              depth={0}
              onChanged={refresh}
            />
          ))}
        </div>
      )}
    </section>
  );
}
