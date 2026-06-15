import { Node, mergeAttributes } from "@tiptap/core";

/**
 * Blocs propres à Nexus Noir.
 *
 * Nœuds Tiptap PURS (schéma + parse/renderHTML), sans NodeView React :
 * fonctionne à l'identique dans l'éditeur et dans le rendu serveur (generateHTML).
 * Le style vient du CSS (.nn-prose [data-nn=...]).
 */

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    nexusBlocks: {
      setDialogue: () => ReturnType;
      /** Définit le locuteur, sa couleur et son slug univers optionnel. */
      setDialogueSpeaker: (speaker: string, colorIdx: number, characterSlug?: string | null) => ReturnType;
      toggleLore: () => ReturnType;
      toggleTransmission: () => ReturnType;
      toggleViolence: () => ReturnType;
    };
  }
}

/**
 * Palette de 8 couleurs pour les locuteurs.
 * Choisie par l'utilisateur dans la SpeakerModal (pas calculée automatiquement).
 */
export const SPEAKER_COLORS = [
  "#f87171", // 0 rouge
  "#60a5fa", // 1 bleu
  "#34d399", // 2 émeraude
  "#fbbf24", // 3 ambre
  "#a78bfa", // 4 violet
  "#f472b6", // 5 rose
  "#22d3ee", // 6 cyan
  "#a3e635", // 7 lime
];

/** Réplique de dialogue avec locuteur optionnel et couleur explicite. */
export const Dialogue = Node.create({
  name: "dialogue",
  group: "block",
  content: "inline*",
  defining: true,

  addAttributes() {
    return {
      speaker: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-speaker") ?? null,
        renderHTML: (attrs) =>
          attrs.speaker ? { "data-speaker": attrs.speaker } : {},
      },
      speakerColor: {
        default: 0,
        parseHTML: (el) => {
          const v = el.getAttribute("data-speaker-color");
          return v !== null ? parseInt(v, 10) : 0;
        },
        renderHTML: (attrs) =>
          attrs.speaker
            ? { "data-speaker-color": String(attrs.speakerColor ?? 0) }
            : {},
      },
      characterSlug: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-character-slug") ?? null,
        renderHTML: (attrs) =>
          attrs.characterSlug ? { "data-character-slug": attrs.characterSlug } : {},
      },
    };
  },

  parseHTML() {
    return [{ tag: 'p[data-nn="dialogue"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["p", mergeAttributes(HTMLAttributes, { "data-nn": "dialogue" }), 0];
  },

  addCommands() {
    return {
      setDialogue:
        () =>
        ({ commands }) =>
          commands.setNode(this.name),
      setDialogueSpeaker:
        (speaker: string, colorIdx: number, characterSlug?: string | null) =>
        ({ commands }) =>
          commands.updateAttributes(this.name, {
            speaker: speaker || null,
            speakerColor: colorIdx,
            characterSlug: characterSlug ?? null,
          }),
    };
  },
});

/** Bloc lore : fragment d'univers. */
export const Lore = Node.create({
  name: "lore",
  group: "block",
  content: "block+",
  defining: true,
  parseHTML() {
    return [{ tag: 'aside[data-nn="lore"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["aside", mergeAttributes(HTMLAttributes, { "data-nn": "lore" }), 0];
  },
  addCommands() {
    return {
      toggleLore:
        () =>
        ({ commands }) =>
          commands.toggleWrap(this.name),
    };
  },
});

/** Bloc transmission : message intercepté. */
export const Transmission = Node.create({
  name: "transmission",
  group: "block",
  content: "block+",
  defining: true,
  parseHTML() {
    return [{ tag: 'aside[data-nn="transmission"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "aside",
      mergeAttributes(HTMLAttributes, { "data-nn": "transmission" }),
      0,
    ];
  },
  addCommands() {
    return {
      toggleTransmission:
        () =>
        ({ commands }) =>
          commands.toggleWrap(this.name),
    };
  },
});

/** Bloc violence : passage violent mis en avant. */
export const Violence = Node.create({
  name: "violence",
  group: "block",
  content: "block+",
  defining: true,
  parseHTML() {
    return [{ tag: 'aside[data-nn="violence"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "aside",
      mergeAttributes(HTMLAttributes, { "data-nn": "violence" }),
      0,
    ];
  },
  addCommands() {
    return {
      toggleViolence:
        () =>
        ({ commands }) =>
          commands.toggleWrap(this.name),
    };
  },
});
