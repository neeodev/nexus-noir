"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/AdminGuard";
import { apiGet, apiSend } from "@/lib/http";

type Report = {
  id: number;
  reason: string;
  body: string | null;
  status: "pending" | "reviewed" | "dismissed";
  createdAt: string;
  resolvedAt: string | null;
  reporter: { id: number; name: string };
  resolver: { id: number; name: string } | null;
  comment: {
    id: number;
    body: string;
    story: { title: string; slug: string } | null;
  };
};

type ReportPage = {
  data: Report[];
  current_page: number;
  last_page: number;
  total: number;
};

const REASON_LABELS: Record<string, string> = {
  spam: "Spam",
  harassment: "Harcèlement",
  spoiler: "Spoiler",
  off_topic: "Hors sujet",
  other: "Autre",
};

const STATUS_LABELS = { pending: "En attente", reviewed: "Traité", dismissed: "Ignoré" } as const;

export default function SignalementsPage() {
  return (
    <AdminGuard permission="admin.access">
      <SignalementsContent />
    </AdminGuard>
  );
}

function SignalementsContent() {
  const [data, setData] = useState<ReportPage | null>(null);
  const [status, setStatus] = useState("pending");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ status });
      if (page > 1) qs.set("page", String(page));
      setData(await apiGet<ReportPage>(`/admin/reports?${qs}`));
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => { void load(); }, [load]);

  async function resolve(id: number, newStatus: "reviewed" | "dismissed") {
    await apiSend(`/admin/reports/${id}`, "PATCH", { status: newStatus });
    void load();
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin" className="text-zinc-600 hover:text-zinc-400 text-sm">← Bureau Noir</Link>
        <span className="text-zinc-800">/</span>
        <h1 className="text-xl font-semibold text-zinc-100">Signalements</h1>
        {data && <span className="ml-auto text-xs text-zinc-600">{data.total} signalement{data.total !== 1 ? "s" : ""}</span>}
      </div>

      {/* Filtres */}
      <div className="mb-5 flex gap-2">
        {(["pending", "reviewed", "dismissed"] as const).map((s) => (
          <button key={s} onClick={() => { setStatus(s); setPage(1); }}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              status === s ? "bg-red-900 text-zinc-100" : "border border-zinc-800 text-zinc-400 hover:border-zinc-700"
            }`}>
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-zinc-600">Chargement…</div>
      ) : data?.data.length === 0 ? (
        <div className="py-12 text-center text-sm text-zinc-600">Aucun signalement.</div>
      ) : (
        <div className="divide-y divide-zinc-900 rounded-lg border border-zinc-900">
          {data?.data.map((report) => (
            <div key={report.id} className="p-4">
              {/* En-tête */}
              <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                <span className="font-medium text-zinc-300">{report.reporter.name}</span>
                <span className="rounded border border-amber-900/40 bg-amber-950/20 px-1.5 py-0.5 text-amber-400 uppercase tracking-wider">
                  {REASON_LABELS[report.reason] ?? report.reason}
                </span>
                {report.comment.story && (
                  <Link href={`/nouvelles/${report.comment.story.slug}`}
                    className="hover:text-zinc-300 truncate max-w-[180px]" title={report.comment.story.title}>
                    {report.comment.story.title}
                  </Link>
                )}
                <span className="ml-auto">
                  {new Date(report.createdAt).toLocaleDateString("fr-FR")}
                </span>
              </div>

              {/* Commentaire signalé */}
              <blockquote className="mb-2 border-l-2 border-zinc-800 pl-3 text-sm text-zinc-400 line-clamp-2">
                {report.comment.body}
              </blockquote>

              {/* Raison détaillée */}
              {report.body && (
                <p className="mb-2 text-xs text-zinc-600 italic">« {report.body} »</p>
              )}

              {/* Actions */}
              {report.status === "pending" && (
                <div className="flex gap-2">
                  <button onClick={() => resolve(report.id, "reviewed")}
                    className="rounded px-2.5 py-1 text-xs text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition-colors">
                    Marquer traité
                  </button>
                  <button onClick={() => resolve(report.id, "dismissed")}
                    className="rounded px-2.5 py-1 text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
                    Ignorer
                  </button>
                </div>
              )}
              {report.status !== "pending" && report.resolver && (
                <p className="text-xs text-zinc-700">
                  {STATUS_LABELS[report.status]} par {report.resolver.name}
                  {report.resolvedAt ? ` le ${new Date(report.resolvedAt).toLocaleDateString("fr-FR")}` : ""}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {data && data.last_page > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
            className="rounded-md border border-zinc-800 px-3 py-1.5 text-xs text-zinc-400 hover:border-zinc-700 disabled:opacity-30">
            ← Précédent
          </button>
          <span className="text-xs text-zinc-600">{page} / {data.last_page}</span>
          <button disabled={page >= data.last_page} onClick={() => setPage((p) => p + 1)}
            className="rounded-md border border-zinc-800 px-3 py-1.5 text-xs text-zinc-400 hover:border-zinc-700 disabled:opacity-30">
            Suivant →
          </button>
        </div>
      )}
    </div>
  );
}
