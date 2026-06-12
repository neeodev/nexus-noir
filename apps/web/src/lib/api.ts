/**
 * Client API Nexus Noir (lecture publique).
 *
 * Le contenu d'une nouvelle est un document JSON Tiptap (ProseMirror).
 * La page publique génère le HTML depuis ce JSON contrôlé (jamais de HTML brut).
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

/** Document Tiptap (ProseMirror) : { type: "doc", content: [...] }. */
export type StoryDocument = { type: string; content?: unknown[] };

// --- Types des ressources API ---

export type StoryListItem = {
  slug: string;
  title: string;
  summaryShort: string | null;
  coverImage: string | null;
  readingTime: number;
  wordCount: number;
  tags: string[];
  contentWarnings: string[];
  publishedAt: string | null;
};

export type Story = StoryListItem & {
  summaryLong: string | null;
  version: number;
  content: StoryDocument;
  author?: { name: string | null };
};

type Paginated<T> = { data: T[] };
type Single<T> = { data: T };

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Accept: "application/json" },
    // Toujours frais en dev ; on ajoutera du cache/revalidate plus tard.
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`API ${path} -> ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchStories(): Promise<StoryListItem[]> {
  const json = await getJson<Paginated<StoryListItem>>("/stories");
  return json.data;
}

export async function fetchStory(slug: string): Promise<Story | null> {
  try {
    const json = await getJson<Single<Story>>(`/stories/${encodeURIComponent(slug)}`);
    return json.data;
  } catch {
    return null;
  }
}
