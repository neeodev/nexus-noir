import type { Metadata } from "next";
import Link from "next/link";
import { universeApi, TYPE_LABELS_PLURAL, type UniverseEntryType, type UniverseEntry } from "@/modules/universe/api";

export const metadata: Metadata = {
  title: "Cartographie",
  description: "Personnages, lieux et factions de l'univers Nexus Noir.",
};

const TYPE_ORDER: UniverseEntryType[] = ["character", "place", "faction", "event", "concept"];

const TYPE_COLORS: Record<UniverseEntryType, string> = {
  character: "border-red-900/50 text-red-400",
  place:     "border-blue-900/50 text-blue-400",
  faction:   "border-amber-900/50 text-amber-400",
  event:     "border-purple-900/50 text-purple-400",
  concept:   "border-zinc-700 text-zinc-500",
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
      <div className="mb-12 border-l-2 border-red-900/50 pl-5">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Cartographie</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Archives de l'univers Nexus Noir — personnages, lieux, factions et événements.
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
      className="group rounded-lg border border-zinc-900 bg-zinc-950/40 p-4 transition-colors hover:border-red-900/40"
    >
      {entry.coverImage && (
        <div className="mb-3 h-32 w-full overflow-hidden rounded-md bg-zinc-900">
          <img src={entry.coverImage} alt={entry.name}
            className="h-full w-full object-cover opacity-70 transition-opacity group-hover:opacity-90" />
        </div>
      )}
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium text-zinc-100">{entry.name}</span>
        <span className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-wider ${colorClass}`}>
          {entry.typeLabel}
        </span>
      </div>
      {entry.summary && (
        <p className="mt-1.5 line-clamp-2 text-xs text-zinc-500">{entry.summary}</p>
      )}
    </Link>
  );
}
