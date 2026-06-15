"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { adminStoriesApi, type AdminStory } from "../api";
import {
  AdminIconBtn,
  IcoEdit, IcoTrash, IcoEye, IcoPublish, IcoUnpublish, IcoArchive, IcoRestore,
} from "@/components/AdminIcons";
import { useDialog } from "@/hooks/useDialog";

type StatusFilter = "all" | "draft" | "published" | "archived" | "in_review" | "ready_to_publish";

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all",              label: "Toutes" },
  { value: "published",        label: "Publiées" },
  { value: "draft",            label: "Brouillons" },
  { value: "in_review",        label: "En révision" },
  { value: "ready_to_publish", label: "Prêtes" },
  { value: "archived",         label: "Archivées" },
];

const STATUS_STYLE: Record<string, string> = {
  published:        "border-emerald-800 bg-emerald-950/40 text-emerald-300",
  draft:            "border-zinc-700 bg-zinc-900 text-zinc-400",
  archived:         "border-zinc-800 bg-zinc-950 text-zinc-600",
  in_review:        "border-blue-800 bg-blue-950/30 text-blue-300",
  ready_to_publish: "border-amber-800 bg-amber-950/30 text-amber-300",
};

type ActionKey = "publish" | "unpublish" | "archive" | "delete";
type InFlight  = { id: number; action: ActionKey } | null;

export function AdminStoriesList() {
  const [stories, setStories]     = useState<AdminStory[]>([]);
  const [loading, setLoading]     = useState(true);
  const [statusFilter, setFilter] = useState<StatusFilter>("all");
  const [search, setSearch]       = useState("");
  const [inFlight, setInFlight]   = useState<InFlight>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { confirm, alert, dialogNode } = useDialog();

  const load = useCallback(async (q: string, status: StatusFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status !== "all") params.set("status", status);
      if (q.trim()) params.set("search", q.trim());
      params.set("per_page", "50");
      setStories(await adminStoriesApi.list(params.toString()));
    } catch {
      setStories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(search, statusFilter); }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSearch(q: string) {
    setSearch(q);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => load(q, statusFilter), 300);
  }

  async function doAction(story: AdminStory, action: ActionKey) {
    if (action === "delete" && !await confirm(`Supprimer « ${story.title} » ?`, { title: "Supprimer la nouvelle", danger: true, confirmLabel: "Supprimer" })) return;
    setInFlight({ id: story.id, action });
    try {
      if (action === "publish")   { updateStory(await adminStoriesApi.publish(story.id)); }
      if (action === "unpublish") { updateStory(await adminStoriesApi.unpublish(story.id)); }
      if (action === "archive")   { updateStory(await adminStoriesApi.archive(story.id)); }
      if (action === "delete")    { await adminStoriesApi.remove(story.id); removeStory(story.id); }
    } catch {
      await alert("Une erreur est survenue.", { title: "Erreur" });
    } finally {
      setInFlight(null);
    }
  }

  const updateStory = (u: AdminStory) => setStories((p) => p.map((s) => (s.id === u.id ? u : s)));
  const removeStory = (id: number)    => setStories((p) => p.filter((s) => s.id !== id));

  return (
    <div>
      {dialogNode}
      <div className="mb-5 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Nouvelles</h1>
        <Link href="/admin/nouvelles/nouveau"
          className="inline-flex items-center gap-1.5 rounded bg-red-950 px-3 py-1.5 text-xs uppercase tracking-widest text-red-300 hover:bg-red-900">
          <span className="text-base leading-none">+</span> Nouvelle
        </Link>
      </div>

      {/* Filtres + recherche */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1">
          {STATUS_TABS.map((tab) => (
            <button key={tab.value} type="button" onClick={() => setFilter(tab.value)}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${statusFilter === tab.value ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}>
              {tab.label}
            </button>
          ))}
        </div>
        <input type="search" value={search} onChange={(e) => handleSearch(e.target.value)}
          placeholder="Rechercher…"
          className="ml-auto w-44 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-300 outline-none focus:border-zinc-700 placeholder:text-zinc-700" />
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-zinc-700">Chargement…</p>
      ) : stories.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-600">Aucune nouvelle.</p>
      ) : (
        <ul className="space-y-1">
          {stories.map((s) => {
            const busy = inFlight?.id === s.id;
            return (
              <li key={s.id} className="flex items-center gap-3 rounded-lg border border-zinc-900 bg-zinc-950/40 px-3 py-2.5 hover:border-zinc-800">
                {s.coverImage
                  ? <img src={s.coverImage} alt="" className="h-10 w-14 shrink-0 rounded object-cover" />
                  : <div className="h-10 w-14 shrink-0 rounded bg-zinc-800/60" />}

                <div className="min-w-0 flex-1">
                  <Link href={`/admin/nouvelles/${s.id}`}
                    className="block truncate text-sm text-zinc-200 hover:text-white">
                    {s.title}
                  </Link>
                  <p className="text-xs text-zinc-600">
                    {s.wordCount} mots · {s.readingTime} min · {fmt(s.updatedAt)}
                  </p>
                </div>

                <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs ${STATUS_STYLE[s.status] ?? STATUS_STYLE.draft}`}>
                  {s.statusLabel}
                </span>

                <div className="flex shrink-0 items-center gap-1">
                  <AdminIconBtn icon={<IcoEdit />}  title="Éditer"     href={`/admin/nouvelles/${s.id}`} />
                  <AdminIconBtn icon={<IcoEye />}   title="Voir la page publique" href={s.status === "published" ? `/nouvelles/${s.slug}` : undefined} target="_blank"
                    variant="neutral" disabled={s.status !== "published"} />

                  {s.status === "published" ? (
                    <AdminIconBtn icon={<IcoUnpublish />} title="Dépublier (brouillon)" onClick={() => doAction(s, "unpublish")} disabled={busy} />
                  ) : s.status !== "archived" ? (
                    <AdminIconBtn icon={<IcoPublish />} title="Publier" onClick={() => doAction(s, "publish")} variant="green" disabled={busy} />
                  ) : null}

                  {s.status !== "archived"
                    ? <AdminIconBtn icon={<IcoArchive />} title="Archiver" onClick={() => doAction(s, "archive")} disabled={busy} />
                    : <AdminIconBtn icon={<IcoRestore />} title="Restaurer (brouillon)" onClick={() => doAction(s, "unpublish")} disabled={busy} />}

                  <AdminIconBtn icon={<IcoTrash />} title="Supprimer définitivement" onClick={() => doAction(s, "delete")} variant="red" disabled={busy} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function fmt(iso: string | null) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }); }
  catch { return "—"; }
}
