"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/Modal";
import { SPEAKER_COLORS } from "../customNodes";
import { universeApi, type UniverseEntry } from "@/modules/universe/api";

type Props = {
  initial: { speaker: string; colorIdx: number; characterSlug?: string | null };
  onConfirm: (speaker: string, colorIdx: number, characterSlug: string | null) => void;
  onClose: () => void;
};

export function SpeakerModal({ initial, onConfirm, onClose }: Props) {
  const [name, setName] = useState(initial.speaker);
  const [colorIdx, setColorIdx] = useState(initial.colorIdx);
  const [characterSlug, setCharacterSlug] = useState<string | null>(initial.characterSlug ?? null);
  const [freeText, setFreeText] = useState(!initial.characterSlug && !!initial.speaker);

  const [characters, setCharacters] = useState<UniverseEntry[]>([]);
  const [loadingChars, setLoadingChars] = useState(true);

  useEffect(() => {
    universeApi.list("character")
      .then((res) => setCharacters(res.data))
      .catch(() => {/* silently ignore */})
      .finally(() => setLoadingChars(false));
  }, []);

  function selectCharacter(c: UniverseEntry) {
    setName(c.name);
    setCharacterSlug(c.slug);
    setFreeText(false);
  }

  function switchToFreeText() {
    setCharacterSlug(null);
    setFreeText(true);
  }

  function handleConfirm() {
    onConfirm(name.trim(), colorIdx, characterSlug);
    onClose();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) handleConfirm();
  }

  const selectedChar = characters.find((c) => c.slug === characterSlug);

  return (
    <Modal onClose={onClose}>
      <p className="mb-5 text-xs uppercase tracking-widest text-zinc-600">Bloc dialogue</p>

      {/* Sélecteur de personnage */}
      <div className="mb-4">
        <span className="mb-2 block text-xs uppercase tracking-widest text-zinc-500">
          Locuteur
        </span>

        {!freeText ? (
          <div className="space-y-1">
            {loadingChars ? (
              <p className="text-xs text-zinc-600">Chargement…</p>
            ) : characters.length === 0 ? (
              <p className="text-xs text-zinc-600">
                Aucun personnage dans l'univers.{" "}
                <button type="button" onClick={switchToFreeText} className="text-zinc-400 underline">
                  Écrire librement
                </button>
              </p>
            ) : (
              <div className="max-h-40 overflow-y-auto rounded-md border border-zinc-800 bg-zinc-950">
                {/* Option sans locuteur */}
                <button
                  type="button"
                  onClick={() => { setName(""); setCharacterSlug(null); setFreeText(false); }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-zinc-900 ${!characterSlug && !name ? "bg-zinc-900 text-zinc-200" : "text-zinc-500"}`}
                >
                  <span className="text-xs italic">Sans locuteur</span>
                </button>
                {characters.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => selectCharacter(c)}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-zinc-900 ${c.slug === characterSlug ? "bg-zinc-900 text-zinc-100" : "text-zinc-400"}`}
                  >
                    {c.coverImage && (
                      <img src={c.coverImage} alt={c.name} className="h-5 w-5 shrink-0 rounded-full object-cover" />
                    )}
                    <span>{c.name}</span>
                    {c.slug === characterSlug && (
                      <span className="ml-auto text-xs text-red-400">✓</span>
                    )}
                  </button>
                ))}
                <div className="border-t border-zinc-800/60">
                  <button
                    type="button"
                    onClick={switchToFreeText}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-zinc-600 hover:bg-zinc-900 hover:text-zinc-400"
                  >
                    + Personnage hors-univers (texte libre)
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nom du personnage…"
              autoFocus
              className="w-full rounded-md border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-red-900/60"
            />
            {characters.length > 0 && (
              <button
                type="button"
                onClick={() => { setFreeText(false); }}
                className="text-xs text-zinc-600 hover:text-zinc-400"
              >
                ← Choisir depuis l'univers
              </button>
            )}
          </div>
        )}
      </div>

      {/* Prévisualisation du nom */}
      {(name.trim() || selectedChar) && (
        <p className="mb-4 text-xs" style={{ color: SPEAKER_COLORS[colorIdx] }}>
          {name.trim() || selectedChar?.name}
          {selectedChar && (
            <span className="ml-1 text-zinc-600">· lié à l'univers</span>
          )}
        </p>
      )}

      {/* Couleur */}
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
