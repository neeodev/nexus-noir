import { apiGet, apiSend } from "@/lib/http";
import type { StoryDocument } from "@/lib/api";

export type StoryUniverseEntry = {
  id: number;
  type: string;
  typeLabel: string;
  name: string;
  slug: string;
  coverImage: string | null;
};

export type AdminStory = {
  id: number;
  title: string;
  slug: string;
  summaryShort: string | null;
  summaryLong: string | null;
  coverImage: string | null;
  status: string;
  statusLabel: string;
  visibility: string;
  visibilityLabel: string;
  content: StoryDocument;
  tags: string[];
  contentWarnings: string[];
  readingTime: number;
  wordCount: number;
  version: number;
  publishedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  universeEntries?: StoryUniverseEntry[];
};

/** Champs modifiables envoyés à l'API (partiels lors d'un autosave). */
export type StoryInput = Partial<{
  title: string;
  slug: string;
  summaryShort: string | null;
  summaryLong: string | null;
  coverImage: string | null;
  status: string;
  visibility: string;
  content: StoryDocument;
  tags: string[];
  contentWarnings: string[];
  universe_entry_ids: number[];
}>;

export type StoryVersion = {
  id: number;
  version: number;
  title: string;
  wordCount: number;
  author: string | null;
  createdAt: string | null;
};

type Wrapped<T> = { data: T };

export const adminStoriesApi = {
  async list(qs?: string): Promise<AdminStory[]> {
    const path = qs ? `/admin/stories?${qs}` : "/admin/stories";
    const res = await apiGet<Wrapped<AdminStory[]>>(path);
    return res.data;
  },

  async get(id: number): Promise<AdminStory> {
    const res = await apiGet<Wrapped<AdminStory>>(`/admin/stories/${id}`);
    return res.data;
  },

  async create(input: StoryInput): Promise<AdminStory> {
    const res = await apiSend<Wrapped<AdminStory>>("/admin/stories", "POST", input);
    return res.data;
  },

  async update(id: number, input: StoryInput): Promise<AdminStory> {
    const res = await apiSend<Wrapped<AdminStory>>(`/admin/stories/${id}`, "PATCH", input);
    return res.data;
  },

  async publish(id: number): Promise<AdminStory> {
    const res = await apiSend<Wrapped<AdminStory>>(`/admin/stories/${id}/publish`, "POST");
    return res.data;
  },

  async unpublish(id: number): Promise<AdminStory> {
    const res = await apiSend<Wrapped<AdminStory>>(`/admin/stories/${id}/unpublish`, "POST");
    return res.data;
  },

  async archive(id: number): Promise<AdminStory> {
    const res = await apiSend<Wrapped<AdminStory>>(`/admin/stories/${id}`, "PATCH", { status: "archived" });
    return res.data;
  },

  remove(id: number): Promise<unknown> {
    return apiSend<unknown>(`/admin/stories/${id}`, "DELETE");
  },

  async versions(id: number): Promise<StoryVersion[]> {
    const res = await apiGet<Wrapped<StoryVersion[]>>(`/admin/stories/${id}/versions`);
    return res.data;
  },

  async restoreVersion(id: number, versionId: number): Promise<AdminStory> {
    const res = await apiSend<Wrapped<AdminStory>>(
      `/admin/stories/${id}/versions/${versionId}/restore`,
      "POST",
    );
    return res.data;
  },
};
