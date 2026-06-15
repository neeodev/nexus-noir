"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/http";
import type { StoryListItem } from "@/lib/api";
import type { UniverseEntry } from "@/modules/universe/api";

type Results = {
  query: string;
  stories: StoryListItem[];
  universe: UniverseEntry[];
};

function debounce<T extends (arg: string) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((arg: string) => { clearTimeout(timer); timer = setTimeout(() => fn(arg), ms); }) as T;
}

export function SearchBar() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const search = useCallback(
    debounce(async (query: string) => {
      if (query.trim().length < 2) { setResults(null); setLoading(false); return; }
      try {
        const data = await apiGet<Results>(`/search?q=${encodeURIComponent(query.trim())}`);
        setResults(data);
      } catch {
        setResults(null);
      } finally {
        setLoading(false);
      }
    }, 300),
    [],
  );

  useEffect(() => {
    if (q.trim().length >= 2) { setLoading(true); search(q); }
    else { setResults(null); setLoading(false); }
  }, [q, search]);

  // Fermer au clic extérieur
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Raccourci clavier /
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "/" && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") { setOpen(false); setQ(""); }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function handleOpen() {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function handleClose() { setOpen(false); setQ(""); setResults(null); }

  const hasResults = results && (results.stories.length > 0 || results.universe.length > 0);
  const noResults = results && !hasResults && results.query.length >= 2;

  return (
    <div ref={containerRef} className="relative">
      {/* Bouton compact */}
      <button
        type="button"
        onClick={handleOpen}
        title="Rechercher (/) "
        className="flex items-center gap-1.5 rounded-md border border-zinc-800 px-2.5 py-1 text-xs text-zinc-500 hover:border-zinc-700 hover:text-zinc-300 transition-colors"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
          <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
        </svg>
        <span className="hidden sm:inline">/</span>
      </button>

      {/* Panneau de recherche */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(90vw,480px)] rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl">
          <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-zinc-600">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Chercher une nouvelle, un personnage…"
              className="flex-1 bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
              autoComplete="off"
            />
            {q && (
              <button type="button" onClick={() => setQ("")} className="text-zinc-600 hover:text-zinc-400">✕</button>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {loading && <p className="px-3 py-4 text-center text-xs text-zinc-600">Recherche…</p>}

            {noResults && (
              <p className="px-3 py-4 text-center text-xs text-zinc-600">
                Aucun résultat pour « {results.query} »
              </p>
            )}

            {!loading && hasResults && (
              <>
                {results.stories.length > 0 && (
                  <div className="mb-2">
                    <p className="px-3 py-1.5 text-[10px] uppercase tracking-widest text-zinc-600">Nouvelles</p>
                    {results.stories.map((s) => (
                      <Link key={s.slug} href={`/nouvelles/${s.slug}`} onClick={handleClose}
                        className="flex items-start gap-3 rounded-md px-3 py-2 hover:bg-zinc-900 transition-colors">
                        {s.coverImage && (
                          <img src={s.coverImage} alt={s.title} className="mt-0.5 h-8 w-8 shrink-0 rounded object-cover" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-zinc-200 line-clamp-1">{s.title}</p>
                          {s.summaryShort && (
                            <p className="text-xs text-zinc-500 line-clamp-1">{s.summaryShort}</p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {results.universe.length > 0 && (
                  <div>
                    <p className="px-3 py-1.5 text-[10px] uppercase tracking-widest text-zinc-600">Univers</p>
                    {results.universe.map((e) => (
                      <Link key={e.slug} href={`/univers/${e.slug}`} onClick={handleClose}
                        className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-zinc-900 transition-colors">
                        {e.coverImage && (
                          <img src={e.coverImage} alt={e.name} className="h-7 w-7 shrink-0 rounded-full object-cover" />
                        )}
                        <div>
                          <p className="text-sm text-zinc-200">{e.name}</p>
                          <p className="text-xs text-zinc-600">{e.typeLabel}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}

            {!q && (
              <p className="px-3 py-4 text-center text-xs text-zinc-700">
                Tapez pour rechercher · <kbd className="rounded border border-zinc-800 px-1">Esc</kbd> pour fermer
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
