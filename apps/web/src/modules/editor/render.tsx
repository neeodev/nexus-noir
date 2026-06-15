import { generateHTML } from "@tiptap/html";
import { editorExtensions } from "./extensions";

export type EditorDoc = { type: string; content?: unknown[] } | null | undefined;

/**
 * Dialogue a content:"inline*", mais les LLMs enveloppent parfois le texte dans un
 * paragraph. generateHTML produirait alors <p><p>texte</p></p> (HTML invalide) et
 * le navigateur sort le contenu du bloc. On unwrap les paragraphes imbriqués
 * uniquement à l'intérieur des nœuds dialogue, avant de passer à generateHTML.
 */
function normalizeDialogue(node: unknown): unknown {
  if (!node || typeof node !== "object") return node;
  const n = node as Record<string, unknown>;
  if (!Array.isArray(n.content)) return n;

  if (n.type === "dialogue") {
    const unwrapped = (n.content as Record<string, unknown>[]).flatMap((child) => {
      if (child.type === "paragraph" && Array.isArray(child.content)) {
        return child.content as Record<string, unknown>[];
      }
      return [child];
    });
    return { ...n, content: unwrapped };
  }

  return { ...n, content: (n.content as unknown[]).map(normalizeDialogue) };
}

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
    return generateHTML(normalizeDialogue(doc) as object, editorExtensions);
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
