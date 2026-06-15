"use client";

import { useEffect, useState } from "react";
import { AdminGuard } from "@/components/AdminGuard";
import { apiGet, apiSend } from "@/lib/http";
import type { Badge } from "@/modules/auth/api";
import { BadgeIcon } from "@/components/BadgeIcon";
import { AdminIconBtn, IcoEdit, IcoTrash } from "@/components/AdminIcons";
import { useDialog } from "@/hooks/useDialog";

type BadgeForm = {
  slug: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  condition_type: string;
  condition_value: string;
  condition_meta_code: string;
  condition_meta_launch_date: string;
  condition_meta_window_days: string;
  is_active: boolean;
  sort_order: string;
};

const RARITY_OPTIONS = [
  { value: "commun", label: "Commun" },
  { value: "rare", label: "Rare" },
  { value: "epique", label: "Épique" },
  { value: "legendaire", label: "Légendaire" },
  { value: "interdit", label: "Interdit" },
];

const CONDITION_OPTIONS = [
  { value: "register", label: "À l'inscription" },
  { value: "readings_count", label: "Nombre de lectures" },
  { value: "reactions_given", label: "Nombre de réactions" },
  { value: "reading_at_night", label: "Lecture de nuit (0h-4h)" },
  { value: "comments_count", label: "Nombre de commentaires" },
  { value: "early_bird", label: "Premiers lecteurs (minutes)" },
  { value: "secret_code", label: "Code secret" },
  { value: "account_age", label: "Ancienneté du compte (jours)" },
  { value: "og_member", label: "Membre OG (fenêtre de lancement)" },
];

const CONDITION_NEEDS_VALUE = new Set(["readings_count", "reactions_given", "comments_count", "early_bird", "account_age"]);

const ICON_OPTIONS = [
  "city", "eye", "folder", "moon", "link", "footsteps", "bolt", "key", "comment", "star", "shield", "crown", "clock",
];

const EMPTY_FORM: BadgeForm = {
  slug: "",
  name: "",
  description: "",
  icon: "star",
  rarity: "commun",
  condition_type: "register",
  condition_value: "",
  condition_meta_code: "",
  condition_meta_launch_date: "",
  condition_meta_window_days: "7",
  is_active: true,
  sort_order: "0",
};

