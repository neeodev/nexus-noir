"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { adminUniverseApi, TYPE_LABELS, TYPE_LABELS_PLURAL, type UniverseEntry, type UniverseEntryType } from "@/modules/universe/api";

const TYPES: UniverseEntryType[] = ["character", "place", "faction", "event", "concept"];

const TYPE_COLORS: Record<UniverseEntryType, string> = {
  character: "bg-red-950 text-red-400 border-red-900/40",
  place:     "bg-blue-950 text-blue-400 border-blue-900/40",
  faction:   "bg-amber-950 text-amber-400 border-amber-900/40",
  event:     "bg-purple-950 text-purple-400 border-purple-900/40",
  concept:   "bg-zinc-900 text-zinc-500 border-zinc-800",
};

export default function AdminUniversPage() {
  const [entries, setEntries] = useState<UniverseEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<UniverseEntryType | "all">("all");
  const [modal, setModal] = useState<"create" | number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminUniverseApi.list();
      setEntries(res.data);
    } catch {
      setError("Impossible de charger l'univers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette entrée définitivement ?")) return;
    setDeleting(id);
    try {
      await adminUniverseApi.delete(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch {
      alert("Erreur lors de la suppression.");
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
        <button
          onClick={() => setModal("create")}
          className="rounded-md bg-red-950 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-900 transition-colors"
        >
          + Nouvelle entrée
        </button>
      </div>

      {/* Filtres par type */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setTypeFilter("all")}
          className={`rounded-md px-3 py-1 text-xs transition-colors ${typeFilter === "all" ? "bg-zinc-800 text-zinc-200" : "text-zinc-500 hover:text-zinc-300"}`}
        >
          Tout ({entries.length})
        </button>
        {TYPES.map((t) => {
          const count = entries.filter((e) => e.type === t).length;
          return (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`rounded-md px-3 py-1 text-xs transition-colors ${typeFilter === t ? "bg-zinc-800 text-zinc-200" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              {TYPE_LABELS_PLURAL[t]} ({count})
            </button>
          );
        })}
      </div>

      {loading && <p className="text-sm text-zinc-600">Chargement…</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="overflow-hidden rounded-lg border border-zinc-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-900 bg-zinc-950/60 text-left text-xs uppercase tracking-wider text-zinc-600">
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/60">
              {visible.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-zinc-600">
                    Aucune entrée.
                  </td>
                </tr>
              )}
              {visible.map((entry) => (
                <tr key={entry.id} className="group hover:bg-zinc-950/30">
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
                    {entry.isHidden ? (
                      <span className="text-xs text-zinc-600">Caché</span>
                    ) : entry.isLocked ? (
                      <span className="text-xs text-amber-600">Verrouillé</span>
                    ) : (
                      <span className="text-xs text-emerald-700">Visible</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => setModal(entry.id)}
                        className="text-xs text-zinc-500 hover:text-zinc-200 transition-colors"
                      >
                        Modifier
                      </button>
                      <Link
                        href={`/univers/${entry.slug}`}
                        target="_blank"
                        className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
                      >
                        Voir
                      </Link>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        disabled={deleting === entry.id}
                        className="text-xs text-red-900 hover:text-red-500 transition-colors disabled:opacity-50"
                      >
                        {deleting === entry.id ? "…" : "Supprimer"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal !== null && (
        <EntryModal
          entryId={typeof modal === "number" ? modal : null}
          onClose={() => setModal(null)}
          onSaved={(entry) => {
            setEntries((prev) => {
              const idx = prev.findIndex((e) => e.id === entry.id);
              if (idx >= 0) {
                const next = [...prev];
                next[idx] = entry;
                return next;
              }
              return [...prev, entry];
            });
            setModal(null);
          }}
        />
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Modale création / édition
// ────────────────────────────────────────────────────────────

type ModalProps = {
  entryId: number | null;
  onClose: () => void;
  onSaved: (entry: UniverseEntry) => void;
};

function EntryModal({ entryId, onClose, onSaved }: ModalProps) {
  const isEdit = entryId !== null;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [fields, setFields] = useState({
    type: "character" as UniverseEntryType,
    name: "",
    slug: "",
    summary: "",
    cover_image: "",
    is_hidden: false,
    sort_order: 0,
    unlock_type: "",
    unlock_value: "",
  });

  useEffect(() => {
    if (!isEdit) return;
    adminUniverseApi.show(entryId!).then((res) => {
      const e = res.data;
      setFields({
        type: e.type,
        name: e.name,
        slug: e.slug,
        summary: e.summary ?? "",
        cover_image: e.coverImage ?? "",
        is_hidden: e.isHidden,
        sort_order: e.sortOrder,
        unlock_type: e.unlockCondition?.type ?? "",
        unlock_value: e.unlockCondition?.value ?? "",
      });
    }).finally(() => setLoading(false));
  }, [entryId, isEdit]);

  const set = (k: string, v: unknown) => setFields((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        type: fields.type,
        name: fields.name,
        slug: fields.slug || undefined,
        summary: fields.summary || null,
        cover_image: fields.cover_image || null,
        is_hidden: fields.is_hidden,
        sort_order: fields.sort_order,
        unlock_condition: fields.unlock_type
          ? { type: fields.unlock_type, value: fields.unlock_value }
          : null,
      };
      const res = isEdit
        ? await adminUniverseApi.update(entryId!, payload)
        : await adminUniverseApi.create(payload);
      onSaved(res.data);
    } catch {
      alert("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-100">
            {isEdit ? "Modifier l'entrée" : "Nouvelle entrée"}
          </h2>
          <button onClick={onClose} className="text-zinc-600 hover:text-zinc-400">✕</button>
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-zinc-600">Chargement…</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs text-zinc-500">Type *</label>
                <select
                  value={fields.type}
                  onChange={(e) => set("type", e.target.value)}
                  className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200"
                  required
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-500">Ordre d'affichage</label>
                <input
                  type="number"
                  min={0}
                  value={fields.sort_order}
                  onChange={(e) => set("sort_order", Number(e.target.value))}
                  className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs text-zinc-500">Nom *</label>
              <input
                type="text"
                value={fields.name}
                onChange={(e) => set("name", e.target.value)}
                className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-zinc-500">Slug (auto si vide)</label>
              <input
                type="text"
                value={fields.slug}
                onChange={(e) => set("slug", e.target.value)}
                placeholder="ex: inspector-vance"
                className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-700"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-zinc-500">Résumé (max 1000 chars)</label>
              <textarea
                value={fields.summary}
                onChange={(e) => set("summary", e.target.value)}
                rows={3}
                maxLength={1000}
                className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 resize-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-zinc-500">URL image de couverture</label>
              <input
                type="text"
                value={fields.cover_image}
                onChange={(e) => set("cover_image", e.target.value)}
                placeholder="https://…"
                className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-700"
              />
            </div>

            <div className="rounded-md border border-zinc-800/60 p-3">
              <p className="mb-2 text-xs text-zinc-500">Condition de déverrouillage</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[10px] text-zinc-600">Type</label>
                  <select
                    value={fields.unlock_type}
                    onChange={(e) => set("unlock_type", e.target.value)}
                    className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-300"
                  >
                    <option value="">Aucune</option>
                    <option value="badge">Badge</option>
                    <option value="story_read">Nouvelle lue</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] text-zinc-600">Valeur (slug)</label>
                  <input
                    type="text"
                    value={fields.unlock_value}
                    onChange={(e) => set("unlock_value", e.target.value)}
                    disabled={!fields.unlock_type}
                    placeholder="ex: detective-prive"
                    className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-xs text-zinc-300 disabled:opacity-40 placeholder:text-zinc-700"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="hidden"
                type="checkbox"
                checked={fields.is_hidden}
                onChange={(e) => set("is_hidden", e.target.checked)}
                className="rounded"
              />
              <label htmlFor="hidden" className="text-xs text-zinc-500">
                Caché (n'apparaît pas dans l'index public)
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-red-950 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-900 disabled:opacity-60 transition-colors"
              >
                {saving ? "Enregistrement…" : isEdit ? "Enregistrer" : "Créer"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
