"use client";

import { useRef } from "react";
import {
  useEditor,
  useEditorState,
  EditorContent,
  type Editor,
  type Content,
} from "@tiptap/react";
import { editorExtensions, emptyDoc } from "../extensions";
import { mediaApi } from "../media";
import type { StoryDocument } from "@/lib/api";

/**
 * Éditeur WYSIWYG d'une nouvelle (Tiptap).
 * Remonte le document JSON à chaque frappe via onChange (aperçu + autosave).
 */
export function StoryEditor({
  initialContent,
  onChange,
}: {
  initialContent: StoryDocument | null;
  onChange: (doc: StoryDocument) => void;
}) {
  const editor = useEditor({
    extensions: editorExtensions,
    content: (initialContent ?? emptyDoc) as Content,
    immediatelyRender: false, // évite un mismatch d'hydratation SSR
    editorProps: {
      attributes: {
        class: "nn-prose nn-editor min-h-[24rem] focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getJSON() as StoryDocument),
  });

  if (!editor) return null;

  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-950">
      <Toolbar editor={editor} />
      <div className="px-4 py-3">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const s = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      strike: editor.isActive("strike"),
      h2: editor.isActive("heading", { level: 2 }),
      h3: editor.isActive("heading", { level: 3 }),
      quote: editor.isActive("blockquote"),
      bullet: editor.isActive("bulletList"),
      ordered: editor.isActive("orderedList"),
      dialogue: editor.isActive("dialogue"),
      lore: editor.isActive("lore"),
      transmission: editor.isActive("transmission"),
      violence: editor.isActive("violence"),
    }),
  });

  function promptSpeaker() {
    const speaker = window.prompt("Locuteur (laisser vide pour aucun) :", "");
    if (speaker === null) return;
    editor.chain().focus().setDialogue().setDialogueSpeaker(speaker.trim()).run();
  }

  const fileInput = useRef<HTMLInputElement>(null);

  async function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // permet de re-sélectionner le même fichier
    if (!file) return;
    try {
      const media = await mediaApi.upload(file);
      editor.chain().focus().setImage({ src: media.url, alt: media.alt ?? undefined }).run();
    } catch {
      window.alert("Échec de l'upload de l'image.");
    }
  }

  const Btn = ({
    active,
    onClick,
    label,
    title,
  }: {
    active?: boolean;
    onClick: () => void;
    label: string;
    title: string;
  }) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()} // garde le focus dans l'éditeur
      onClick={onClick}
      className={[
        "rounded px-2 py-1 text-sm transition-colors",
        active ? "bg-red-900 text-zinc-100" : "text-zinc-400 hover:bg-zinc-800",
      ].join(" ")}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-zinc-800 px-2 py-2">
      <Btn title="Gras" label="G" active={s.bold} onClick={() => editor.chain().focus().toggleBold().run()} />
      <Btn title="Italique" label="I" active={s.italic} onClick={() => editor.chain().focus().toggleItalic().run()} />
      <Btn title="Barré" label="S" active={s.strike} onClick={() => editor.chain().focus().toggleStrike().run()} />
      <span className="mx-1 h-5 w-px bg-zinc-800" />
      <Btn title="Titre" label="H2" active={s.h2} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
      <Btn title="Sous-titre" label="H3" active={s.h3} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
      <span className="mx-1 h-5 w-px bg-zinc-800" />
      <Btn title="Citation" label="❝" active={s.quote} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
      <Btn title="Liste à puces" label="•" active={s.bullet} onClick={() => editor.chain().focus().toggleBulletList().run()} />
      <Btn title="Liste numérotée" label="1." active={s.ordered} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
      <span className="mx-1 h-5 w-px bg-zinc-800" />
      <Btn title="Séparateur de scène" label="· · ·" onClick={() => editor.chain().focus().setHorizontalRule().run()} />
      <span className="mx-1 h-5 w-px bg-zinc-800" />
      <Btn title="Dialogue (avec locuteur)" label="💬" active={s.dialogue} onClick={promptSpeaker} />
      <Btn title="Bloc lore" label="Lore" active={s.lore} onClick={() => editor.chain().focus().toggleLore().run()} />
      <Btn title="Bloc transmission" label="Transm." active={s.transmission} onClick={() => editor.chain().focus().toggleTransmission().run()} />
      <Btn title="Violence (mise en avant)" label="⚠ Violence" active={s.violence} onClick={() => editor.chain().focus().toggleViolence().run()} />
      <span className="mx-1 h-5 w-px bg-zinc-800" />
      <Btn title="Insérer une image" label="🖼" onClick={() => fileInput.current?.click()} />
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageFile}
      />
    </div>
  );
}
