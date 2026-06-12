import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchStory } from "@/lib/api";
import { StoryContent } from "@/modules/editor/render";
import { ReactionBar } from "@/modules/reactions/components/ReactionBar";
import { CommentSection } from "@/modules/comments/components/CommentSection";

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

  const description = story.summaryShort ?? story.summaryLong ?? undefined;

  return {
    title: story.title,
    description,
    openGraph: {
      title: story.title,
      description,
      type: "article",
      images: story.coverImage ? [story.coverImage] : undefined,
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
    <article>
      <Link
        href="/"
        className="mb-8 inline-block text-xs uppercase tracking-widest text-zinc-600 hover:text-red-500"
      >
        ← Retour aux archives
      </Link>

      <div className="mb-8 flex flex-wrap items-center gap-x-3 text-xs text-zinc-600">
        <span>{story.readingTime} min de lecture</span>
        <span>·</span>
        <span>{story.wordCount} mots</span>
        {story.author?.name && (
          <>
            <span>·</span>
            <span>{story.author.name}</span>
          </>
        )}
      </div>

      <StoryContent doc={story.content} />

      <ReactionBar slug={story.slug} />

      <CommentSection slug={story.slug} />
    </article>
  );
}
