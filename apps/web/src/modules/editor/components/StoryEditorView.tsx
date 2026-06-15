"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { StoryDocument } from "@/lib/api";
import { ApiError } from "@/lib/http";
import { emptyDoc } from "../extensions";
import {
  adminStoriesApi,
  type AdminStory,
  type StoryInput,
  type StoryVersion,
  type StoryUniverseEntry,
} from "../api";
import { adminUniverseApi, TYPE_LABELS_PLURAL, type UniverseEntryType } from "@/modules/universe/api";
import { mediaApi } from "../media";
import { StoryEditor } from "./StoryEditor";
import { useDialog } from "@/hooks/useDialog";

const STATUS_OPTIONS = [
  { value: "draft", label: "Brouillon" },
  { value: "in_review", label: "En correction" },
  { value: "ready_to_publish", label: "Prêt à publier" },
  { value: "published", label: "Publié" },
  { value: "archived", label: "Archivé" },
  { value: "private", label: "Privé" },
];

const VISIBILITY_OPTIONS = [
  { value: "public", label: "Public" },
  { value: "authenticated", label: "Connectés uniquement" },
  { value: "private", label: "Privé" },
  { value: "early_access", label: "Accès anticipé" },
  { value: "hidden", label: "Masqué" },
];

type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

export function StoryEditorView({ storyId }: { storyId?: number }) {
  const [loading, setLoading] = useState(Boolean(storyId));
  const [id, setId] = useState<number | undefined>(storyId);
  const [story, setStory] = useState<AdminStory | null>(null);

  const [title, setTitle] = useState("");
  const [summaryShort, setSummaryShort] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [status, setStatus] = useState("draft");
  const [tags, setTags] = useState("");
  const [warnings, setWarnings] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [content, setContent] = useState<StoryDocument>(emptyDoc);
  const [initialContent, setInitialContent] = useState<StoryDocument | null>(
    storyId ? null : emptyDoc,
  );

  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);
  const idRef = useRef<number | undefined>(storyId);
  const savingRef = useRef(false);

  const [editorKey, setEditorKey] = useState(0);
  const [showVersions, setShowVersions] = useState(false);
  const [versions, setVersions] = useState<StoryVersion[] | null>(null);

  // Univers lié
  const [universeEntryIds, setUniverseEntryIds] = useState<number[]>([]);

  const { confirm, dialogNode } = useDialog();

  useEffect(() => {
    if (!storyId) return;
    let active = true;
    adminStoriesApi
      .get(storyId)
      .then((s) => {
        if (!active) return;
        setStory(s);
        setTitle(s.title);
        setSummaryShort(s.summaryShort ?? "");
        setVisibility(s.visibility);
        setStatus(s.status);
        setTags(s.tags.join(", "));
        setWarnings(s.contentWarnings.join(", "));
        setCoverImage(s.coverImage);
        setContent(s.content);
        setInitialContent(s.content);
        setUniverseEntryIds((s.universeEntries ?? []).map((e) => e.id));
        setLoading(false);
      })
      .catch(() => {
        if (active) {
          setError("Nouvelle introuvable.");
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [storyId]);

  const buildInput = useCallback(
    (): StoryInput => ({
      title: title.trim() || "Sans titre",
      summaryShort: summaryShort.trim() || null,
      coverImage,
      visibility,
      content,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      contentWarnings: warnings
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      universe_entry_ids: universeEntryIds,
    }),
    [title, summaryShort, coverImage, visibility, content, tags, warnings, universeEntryIds],
  );

  const save = useCallback(async () => {
    if (!title.trim()) return;
    if (savingRef.current) return;
    savingRef.current = true;
    setSaveState("saving");
    setError(null);
    try {
      const input = buildInput();
      if (idRef.current) {
        const updated = await adminStoriesApi.update(idRef.current, input);
        setStory(updated);
        setStatus(updated.status);
      } else {
        const created = await adminStoriesApi.create(input);
        idRef.current = created.id;
        setId(created.id);
        setStory(created);
        setStatus(created.status);
        window.history.replaceState(null, "", `/admin/nouvelles/${created.id}`);
      }
      setSaveState((s) => (s === "dirty" ? "dirty" : "saved"));
    } catch (err) {
      setSaveState("error");
      setError(
        err instanceof ApiError ? err.message : "Échec de l'enregistrement.",
      );
    } finally {
      savingRef.current = false;
    }
  }, [buildInput, title]);

  useEffect(() => {
    if (saveState !== "dirty") return;
    const timer = setTimeout(save, 1500);
    return () => clearTimeout(timer);
  }, [saveState, save]);

  const markDirty = () => setSaveState("dirty");

  async function handlePublish() {
    if (!idRef.current) await save();
    if (!idRef.current) return;
    const updated = await adminStoriesApi.publish(idRef.current);
    setStory(updated);
    setStatus(updated.status);
    setSaveState("saved");
  }

  async function handleUnpublish() {
    if (!idRef.current) return;
    const updated = await adminStoriesApi.unpublish(idRef.current);
    setStory(updated);
    setStatus(updated.status);
    setSaveState("saved");
  }

  async function toggleVersions() {
    const next = !showVersions;
    setShowVersions(next);
    if (next && idRef.current) {
      setVersions(null);
      setVersions(
        await adminStoriesApi.versions(idRef.current).catch(() => []),
      );
    }
  }

  async function handleRestore(versionId: number) {
    if (!idRef.current) return;
    const ok = await confirm(
      "Restaurer cette version ? La version actuelle est conservée dans l'historique.",
    );
    if (!ok) return;
    const restored = await adminStoriesApi.restoreVersion(
      idRef.current,
      versionId,
    );
    setStory(restored);
    setTitle(restored.title);
    setContent(restored.content);
    setInitialContent(restored.content);
    setEditorKey((k) => k + 1);
    setStatus(restored.status);
    setShowVersions(false);
    setSaveState("saved");
  }

  if (loading) return <p className="text-zinc-600">Chargement…</p>;

  const isPublished = status === "published";
  const saveLabel = {
    idle: "",
    dirty: "Modifié",
    saving: "Enregistrement…",
    saved: "Enregistré",
    error: "Erreur",
  }[saveState];

  return (
    <>
      {dialogNode}

      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link
            href="/admin/nouvelles"
            className="text-xs uppercase tracking-widest text-zinc-500 hover:text-red-400"
          >
            ← Nouvelles
          </Link>
          <div className="flex items-center gap-3 text-xs">
            <span
              className={
                saveState === "error" ? "text-red-400" : "text-zinc-500"
              }
            >
              {saveLabel}
            </span>
            {id && (
              <button
                type="button"
                onClick={toggleVersions}
                className="rounded border border-zinc-700 px-3 py-1.5 uppercase tracking-widest text-zinc-300 hover:border-zinc-500"
              >
                Versions
              </button>
            )}
            <button
              type="button"
              onClick={save}
              className="rounded border border-zinc-700 px-3 py-1.5 uppercase tracking-widest text-zinc-300 hover:border-zinc-500"
            >
              Enregistrer
            </button>
            {isPublished ? (
              <button
                type="button"
                onClick={handleUnpublish}
                className="rounded border border-amber-800 px-3 py-1.5 uppercase tracking-widest text-amber-300 hover:bg-amber-950/40"
              >
                Dépublier
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePublish}
                className="rounded bg-red-900 px-3 py-1.5 uppercase tracking-widest text-zinc-100 hover:bg-red-800"
              >
                Publier
              </button>
            )}
            {isPublished && story && (
              <Link
                href={`/nouvelles/${story.slug}`}
                target="_blank"
                className="rounded border border-zinc-700 px-3 py-1.5 uppercase tracking-widest text-zinc-300 hover:border-zinc-500"
              >
                Voir
              </Link>
            )}
          </div>
        </div>

        {error && (
          <p className="mb-4 rounded border border-red-900/60 bg-red-950/30 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        {showVersions && (
          <div className="mb-6 rounded-md border border-zinc-800 bg-zinc-950/60 p-4">
            <p className="mb-3 text-xs uppercase tracking-widest text-zinc-600">
              Historique des versions
            </p>
            {versions === null ? (
              <p className="text-sm text-zinc-700">…</p>
            ) : versions.length === 0 ? (
              <p className="text-sm text-zinc-600">
                Aucune version enregistrée.
              </p>
            ) : (
              <ul className="divide-y divide-zinc-900">
                {versions.map((v) => (
                  <li
                    key={v.id}
                    className="flex items-center justify-between gap-3 py-2 text-sm"
                  >
                    <span className="text-zinc-400">
                      {formatVersionDate(v.createdAt)}
                      <span className="ml-2 text-zinc-600">
                        v{v.version} · {v.wordCount} mots
                        {v.author ? ` · ${v.author}` : ""}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRestore(v.id)}
                      className="shrink-0 rounded border border-zinc-700 px-2.5 py-1 text-xs uppercase tracking-widest text-zinc-300 hover:border-red-700 hover:text-red-300"
                    >
                      Restaurer
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            markDirty();
          }}
          placeholder="Titre de la nouvelle"
          className="mb-6 w-full bg-transparent text-2xl font-semibold tracking-tight text-zinc-100 outline-none placeholder:text-zinc-700"
        />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem]">
          <div className="min-w-0">
            {initialContent !== null && (
              <StoryEditor
                key={editorKey}
                initialContent={initialContent}
                onChange={(doc) => {
                  setContent(doc);
                  markDirty();
                }}
              />
            )}
          </div>

          <aside className="space-y-4 self-start rounded-md border border-zinc-900 bg-zinc-950/40 p-4 lg:sticky lg:top-6">
            <p className="text-xs uppercase tracking-widest text-zinc-600">
              Paramètres
            </p>

            <CoverField
              coverImage={coverImage}
              onChange={(url) => {
                setCoverImage(url);
                markDirty();
              }}
            />

            <Field label="Résumé court">
              <textarea
                value={summaryShort}
                onChange={(e) => {
                  setSummaryShort(e.target.value);
                  markDirty();
                }}
                rows={3}
                className={inputClass}
              />
            </Field>

            <Field label="Statut">
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  markDirty();
                }}
                className={inputClass}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Visibilité">
              <select
                value={visibility}
                onChange={(e) => {
                  setVisibility(e.target.value);
                  markDirty();
                }}
                className={inputClass}
              >
                {VISIBILITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Tags (virgules)">
              <input
                type="text"
                value={tags}
                onChange={(e) => {
                  setTags(e.target.value);
                  markDirty();
                }}
                className={inputClass}
              />
            </Field>

            <Field label="Avertissements (virgules)">
              <input
                type="text"
                value={warnings}
                onChange={(e) => {
                  setWarnings(e.target.value);
                  markDirty();
                }}
                className={inputClass}
              />
            </Field>

            {story && (
              <p className="text-xs text-zinc-600">
                {story.wordCount} mots · {story.readingTime} min · v
                {story.version}
                {story.slug && <> · /{story.slug}</>}
              </p>
            )}

            <UniversePanel
              selectedIds={universeEntryIds}
              onChange={(ids) => { setUniverseEntryIds(ids); markDirty(); }}
            />
          </aside>
        </div>
      </div>
    </>
  );
}

function formatVersionDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

const inputClass =
  "w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-red-900/70";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-widest text-zinc-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function CoverField({
  coverImage,
  onChange,
}: {
  coverImage: string | null;
  onChange: (url: string | null) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const media = await mediaApi.upload(file);
      onChange(media.url);
    } catch {
      setUploadError("Échec de l'upload de la couverture.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <span className="mb-1.5 block text-xs uppercase tracking-widest text-zinc-500">
        Image de couverture
      </span>
      {coverImage ? (
        <div className="space-y-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverImage}
            alt=""
            className="w-full rounded-md border border-zinc-800"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs uppercase tracking-widest text-zinc-500 hover:text-red-400"
          >
            Retirer
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={uploading}
          className="rounded-md border border-zinc-800 px-3 py-2 text-sm text-zinc-300 hover:border-zinc-600 disabled:opacity-50"
        >
          {uploading ? "Upload…" : "Téléverser une couverture"}
        </button>
      )}
      {uploadError && (
        <p className="mt-1 text-xs text-red-400">{uploadError}</p>
      )}
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Panneau Univers
// ────────────────────────────────────────────────────────────

const UNIVERSE_TYPES: UniverseEntryType[] = ["character", "place", "faction", "event", "concept"];

function UniversePanel({
  selectedIds,
  onChange,
}: {
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}) {
  const [entries, setEntries] = useState<{ id: number; type: string; typeLabel: string; name: string; slug: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  async function load() {
    if (loaded) return;
    setLoading(true);
    try {
      const res = await adminUniverseApi.list();
      setEntries(res.data.map((e) => ({ id: e.id, type: e.type, typeLabel: e.typeLabel, name: e.name, slug: e.slug })));
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  }

  function toggle() {
    if (!open) load();
    setOpen((v) => !v);
  }

  function toggleEntry(id: number) {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id],
    );
  }

  const selectedCount = selectedIds.length;

  return (
    <div>
      <button
        type="button"
        onClick={toggle}
        className="flex w-full items-center justify-between text-xs uppercase tracking-widest text-zinc-500 hover:text-zinc-300"
      >
        <span>Univers lié</span>
        <span className="text-zinc-600">{selectedCount > 0 ? `${selectedCount} lié${selectedCount > 1 ? "s" : ""}` : open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="mt-3">
          {loading && <p className="text-xs text-zinc-600">Chargement…</p>}
          {!loading && entries.length === 0 && (
            <p className="text-xs text-zinc-600">
              Aucune entrée dans l'univers.
            </p>
          )}
          {!loading && UNIVERSE_TYPES.map((type) => {
            const group = entries.filter((e) => e.type === type);
            if (!group.length) return null;
            return (
              <div key={type} className="mb-3">
                <p className="mb-1.5 text-[10px] uppercase tracking-wider text-zinc-600">
                  {TYPE_LABELS_PLURAL[type]}
                </p>
                <div className="space-y-1">
                  {group.map((e) => {
                    const checked = selectedIds.includes(e.id);
                    return (
                      <label key={e.id} className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleEntry(e.id)}
                          className="rounded border-zinc-700 bg-zinc-900"
                        />
                        <span className={`text-xs ${checked ? "text-zinc-200" : "text-zinc-500"}`}>
                          {e.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
