import Link from "next/link";
import { notFound } from "next/navigation";
import { seriesApi, type Series } from "@/modules/series/api";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const s = await seriesApi.get(slug);
    return {
      title: `${s.title} | Nexus Noir`,
      description: s.summary ?? undefined,
      openGraph: s.coverImage ? { images: [s.coverImage] } : undefined,
    };
  } catch {
    return { title: "Série | Nexus Noir" };
  }
}

export default async function SeriesDetailPage({ params }: Props) {
  const { slug } = await params;
  let series: Series;
  try {
    series = await seriesApi.get(slug);
  } catch {
    notFound();
  }

  const stories = series.stories ?? [];

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      {/* En-tête */}
      <Link href="/series" className="mb-6 inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-400">
        ← Toutes les séries
      </Link>

      {series.coverImage && (
        <img
          src={series.coverImage}
          alt={series.title}
          className="mb-8 aspect-[21/6] w-full rounded-xl object-cover"
        />
      )}

      <div className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.2em] text-red-900/80">Série</span>
          {series.isCompleted && (
            <span className="rounded-sm bg-emerald-950/60 px-2 py-0.5 text-[10px] uppercase tracking-widest text-emerald-500">
              Terminée
            </span>
          )}
        </div>
        <h1 className="font-heading text-3xl font-bold text-zinc-100">{series.title}</h1>
        {series.summary && (
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">{series.summary}</p>
        )}
        <p className="mt-2 text-xs text-zinc-600">
          {stories.length} épisode{stories.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Liste des épisodes */}
      {stories.length === 0 ? (
        <p className="text-sm text-zinc-600">Aucun épisode publié.</p>
      ) : (
        <ol className="space-y-3">
          {stories.map((story, idx) => (
            <li key={story.slug}>
              <Link
                href={`/nouvelles/${story.slug}`}
                className="group flex items-start gap-4 rounded-lg border border-zinc-800 bg-zinc-900/30 p-4 transition-colors hover:border-zinc-700 hover:bg-zinc-900/60"
              >
                <span className="mt-0.5 shrink-0 font-mono text-xs text-zinc-600">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                {story.coverImage && (
                  <img
                    src={story.coverImage}
                    alt={story.title}
                    className="h-12 w-12 shrink-0 rounded object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-zinc-100 group-hover:text-white line-clamp-1">
                    {story.title}
                  </p>
                  {story.summaryShort && (
                    <p className="mt-0.5 text-xs text-zinc-500 line-clamp-2">{story.summaryShort}</p>
                  )}
                  <div className="mt-1 flex items-center gap-3">
                    {story.readingTime && (
                      <span className="text-[10px] text-zinc-600">{story.readingTime} min</span>
                    )}
                    {!story.publishedAt && (
                      <span className="text-[10px] uppercase tracking-widest text-zinc-700">À venir</span>
                    )}
                  </div>
                </div>
                <span className="ml-2 shrink-0 text-zinc-700 group-hover:text-zinc-500">→</span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
