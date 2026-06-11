"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/modules/auth/store";
import { useHasPermission } from "@/modules/auth/hooks";

export default function AdminHomePage() {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const canAccessAdmin = useHasPermission("admin.access");

  useEffect(() => {
    // Une fois l'état auth résolu, on éconduit ceux qui n'ont pas l'accès.
    if (status !== "loading" && !canAccessAdmin) {
      router.replace("/");
    }
  }, [status, canAccessAdmin, router]);

  if (status === "loading") {
    return <p className="text-zinc-600">…</p>;
  }

  if (!canAccessAdmin) {
    return null;
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold tracking-tight text-zinc-100">
        Bureau Noir
      </h1>
      <p className="text-sm text-zinc-500">
        Administration de Nexus Noir. Les sections (nouvelles, commentaires,
        utilisateurs, badges…) arrivent ici.
      </p>
    </div>
  );
}
