import { apiGet, apiSend } from "@/lib/http";

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
};

type Wrapped<T> = { data: T };

export const commentsApi = {
  async list(slug: string): Promise<Comment[]> {
    const res = await apiGet<Wrapped<Comment[]>>(
      `/stories/${encodeURIComponent(slug)}/comments`,
    );
    return res.data;
  },

  async post(slug: string, body: string, parentId?: number): Promise<Comment> {
    const res = await apiSend<Wrapped<Comment>>(
      `/stories/${encodeURIComponent(slug)}/comments`,
      "POST",
      { body, parentId: parentId ?? null },
    );
    return res.data;
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
};
