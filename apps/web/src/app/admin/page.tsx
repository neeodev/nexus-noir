import Link from "next/link";
import { AdminGuard } from "@/components/AdminGuard";
import { StatsPanel } from "@/components/StatsPanel";

export default function AdminHomePage() {
  return (
    <AdminGuard permission="admin.access">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight text-zinc-100">Bureau Noir</h1>
      <p className="mb-8 text-sm text-zinc-500">Administration de Nexus Noir.</p>

      {/* Navigation */}
      <div className="mb-10 grid gap-3 sm:grid-cols-2">
        <Link
          href="/admin/nouvelles"
          className="rounded-lg border border-zinc-900 bg-zinc-950/40 p-5 transition-colors hover:border-red-900/60"
        >
          <span className="block text-zinc-100">Nouvelles</span>
          <span className="text-sm text-zinc-500">Écrire, éditer, publier les archives.</span>
        </Link>
        <Link
          href="/admin/badges"
          className="rounded-lg border border-zinc-900 bg-zinc-950/40 p-5 transition-colors hover:border-red-900/60"
        >
          <span className="block text-zinc-100">Marques</span>
          <span className="text-sm text-zinc-500">Gérer les badges et conditions d'attribution.</span>
        </Link>
        <Link
          href="/admin/moderation"
          className="rounded-lg border border-zinc-900 bg-zinc-950/40 p-5 transition-colors hover:border-red-900/60"
        >
          <span className="block text-zinc-100">Modération</span>
          <span className="text-sm text-zinc-500">Masquer, épingler ou supprimer des commentaires.</span>
        </Link>
        <Link
          href="/admin/signalements"
          className="rounded-lg border border-zinc-900 bg-zinc-950/40 p-5 transition-colors hover:border-red-900/60"
        >
          <span className="block text-zinc-100">Signalements</span>
          <span className="text-sm text-zinc-500">Traiter les commentaires signalés par les lecteurs.</span>
        </Link>
        <Link
          href="/admin/utilisateurs"
          className="rounded-lg border border-zinc-900 bg-zinc-950/40 p-5 transition-colors hover:border-red-900/60"
        >
          <span className="block text-zinc-100">Utilisateurs</span>
          <span className="text-sm text-zinc-500">Gérer les rôles, bans et marques des membres.</span>
        </Link>
      </div>

      {/* Statistiques */}
      <h2 className="mb-4 text-xs uppercase tracking-widest text-zinc-600">
        Statistiques de lecture
      </h2>
      <StatsPanel />
    </AdminGuard>
  );
}
