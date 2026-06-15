"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { adminSeriesApi, type Series } from "@/modules/series/api";
import { AdminIconBtn, IcoEdit, IcoTrash, IcoEye } from "@/components/AdminIcons";
import { useDialog } from "@/hooks/useDialog";

export default function AdminSeriesPage() {
  const [series, setSeries]     = useState<Series[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const { confirm, alert, dialogNode } = useDialog();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setSeries(await adminSeriesApi.list());
    } catch {
      setError("Impossible de charger les séries.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(s: Series) {
    if (!await confirm(`Supprimer « ${s.title} » ?`, { title: "Supprimer la série", danger: true, confirmLabel: "Supprimer", })) return;
    setDeleting(s.id);
    try {
      await adminSeriesApi.destroy(s.id);
      setSeries((p) => p.filter((x) => x.id !== s.id));
    } catch {
      await alert("Erreur lors de la suppression.", { title: "Erreur" });
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-600">Admin</p>
          <h1 className="font-heading text-2xl font-bold text-zinc-100">Séries</h1>
        </div>
        <Link href="/admin/series/nouveau"
          className="inline-flex items-center gap-1.5 rounded bg-red-950 px-4 py-2 text-xs uppercase tracking-widest text-red-300 hover:bg-red-900">
          <span className="text-base leading-none">+</span> Nouvelle série
        </Link>
      </div>

      {loading && <p className="text-sm text-zinc-600">Chargement…</p>}
      {error   && <p className="text-sm text-red-500">{error}</p>}
      {dialogNode}
      {!loading && series.length === 0 && (
        <p className="text-sm text-zinc-600">Aucune série pour l&apos;instant.</p>
      )}

      {!loading && series.length > 0 && (
        <div className="space-y-1.5">
          {series.map((s) => (
            <div key={s.id} className="flex items-center gap-3 rounded-lg border border-zinc-900 bg-zinc-950/40 px-3 py-2.5 hover:border-zinc-800">
              {s.coverImage
                ? <img src={s.coverImage} alt={s.title} className="h-10 w-14 shrink-0 rounded object-cover" />
                : <div className="h-10 w-14 shrink-0 rounded bg-zinc-800/60" />}

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-zinc-200">{s.title}</p>
                <p className="text-xs text-zinc-600">
                  {s.storiesCount ?? 0} épisode{(s.storiesCount ?? 0) !== 1 ? "s" : ""}
                  {s.isCompleted ? " · Terminée" : ""}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <AdminIconBtn icon={<IcoEdit />}  title="Éditer la série"        href={`/admin/series/${s.id}`} />
                <AdminIconBtn icon={<IcoEye />}   title="Voir la page publique"  href={`/series/${s.slug}`} target="_blank" />
                <AdminIconBtn icon={<IcoTrash />} title="Supprimer la série"     variant="red"
                  disabled={deleting === s.id} onClick={() => handleDelete(s)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
