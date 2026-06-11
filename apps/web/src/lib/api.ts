/**
 * Client API Nexus Noir.
 *
 * Le contenu d'une nouvelle est un document structuré en blocs (JSON).
 * Le front rend ces blocs — il ne reçoit jamais de HTML brut à injecter.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1";

// --- Types des blocs ---

export type InlineNode = {
  type: "text";
  text: string;
};

export type StoryBlock =
  | { id: string; type: "heading"; level: 1 | 2 | 3; content: string }
  | { id: string; type: "paragraph"; content: InlineNode[] }
  | { id: string; type: "dialogue"; speaker?: string; content: InlineNode[] }
  | { id: string; type: "quote"; content: InlineNode[] }
  | { id: string; type: "author_note"; content: InlineNode[] }
  | { id: string; type: "content_warning"; label: string }
  | { id: string; type: "scene_break" };

export type StoryDocument = {
  version: number;
  title?: string;
  blocks: StoryBlock[];
};

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
