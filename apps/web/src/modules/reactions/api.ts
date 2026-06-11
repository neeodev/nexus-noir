import { apiGet, apiSend } from "@/lib/http";

export type ReactionCount = {
  type: string;
  label: string;
  emoji: string;
  count: number;
};

export type ReactionSummary = {
  total: number;
  userReaction: string | null;
  reactions: ReactionCount[];
};

export const reactionsApi = {
  get(slug: string): Promise<ReactionSummary> {
    return apiGet<ReactionSummary>(`/stories/${encodeURIComponent(slug)}/reactions`);
  },

  /** Pose, change ou retire (toggle) la réaction de l'utilisateur. */
  toggle(slug: string, type: string): Promise<ReactionSummary> {
    return apiSend<ReactionSummary>(
      `/stories/${encodeURIComponent(slug)}/reactions`,
      "POST",
      { type },
    );
  },
};
