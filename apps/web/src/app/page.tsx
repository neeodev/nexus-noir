import Link from "next/link";
import { fetchStories } from "@/lib/api";

export default async function HomePage() {
  const stories = await fetchStories();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight text-zinc-100">
        Archives
      </h1>
      <p className="mb-10 text-sm text-zinc-500">
        Chaque nouvelle est une archive retrouvée dans Nexus Noir.
      </p>

      {stories.length === 0 ? (
        <p className="text-zinc-500">Aucune archive disponible pour le moment.</p>
      ) : (
        <ul className="space-y-6">
          {stories.map((story) => (
            <li key={story.slug}>
              <Link
                href={`/nouvelles/${story.slug}`}
                className="group block rounded-lg border border-zinc-900 bg-zinc-950/40 p-5 transition-colors hover:border-red-900/60"
              >
                <h2 className="text-lg font-medium text-zinc-100 group-hover:text-red-400">
                  {story.title}
                </h2>
                {story.summaryShort && (
                  <p className="mt-2 text-sm text-zinc-400">{story.summaryShort}</p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-600">
                  <span>{story.readingTime} min de lecture</span>
                  {story.tags.map((tag) => (
                    <span key={tag} className="text-zinc-500">
                      #{tag}
                    </span>
                  ))}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
