import { generateHTML } from "@tiptap/html";
import { editorExtensions } from "./extensions";

export type EditorDoc = { type: string; content?: unknown[] } | null | undefined;

/**
 * Génère le HTML d'une nouvelle depuis son JSON Tiptap.
 *
 * Le HTML est dérivé d'un schéma contrôlé (nœuds/marques connus uniquement) :
 * pas de balise arbitraire, donc sûr. Fonctionne côté serveur (SSR public)
 * comme côté client (aperçu live).
 */
export function renderStoryHtml(doc: EditorDoc): string {
  if (!doc || typeof doc !== "object" || !("type" in doc)) return "";
  try {
    return generateHTML(doc as object, editorExtensions);
  } catch {
    return "";
  }
}

/**
 * Rend le contenu d'une nouvelle avec la typographie de lecture Nexus Noir.
 * Utilisé par la page publique ET l'aperçu de l'éditeur (rendu identique).
 */
export function StoryContent({ doc }: { doc: EditorDoc }) {
  const html = renderStoryHtml(doc);
  return (
    <div
      className="nn-prose"
      // HTML dérivé du JSON contrôlé Tiptap (schéma restreint), donc sûr.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
