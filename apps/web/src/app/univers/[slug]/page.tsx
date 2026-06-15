import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { universeApi, TYPE_LABELS_PLURAL } from "@/modules/universe/api";
import { StoryContent } from "@/modules/editor/render";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await universeApi.show(slug);
    const entry = res.data;
    return {
      title: entry.name,
      description: entry.summary ?? undefined,
      openGraph: {
        title: `${entry.name} — Nexus Noir`,
        description: entry.summary ?? undefined,
        images: entry.coverImage ? [{ url: entry.coverImage, alt: entry.name }] : undefined,
      },
    };
  } catch {
    return { title: "Archive introuvable" };
  }
}

export default async function UniverseEntryPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;

  let entry: Awaited<ReturnType<typeof universeApi.show>>["data"];
  try {
    const res = await universeApi.show(slug);
    entry = res.data;
  } catch {
    notFound();
  }

  const typeHref = `/univers?type=${entry!.type}`;

  return (
    <div className="mx-auto max-w-3xl">
      {/* Fil d'Ariane */}
      <div className="mb-8 flex items-center gap-2 text-xs text-zinc-600">
        <Link href="/univers" className="hover:text-zinc-400">Cartographie</Link>
        <span>/</span>
        <Link href={typeHref} className="hover:text-zinc-400">
          {TYPE_LABELS_PLURAL[entry.type as keyof typeof TYPE_LABELS_PLURAL]}
        </Link>
        <span>/</span>
        <span className="text-zinc-400">{entry.name}</span>
      </div>

      {/* Couverture */}
      {entry.coverImage && (
        <div className="mb-8 h-56 w-full overflow-hidden rounded-lg bg-zinc-900 sm:h-72">
          <img src={entry.coverImage} alt={entry.name}
            className="h-full w-full object-cover opacity-80" />
        </div>
      )}

      {/* En-tête */}
      <header className="mb-8">
        <p className="mb-1 text-xs uppercase tracking-widest text-zinc-600">{entry.typeLabel}</p>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">{entry.name}</h1>
        {entry.summary && (
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">{entry.summary}</p>
        )}
      </header>

      {/* Métadonnées selon le type */}
      {entry.meta && Object.keys(entry.meta).length > 0 && (
        <div className="mb-8 grid grid-cols-2 gap-3 rounded-lg border border-zinc-900 bg-zinc-950/30 p-4 sm:grid-cols-3">
          {Object.entries(entry.meta).map(([k, v]) => (
            v ? (
              <div key={k}>
                <p className="text-[10px] uppercase tracking-wider text-zinc-600">{k}</p>
                <p className="text-sm text-zinc-300">{String(v)}</p>
              </div>
            ) : null
          ))}
        </div>
      )}

      {/* Contenu riche */}
      {!!entry.content && (
        <div className="prose-nexus mb-10">
          <StoryContent doc={entry.content as { type: string; content?: unknown[] }} />
        </div>
      )}

      {/* Nouvelles liées */}
      {entry.stories && entry.stories.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-xs uppercase tracking-widest text-zinc-600">Apparaît dans</h2>
          <div className="flex flex-wrap gap-2">
            {entry.stories.map((s) => (
              <Link key={s.slug} href={`/nouvelles/${s.slug}`}
                className="rounded-md border border-zinc-800 px-3 py-1.5 text-sm text-zinc-400 hover:border-red-900/50 hover:text-zinc-200 transition-colors">
                {s.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Entrées liées */}
      {entry.related && entry.related.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-xs uppercase tracking-widest text-zinc-600">Voir aussi</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {entry.related.map((r) => (
              <Link key={r.slug} href={`/univers/${r.slug}`}
                className="flex items-center gap-3 rounded-lg border border-zinc-900 p-3 hover:border-zinc-800 transition-colors">
                {r.coverImage && (
                  <img src={r.coverImage} alt={r.name} className="h-10 w-10 rounded object-cover" />
                )}
                <div>
                  <p className="text-sm font-medium text-zinc-200">{r.name}</p>
                  <p className="text-xs text-zinc-600">{r.typeLabel}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
