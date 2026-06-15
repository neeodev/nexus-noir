import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchStory } from "@/lib/api";
import { StoryContent } from "@/modules/editor/render";
import { ReactionBar } from "@/modules/reactions/components/ReactionBar";
import { CommentSection } from "@/modules/comments/components/CommentSection";
import { StoryViewTracker } from "@/components/StoryViewTracker";

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
      <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight text-zinc-50 sm:text-5xl">
        {story.title}
      </h1>

      {/* Résumé court */}
      {story.summaryShort && (
        <p className="mb-6 text-lg leading-relaxed text-zinc-400">
          {story.summaryShort}
        </p>
      )}

      {/* Méta */}
      <div className="mb-10 flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-zinc-900 pb-8 text-xs text-zinc-600">
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
      </div>

      <StoryViewTracker slug={story.slug} />

      {/* Corps du texte */}
      <StoryContent doc={story.content} />

      <ReactionBar slug={story.slug} />

      <CommentSection slug={story.slug} />
    </article>
  );
}
