import { apiGet, apiSend } from "@/lib/http";
import type { StoryListItem } from "@/lib/api";

type Paginated<T> = { data: T[]; current_page: number; last_page: number; total: number };

export const bookmarkApi = {
  list(page = 1): Promise<Paginated<StoryListItem>> {
    return apiGet<Paginated<StoryListItem>>(`/bookmarks?page=${page}`);
  },

  slugs(): Promise<{ slugs: string[] }> {
    return apiGet<{ slugs: string[] }>("/bookmarks/slugs");
  },

  toggle(slug: string): Promise<{ bookmarked: boolean }> {
    return apiSend<{ bookmarked: boolean }>(`/stories/${slug}/bookmark`, "POST");
  },
};
