"use client";

import { useEffect } from "react";
import { useAuthStore } from "./store";

/**
 * Hydrate l'état d'authentification au chargement de l'app
 * en vérifiant la session courante côté API.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const fetchUser = useAuthStore((s) => s.fetchUser);

  useEffect(() => {
    void fetchUser();
  }, [fetchUser]);

  return <>{children}</>;
}
