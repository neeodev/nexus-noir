"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminUniverseApi, TYPE_LABELS, TYPES_ORDER, type UniverseEntryType } from "./api";
import type { StoryDocument } from "@/lib/api";
import { StoryEditor } from "@/modules/editor/components/StoryEditor";
import { emptyDoc } from "@/modules/editor/extensions";
import { ApiError } from "@/lib/http";
import { useDialog } from "@/hooks/useDialog";

// Champs meta par type
const META_PRESETS: Record<UniverseEntryType, string[]> = {
  character: ["Âge", "Statut", "Affiliation", "Occupation"],
  place:     ["Catégorie", "Statut", "Quartier", "Accès"],
  faction:   ["Alignement", "Statut", "Fondée en", "Chef"],
  event:     ["Date", "Lieu", "Résultat"],
  concept:   ["Catégorie", "Origine"],
};

type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

export function UniverseEntryEditorView({ entryId }: { entryId?: number }) {
  const router = useRouter();
  const isNew = !entryId;
  const { confirm, dialogNode } = useDialog();

  const [loading, setLoading] = useState(!isNew);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);
  const savingRef = useRef(false);
  const idRef = useRef<number | undefined>(entryId);

  // Champs
  const [type, setType] = useState<UniverseEntryType>("character");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [isHidden, setIsHidden] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);
  const [unlockType, setUnlockType] = useState("");
  const [unlockValue, setUnlockValue] = useState("");
  const [content, setContent] = useState<StoryDocument>(emptyDoc);
  const [initialContent, setInitialContent] = useState<StoryDocument | null>(isNew ? emptyDoc : null);

  // Meta key-value
  const [metaFields, setMetaFields] = useState<{ key: string; value: string }[]>([]);

  useEffect(() => {
    if (isNew) return;
    adminUniverseApi.show(entryId!).then((res) => {
      const e = res.data;
      setType(e.type);
      setName(e.name);
      setSlug(e.slug);
      setSummary(e.summary ?? "");
      setCoverImage(e.coverImage ?? "");
      setIsHidden(e.isHidden);
      setSortOrder(e.sortOrder);
      setUnlockType(e.unlockCondition?.type ?? "");
      setUnlockValue(e.unlockCondition?.value ?? "");
      if (e.content) {
        const doc = e.content as StoryDocument;
        setContent(doc);
        setInitialContent(doc);
      } else {
        setInitialContent(emptyDoc);
      }
      const meta = e.meta ?? {};
      setMetaFields(Object.entries(meta).map(([key, value]) => ({ key, value: String(value ?? "") })));
    }).catch(() => {
      setError("Entrée introuvable.");
    }).finally(() => setLoading(false));
  }, [entryId, isNew]);

  const buildPayload = useCallback(() => {
    const meta: Record<string, string> = {};
    metaFields.forEach(({ key, value }) => { if (key.trim()) meta[key.trim()] = value; });
    return {
      type,
      name: name.trim() || "Sans titre",
      slug: slug.trim() || undefined,
      summary: summary.trim() || null,
      cover_image: coverImage.trim() || null,
      is_hidden: isHidden,
      sort_order: sortOrder,
      content,
      meta: Object.keys(meta).length > 0 ? meta : null,
      unlock_condition: unlockType ? { type: unlockType, value: unlockValue } : null,
    };
  }, [type, name, slug, summary, coverImage, isHidden, sortOrder, content, metaFields, unlockType, unlockValue]);

  const save = useCallback(async () => {
    if (!name.trim()) return;
    if (savingRef.current) return;
    savingRef.current = true;
    setSaveState("saving");
    setError(null);
    try {
      const payload = buildPayload();
      if (idRef.current) {
        await adminUniverseApi.update(idRef.current, payload);
      } else {
        const res = await adminUniverseApi.create(payload);
        idRef.current = res.data.id;
        window.history.replaceState(null, "", `/admin/univers/${res.data.id}`);
      }
      setSaveState((s) => (s === "dirty" ? "dirty" : "saved"));
    } catch (err) {
      setSaveState("error");
      setError(err instanceof ApiError ? err.message : "Échec de l'enregistrement.");
    } finally {
      savingRef.current = false;
    }
  }, [buildPayload, name]);

  useEffect(() => {
    if (saveState !== "dirty") return;
    const t = setTimeout(save, 1500);
    return () => clearTimeout(t);
  }, [saveState, save]);

  const markDirty = () => setSaveState("dirty");

  async function handleDelete() {
    if (!idRef.current) return;
    if (!await confirm("Supprimer définitivement cette entrée ?", { title: "Supprimer l'entrée", danger: true, confirmLabel: "Supprimer" })) return;
    await adminUniverseApi.delete(idRef.current);
    router.push("/admin/univers");
  }

  const saveLabel = { idle: "", dirty: "Modifié", saving: "Enregistrement…", saved: "Enregistré", error: "Erreur" }[saveState];

  if (loading) return <p className="text-zinc-600">Chargement…</p>;

  return (
    <div>
      {dialogNode}
      {/* Barre top */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link href="/admin/univers" className="text-xs uppercase tracking-widest text-zinc-500 hover:text-red-400">
          ← Cartographie
        </Link>
        <div className="flex items-center gap-3 text-xs">
          <span className={saveState === "error" ? "text-red-400" : "text-zinc-500"}>{saveLabel}</span>
          {!isNew && (
            <button type="button" onClick={handleDelete}
              className="rounded border border-zinc-800 px-3 py-1.5 uppercase tracking-widest text-red-900 hover:border-red-800 hover:text-red-400">
              Supprimer
            </button>
          )}
          <button type="button" onClick={save}
            className="rounded border border-zinc-700 px-3 py-1.5 uppercase tracking-widest text-zinc-300 hover:border-zinc-500">
            Enregistrer
          </button>
          {!isNew && (
            <Link href={`/univers/${slug || idRef.current}`} target="_blank"
              className="rounded border border-zinc-700 px-3 py-1.5 uppercase tracking-widest text-zinc-300 hover:border-zinc-500">
              Voir
            </Link>
          )}
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded border border-red-900/60 bg-red-950/30 px-3 py-2 text-sm text-red-300">{error}</p>
      )}

      {/* Nom */}
      <input
        type="text"
        value={name}
        onChange={(e) => { setName(e.target.value); markDirty(); }}
        placeholder="Nom de l'entrée"
        className="mb-6 w-full bg-transparent text-2xl font-semibold tracking-tight text-zinc-100 outline-none placeholder:text-zinc-700"
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem]">
        {/* Contenu riche */}
        <div className="min-w-0">
          <p className="mb-2 text-xs uppercase tracking-widest text-zinc-600">Contenu</p>
          {initialContent !== null && (
            <StoryEditor
              initialContent={initialContent}
              onChange={(doc) => { setContent(doc); markDirty(); }}
            />
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-5 self-start rounded-md border border-zinc-900 bg-zinc-950/40 p-4 lg:sticky lg:top-6">
          <p className="text-xs uppercase tracking-widest text-zinc-600">Paramètres</p>

          <SField label="Type">
            <select value={type} onChange={(e) => { setType(e.target.value as UniverseEntryType); markDirty(); }} className={cls}>
              {TYPES_ORDER.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
            </select>
          </SField>

          <SField label="Résumé (max 1000)">
            <textarea value={summary} onChange={(e) => { setSummary(e.target.value); markDirty(); }}
              rows={3} maxLength={1000} className={`${cls} resize-none`} />
          </SField>

          <SField label="Image de couverture (URL)">
            <input type="text" value={coverImage} onChange={(e) => { setCoverImage(e.target.value); markDirty(); }}
              placeholder="https://…" className={cls} />
          </SField>

          <SField label="Slug (auto si vide)">
            <input type="text" value={slug} onChange={(e) => { setSlug(e.target.value); markDirty(); }}
              placeholder="ex: inspector-vance" className={cls} />
          </SField>

          <SField label="Ordre d'affichage">
            <input type="number" min={0} value={sortOrder}
              onChange={(e) => { setSortOrder(Number(e.target.value)); markDirty(); }} className={cls} />
          </SField>

          {/* Métadonnées */}
          <div>
            <p className="mb-2 text-xs uppercase tracking-widest text-zinc-500">Métadonnées</p>
            <div className="space-y-2">
              {metaFields.map((f, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={f.key}
                    onChange={(e) => { const n = [...metaFields]; n[i] = { ...n[i], key: e.target.value }; setMetaFields(n); markDirty(); }}
                    placeholder="Champ"
                    className="w-2/5 rounded border border-zinc-800 bg-zinc-950 px-2 py-1.5 text-xs text-zinc-300 outline-none focus:border-red-900/50"
                    list={`meta-preset-${type}`}
                  />
                  <input
                    type="text"
                    value={f.value}
                    onChange={(e) => { const n = [...metaFields]; n[i] = { ...n[i], value: e.target.value }; setMetaFields(n); markDirty(); }}
                    placeholder="Valeur"
                    className="flex-1 rounded border border-zinc-800 bg-zinc-950 px-2 py-1.5 text-xs text-zinc-300 outline-none focus:border-red-900/50"
                  />
                  <button type="button" onClick={() => { setMetaFields(metaFields.filter((_, j) => j !== i)); markDirty(); }}
                    className="text-zinc-700 hover:text-red-500">✕</button>
                </div>
              ))}
              <datalist id={`meta-preset-${type}`}>
                {META_PRESETS[type].map((p) => <option key={p} value={p} />)}
              </datalist>
              <button type="button"
                onClick={() => { setMetaFields([...metaFields, { key: "", value: "" }]); }}
                className="text-xs text-zinc-600 hover:text-zinc-400">
                + Ajouter un champ
              </button>
            </div>
          </div>

          {/* Déverrouillage */}
          <div className="rounded-md border border-zinc-800/60 p-3">
            <p className="mb-2 text-xs uppercase tracking-widest text-zinc-600">Condition de déverrouillage</p>
            <div className="space-y-2">
              <select value={unlockType} onChange={(e) => { setUnlockType(e.target.value); markDirty(); }} className={cls}>
                <option value="">Aucune</option>
                <option value="badge">Badge</option>
                <option value="story_read">Nouvelle lue</option>
              </select>
              {unlockType && (
                <input type="text" value={unlockValue}
                  onChange={(e) => { setUnlockValue(e.target.value); markDirty(); }}
                  placeholder="Slug (ex: detective-prive)"
                  className={cls} />
              )}
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" checked={isHidden} onChange={(e) => { setIsHidden(e.target.checked); markDirty(); }} className="rounded" />
            <span className="text-xs text-zinc-500">Caché (hors index public)</span>
          </label>
        </aside>
      </div>
    </div>
  );
}

const cls = "w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-red-900/70";

function SField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-widest text-zinc-500">{label}</span>
      {children}
    </label>
  );
}
