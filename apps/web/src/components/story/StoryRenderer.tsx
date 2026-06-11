import type { InlineNode, StoryBlock, StoryDocument } from "@/lib/api";

/**
 * Rendu d'un document Nexus Noir.
 *
 * Chaque type de bloc a un rendu contrôlé. Tout type inconnu est ignoré
 * silencieusement — le rendu public ne dépend jamais de HTML arbitraire.
 */

function renderInline(nodes: InlineNode[]) {
  return nodes.map((node, i) => {
    if (node.type === "text") {
      return <span key={i}>{node.text}</span>;
    }
    return null;
  });
}

function Block({ block }: { block: StoryBlock }) {
  switch (block.type) {
    case "heading": {
      const cls = "font-semibold tracking-tight text-zinc-100";
      if (block.level === 1) {
        return <h1 className={`text-3xl sm:text-4xl ${cls} mb-8`}>{block.content}</h1>;
      }
      if (block.level === 2) {
        return <h2 className={`text-2xl ${cls} mt-10 mb-4`}>{block.content}</h2>;
      }
      return <h3 className={`text-xl ${cls} mt-8 mb-3`}>{block.content}</h3>;
    }

    case "paragraph":
      return (
        <p className="mb-5 leading-relaxed text-zinc-300">{renderInline(block.content)}</p>
      );

    case "dialogue":
      return (
        <p className="mb-5 border-l-2 border-red-900/60 pl-4 leading-relaxed text-zinc-200">
          {block.speaker && (
            <span className="mr-2 text-xs uppercase tracking-widest text-red-500/80">
              {block.speaker}
            </span>
          )}
          <span className="italic">— {renderInline(block.content)}</span>
        </p>
      );

    case "quote":
      return (
        <blockquote className="my-8 border-l-4 border-zinc-700 pl-5 text-lg italic text-zinc-400">
          {renderInline(block.content)}
        </blockquote>
      );

    case "author_note":
      return (
        <aside className="my-8 rounded-md border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-500">
          <span className="mr-2 uppercase tracking-widest text-zinc-600">Note</span>
          {renderInline(block.content)}
        </aside>
      );

    case "content_warning":
      return (
        <div className="my-6 rounded-md border border-amber-900/50 bg-amber-950/30 px-4 py-3 text-sm text-amber-300/90">
          ⚠ Avertissement — {block.label}
        </div>
      );

    case "scene_break":
      return (
        <div className="my-10 text-center text-2xl tracking-[0.5em] text-zinc-700 select-none">
          · · ·
        </div>
      );

    default:
      return null;
  }
}

export function StoryRenderer({ document }: { document: StoryDocument }) {
  return (
    <div>
      {document.blocks.map((block) => (
        <Block key={block.id} block={block} />
      ))}
    </div>
  );
}
