"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/AdminGuard";
import { commentsApi, type Comment, type CommentPage } from "@/modules/comments/api";
import { ApiError } from "@/modules/auth/api";
import { useDialog } from "@/hooks/useDialog";

type Status = "all" | "hidden" | "pinned" | "deleted";

const STATUS_LABELS: Record<Status, string> = {
  all: "Tous",
  hidden: "Masqués",
  pinned: "Épinglés",
  deleted: "Supprimés",
};

export default function ModerationPage() {
  return (
    <AdminGuard permission="admin.access">
      <ModerationContent />
    </AdminGuard>
  );
}

function ModerationContent() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<Status>("all");
  const [data, setData] = useState<CommentPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { confirm, dialogNode } = useDialog();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await commentsApi.adminList({ page, status });
      setData(res);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => { void load(); }, [load]);

  function handleStatusChange(s: Status) {
    setStatus(s);
    setPage(1);
  }

  async function act(
    commentId: number,
    action: "hide" | "show" | "pin" | "unpin" | "delete",
  ) {
    try {
      if (action === "delete") {
        await commentsApi.remove(commentId);
      } else {
        const changes =
          action === "hide" ? { isHidden: true }
          : action === "show" ? { isHidden: false }
          : action === "pin" ? { isPinned: true }
          : { isPinned: false };
        await commentsApi.moderate(commentId, changes);
      }
      void load();
    } catch {
      // silently ignore
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin" className="text-zinc-600 hover:text-zinc-400 text-sm">
          ← Bureau Noir
        </Link>
        <span className="text-zinc-800">/</span>
        <h1 className="text-xl font-semibold text-zinc-100">Modération</h1>
      </div>

      {/* Filtres */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {(Object.keys(STATUS_LABELS) as Status[]).map((s) => (
          <button
            key={s}
            onClick={() => handleStatusChange(s)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              status === s
                ? "bg-red-900 text-zinc-100"
                : "border border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
            }`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
        {data && (
          <span className="ml-auto self-center text-xs text-zinc-600">
            {data.meta.total} commentaire{data.meta.total !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {dialogNode}
      {error && (
        <p className="mb-4 rounded-md border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {loading ? (
        <div className="py-12 text-center text-sm text-zinc-600">Chargement…</div>
      ) : data?.data.length === 0 ? (
        <div className="py-12 text-center text-sm text-zinc-600">
          Aucun commentaire{status !== "all" ? ` avec le filtre « ${STATUS_LABELS[status]} »` : ""}.
        </div>
      ) : (
        <div className="divide-y divide-zinc-900 rounded-lg border border-zinc-900">
          {data?.data.map((comment) => (
            <CommentRow key={comment.id} comment={comment} onAct={act}
              onDelete={async (id) => {
                if (await confirm("Supprimer ce commentaire ?", { title: "Supprimer", danger: true, confirmLabel: "Supprimer" }))
                  act(id, "delete");
              }}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.meta.last_page > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-md border border-zinc-800 px-3 py-1.5 text-xs text-zinc-400 hover:border-zinc-700 disabled:opacity-30"
          >
            ← Précédent
          </button>
          <span className="text-xs text-zinc-600">
            {page} / {data.meta.last_page}
          </span>
          <button
            disabled={page >= data.meta.last_page}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-md border border-zinc-800 px-3 py-1.5 text-xs text-zinc-400 hover:border-zinc-700 disabled:opacity-30"
          >
            Suivant →
          </button>
        </div>
      )}
    </div>
  );
}

function CommentRow({
  comment,
  onAct,
  onDelete,
}: {
  comment: Comment;
  onAct: (id: number, action: "hide" | "show" | "pin" | "unpin" | "delete") => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="flex gap-4 p-4 hover:bg-zinc-950/40">
      {/* Contenu */}
      <div className="min-w-0 flex-1">
        {/* Méta */}
        <div className="mb-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-xs font-medium text-zinc-300">
            {comment.author?.name ?? <span className="italic text-zinc-600">Anonyme</span>}
          </span>
          {comment.story && (
            <Link
              href={`/nouvelles/${comment.story.slug}`}
              className="text-xs text-zinc-600 hover:text-zinc-400 truncate max-w-[200px]"
              title={comment.story.title}
            >
              {comment.story.title}
            </Link>
          )}
          <span className="text-xs text-zinc-700">
            {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString("fr-FR") : "—"}
          </span>
          <div className="flex gap-1.5">
            {comment.isPinned && <StatusBadge color="amber">Épinglé</StatusBadge>}
            {comment.isHidden && <StatusBadge color="red">Masqué</StatusBadge>}
            {comment.isDeleted && <StatusBadge color="zinc">Supprimé</StatusBadge>}
          </div>
        </div>

        {/* Corps */}
        <p className="line-clamp-2 text-sm text-zinc-400">{comment.body}</p>
      </div>

      {/* Actions */}
      {!comment.isDeleted && (
        <div className="flex shrink-0 flex-col gap-1 items-end justify-start">
          {comment.can.moderate && (
            <>
              <ActionBtn
                onClick={() => onAct(comment.id, comment.isHidden ? "show" : "hide")}
              >
                {comment.isHidden ? "Afficher" : "Masquer"}
              </ActionBtn>
              <ActionBtn
                onClick={() => onAct(comment.id, comment.isPinned ? "unpin" : "pin")}
              >
                {comment.isPinned ? "Désépingler" : "Épingler"}
              </ActionBtn>
            </>
          )}
          {comment.can.delete && (
            <ActionBtn onClick={() => onDelete(comment.id)} danger>
              Supprimer
            </ActionBtn>
          )}
        </div>
      )}
    </div>
  );
}

function StatusBadge({
  color,
  children,
}: {
  color: "amber" | "red" | "zinc";
  children: React.ReactNode;
}) {
  const cls =
    color === "amber"
      ? "bg-amber-900/30 text-amber-400 border-amber-900/60"
      : color === "red"
        ? "bg-red-900/30 text-red-400 border-red-900/60"
        : "bg-zinc-900/50 text-zinc-500 border-zinc-800";
  return (
    <span className={`rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-wider ${cls}`}>
      {children}
    </span>
  );
}

function ActionBtn({
  onClick,
  danger = false,
  children,
}: {
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded px-2 py-1 text-xs transition-colors ${
        danger
          ? "text-red-500 hover:bg-red-950/40 hover:text-red-400"
          : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
      }`}
    >
      {children}
    </button>
  );
}
