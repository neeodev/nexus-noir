import Link from "next/link";
import { seriesApi, type Series } from "@/modules/series/api";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Séries | Nexus Noir",
  description: "Les arcs narratifs de l'univers Nexus Noir.",
};

export default async function SeriesIndexPage() {
  let series: Series[] = [];
  try {
    series = await seriesApi.list();
  } catch {
    series = [];
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <header className="mb-10 border-l-2 border-nn-red-dark pl-6">
        <p className="mb-1.5 text-[10px] uppercase tracking-[0.2em] text-nn-red-dark">— Arcs narratifs · Dossiers ouverts —</p>
        <h1 className="font-heading text-4xl font-bold text-nn-text">Séries</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-nn-muted">
          Les arcs narratifs de l&apos;univers Nexus Noir.
        </p>
      </header>

      {series.length === 0 ? (
        <p className="font-mono text-sm text-nn-border">— Aucune série disponible pour l&apos;instant.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {series.map((s) => (
            <Link
              key={s.slug}
              href={`/series/${s.slug}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 transition-colors hover:border-zinc-700"
            >
              {s.coverImage ? (
                <img
                  src={s.coverImage}
                  alt={s.title}
                  className="aspect-[16/7] w-full object-cover"
                />
              ) : (
                <div className="aspect-[16/7] w-full bg-zinc-800/60" />
              )}
              <div className="flex flex-1 flex-col p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest text-zinc-600">
                    {s.storiesCount ?? 0} épisode{(s.storiesCount ?? 0) !== 1 ? "s" : ""}
                  </span>
                  {s.isCompleted && (
                    <span className="rounded-sm bg-emerald-950/60 px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-emerald-500">
                      Terminée
                    </span>
                  )}
                </div>
                <h2 className="font-heading text-lg font-semibold text-zinc-100 group-hover:text-white">
                  {s.title}
                </h2>
                {s.summary && (
                  <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{s.summary}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
