/**
 * Client API Nexus Noir (lecture publique).
 *
 * Le contenu d'une nouvelle est un document JSON Tiptap (ProseMirror).
 * La page publique génère le HTML depuis ce JSON contrôlé (jamais de HTML brut).
 */

import type { Badge } from "@/modules/auth/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

// Racine du serveur Laravel (sans /api/v1) pour le cookie CSRF de Sanctum.
const API_HOST = API_URL.replace(/\/api\/v1\/?$/, "");

function getXsrfToken(): string {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : "";
}

async function ensureCsrf(): Promise<void> {
  if (getXsrfToken()) return;
  await fetch(`${API_HOST}/sanctum/csrf-cookie`, { credentials: "include" });
}

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
  viewsCount: number;
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

export type TrackViewResult = { views: number; newBadges: Badge[] };

export async function trackView(slug: string): Promise<TrackViewResult> {
  await ensureCsrf();
  const res = await fetch(`${API_URL}/stories/${encodeURIComponent(slug)}/view`, {
    method: "POST",
    headers: { Accept: "application/json", "X-XSRF-TOKEN": getXsrfToken() },
    credentials: "include",
  });
  if (!res.ok) return { views: 0, newBadges: [] };
  return res.json() as Promise<TrackViewResult>;
}

export type AdminStats = {
  viewsToday: number;
  viewsWeek: number;
  topStories: { slug: string; title: string; viewsCount: number }[];
};

export async function fetchAdminStats(): Promise<AdminStats> {
  await ensureCsrf();
  const res = await fetch(`${API_URL}/admin/stats`, {
    headers: { Accept: "application/json", "X-XSRF-TOKEN": getXsrfToken() },
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Admin stats -> ${res.status}`);
  return res.json() as Promise<AdminStats>;
}
