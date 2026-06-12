"use client";

import { useAuthContext } from "./store";

export function useHasPermission(permission: string): boolean {
  const { user } = useAuthContext();
  return user?.permissions?.includes(permission) ?? false;
}

export function useAuth() {
  const { user, status } = useAuthContext();
  return { user, status, isAuthenticated: status === "authenticated" };
}
