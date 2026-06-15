import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchStory, type StoryUniverseEntry, type SeriesContext } from "@/lib/api";
import { StoryContent } from "@/modules/editor/render";
import { ReactionBar } from "@/modules/reactions/components/ReactionBar";
import { CommentSection } from "@/modules/comments/components/CommentSection";
import { StoryViewTracker } from "@/components/StoryViewTracker";
import { TYPE_LABELS_PLURAL, type UniverseEntryType } from "@/modules/universe/api";
import { BookmarkButton } from "@/modules/bookmarks/BookmarkButton";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const story = await fetchStory(slug);

  if (!story) {
    return { title: "Archive introuvable" };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";
  const description = story.summaryShort ?? story.summaryLong ?? undefined;
  const url = `${siteUrl}/nouvelles/${slug}`;

  return {
    title: story.title,
    description,
    openGraph: {
      title: `${story.title} — Nexus Noir`,
      description,
      type: "article",
      url,
      siteName: "Nexus Noir",
      locale: "fr_FR",
      publishedTime: story.publishedAt ?? undefined,
      images: story.coverImage
        ? [{ url: story.coverImage, alt: story.title }]
        : [{ url: `${siteUrl}/og-default.jpg`, alt: "Nexus Noir" }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${story.title} — Nexus Noir`,
      description,
      images: story.coverImage ? [story.coverImage] : [`${siteUrl}/og-default.jpg`],
    },
  };
}

export default async function StoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const story = await fetchStory(slug);

  if (!story) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl">
      <Link
        href="/"
        className="mb-10 inline-block text-xs uppercase tracking-widest text-zinc-700 transition-colors hover:text-red-500"
      >
        ← Archives
      </Link>

      {/* Couverture */}
      {story.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={story.coverImage}
          alt=""
          className="mb-10 aspect-[3/1] w-full rounded-lg object-cover"
        />
      )}

      {/* Titre */}
      <h1 className="mb-4 font-heading text-4xl font-bold leading-tight text-zinc-50 sm:text-5xl">
        {story.title}
      </h1>

      {/* Résumé court */}
      {story.summaryShort && (
        <p className="mb-6 text-lg leading-relaxed text-zinc-400">
          {story.summaryShort}
        </p>
      )}

      {/* Méta */}
      <div className="mb-10 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-zinc-900 pb-8 text-xs text-zinc-600">
        {story.author?.name && (
          <span className="font-medium text-zinc-500">{story.author.name}</span>
        )}
        <span>{story.readingTime} min de lecture</span>
        <span>{story.wordCount} mots</span>
        {story.viewsCount > 0 && (
          <span>{story.viewsCount} vue{story.viewsCount > 1 ? "s" : ""}</span>
        )}
        {story.tags.map((tag) => (
          <span key={tag}>#{tag}</span>
        ))}
        <div className="ml-auto">
          <BookmarkButton slug={story.slug} />
        </div>
      </div>

      {/* Bannière de série */}
      {story.seriesContext && <SeriesBanner ctx={story.seriesContext} />}

      <StoryViewTracker slug={story.slug} />

      {/* Corps du texte */}
      <StoryContent doc={story.content} />

      {/* Navigation série après le texte */}
      {story.seriesContext && <SeriesNav ctx={story.seriesContext} />}

      {/* Entrées d'univers liées */}
      {story.universeEntries && story.universeEntries.length > 0 && (
        <UniverseEntriesSection entries={story.universeEntries!} />
      )}

      <ReactionBar slug={story.slug} />

      <CommentSection slug={story.slug} />
    </article>
  );
}

// ──────────────────────────────────────────────────────────────
// Navigation série
// ──────────────────────────────────────────────────────────────

function SeriesBanner({ ctx }: { ctx: SeriesContext }) {
  return (
    <div className="mb-6 flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2.5">
      <Link href={`/series/${ctx.slug}`} className="text-xs text-zinc-500 hover:text-zinc-300 line-clamp-1 flex-1">
        Série · <span className="text-zinc-400">{ctx.title}</span>
      </Link>
      <span className="shrink-0 font-mono text-xs text-zinc-700">
        {ctx.position} / {ctx.total}
      </span>
    </div>
  );
}

function SeriesNav({ ctx }: { ctx: SeriesContext }) {
  return (
    <div className="my-12 grid grid-cols-2 gap-4 border-t border-zinc-900 pt-10">
      {ctx.prev ? (
        <Link
          href={`/nouvelles/${ctx.prev.slug}`}
          className="group flex flex-col gap-1 rounded-lg border border-zinc-800 bg-zinc-900/30 p-4 transition-colors hover:border-zinc-700"
        >
          <span className="text-[10px] uppercase tracking-widest text-zinc-600">← Épisode précédent</span>
          <span className="text-sm text-zinc-300 group-hover:text-white line-clamp-2">{ctx.prev.title}</span>
        </Link>
      ) : <div />}

      {ctx.next ? (
        <Link
          href={`/nouvelles/${ctx.next.slug}`}
          className="group flex flex-col items-end gap-1 rounded-lg border border-zinc-800 bg-zinc-900/30 p-4 text-right transition-colors hover:border-zinc-700"
        >
          <span className="text-[10px] uppercase tracking-widest text-zinc-600">Épisode suivant →</span>
          <span className="text-sm text-zinc-300 group-hover:text-white line-clamp-2">{ctx.next.title}</span>
        </Link>
      ) : <div />}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Entrées d'univers liées à la nouvelle
// ──────────────────────────────────────────────────────────────

const TYPE_ORDER: UniverseEntryType[] = ["character", "place", "faction", "event", "concept"];

const TYPE_COLORS: Record<UniverseEntryType, string> = {
  character: "border-red-900/40 text-red-400",
  place:     "border-blue-900/40 text-blue-400",
  faction:   "border-amber-900/40 text-amber-400",
  event:     "border-purple-900/40 text-purple-400",
  concept:   "border-zinc-700 text-zinc-500",
};

function UniverseEntriesSection({ entries }: { entries: StoryUniverseEntry[] }) {
  const byType = TYPE_ORDER.reduce<Record<string, StoryUniverseEntry[]>>((acc, t) => {
    acc[t] = entries.filter((e) => e.type === t);
    return acc;
  }, {});

  return (
    <div className="my-12 border-t border-zinc-900 pt-10">
      <p className="mb-5 text-xs uppercase tracking-widest text-zinc-600">Dans cette nouvelle</p>
      <div className="space-y-5">
        {TYPE_ORDER.map((type) => {
          const group = byType[type];
          if (!group?.length) return null;
          return (
            <div key={type}>
              <p className="mb-2 text-[10px] uppercase tracking-widest text-zinc-700">
                {TYPE_LABELS_PLURAL[type]}
              </p>
              <div className="flex flex-wrap gap-2">
                {group.map((e) => (
                  <Link
                    key={e.id}
                    href={`/univers/${e.slug}`}
                    className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-zinc-900 ${TYPE_COLORS[type as UniverseEntryType]}`}
                  >
                    {e.coverImage && (
                      <img src={e.coverImage} alt={e.name}
                        className="h-5 w-5 shrink-0 rounded-full object-cover opacity-80" />
                    )}
                    {e.name}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
