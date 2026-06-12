"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/modules/auth/store";
import { useHasPermission } from "@/modules/auth/hooks";

/**
 * Garde côté client pour les pages du Bureau Noir : redirige vers l'accueil
 * si la permission n'est pas accordée. La sécurité réelle reste côté API.
 */
export function AdminGuard({
  permission = "admin.access",
  children,
}: {
  permission?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const allowed = useHasPermission(permission);

  useEffect(() => {
    if (status !== "loading" && !allowed) {
      router.replace("/");
    }
  }, [status, allowed, router]);

  if (status === "loading") {
    return <p className="text-zinc-600">…</p>;
  }
  if (!allowed) {
    return null;
  }
  return <>{children}</>;
}
