import StarterKit from "@tiptap/starter-kit";
import type { Extensions } from "@tiptap/react";
import type { StoryDocument } from "@/lib/api";
import { Dialogue, Lore, Transmission, Violence } from "./customNodes";

/**
 * Extensions Tiptap de Nexus Noir.
 *
 * Volontairement restreint à ce qui sert à une nouvelle : titres (h2/h3),
 * gras, italique, barré, citation, listes, séparateur de scène (hr).
 * Le même jeu sert à l'éditeur, à l'aperçu et au rendu public (depuis le JSON).
 */
export const editorExtensions: Extensions = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
  }),
  Dialogue,
  Lore,
  Transmission,
  Violence,
];

/** Document vide par défaut (un paragraphe). */
export const emptyDoc: StoryDocument = {
  type: "doc",
  content: [{ type: "paragraph" }],
};
