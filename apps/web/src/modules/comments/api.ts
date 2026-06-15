import { apiGet, apiSend } from "@/lib/http";
import type { Badge } from "@/modules/auth/api";

export type Comment = {
  id: number;
  parentId: number | null;
  body: string;
  author: { name: string | null } | null;
  isPinned: boolean;
  isHidden: boolean;
  isDeleted: boolean;
  createdAt: string | null;
  can: { delete: boolean; moderate: boolean; reply: boolean };
  replies: Comment[];
  story?: { id: number; title: string; slug: string };
};

export type CommentPage = {
  data: Comment[];
  meta: { current_page: number; last_page: number; total: number; per_page: number };
};

type Wrapped<T> = { data: T };

type CommentPostResult = { data: Comment; newBadges: Badge[] };

export const commentsApi = {
  async list(slug: string): Promise<Comment[]> {
    const res = await apiGet<Wrapped<Comment[]>>(
      `/stories/${encodeURIComponent(slug)}/comments`,
    );
    return res.data;
  },

  async post(slug: string, body: string, parentId?: number): Promise<CommentPostResult> {
    return apiSend<CommentPostResult>(
      `/stories/${encodeURIComponent(slug)}/comments`,
      "POST",
      { body, parentId: parentId ?? null },
    );
  },

  remove(commentId: number): Promise<unknown> {
    return apiSend<unknown>(`/comments/${commentId}`, "DELETE");
  },

  async moderate(
    commentId: number,
    changes: { isHidden?: boolean; isPinned?: boolean },
  ): Promise<Comment> {
    const res = await apiSend<Wrapped<Comment>>(
      `/comments/${commentId}/moderate`,
      "PATCH",
      changes,
    );
    return res.data;
  },

  async adminList(params: {
    page?: number;
    status?: "all" | "hidden" | "pinned" | "deleted";
    storyId?: number;
  }): Promise<CommentPage> {
    const search = new URLSearchParams();
    if (params.page && params.page > 1) search.set("page", String(params.page));
    if (params.status && params.status !== "all") search.set("status", params.status);
    if (params.storyId) search.set("story_id", String(params.storyId));
    const qs = search.toString();
    return apiGet<CommentPage>(`/admin/comments${qs ? `?${qs}` : ""}`);
  },
};
