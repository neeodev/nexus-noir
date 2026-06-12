import Link from "next/link";
import { AdminGuard } from "@/components/AdminGuard";

export default function AdminHomePage() {
  return (
    <AdminGuard permission="admin.access">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight text-zinc-100">Bureau Noir</h1>
      <p className="mb-8 text-sm text-zinc-500">Administration de Nexus Noir.</p>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/admin/nouvelles"
          className="rounded-lg border border-zinc-900 bg-zinc-950/40 p-5 transition-colors hover:border-red-900/60"
        >
          <span className="block text-zinc-100">Nouvelles</span>
          <span className="text-sm text-zinc-500">Écrire, éditer, publier les archives.</span>
        </Link>
      </div>
    </AdminGuard>
  );
}
