"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthContext } from "@/modules/auth/store";
import { useHasPermission } from "@/modules/auth/hooks";
import { SearchBar } from "./SearchBar";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={`relative pb-0.5 transition-colors ${
        active
          ? "text-nn-text after:absolute after:inset-x-0 after:-bottom-px after:h-px after:bg-nn-red"
          : "text-nn-muted hover:text-nn-text"
      }`}
    >
      {children}
    </Link>
  );
}

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
    <header className="sticky top-0 z-20 bg-nn-black/95 backdrop-blur-md">
      {/* Ligne rouge — identité de la ville */}
      <div className="h-[2px] w-full bg-gradient-to-r from-nn-red-dark via-nn-red to-nn-red-dark opacity-80" />

      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">

        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <span className="font-title text-2xl tracking-[0.18em] text-nn-text transition-colors group-hover:text-nn-red">
            NEXUS NOIR
          </span>
          <span className="hidden items-center gap-2.5 sm:flex">
            <span className="h-3 w-px bg-nn-border" />
            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-nn-border group-hover:text-nn-muted transition-colors">
              Archives
            </span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-5 font-mono text-[10px] uppercase tracking-widest">
          <SearchBar />
          <NavLink href="/series">Séries</NavLink>
          <NavLink href="/univers">Univers</NavLink>

          {status === "loading" ? (
            <span className="text-nn-border">…</span>
          ) : user ? (
            <>
              <span className="text-nn-border">·</span>
              {canAccessAdmin && (
                <NavLink href="/admin">
                  <span className="text-nn-red-dark hover:text-nn-red transition-colors">Bureau Noir</span>
                </NavLink>
              )}
              <NavLink href="/compte">{user.name}</NavLink>
              <button
                onClick={handleLogout}
                className="text-nn-border hover:text-nn-muted transition-colors"
                type="button"
              >
                Sortir
              </button>
            </>
          ) : (
            <>
              <span className="text-nn-border">·</span>
              <Link href="/connexion" className="text-nn-muted hover:text-nn-text transition-colors">
                Connexion
              </Link>
              <Link href="/inscription" className="text-nn-muted hover:text-nn-red transition-colors">
                Inscription
              </Link>
            </>
          )}
        </nav>

      </div>

      {/* Ligne de séparation basse */}
      <div className="h-px w-full bg-nn-border/40" />
    </header>
  );
}
