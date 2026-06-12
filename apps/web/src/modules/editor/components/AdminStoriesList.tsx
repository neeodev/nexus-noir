"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminStoriesApi, type AdminStory } from "../api";

export function AdminStoriesList() {
  const [stories, setStories] = useState<AdminStory[] | null>(null);

  useEffect(() => {
    adminStoriesApi
      .list()
      .then(setStories)
      .catch(() => setStories([]));
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Nouvelles</h1>
        <Link
          href="/admin/nouvelles/nouveau"
          className="rounded bg-red-900 px-3 py-1.5 text-sm font-medium text-zinc-100 hover:bg-red-800"
        >
          + Nouvelle
        </Link>
      </div>

      {stories === null ? (
        <p className="text-sm text-zinc-700">…</p>
      ) : stories.length === 0 ? (
        <p className="text-sm text-zinc-600">Aucune nouvelle. Commence par en créer une.</p>
      ) : (
        <ul className="divide-y divide-zinc-900 rounded-md border border-zinc-900">
          {stories.map((s) => (
            <li key={s.id}>
              <Link
                href={`/admin/nouvelles/${s.id}`}
                className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-zinc-950/60"
              >
                <span className="min-w-0">
                  <span className="block truncate text-zinc-200">{s.title}</span>
                  <span className="text-xs text-zinc-600">
                    {s.wordCount} mots · {s.readingTime} min · maj {formatDate(s.updatedAt)}
                  </span>
                </span>
                <StatusBadge status={s.status} label={s.statusLabel} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatusBadge({ status, label }: { status: string; label: string }) {
  const cls =
    status === "published"
      ? "border-emerald-800 bg-emerald-950/40 text-emerald-300"
      : status === "draft"
        ? "border-zinc-700 bg-zinc-900 text-zinc-400"
        : "border-amber-800 bg-amber-950/30 text-amber-300";
  return (
    <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs ${cls}`}>{label}</span>
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  } catch {
    return "—";
  }
}
