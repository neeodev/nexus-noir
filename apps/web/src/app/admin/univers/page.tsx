"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { adminUniverseApi, TYPE_LABELS_PLURAL, TYPES_ORDER, type UniverseEntry, type UniverseEntryType } from "@/modules/universe/api";
import { AdminIconBtn, IcoEdit, IcoTrash, IcoEye } from "@/components/AdminIcons";
import { useDialog } from "@/hooks/useDialog";

const TYPE_COLORS: Record<UniverseEntryType, string> = {
  character: "bg-red-950 text-red-400 border-red-900/40",
  place:     "bg-blue-950 text-blue-400 border-blue-900/40",
  faction:   "bg-amber-950 text-amber-400 border-amber-900/40",
  event:     "bg-purple-950 text-purple-400 border-purple-900/40",
  concept:   "bg-zinc-900 text-zinc-500 border-zinc-800",
};

export default function AdminUniversPage() {
  const [entries, setEntries]     = useState<UniverseEntry[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [typeFilter, setFilter]   = useState<UniverseEntryType | "all">("all");
  const [deleting, setDeleting]   = useState<number | null>(null);
  const { confirm, alert, dialogNode } = useDialog();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setEntries((await adminUniverseApi.list()).data);
    } catch {
      setError("Impossible de charger l'univers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: number, name: string) => {
    if (!await confirm(`Supprimer « ${name} » définitivement ?`, { title: "Supprimer l'entrée", danger: true, confirmLabel: "Supprimer" })) return;
    setDeleting(id);
    try {
      await adminUniverseApi.delete(id);
      setEntries((p) => p.filter((e) => e.id !== id));
    } catch {
      await alert("Erreur lors de la suppression.", { title: "Erreur" });
    } finally {
      setDeleting(null);
    }
  };

  const visible = typeFilter === "all" ? entries : entries.filter((e) => e.type === typeFilter);

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Cartographie</h1>
          <p className="mt-1 text-sm text-zinc-500">Gestion de l'univers Nexus Noir.</p>
        </div>
        <Link href="/admin/univers/nouveau"
          className="inline-flex items-center gap-1.5 rounded bg-red-950 px-4 py-2 text-xs uppercase tracking-widest text-red-300 hover:bg-red-900">
          <span className="text-base leading-none">+</span> Nouvelle entrée
        </Link>
      </div>

      {/* Filtres par type */}
      <div className="mb-6 flex flex-wrap gap-1.5">
        <button onClick={() => setFilter("all")}
          className={`rounded-full px-3 py-1 text-xs transition-colors ${typeFilter === "all" ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}>
          Tout ({entries.length})
        </button>
        {TYPES_ORDER.map((t) => (
          <button key={t} onClick={() => setFilter(t)}
            className={`rounded-full px-3 py-1 text-xs transition-colors ${typeFilter === t ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}>
            {TYPE_LABELS_PLURAL[t]} ({entries.filter((e) => e.type === t).length})
          </button>
        ))}
      </div>

      {dialogNode}
      {loading && <p className="text-sm text-zinc-600">Chargement…</p>}
      {error   && <p className="text-sm text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="overflow-hidden rounded-lg border border-zinc-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-900 bg-zinc-950/60 text-left text-xs uppercase tracking-wider text-zinc-600">
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/60">
              {visible.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-zinc-600">Aucune entrée.</td></tr>
              )}
              {visible.map((entry) => (
                <tr key={entry.id} className="hover:bg-zinc-950/30">
                  <td className="px-4 py-3">
                    <div className="font-medium text-zinc-200">{entry.name}</div>
                    <div className="text-xs text-zinc-600">{entry.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-wider ${TYPE_COLORS[entry.type]}`}>
                      {entry.typeLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {entry.isHidden  ? <span className="text-xs text-zinc-600">Caché</span>
                   : entry.isLocked ? <span className="text-xs text-amber-600">Verrouillé</span>
                   :                  <span className="text-xs text-emerald-700">Visible</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <AdminIconBtn icon={<IcoEdit />} title="Modifier" href={`/admin/univers/${entry.id}`} />
                      <AdminIconBtn icon={<IcoEye />}  title="Voir la page publique" href={`/univers/${entry.slug}`} target="_blank" />
                      <AdminIconBtn icon={<IcoTrash />} title="Supprimer" variant="red"
                        disabled={deleting === entry.id} onClick={() => handleDelete(entry.id, entry.name)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
