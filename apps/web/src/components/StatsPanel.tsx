"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchAdminStats, type AdminStats } from "@/lib/api";

export function StatsPanel() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchAdminStats()
      .then(setStats)
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <p className="text-xs text-red-500/70">Impossible de charger les statistiques.</p>
    );
  }

  if (!stats) {
    return <p className="text-xs text-zinc-700">Chargement des statistiques…</p>;
  }

  return (
    <div className="space-y-6">
      {/* Compteurs rapides */}
      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard label="Vues aujourd&apos;hui" value={stats.viewsToday} />
        <StatCard label="Vues cette semaine" value={stats.viewsWeek} />
      </div>

      {/* Top nouvelles */}
      {stats.topStories.length > 0 && (
        <div>
          <h3 className="mb-3 text-xs uppercase tracking-widest text-zinc-600">
            Top nouvelles
          </h3>
          <ol className="space-y-1.5">
            {stats.topStories.map((s, i) => (
              <li key={s.slug} className="flex items-baseline gap-3">
                <span className="w-4 shrink-0 text-right text-xs text-zinc-700">
                  {i + 1}
                </span>
                <Link
                  href={`/nouvelles/${s.slug}`}
                  className="flex-1 truncate text-sm text-zinc-300 hover:text-red-400 transition-colors"
                >
                  {s.title}
                </Link>
                <span className="shrink-0 text-xs text-zinc-600">
                  {s.viewsCount} vue{s.viewsCount !== 1 ? "s" : ""}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-zinc-900 bg-zinc-950/40 p-5">
      <p className="text-2xl font-bold text-zinc-100">{value.toLocaleString("fr-FR")}</p>
      <p className="mt-1 text-xs text-zinc-500">{label}</p>
    </div>
  );
}
