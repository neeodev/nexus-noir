"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/modules/auth/hooks";
import { ApiError } from "@/lib/http";
import { reactionsApi, type ReactionSummary } from "../api";

export function ReactionBar({ slug }: { slug: string }) {
  const router = useRouter();
  const { isAuthenticated, status } = useAuth();
  const [summary, setSummary] = useState<ReactionSummary | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  // Recharge le résumé quand l'état d'auth est résolu (pour récupérer userReaction).
  useEffect(() => {
    if (status === "loading") return;
    let active = true;
    reactionsApi
      .get(slug)
      .then((s) => {
        if (active) setSummary(s);
      })
      .catch(() => {
        if (active) setSummary(null);
      });
    return () => {
      active = false;
    };
  }, [slug, status]);

  async function handleClick(type: string) {
    if (!isAuthenticated) {
      router.push("/connexion");
      return;
    }
    setPending(type);
    try {
      const updated = await reactionsApi.toggle(slug, type);
      setSummary(updated);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        router.push("/connexion");
      }
    } finally {
      setPending(null);
    }
  }

  if (!summary) {
    return <div className="mt-12 border-t border-zinc-900 pt-6 text-sm text-zinc-700">…</div>;
  }

  return (
    <div className="mt-12 border-t border-zinc-900 pt-6">
      <p className="mb-4 text-xs uppercase tracking-widest text-zinc-600">
        Ton impact{!isAuthenticated && " — connecte-toi pour réagir"}
      </p>
      <div className="flex flex-wrap gap-2">
        {summary.reactions.map((reaction) => {
          const active = summary.userReaction === reaction.type;
          return (
            <button
              key={reaction.type}
              type="button"
              onClick={() => handleClick(reaction.type)}
              disabled={pending !== null}
              title={reaction.label}
              className={[
                "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors disabled:opacity-50",
                active
                  ? "border-red-700 bg-red-950/50 text-red-200"
                  : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700",
              ].join(" ")}
            >
              <span aria-hidden>{reaction.emoji}</span>
              <span>{reaction.label}</span>
              {reaction.count > 0 && (
                <span className="text-xs text-zinc-500">{reaction.count}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
