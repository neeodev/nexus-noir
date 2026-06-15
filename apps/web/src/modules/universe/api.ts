import { apiGet, apiSend } from "@/lib/http";

export type UniverseEntryType = "character" | "place" | "faction" | "event" | "concept";

export const TYPE_LABELS: Record<UniverseEntryType, string> = {
  character: "Personnage",
  place: "Lieu",
  faction: "Faction",
  event: "Événement",
  concept: "Concept",
};

export const TYPE_LABELS_PLURAL: Record<UniverseEntryType, string> = {
  character: "Personnages",
  place: "Lieux",
  faction: "Factions",
  event: "Événements",
  concept: "Concepts",
};

export type UniverseEntry = {
  id: number;
  type: UniverseEntryType;
  typeLabel: string;
  name: string;
  slug: string;
  summary: string | null;
  content?: unknown;
  meta: Record<string, unknown> | null;
  coverImage: string | null;
  isHidden: boolean;
  isLocked: boolean;
  unlockCondition?: { type: string; value: string } | null;
  sortOrder: number;
  stories?: { slug: string; title: string }[];
  related?: { slug: string; name: string; type: string; typeLabel: string; coverImage: string | null; relationType: string }[];
};

type Wrapped<T> = { data: T };

const BASE = "/universe";

export const universeApi = {
  list(type?: string): Promise<Wrapped<UniverseEntry[]>> {
    const qs = type ? `?type=${type}` : "";
    return apiGet<Wrapped<UniverseEntry[]>>(`${BASE}${qs}`);
  },

  show(slug: string): Promise<Wrapped<UniverseEntry>> {
    return apiGet<Wrapped<UniverseEntry>>(`${BASE}/${slug}`);
  },
};

export const adminUniverseApi = {
  list(): Promise<Wrapped<UniverseEntry[]>> {
    return apiGet<Wrapped<UniverseEntry[]>>("/admin/universe");
  },

  show(id: number): Promise<Wrapped<UniverseEntry>> {
    return apiGet<Wrapped<UniverseEntry>>(`/admin/universe/${id}`);
  },

  create(data: Partial<UniverseEntry> & { story_ids?: number[]; related_ids?: number[] }): Promise<Wrapped<UniverseEntry>> {
    return apiSend<Wrapped<UniverseEntry>>("/admin/universe", "POST", data);
  },

  update(id: number, data: Partial<UniverseEntry> & { story_ids?: number[]; related_ids?: number[] }): Promise<Wrapped<UniverseEntry>> {
    return apiSend<Wrapped<UniverseEntry>>(`/admin/universe/${id}`, "PATCH", data);
  },

  delete(id: number): Promise<unknown> {
    return apiSend<unknown>(`/admin/universe/${id}`, "DELETE");
  },
};
