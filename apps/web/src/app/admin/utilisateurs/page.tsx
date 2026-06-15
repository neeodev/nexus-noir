"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/AdminGuard";
import { adminUsersApi, type AdminUser, type AdminUserPage } from "@/modules/admin/usersApi";

const ROLES = ["", "reader", "moderator", "editor", "admin", "super_admin"] as const;
const ROLE_LABELS: Record<string, string> = {
  "": "Tous les rôles",
  reader: "Lecteur",
  moderator: "Modérateur",
  editor: "Éditeur",
  admin: "Administrateur",
  super_admin: "Super admin",
};

export default function UtilisateursPage() {
  return (
    <AdminGuard permission="admin.access">
      <UserListContent />
    </AdminGuard>
  );
}

function UserListContent() {
  const [data, setData] = useState<AdminUserPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async (opts: { q: string; role: string; status: string; page: number }) => {
    setLoading(true);
    try {
      const res = await adminUsersApi.list(opts);
      setData(res);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => void load({ q, role, status, page }), q ? 300 : 0);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [q, role, status, page, load]);

  function reset(updates: Partial<{ q: string; role: string; status: string }>) {
    if ("q" in updates) setQ(updates.q!);
    if ("role" in updates) setRole(updates.role!);
    if ("status" in updates) setStatus(updates.status!);
    setPage(1);
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin" className="text-zinc-600 hover:text-zinc-400 text-sm">← Bureau Noir</Link>
        <span className="text-zinc-800">/</span>
        <h1 className="text-xl font-semibold text-zinc-100">Utilisateurs</h1>
        {data && <span className="ml-auto text-xs text-zinc-600">{data.meta.total} membre{data.meta.total !== 1 ? "s" : ""}</span>}
      </div>

      {/* Filtres */}
      <div className="mb-5 flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Rechercher nom ou email…"
          value={q}
          onChange={(e) => reset({ q: e.target.value })}
          className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-red-900/70 w-64"
        />
        <select
          value={role}
          onChange={(e) => reset({ role: e.target.value })}
          className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-400 outline-none focus:border-red-900/70"
        >
          {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
        </select>
        <select
          value={status}
          onChange={(e) => reset({ status: e.target.value })}
          className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-400 outline-none focus:border-red-900/70"
        >
          <option value="">Tous les statuts</option>
          <option value="active">Actifs</option>
          <option value="banned">Bannis</option>
        </select>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-zinc-600">Chargement…</div>
      ) : data?.data.length === 0 ? (
        <div className="py-12 text-center text-sm text-zinc-600">Aucun utilisateur trouvé.</div>
      ) : (
        <div className="divide-y divide-zinc-900 rounded-lg border border-zinc-900">
          {data?.data.map((user) => <UserRow key={user.id} user={user} />)}
        </div>
      )}

      {data && data.meta.last_page > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
            className="rounded-md border border-zinc-800 px-3 py-1.5 text-xs text-zinc-400 hover:border-zinc-700 disabled:opacity-30">
            ← Précédent
          </button>
          <span className="text-xs text-zinc-600">{page} / {data.meta.last_page}</span>
          <button disabled={page >= data.meta.last_page} onClick={() => setPage((p) => p + 1)}
            className="rounded-md border border-zinc-800 px-3 py-1.5 text-xs text-zinc-400 hover:border-zinc-700 disabled:opacity-30">
            Suivant →
          </button>
        </div>
      )}
    </div>
  );
}

function UserRow({ user }: { user: AdminUser }) {
  return (
    <Link href={`/admin/utilisateurs/${user.id}`}
      className="flex items-center gap-4 p-4 hover:bg-zinc-950/40 transition-colors">
      {/* Avatar initiales */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-zinc-400">
        {user.name.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-zinc-100">{user.name}</span>
          <span className="text-xs text-zinc-600">{user.email}</span>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-2">
          <RoleBadge role={user.role} label={user.roleLabel} />
          {user.isBanned && (
            <span className="rounded border border-red-900/60 bg-red-950/30 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-red-400">
              Banni
            </span>
          )}
        </div>
      </div>
      <div className="shrink-0 text-right text-xs text-zinc-600">
        <div>Inscrit {user.createdAt ? new Date(user.createdAt).toLocaleDateString("fr-FR") : "—"}</div>
      </div>
    </Link>
  );
}

function RoleBadge({ role, label }: { role: string; label: string }) {
  const cls =
    role === "super_admin" ? "border-purple-900/60 bg-purple-950/30 text-purple-400"
    : role === "admin" ? "border-red-900/60 bg-red-950/30 text-red-400"
    : role === "editor" ? "border-amber-900/60 bg-amber-950/30 text-amber-400"
    : role === "moderator" ? "border-blue-900/60 bg-blue-950/30 text-blue-400"
    : "border-zinc-800 bg-zinc-900/50 text-zinc-500";
  return (
    <span className={`rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-wider ${cls}`}>
      {label}
    </span>
  );
}
