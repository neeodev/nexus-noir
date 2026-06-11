import { useAuthStore } from "./store";

/** Vrai si l'utilisateur courant possède la permission donnée. */
export function useHasPermission(permission: string): boolean {
  return useAuthStore((s) => s.user?.permissions?.includes(permission) ?? false);
}

/**
 * Raccourcis utiles pour l'UI.
 *
 * On sélectionne des valeurs primitives séparément : un sélecteur qui
 * renverrait un nouvel objet à chaque rendu casserait le cache de
 * getSnapshot (boucle de re-render avec Zustand).
 */
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);

  return { user, status, isAuthenticated: status === "authenticated" };
}
