import Link from "next/link";
import { fetchStories, type StoryListItem } from "@/lib/api";

export default async function HomePage() {
  const stories = await fetchStories();

  return (
    <div className="mx-auto max-w-3xl">
      {/* En-tête atmosphérique */}
      <div className="mb-12 border-l-2 border-red-900/50 pl-5">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">
          Archives
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Des nouvelles retrouvées dans une ville malade.
        </p>
      </div>

      {stories.length === 0 ? (
        <p className="text-sm text-zinc-600">Aucune archive disponible pour le moment.</p>
      ) : (
        <ul className="space-y-px divide-y divide-zinc-900/60">
          {stories.map((story) => (
            <li key={story.slug}>
              <StoryCard story={story} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StoryCard({ story }: { story: StoryListItem }) {
  return (
    <Link
      href={`/nouvelles/${story.slug}`}
      className="group flex gap-5 py-7 transition-all"
    >
      {/* Image de couverture (si disponible) */}
      {story.coverImage && (
        <div className="hidden shrink-0 sm:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={story.coverImage}
            alt=""
            className="h-24 w-16 rounded object-cover opacity-70 transition-opacity group-hover:opacity-100"
          />
        </div>
      )}

      {/* Contenu */}
      <div className="min-w-0 flex-1">
        <h2 className="text-lg font-semibold leading-snug text-zinc-200 transition-colors group-hover:text-red-400">
          {story.title}
        </h2>
        {story.summaryShort && (
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-500 line-clamp-2">
            {story.summaryShort}
          </p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-600">
          <span>{story.readingTime} min</span>
          {story.viewsCount > 0 && (
            <>
              <span className="text-zinc-800">·</span>
              <span>{story.viewsCount} vue{story.viewsCount > 1 ? "s" : ""}</span>
            </>
          )}
          {story.tags.length > 0 && (
            <span className="text-zinc-800">·</span>
          )}
          {story.tags.map((tag) => (
            <span key={tag} className="text-zinc-600 transition-colors group-hover:text-zinc-500">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Flèche */}
      <div className="hidden items-center self-center text-zinc-800 transition-colors group-hover:text-red-900 sm:flex">
        →
      </div>
    </Link>
  );
}
