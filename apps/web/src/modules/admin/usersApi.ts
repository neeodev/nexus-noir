import { apiGet, apiSend } from "@/lib/http";
import type { Badge } from "@/modules/auth/api";

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  roleLabel: string;
  isBanned: boolean;
  bannedAt: string | null;
  banReason: string | null;
  createdAt: string | null;
  badgesCount?: number;
  readingsCount?: number;
  badges?: Badge[];
};

export type AdminUserPage = {
  data: AdminUser[];
  meta: { current_page: number; last_page: number; total: number; per_page: number };
};

export const adminUsersApi = {
  list(params: { q?: string; role?: string; status?: string; page?: number } = {}): Promise<AdminUserPage> {
    const qs = new URLSearchParams();
    if (params.q) qs.set("q", params.q);
    if (params.role) qs.set("role", params.role);
    if (params.status) qs.set("status", params.status);
    if (params.page && params.page > 1) qs.set("page", String(params.page));
    const s = qs.toString();
    return apiGet<AdminUserPage>(`/admin/users${s ? `?${s}` : ""}`);
  },

  show(id: number): Promise<{ data: AdminUser }> {
    return apiGet<{ data: AdminUser }>(`/admin/users/${id}`);
  },

  updateRole(id: number, role: string): Promise<{ data: AdminUser }> {
    return apiSend<{ data: AdminUser }>(`/admin/users/${id}/role`, "PATCH", { role });
  },

  ban(id: number, reason?: string): Promise<{ data: AdminUser }> {
    return apiSend<{ data: AdminUser }>(`/admin/users/${id}/ban`, "POST", { reason: reason ?? null });
  },

  unban(id: number): Promise<{ data: AdminUser }> {
    return apiSend<{ data: AdminUser }>(`/admin/users/${id}/ban`, "DELETE");
  },

  delete(id: number): Promise<unknown> {
    return apiSend<unknown>(`/admin/users/${id}`, "DELETE");
  },

  awardBadge(userId: number, badgeId: number): Promise<{ data: Badge[] }> {
    return apiSend<{ data: Badge[] }>(`/admin/users/${userId}/badges/${badgeId}`, "POST");
  },

  revokeBadge(userId: number, badgeId: number): Promise<unknown> {
    return apiSend<unknown>(`/admin/users/${userId}/badges/${badgeId}`, "DELETE");
  },
};
