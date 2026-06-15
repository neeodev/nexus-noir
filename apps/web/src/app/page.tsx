import Link from "next/link";
import { fetchStories, type StoryListItem } from "@/lib/api";

export default async function HomePage() {
  const stories = await fetchStories();

  return (
    <div className="mx-auto max-w-3xl">

      {/* En-tête */}
      <div className="mb-14 border-l-2 border-nn-red-dark pl-6">
        <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.3em] text-nn-red-dark">
          — Accès public · Dossiers ouverts —
        </p>
        <h1 className="font-heading text-4xl font-bold text-nn-text">
          Archives
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-nn-muted">
          Des nouvelles retrouvées dans une ville qui n&apos;aurait pas dû survivre.
        </p>
      </div>

      {stories.length === 0 ? (
        <p className="font-mono text-sm text-nn-border">
          — Aucun dossier disponible —
        </p>
      ) : (
        <ul className="space-y-0">
          {stories.map((story, i) => (
            <li key={story.slug}>
              <StoryCard story={story} index={i} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StoryCard({ story, index }: { story: StoryListItem; index: number }) {
  return (
    <Link
      href={`/nouvelles/${story.slug}`}
      className="group relative flex gap-5 border-l-2 border-nn-border py-7 pl-6 transition-colors hover:border-nn-red"
    >
      {/* Numéro de dossier */}
      <span className="absolute -left-7 top-7 font-mono text-[9px] text-nn-border transition-colors group-hover:text-nn-muted">
        {String(index + 1).padStart(3, "0")}
      </span>

      {/* Image — filtre noir et blanc, couleur au survol */}
      {story.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={story.coverImage}
          alt=""
          className="hidden h-28 w-20 shrink-0 rounded-sm object-cover opacity-40 grayscale transition-all group-hover:opacity-75 group-hover:grayscale-0 sm:block"
        />
      )}

      {/* Contenu */}
      <div className="min-w-0 flex-1">
        <h2 className="font-heading text-xl font-bold leading-snug text-nn-text transition-colors group-hover:text-white">
          {story.title}
        </h2>

        {story.summaryShort && (
          <p className="mt-2 text-sm leading-relaxed text-nn-muted line-clamp-2">
            {story.summaryShort}
          </p>
        )}

        {/* Méta */}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px]">
          {story.publishedAt && (
            <span className="text-nn-yellow">
              {new Date(story.publishedAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
          <span className="text-nn-border">·</span>
          <span className="text-nn-muted">{story.readingTime} min</span>
          {story.wordCount > 0 && (
            <>
              <span className="text-nn-border">·</span>
              <span className="text-nn-muted">
                {story.wordCount >= 1000
                  ? `${(story.wordCount / 1000).toFixed(1)}k`
                  : story.wordCount}{" "}
                mots
              </span>
            </>
          )}
          {story.tags.length > 0 && (
            <>
              <span className="text-nn-border">·</span>
              {story.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-nn-cyan opacity-60 transition-opacity group-hover:opacity-100">
                  #{tag}
                </span>
              ))}
            </>
          )}
          {story.contentWarnings.length > 0 && (
            <span className="ml-1 text-nn-red-dark opacity-80">
              ⚠ {story.contentWarnings[0]}
            </span>
          )}
        </div>
      </div>

      {/* Flèche */}
      <div className="hidden shrink-0 self-center text-nn-border transition-colors group-hover:text-nn-red sm:block">
        →
      </div>
    </Link>
  );
}
