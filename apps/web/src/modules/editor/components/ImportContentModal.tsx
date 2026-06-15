"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/react";
import { Modal } from "@/components/Modal";

type Mode = "json" | "html";

type Props = {
  editor: Editor;
  onClose: () => void;
};

export function ImportContentModal({ editor, onClose }: Props) {
  const [mode, setMode] = useState<Mode>("json");
  const [raw, setRaw] = useState("");
  const [error, setError] = useState<string | null>(null);

  function validate(): unknown {
    setError(null);
    const trimmed = raw.trim();
    if (!trimmed) { setError("Contenu vide."); return null; }

    if (mode === "json") {
      let parsed: unknown;
      try { parsed = JSON.parse(trimmed); } catch {
        setError("JSON invalide — vérifie la syntaxe."); return null;
      }
      if (typeof parsed !== "object" || parsed === null || (parsed as Record<string,unknown>).type !== "doc") {
        setError('Le JSON doit commencer par { "type": "doc", "content": [...] }'); return null;
      }
      return parsed;
    }

    return trimmed; // HTML : Tiptap gère le parsing
  }

  function handleReplace() {
    const content = validate();
    if (!content) return;
    editor.commands.setContent(content as Parameters<typeof editor.commands.setContent>[0]);
    onClose();
  }

  function handleInsert() {
    const content = validate();
    if (!content) return;
    editor.commands.insertContent(content as Parameters<typeof editor.commands.insertContent>[0]);
    onClose();
  }

  return (
    <Modal onClose={onClose}>
      <p className="mb-4 text-xs uppercase tracking-widest text-zinc-600">Importer du contenu</p>

      {/* Sélecteur de mode */}
      <div className="mb-4 flex gap-1 rounded-md border border-zinc-800 bg-zinc-900/50 p-1">
        {(["json", "html"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setError(null); }}
            className={`flex-1 rounded py-1 text-xs uppercase tracking-widest transition-colors ${
              mode === m ? "bg-zinc-800 text-zinc-200" : "text-zinc-600 hover:text-zinc-400"
            }`}
          >
            {m === "json" ? "JSON Tiptap" : "HTML"}
          </button>
        ))}
      </div>

      {/* Aide mode */}
      <p className="mb-3 text-xs text-zinc-600">
        {mode === "json"
          ? 'Colle un document Tiptap JSON { "type": "doc", "content": [...] }'
          : "Colle du HTML — Tiptap le convertira automatiquement."}
      </p>

      <textarea
        value={raw}
        onChange={(e) => { setRaw(e.target.value); setError(null); }}
        placeholder={mode === "json" ? '{\n  "type": "doc",\n  "content": [...]\n}' : "<h2>Titre</h2>\n<p>Contenu…</p>"}
        rows={12}
        className="mb-3 w-full resize-y rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-xs text-zinc-300 outline-none focus:border-red-900/60 placeholder:text-zinc-700"
        spellCheck={false}
        autoComplete="off"
      />

      {error && (
        <p className="mb-3 rounded border border-red-900/40 bg-red-950/20 px-3 py-2 text-xs text-red-400">{error}</p>
      )}

      {/* Référence des nodes custom */}
      <details className="mb-4">
        <summary className="cursor-pointer text-xs text-zinc-600 hover:text-zinc-400">
          Nodes custom Nexus Noir (à donner au LLM)
        </summary>
        <pre className="mt-2 overflow-x-auto rounded border border-zinc-800 bg-zinc-900/60 p-3 text-[10px] leading-relaxed text-zinc-400">{NODES_REFERENCE}</pre>
      </details>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose}
          className="rounded border border-zinc-800 px-4 py-2 text-xs uppercase tracking-widest text-zinc-500 hover:border-zinc-700 hover:text-zinc-300">
          Annuler
        </button>
        <button type="button" onClick={handleInsert}
          className="rounded border border-zinc-700 px-4 py-2 text-xs uppercase tracking-widest text-zinc-300 hover:bg-zinc-800">
          Insérer à la fin
        </button>
        <button type="button" onClick={handleReplace}
          className="rounded bg-red-950 px-4 py-2 text-xs uppercase tracking-widest text-red-300 hover:bg-red-900">
          Remplacer
        </button>
      </div>
    </Modal>
  );
}

const NODES_REFERENCE = `Extensions actives : StarterKit + Image + nodes custom.

Nodes standards (StarterKit) :
  paragraph, heading (level 2|3), bold, italic, strike,
  blockquote, bulletList, orderedList, listItem,
  horizontalRule, hardBreak

Node image :
  { "type": "image", "attrs": { "src": "URL", "alt": "texte" } }

Nodes custom Nexus Noir :
  dialogue — réplique avec locuteur optionnel
    attrs: speaker (string|null), speakerColor (0-7), characterSlug (string|null)
    couleurs: 0=rouge 1=bleu 2=vert 3=ambre 4=violet 5=rose 6=cyan 7=lime

  lore — bloc univers (aside)
  transmission — message intercepté (aside)
  violence — passage violent (aside)
    → ces trois wrappent des blocs (content: block+)

Exemple dialogue (le texte doit être INLINE — sans balise paragraph intermédiaire) :
{
  "type": "dialogue",
  "attrs": { "speaker": "Nom", "speakerColor": 1, "characterSlug": null },
  "content": [{ "type": "text", "text": "Réplique du personnage." }]
}
⚠ Si le LLM enveloppe dans un paragraph, le rendu public sera corrigé automatiquement,
  mais l'éditeur affichera aussi correctement (il normalise le schéma à l'import).

Exemple lore :
{
  "type": "lore",
  "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Fragment d'univers." }] }]
}`;
