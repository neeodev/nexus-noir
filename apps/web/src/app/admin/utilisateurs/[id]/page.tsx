"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AdminGuard } from "@/components/AdminGuard";
import { BadgeIcon } from "@/components/BadgeIcon";
import { adminUsersApi, type AdminUser } from "@/modules/admin/usersApi";
import type { Badge } from "@/modules/auth/api";
import { apiGet } from "@/lib/http";

const ASSIGNABLE_ROLES = ["reader", "moderator", "editor", "admin"] as const;
const ROLE_LABELS: Record<string, string> = {
  reader: "Lecteur",
  moderator: "Modérateur",
  editor: "Éditeur",
  admin: "Administrateur",
  super_admin: "Super admin",
};

export default function UserDetailPage() {
  return (
    <AdminGuard permission="admin.access">
      <UserDetailContent />
    </AdminGuard>
  );
}

function UserDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [banReason, setBanReason] = useState("");
  const [showBanForm, setShowBanForm] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [userRes, badgesRes] = await Promise.all([
        adminUsersApi.show(Number(id)),
        apiGet<{ data: Badge[] }>("/admin/badges"),
      ]);
      setUser(userRes.data);
      setAllBadges(badgesRes.data);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  async function handleRoleChange(role: string) {
    if (!user || busy) return;
    setBusy(true);
    try {
      const res = await adminUsersApi.updateRole(user.id, role);
      setUser(res.data);
    } finally {
      setBusy(false);
    }
  }

  async function handleBan() {
    if (!user || busy) return;
    setBusy(true);
    try {
      const res = await adminUsersApi.ban(user.id, banReason || undefined);
      setUser(res.data);
      setShowBanForm(false);
      setBanReason("");
    } finally {
      setBusy(false);
    }
  }

  async function handleUnban() {
    if (!user || busy) return;
    setBusy(true);
    try {
      const res = await adminUsersApi.unban(user.id);
      setUser(res.data);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!user || busy) return;
    if (!confirm(`Supprimer définitivement le compte de ${user.name} ? Cette action est irréversible.`)) return;
    setBusy(true);
    try {
      await adminUsersApi.delete(user.id);
      router.push("/admin/utilisateurs");
    } finally {
      setBusy(false);
    }
  }

  async function handleAwardBadge(badge: Badge) {
    if (!user || busy) return;
    setBusy(true);
    try {
      await adminUsersApi.awardBadge(user.id, badge.id);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function handleRevokeBadge(badge: Badge) {
    if (!user || busy) return;
    if (!confirm(`Révoquer la marque « ${badge.name} » ?`)) return;
    setBusy(true);
    try {
      await adminUsersApi.revokeBadge(user.id, badge.id);
      await load();
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="py-16 text-center text-sm text-zinc-600">Chargement…</div>;
  if (!user) return <div className="py-16 text-center text-sm text-zinc-600">Utilisateur introuvable.</div>;

  const awardedIds = new Set(user.badges?.map((b) => b.id) ?? []);
  const availableBadges = allBadges.filter((b) => !awardedIds.has(b.id));

  const roleColor =
    user.role === "super_admin" ? "text-purple-400"
    : user.role === "admin" ? "text-red-400"
    : user.role === "editor" ? "text-amber-400"
    : user.role === "moderator" ? "text-blue-400"
    : "text-zinc-400";

  return (
    <div className="max-w-2xl">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-3 text-sm">
        <Link href="/admin" className="text-zinc-600 hover:text-zinc-400">Bureau Noir</Link>
        <span className="text-zinc-800">/</span>
        <Link href="/admin/utilisateurs" className="text-zinc-600 hover:text-zinc-400">Utilisateurs</Link>
        <span className="text-zinc-800">/</span>
        <span className="text-zinc-300">{user.name}</span>
      </div>

      {/* En-tête utilisateur */}
      <div className="mb-8 flex items-start gap-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xl font-bold text-zinc-400">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-zinc-100">{user.name}</h1>
          <p className="text-sm text-zinc-500">{user.email}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className={`text-xs font-medium uppercase tracking-wider ${roleColor}`}>
              {ROLE_LABELS[user.role] ?? user.roleLabel}
            </span>
            {user.isBanned && (
              <span className="rounded border border-red-900/60 bg-red-950/30 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-red-400">
                Banni{user.banReason ? ` — ${user.banReason}` : ""}
              </span>
            )}
            <span className="text-xs text-zinc-700">
              Inscrit le {user.createdAt ? new Date(user.createdAt).toLocaleDateString("fr-FR") : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Section rôle */}
      {user.role !== "super_admin" && (
        <Section title="Rôle">
          <div className="flex flex-wrap gap-2">
            {ASSIGNABLE_ROLES.map((r) => (
              <button
                key={r}
                disabled={busy}
                onClick={() => handleRoleChange(r)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  user.role === r
                    ? "bg-red-900 text-zinc-100"
                    : "border border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                }`}
              >
                {ROLE_LABELS[r]}
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* Section bannissement */}
      <Section title="Accès">
        {user.isBanned ? (
          <div className="flex items-start gap-4">
            <div className="flex-1 text-sm text-zinc-400">
              Compte suspendu{user.bannedAt ? ` le ${new Date(user.bannedAt).toLocaleDateString("fr-FR")}` : ""}.
              {user.banReason && <span className="block text-zinc-600 mt-0.5">Raison : {user.banReason}</span>}
            </div>
            <button onClick={handleUnban} disabled={busy}
              className="shrink-0 rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:border-zinc-600 disabled:opacity-50">
              Lever la suspension
            </button>
          </div>
        ) : showBanForm ? (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Raison (optionnel)"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-red-900/70"
            />
            <div className="flex gap-2">
              <button onClick={handleBan} disabled={busy}
                className="rounded-md bg-red-900 px-3 py-1.5 text-xs font-medium text-zinc-100 hover:bg-red-800 disabled:opacity-50">
                Confirmer le ban
              </button>
              <button onClick={() => setShowBanForm(false)}
                className="rounded-md border border-zinc-800 px-3 py-1.5 text-xs text-zinc-400 hover:border-zinc-700">
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowBanForm(true)}
            className="rounded-md border border-zinc-800 px-3 py-1.5 text-xs text-zinc-400 hover:border-red-900/60 hover:text-red-400 transition-colors">
            Suspendre le compte
          </button>
        )}
      </Section>

      {/* Section marques */}
      <Section title="Marques">
        {user.badges && user.badges.length > 0 ? (
          <div className="mb-4 flex flex-wrap gap-2">
            {user.badges.map((badge) => (
              <div key={badge.id}
                className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2">
                <span style={{ color: badge.rarityColor }}>
                  <BadgeIcon name={badge.icon} className="h-4 w-4" />
                </span>
                <span className="text-xs text-zinc-300">{badge.name}</span>
                <button onClick={() => handleRevokeBadge(badge)} title="Révoquer"
                  className="ml-1 text-zinc-700 hover:text-red-400 transition-colors text-xs">
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="mb-3 text-sm text-zinc-600">Aucune marque.</p>
        )}

        {availableBadges.length > 0 && (
          <div>
            <p className="mb-2 text-xs uppercase tracking-widest text-zinc-600">Attribuer</p>
            <div className="flex flex-wrap gap-2">
              {availableBadges.map((badge) => (
                <button key={badge.id} onClick={() => handleAwardBadge(badge)} disabled={busy}
                  className="flex items-center gap-1.5 rounded-md border border-zinc-800 px-2.5 py-1.5 text-xs text-zinc-500 hover:border-zinc-700 hover:text-zinc-300 transition-colors disabled:opacity-50">
                  <BadgeIcon name={badge.icon} className="h-3.5 w-3.5" />
                  {badge.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* Section danger */}
      {user.role !== "super_admin" && (
        <Section title="Zone de danger">
          <button onClick={handleDelete} disabled={busy}
            className="rounded-md border border-red-900/40 px-3 py-1.5 text-xs text-red-500 hover:bg-red-950/30 transition-colors disabled:opacity-50">
            Supprimer le compte définitivement
          </button>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 rounded-lg border border-zinc-900 p-5">
      <h2 className="mb-4 text-xs uppercase tracking-widest text-zinc-600">{title}</h2>
      {children}
    </div>
  );
}
