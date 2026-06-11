"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/modules/auth/store";
import { useHasPermission } from "@/modules/auth/hooks";

export function SiteHeader() {
  const router = useRouter();
  const { user, status, logout } = useAuthStore();
  const canAccessAdmin = useHasPermission("admin.access");

  async function handleLogout() {
    await logout();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="border-b border-zinc-900">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
        <Link
          href="/"
          className="font-mono text-sm uppercase tracking-[0.3em] text-zinc-300 hover:text-red-500"
        >
          Nexus Noir
        </Link>

        <nav className="flex items-center gap-4 text-xs uppercase tracking-widest">
          {status === "loading" ? (
            <span className="text-zinc-700">…</span>
          ) : user ? (
            <>
              {canAccessAdmin && (
                <Link href="/admin" className="text-red-400 hover:text-red-300">
                  Bureau Noir
                </Link>
              )}
              <span className="text-zinc-400" title={user.roleLabel}>
                {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="text-zinc-500 hover:text-red-500"
                type="button"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link href="/connexion" className="text-zinc-400 hover:text-red-500">
                Connexion
              </Link>
              <Link href="/inscription" className="text-zinc-400 hover:text-red-500">
                Inscription
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
