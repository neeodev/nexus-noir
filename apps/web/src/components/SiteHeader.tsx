"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/modules/auth/store";
import { useHasPermission } from "@/modules/auth/hooks";

export function SiteHeader() {
  const router = useRouter();
  const { user, status, logout } = useAuthContext();
  const canAccessAdmin = useHasPermission("admin.access");

  async function handleLogout() {
    await logout();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-900 bg-[#08080a]/85 backdrop-blur">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-red-900/70 to-transparent" />
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="font-mono text-sm uppercase tracking-[0.3em] text-zinc-200 group-hover:text-red-400">
            Nexus Noir
          </span>
          <span className="hidden text-[0.65rem] uppercase tracking-widest text-zinc-600 sm:inline">
            Archives
          </span>
        </Link>

        <nav className="flex items-center gap-4 text-xs uppercase tracking-widest">
          <Link href="/univers" className="text-zinc-500 hover:text-zinc-300">
            Univers
          </Link>
          {status === "loading" ? (
            <span className="text-zinc-700">…</span>
          ) : user ? (
            <>
              {canAccessAdmin && (
                <Link href="/admin" className="text-red-400 hover:text-red-300">
                  Bureau Noir
                </Link>
              )}
              <Link href="/compte" className="text-zinc-400 hover:text-red-500" title={user.roleLabel}>
                {user.name}
              </Link>
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
