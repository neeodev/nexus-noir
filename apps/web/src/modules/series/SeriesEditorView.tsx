"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminSeriesApi, type Series, type SeriesStory } from "./api";
import { ApiError } from "@/lib/http";
import { apiGet } from "@/lib/http";
import { useDialog } from "@/hooks/useDialog";

type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

type AdminStoryListItem = { id: number; title: string; slug: string; coverImage: string | null };

export function SeriesEditorView({ seriesId }: { seriesId?: number }) {
  const router = useRouter();
  const isNew = !seriesId;
  const { confirm, dialogNode } = useDialog();

  const [loading, setLoading] = useState(!isNew);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);
  const savingRef = useRef(false);

  // Champs
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);

  // Stories de la série (ordonnées)
  const [stories, setStories] = useState<SeriesStory[]>([]);
  const [storySearch, setStorySearch] = useState("");
  const [storyResults, setStoryResults] = useState<AdminStoryListItem[]>([]);
  const [storySearching, setStorySearching] = useState(false);

  // Charger la série existante
  useEffect(() => {
    if (isNew) return;
    adminSeriesApi.get(seriesId!).then((s) => {
      setTitle(s.title);
      setSlug(s.slug);
      setSummary(s.summary ?? "");
      setCoverImage(s.coverImage ?? "");
      setIsCompleted(s.isCompleted);
      setSortOrder(s.sortOrder);
      setStories(s.stories ?? []);
      setLoading(false);
    }).catch(() => setError("Impossible de charger la série."));
  }, [isNew, seriesId]);

  // Recherche de nouvelles à ajouter
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (storySearch.trim().length < 2) { setStoryResults([]); return; }
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    setStorySearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await apiGet<{ data: AdminStoryListItem[] }>(
          `/admin/stories?search=${encodeURIComponent(storySearch.trim())}&per_page=10`
        );
        const existing = new Set(stories.map((s) => s.id));
        setStoryResults(res.data.filter((s) => !existing.has(s.id)));
      } catch {
        setStoryResults([]);
      } finally {
        setStorySearching(false);
      }
    }, 300);
  }, [storySearch, stories]);

  function addStory(item: AdminStoryListItem) {
    setStories((prev) => [
      ...prev,
      { id: item.id, title: item.title, slug: item.slug, coverImage: item.coverImage, position: prev.length + 1, publishedAt: null, readingTime: null, summaryShort: null },
    ]);
    setStorySearch("");
    setStoryResults([]);
  }

  function removeStory(id: number) {
    setStories((prev) => prev.filter((s) => s.id !== id).map((s, i) => ({ ...s, position: i + 1 })));
  }

  function moveStory(idx: number, dir: -1 | 1) {
    setStories((prev) => {
      const next = [...prev];
      const swap = idx + dir;
      if (swap < 0 || swap >= next.length) return prev;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next.map((s, i) => ({ ...s, position: i + 1 }));
    });
  }

  const save = useCallback(async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaveState("saving");
    setError(null);
    try {
      const input = {
        title: title.trim(),
        slug: slug.trim(),
        summary: summary.trim() || null,
        cover_image: coverImage.trim() || null,
        is_completed: isCompleted,
        sort_order: sortOrder,
        story_ids_ordered: stories.map((s) => s.id),
      };
      if (isNew) {
        const created = await adminSeriesApi.create(input);
        setSaveState("saved");
        router.replace(`/admin/series/${created.id}`);
      } else {
        await adminSeriesApi.update(seriesId!, input);
        setSaveState("saved");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Erreur lors de la sauvegarde.");
      }
      setSaveState("error");
    } finally {
      savingRef.current = false;
    }
  }, [title, slug, summary, coverImage, isCompleted, sortOrder, stories, isNew, seriesId, router]);

  async function handleDelete() {
    if (!seriesId) return;
    if (!await confirm("Supprimer cette série ? Les nouvelles liées ne seront pas supprimées.", { title: "Supprimer la série", danger: true, confirmLabel: "Supprimer" })) return;
    await adminSeriesApi.destroy(seriesId);
    router.push("/admin/series");
  }

  function slugify(s: string) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  if (loading) {
    return <div className="py-12 text-center text-sm text-zinc-600">Chargement…</div>;
  }

  const saveBtnLabel = saveState === "saving" ? "Sauvegarde…" : saveState === "saved" ? "Sauvegardé ✓" : "Sauvegarder";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {dialogNode}
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <Link href="/admin/series" className="text-xs text-zinc-600 hover:text-zinc-400">
            ← Séries
          </Link>
          <h1 className="mt-1 font-heading text-xl font-bold text-zinc-100">
            {isNew ? "Nouvelle série" : title || "Série sans titre"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <button
              type="button"
              onClick={handleDelete}
              className="rounded border border-red-900/50 px-3 py-1.5 text-xs text-red-500 hover:bg-red-950/40"
            >
              Supprimer
            </button>
          )}
          <button
            type="button"
            onClick={save}
            disabled={saveState === "saving"}
            className="rounded bg-red-950 px-4 py-1.5 text-xs uppercase tracking-widest text-red-300 hover:bg-red-900 disabled:opacity-50"
          >
            {saveBtnLabel}
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded border border-red-900/40 bg-red-950/20 px-3 py-2 text-xs text-red-400">
          {error}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Colonne principale */}
        <div className="space-y-5">
          {/* Titre */}
          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-zinc-600">Titre</label>
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (isNew) setSlug(slugify(e.target.value));
              }}
              className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-red-900/60"
              placeholder="Titre de la série"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-zinc-600">Slug</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-xs text-zinc-400 outline-none focus:border-red-900/60"
              placeholder="slug-de-la-serie"
            />
          </div>

          {/* Résumé */}
          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-zinc-600">Résumé</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              className="w-full resize-y rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-red-900/60"
              placeholder="Présentation de l'arc narratif…"
            />
          </div>

          {/* Cover image */}
          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-zinc-600">Image de couverture (URL)</label>
            <input
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-xs text-zinc-400 outline-none focus:border-red-900/60"
              placeholder="https://…"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Options */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
            <p className="text-xs uppercase tracking-widest text-zinc-600">Options</p>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isCompleted} onChange={(e) => setIsCompleted(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-800 text-red-700" />
              <span className="text-sm text-zinc-400">Série terminée</span>
            </label>

            <div>
              <label className="mb-1 block text-xs text-zinc-600">Ordre d&apos;affichage</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-20 rounded border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-300 outline-none"
              />
            </div>
          </div>

          {/* Lien public */}
          {!isNew && (
            <Link
              href={`/series/${slug}`}
              target="_blank"
              className="block rounded border border-zinc-800 px-3 py-2 text-center text-xs text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
            >
              Voir la page publique ↗
            </Link>
          )}
        </div>
      </div>

      {/* Épisodes */}
      <div className="mt-8">
        <h2 className="mb-4 text-sm uppercase tracking-widest text-zinc-500">Épisodes ({stories.length})</h2>

        {stories.length > 0 && (
          <ol className="mb-4 space-y-2">
            {stories.map((s, idx) => (
              <li key={s.id} className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2">
                <span className="shrink-0 font-mono text-xs text-zinc-600">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                {s.coverImage && (
                  <img src={s.coverImage} alt={s.title} className="h-8 w-8 shrink-0 rounded object-cover" />
                )}
                <span className="flex-1 text-sm text-zinc-200 line-clamp-1">{s.title}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveStory(idx, -1)}
                    disabled={idx === 0}
                    className="rounded p-1 text-zinc-600 hover:text-zinc-400 disabled:opacity-20"
                    title="Remonter"
                  >↑</button>
                  <button
                    type="button"
                    onClick={() => moveStory(idx, 1)}
                    disabled={idx === stories.length - 1}
                    className="rounded p-1 text-zinc-600 hover:text-zinc-400 disabled:opacity-20"
                    title="Descendre"
                  >↓</button>
                  <button
                    type="button"
                    onClick={() => removeStory(s.id)}
                    className="rounded p-1 text-red-800 hover:text-red-500"
                    title="Retirer"
                  >✕</button>
                </div>
              </li>
            ))}
          </ol>
        )}

        {/* Recherche / ajout */}
        <div className="relative">
          <input
            value={storySearch}
            onChange={(e) => setStorySearch(e.target.value)}
            placeholder="Ajouter une nouvelle… (tapez le titre)"
            className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 outline-none focus:border-red-900/60 placeholder:text-zinc-700"
          />
          {storySearching && (
            <span className="absolute right-3 top-2 text-xs text-zinc-600">…</span>
          )}
          {storyResults.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full rounded-md border border-zinc-800 bg-zinc-950 shadow-xl">
              {storyResults.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => addStory(r)}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-900"
                  >
                    {r.coverImage && (
                      <img src={r.coverImage} alt={r.title} className="h-7 w-7 shrink-0 rounded object-cover" />
                    )}
                    {r.title}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
