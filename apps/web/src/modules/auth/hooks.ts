import { useAuthStore } from "./store";

/** Vrai si l'utilisateur courant possède la permission donnée. */
export function useHasPermission(permission: string): boolean {
  return useAuthStore((s) => s.user?.permissions.includes(permission) ?? false);
}

/** Raccourcis utiles pour l'UI. */
export function useAuth() {
  return useAuthStore((s) => ({
    user: s.user,
    status: s.status,
    isAuthenticated: s.status === "authenticated",
  }));
}