export default function AdminBadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<BadgeForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { confirm, dialogNode } = useDialog();

  async function loadBadges() {
    setLoading(true);
    try {
      const res = await apiGet<{ data: Badge[] }>("/admin/badges");
      setBadges(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBadges();
  }, []);

  function openNew() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError(null);
    setShowForm(true);
  }

  function openEdit(badge: Badge) {
    setForm({
      slug: badge.slug,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      rarity: badge.rarity,
      condition_type: badge.conditionType,
      condition_value: badge.conditionValue !== null ? String(badge.conditionValue) : "",
      condition_meta_code: (badge.conditionMeta?.["code"] as string | undefined) ?? "",
      condition_meta_launch_date: (badge.conditionMeta?.["launch_date"] as string | undefined) ?? "",
      condition_meta_window_days: String(badge.conditionMeta?.["window_days"] ?? "7"),
      is_active: badge.isActive,
      sort_order: String(badge.sortOrder),
    });
    setEditingId(badge.id);
    setError(null);
    setShowForm(true);
  }

  function cancel() {
    setShowForm(false);
    setEditingId(null);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const conditionMeta =
        form.condition_type === "secret_code" && form.condition_meta_code
          ? { code: form.condition_meta_code }
          : form.condition_type === "og_member" && form.condition_meta_launch_date
          ? { launch_date: form.condition_meta_launch_date, window_days: Number(form.condition_meta_window_days) || 7 }
          : null;

      const payload = {
        slug: form.slug,
        name: form.name,
        description: form.description,
        icon: form.icon,
        rarity: form.rarity,
        condition_type: form.condition_type,
        condition_value: form.condition_value !== "" ? Number(form.condition_value) : null,
        condition_meta: conditionMeta,
        is_active: form.is_active,
        sort_order: Number(form.sort_order),
      };

      if (editingId !== null) {
        await apiSend(`/admin/badges/${editingId}`, "PATCH", payload);
      } else {
        await apiSend("/admin/badges", "POST", payload);
      }

      setShowForm(false);
      setEditingId(null);
      await loadBadges();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(badge: Badge) {
    if (!await confirm(`Supprimer la marque « ${badge.name} » ?`, { title: "Supprimer la marque", danger: true, confirmLabel: "Supprimer" })) return;
    try {
      await apiSend(`/admin/badges/${badge.id}`, "DELETE");
      await loadBadges();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression.");
    }
  }

  return (
    <AdminGuard permission="admin.access">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Marques</h1>
          <p className="mt-1 text-sm text-zinc-500">Gérer les badges et conditions d'attribution.</p>
        </div>
        {!showForm && (
          <button
            onClick={openNew}
            className="rounded bg-red-900 px-4 py-2 text-xs uppercase tracking-widest text-zinc-100 transition-colors hover:bg-red-800"
          >
            Nouveau badge
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 space-y-4 rounded-lg border border-zinc-900 bg-zinc-950/40 p-6"
        >
          <h2 className="text-sm font-semibold text-zinc-300">
            {editingId !== null ? "Modifier la marque" : "Nouvelle marque"}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Slug">
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                required
                className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-red-900"
              />
            </Field>
            <Field label="Nom">
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-red-900"
              />
            </Field>
            <Field label="Icône">
              <select
                value={form.icon}
                onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-red-900"
              >
                {ICON_OPTIONS.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              {form.icon && (
                <div className="mt-2 flex items-center gap-2 text-zinc-400">
                  <BadgeIcon name={form.icon} className="h-5 w-5" />
                  <span className="text-xs">{form.icon}</span>
                </div>
              )}
            </Field>
            <Field label="Rareté">
              <select
                value={form.rarity}
                onChange={(e) => setForm((f) => ({ ...f, rarity: e.target.value }))}
                className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-red-900"
              >
                {RARITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Type de condition">
              <select
                value={form.condition_type}
                onChange={(e) => setForm((f) => ({ ...f, condition_type: e.target.value, condition_value: "", condition_meta_code: "", condition_meta_launch_date: "", condition_meta_window_days: "7" }))}
                className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-red-900"
              >
                {CONDITION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
            {CONDITION_NEEDS_VALUE.has(form.condition_type) && (
              <Field label="Valeur seuil">
                <input
                  type="number"
                  min={1}
                  value={form.condition_value}
                  onChange={(e) => setForm((f) => ({ ...f, condition_value: e.target.value }))}
                  className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-red-900"
                />
              </Field>
            )}
            {form.condition_type === "secret_code" && (
              <Field label="Code secret">
                <input
                  type="text"
                  value={form.condition_meta_code}
                  onChange={(e) => setForm((f) => ({ ...f, condition_meta_code: e.target.value.toUpperCase() }))}
                  placeholder="EX: NEXUS2026"
                  className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-sm uppercase tracking-widest text-zinc-100 outline-none focus:border-red-900"
                />
              </Field>
            )}
            {form.condition_type === "og_member" && (
              <>
                <Field label="Date de lancement">
                  <input
                    type="date"
                    value={form.condition_meta_launch_date}
                    onChange={(e) => setForm((f) => ({ ...f, condition_meta_launch_date: e.target.value }))}
                    className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-red-900"
                  />
                </Field>
                <Field label="Fenêtre (jours)">
                  <input
                    type="number"
                    min={1}
                    value={form.condition_meta_window_days}
                    onChange={(e) => setForm((f) => ({ ...f, condition_meta_window_days: e.target.value }))}
                    className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-red-900"
                  />
                </Field>
              </>
            )}
            <Field label="Ordre">
              <input
                type="number"
                min={0}
                value={form.sort_order}
                onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
                className="w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-red-900"
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              required
              rows={2}
              className="w-full resize-none rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-red-900"
            />
          </Field>

          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
              className="h-4 w-4 accent-red-800"
            />
            Actif
          </label>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-red-900 px-4 py-2 text-xs uppercase tracking-widest text-zinc-100 transition-colors hover:bg-red-800 disabled:opacity-50"
            >
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
            <button
              type="button"
              onClick={cancel}
              className="rounded border border-zinc-800 px-4 py-2 text-xs uppercase tracking-widest text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-300"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {dialogNode}
      {loading ? (
        <p className="text-sm text-zinc-700">Chargement…</p>
      ) : badges.length === 0 ? (
        <p className="text-sm text-zinc-600">Aucune marque configurée.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-900">
          <table className="w-full text-sm">
            <thead className="bg-zinc-950/60">
              <tr className="text-left text-xs uppercase tracking-widest text-zinc-600">
                <th className="px-4 py-3">Icône</th>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Rareté</th>
                <th className="px-4 py-3">Condition</th>
                <th className="px-4 py-3">Actif</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {badges.map((badge) => (
                <tr key={badge.id} className="border-t border-zinc-900 hover:bg-zinc-950/40">
                  <td className="px-4 py-3">
                    <BadgeIcon name={badge.icon} className="h-5 w-5 text-zinc-400" />
                  </td>
                  <td className="px-4 py-3 text-zinc-100">{badge.name}</td>
                  <td className="px-4 py-3">
                    <span style={{ color: badge.rarityColor }} className="text-xs uppercase tracking-wider">
                      {badge.rarityLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {badge.conditionType}
                    {badge.conditionValue !== null && ` ≥ ${badge.conditionValue}`}
                  </td>
                  <td className="px-4 py-3">
                    <span className={badge.isActive ? "text-zinc-300" : "text-zinc-700"}>
                      {badge.isActive ? "Oui" : "Non"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <AdminIconBtn icon={<IcoEdit />}  title="Modifier"   onClick={() => openEdit(badge)} />
                      <AdminIconBtn icon={<IcoTrash />} title="Supprimer"  variant="red" onClick={() => handleDelete(badge)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminGuard>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs text-zinc-400">{label}</label>
      {children}
    </div>
  );
}
