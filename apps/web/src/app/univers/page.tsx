import type { Metadata } from "next";
import Link from "next/link";
import { universeApi, TYPE_LABELS_PLURAL, type UniverseEntryType, type UniverseEntry } from "@/modules/universe/api";

export const metadata: Metadata = {
  title: "Cartographie",
  description: "Personnages, lieux et factions de l'univers Nexus Noir.",
};

const TYPE_ORDER: UniverseEntryType[] = ["character", "place", "faction", "event", "concept"];

const TYPE_COLORS: Record<UniverseEntryType, string> = {
  character: "border-nn-red-dark/60 text-nn-text",
  place:     "border-nn-yellow/50 text-nn-yellow",
  faction:   "border-nn-purple/50 text-nn-purple",
  event:     "border-nn-cyan/40 text-nn-cyan",
  concept:   "border-nn-border text-nn-muted",
};

export default async function UniversPage() {
  const res = await universeApi.list();
  const entries = res.data;

  const byType = TYPE_ORDER.reduce<Record<string, UniverseEntry[]>>((acc, t) => {
    acc[t] = entries.filter((e) => e.type === t);
    return acc;
  }, {});

  const hasAny = entries.length > 0;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-12 border-l-2 border-nn-red-dark pl-6">
        <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.3em] text-nn-red-dark">
          — Base de données · Accès classifié —
        </p>
        <h1 className="font-heading text-4xl font-bold text-nn-text">Cartographie</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-nn-muted">
          Personnages, lieux, factions et événements de l&apos;univers Nexus Noir.
        </p>
      </div>

      {!hasAny && (
        <p className="text-sm text-zinc-600">Les archives sont vides pour l'instant.</p>
      )}

      {TYPE_ORDER.map((type) => {
        const group = byType[type];
        if (!group?.length) return null;
        return (
          <section key={type} className="mb-12">
            <h2 className="mb-5 text-xs uppercase tracking-widest text-zinc-600">
              {TYPE_LABELS_PLURAL[type]}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.map((entry) => (
                <EntryCard key={entry.id} entry={entry} colorClass={TYPE_COLORS[type]} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function EntryCard({ entry, colorClass }: { entry: UniverseEntry; colorClass: string }) {
  return (
    <Link
      href={`/univers/${entry.slug}`}
      className="group rounded-sm border border-nn-border/50 bg-nn-surface/40 p-4 transition-colors hover:border-nn-red-dark/60 hover:bg-nn-surface"
    >
      {entry.coverImage && (
        <div className="mb-3 h-32 w-full overflow-hidden rounded-md bg-zinc-900">
          <img src={entry.coverImage} alt={entry.name}
            className="h-full w-full object-cover opacity-70 transition-opacity group-hover:opacity-90" />
        </div>
      )}
      <div className="flex items-start justify-between gap-2">
        <span className="font-heading font-semibold text-nn-text group-hover:text-white transition-colors">{entry.name}</span>
        <span className={`shrink-0 rounded-sm border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider ${colorClass}`}>
          {entry.typeLabel}
        </span>
      </div>
      {entry.summary && (
        <p className="mt-1.5 line-clamp-2 text-xs text-nn-muted">{entry.summary}</p>
      )}
    </Link>
  );
}
