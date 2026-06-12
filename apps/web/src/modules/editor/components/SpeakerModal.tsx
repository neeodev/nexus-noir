"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { SPEAKER_COLORS } from "../customNodes";

type Props = {
  initial: { speaker: string; colorIdx: number };
  onConfirm: (speaker: string, colorIdx: number) => void;
  onClose: () => void;
};

export function SpeakerModal({ initial, onConfirm, onClose }: Props) {
  const [name, setName] = useState(initial.speaker);
  const [colorIdx, setColorIdx] = useState(initial.colorIdx);

  function handleConfirm() {
    onConfirm(name.trim(), colorIdx);
    onClose();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) handleConfirm();
  }

  return (
    <Modal onClose={onClose}>
      <p className="mb-5 text-xs uppercase tracking-widest text-zinc-600">Bloc dialogue</p>

      <div className="mb-4">
        <label className="mb-1.5 block text-xs uppercase tracking-widest text-zinc-500">
          Locuteur (optionnel)
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nom du personnage…"
          autoFocus
          className="w-full rounded-md border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-red-900/60"
        />
      </div>

      <div className="mb-6">
        <span className="mb-2.5 block text-xs uppercase tracking-widest text-zinc-500">
          Couleur du locuteur
        </span>
        <div className="flex gap-2.5">
          {SPEAKER_COLORS.map((color, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setColorIdx(i)}
              title={`Couleur ${i + 1}`}
              style={{
                backgroundColor: color,
                boxShadow:
                  colorIdx === i
                    ? `0 0 0 2px #0d0d10, 0 0 0 4px ${color}`
                    : undefined,
              }}
              className="h-6 w-6 shrink-0 rounded-full transition-transform hover:scale-110"
            />
          ))}
        </div>
        {name.trim() && (
          <p className="mt-2.5 text-xs" style={{ color: SPEAKER_COLORS[colorIdx] }}>
            {name.trim()} — prévisualisation
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded border border-zinc-800 px-4 py-2 text-xs uppercase tracking-widest text-zinc-500 transition-colors hover:border-zinc-700 hover:text-zinc-300"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          className="rounded border border-zinc-700 bg-zinc-800/60 px-4 py-2 text-xs uppercase tracking-widest text-zinc-200 transition-colors hover:bg-zinc-700/60"
        >
          {name.trim() ? "Confirmer" : "Sans locuteur"}
        </button>
      </div>
    </Modal>
  );
}
