"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { StoryDocument } from "@/lib/api";
import { ApiError } from "@/lib/http";
import { StoryContent } from "../render";
import { emptyDoc } from "../extensions";
import { adminStoriesApi, type AdminStory, type StoryInput } from "../api";
import { StoryEditor } from "./StoryEditor";

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
  const router = useRouter();

  const [loading, setLoading] = useState(Boolean(storyId));
  const [id, setId] = useState<number | undefined>(storyId);
  const [story, setStory] = useState<AdminStory | null>(null);

  // Champs de la nouvelle
  const [title, setTitle] = useState("");
  const [summaryShort, setSummaryShort] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [status, setStatus] = useState("draft");
  const [tags, setTags] = useState("");
  const [warnings, setWarnings] = useState("");
  const [content, setContent] = useState<StoryDocument>(emptyDoc);
  // Contenu initial figé pour l'éditeur (monté une seule fois).
  const [initialContent, setInitialContent] = useState<StoryDocument | null>(null);

  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);
  const idRef = useRef<number | undefined>(storyId);
  const savingRef = useRef(false); // évite les sauvegardes concurrentes (doubles créations)

  // Charge la nouvelle existante.
  useEffect(() => {
    if (!storyId) {
      setInitialContent(emptyDoc);
      return;
    }
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
        setContent(s.content);
        setInitialContent(s.content);
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
      visibility,
      content,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      contentWarnings: warnings.split(",").map((t) => t.trim()).filter(Boolean),
    }),
    [title, summaryShort, visibility, content, tags, warnings],
  );

  const save = useCallback(async () => {
    if (!title.trim()) return; // on ne crée pas de nouvelle sans titre
    if (savingRef.current) return; // une sauvegarde est déjà en vol
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
        // Passe l'URL en mode édition sans recharger.
        window.history.replaceState(null, "", `/admin/nouvelles/${created.id}`);
      }
      // Conserve "dirty" si une modification est survenue pendant la sauvegarde.
      setSaveState((s) => (s === "dirty" ? "dirty" : "saved"));
    } catch (err) {
      setSaveState("error");
      setError(err instanceof ApiError ? err.message : "Échec de l'enregistrement.");
    } finally {
      savingRef.current = false;
    }
  }, [buildInput, title]);

  // Autosave : 1,5 s après la dernière modification.
  useEffect(() => {
    if (saveState !== "dirty") return;
    const timer = setTimeout(save, 1500);
    return () => clearTimeout(timer);
  }, [saveState, save]);

  // Marque "modifié" quand un champ change (après chargement initial).
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
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link href="/admin/nouvelles" className="text-xs uppercase tracking-widest text-zinc-500 hover:text-red-400">
          ← Nouvelles
        </Link>
        <div className="flex items-center gap-3 text-xs">
          <span className={saveState === "error" ? "text-red-400" : "text-zinc-500"}>{saveLabel}</span>
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

      {error && <p className="mb-4 rounded border border-red-900/60 bg-red-950/30 px-3 py-2 text-sm text-red-300">{error}</p>}

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

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Colonne gauche : éditeur + paramètres */}
        <div className="space-y-6">
          {initialContent !== null && (
            <StoryEditor
              initialContent={initialContent}
              onChange={(doc) => {
                setContent(doc);
                markDirty();
              }}
            />
          )}

          <div className="space-y-4 rounded-md border border-zinc-900 bg-zinc-950/40 p-4">
            <p className="text-xs uppercase tracking-widest text-zinc-600">Paramètres</p>

            <Field label="Résumé court">
              <textarea
                value={summaryShort}
                onChange={(e) => {
                  setSummaryShort(e.target.value);
                  markDirty();
                }}
                rows={2}
                className={inputClass}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
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
                    <option key={o.value} value={o.value}>{o.label}</option>
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
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Tags (séparés par des virgules)">
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

            <Field label="Avertissements de contenu (virgules)">
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
                {story.wordCount} mots · {story.readingTime} min · v{story.version}
                {story.slug && <> · /{story.slug}</>}
              </p>
            )}
          </div>
        </div>

        {/* Colonne droite : aperçu live */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <p className="mb-3 text-xs uppercase tracking-widest text-zinc-600">Aperçu</p>
          <div className="rounded-md border border-zinc-900 bg-zinc-950/40 p-5">
            <h1 className="mb-6 text-2xl font-semibold tracking-tight text-zinc-100">
              {title || "Titre de la nouvelle"}
            </h1>
            <StoryContent doc={content} />
          </div>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-red-900/70";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-widest text-zinc-500">{label}</span>
      {children}
    </label>
  );
}
