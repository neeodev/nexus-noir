"use client";

import { useRef, useState } from "react";
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
import { SpeakerModal } from "./SpeakerModal";
import {
  IconDialogue,
  IconLore,
  IconTransmission,
  IconViolence,
  IconImage,
} from "./Icons";

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
    immediatelyRender: false,
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

type SpeakerModalState = { speaker: string; colorIdx: number } | null;

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

  const [speakerModal, setSpeakerModal] = useState<SpeakerModalState>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  function openSpeakerModal() {
    const attrs = editor.getAttributes("dialogue");
    setSpeakerModal({
      speaker: (attrs.speaker as string | null) ?? "",
      colorIdx: (attrs.speakerColor as number | undefined) ?? 0,
    });
  }

  function handleSpeakerConfirm(speaker: string, colorIdx: number) {
    editor
      .chain()
      .focus()
      .setDialogue()
      .setDialogueSpeaker(speaker, colorIdx)
      .run();
    setSpeakerModal(null);
  }

  async function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const media = await mediaApi.upload(file);
      editor
        .chain()
        .focus()
        .setImage({ src: media.url, alt: media.alt ?? undefined })
        .run();
    } catch {
      setUploadError("Échec de l'upload — vérifie le format et la taille.");
      setTimeout(() => setUploadError(null), 4000);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-1 border-b border-zinc-800 px-2 py-2">
        {/* Formatage de base */}
        <Btn title="Gras" label="G" active={s.bold} onClick={() => editor.chain().focus().toggleBold().run()} />
        <Btn title="Italique" label={<em>I</em>} active={s.italic} onClick={() => editor.chain().focus().toggleItalic().run()} />
        <Btn title="Barré" label={<s>S</s>} active={s.strike} onClick={() => editor.chain().focus().toggleStrike().run()} />
        <Sep />
        <Btn title="Titre H2" label="H2" active={s.h2} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
        <Btn title="Sous-titre H3" label="H3" active={s.h3} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
        <Sep />
        <Btn title="Citation" label="❝" active={s.quote} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
        <Btn title="Liste à puces" label="•" active={s.bullet} onClick={() => editor.chain().focus().toggleBulletList().run()} />
        <Btn title="Liste numérotée" label="1." active={s.ordered} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
        <Btn title="Séparateur de scène" label="· · ·" onClick={() => editor.chain().focus().setHorizontalRule().run()} />
        <Sep />
        {/* Blocs Nexus Noir */}
        <Btn
          title="Dialogue (avec locuteur)"
          label={<IconDialogue />}
          active={s.dialogue}
          onClick={openSpeakerModal}
        />
        <Btn
          title="Bloc Lore"
          label={<IconLore />}
          active={s.lore}
          onClick={() => editor.chain().focus().toggleLore().run()}
        />
        <Btn
          title="Transmission interceptée"
          label={<IconTransmission />}
          active={s.transmission}
          onClick={() => editor.chain().focus().toggleTransmission().run()}
        />
        <Btn
          title="Violence (mis en avant)"
          label={<IconViolence />}
          active={s.violence}
          onClick={() => editor.chain().focus().toggleViolence().run()}
        />
        <Sep />
        <Btn
          title="Insérer une image"
          label={<IconImage />}
          onClick={() => fileInput.current?.click()}
        />
        {uploadError && (
          <span className="ml-1 text-xs text-red-400">{uploadError}</span>
        )}
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageFile}
        />
      </div>

      {speakerModal !== null && (
        <SpeakerModal
          initial={speakerModal}
          onConfirm={handleSpeakerConfirm}
          onClose={() => setSpeakerModal(null)}
        />
      )}
    </>
  );
}

function Sep() {
  return <span className="mx-1 h-5 w-px bg-zinc-800" />;
}

function Btn({
  active,
  onClick,
  label,
  title,
}: {
  active?: boolean;
  onClick: () => void;
  label: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={[
        "flex items-center justify-center rounded px-2 py-1 text-sm transition-colors",
        active ? "bg-red-900 text-zinc-100" : "text-zinc-400 hover:bg-zinc-800",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
