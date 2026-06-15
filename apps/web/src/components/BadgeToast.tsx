"use client";

import type { Badge } from "@/modules/auth/api";
import { BadgeIcon } from "./BadgeIcon";

export function BadgeToast({
  badge,
  onDismiss,
}: {
  badge: Badge;
  onDismiss: () => void;
}) {
  return (
    <div
      className="animate-slide-up relative rounded-lg border border-zinc-800 bg-zinc-950 p-4 flex items-center gap-4 shadow-2xl"
      style={{ borderLeftColor: badge.rarityColor, borderLeftWidth: "3px" }}
    >
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Fermer"
        className="absolute right-2 top-2 text-zinc-700 hover:text-zinc-400"
      >
        ×
      </button>
      <div className="shrink-0" style={{ color: badge.rarityColor }}>
        <BadgeIcon name={badge.icon} className="h-8 w-8" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-widest text-zinc-500">
          Marque débloquée
        </p>
        <p className="text-sm font-semibold text-zinc-100">{badge.name}</p>
        <p
          className="text-[10px] uppercase tracking-wider"
          style={{ color: badge.rarityColor }}
        >
          {badge.rarityLabel}
        </p>
      </div>
    </div>
  );
}
