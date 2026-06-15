import { apiGet, apiSend } from "@/lib/http";

export type SeriesStory = {
  id: number;
  title: string;
  slug: string;
  coverImage: string | null;
  position: number;
  publishedAt: string | null;
  readingTime: number | null;
  summaryShort: string | null;
};

export type Series = {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  coverImage: string | null;
  isCompleted: boolean;
  sortOrder: number;
  storiesCount?: number | null;
  stories?: SeriesStory[];
};

export type SeriesInput = {
  title?: string;
  slug?: string;
  summary?: string | null;
  cover_image?: string | null;
  is_completed?: boolean;
  sort_order?: number;
  story_ids_ordered?: number[];
};

export const seriesApi = {
  list: () => apiGet<{ data: Series[] }>("/series").then((r) => r.data),

  get: (slug: string) => apiGet<{ data: Series }>(`/series/${slug}`).then((r) => r.data),
};

export const adminSeriesApi = {
  list: () => apiGet<{ data: Series[] }>("/admin/series").then((r) => r.data),

  get: (id: number) => apiGet<{ data: Series }>(`/admin/series/${id}`).then((r) => r.data),

  create: (input: SeriesInput) =>
    apiSend<{ data: Series }>("/admin/series", "POST", input).then((r) => r.data),

  update: (id: number, input: SeriesInput) =>
    apiSend<{ data: Series }>(`/admin/series/${id}`, "PATCH", input).then((r) => r.data),

  destroy: (id: number) => apiSend<unknown>(`/admin/series/${id}`, "DELETE"),
};
