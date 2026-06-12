import { Node, mergeAttributes } from "@tiptap/core";

/**
 * Blocs propres à Nexus Noir.
 *
 * Ce sont des nœuds Tiptap PURS (schéma + parse/renderHTML), sans NodeView
 * React : le même jeu d'extensions sert au rendu serveur (generateHTML) comme
 * à l'éditeur. Le style vient du CSS (.nn-prose [data-nn=...]).
 */

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    nexusBlocks: {
      setDialogue: () => ReturnType;
      setDialogueSpeaker: (speaker: string) => ReturnType;
      toggleLore: () => ReturnType;
      toggleTransmission: () => ReturnType;
      toggleViolence: () => ReturnType;
    };
  }
}

/**
 * Palette de 8 couleurs pour les locuteurs de dialogue.
 * La couleur est dérivée du nom via un hash → même nom = même couleur partout.
 * Index 0 = rouge (couleur principale Nexus Noir), autres = couleurs distinctes.
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

function speakerColorIndex(name: string): number {
  if (!name) return 0;
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % SPEAKER_COLORS.length;
}

/** Réplique de dialogue, avec un locuteur optionnel (couleur dérivée du nom). */
export const Dialogue = Node.create({
  name: "dialogue",
  group: "block",
  content: "inline*",
  defining: true,

  addAttributes() {
    return {
      speaker: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-speaker"),
        renderHTML: (attrs) =>
          attrs.speaker ? { "data-speaker": attrs.speaker } : {},
      },
    };
  },

  parseHTML() {
    return [{ tag: 'p[data-nn="dialogue"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const speaker: string = HTMLAttributes.speaker ?? "";
    const colorIdx = speakerColorIndex(speaker);
    return [
      "p",
      mergeAttributes(HTMLAttributes, {
        "data-nn": "dialogue",
        ...(speaker ? { "data-speaker-color": String(colorIdx) } : {}),
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setDialogue:
        () =>
        ({ commands }) =>
          commands.setNode(this.name),
      setDialogueSpeaker:
        (speaker: string) =>
        ({ commands }) =>
          commands.updateAttributes(this.name, { speaker }),
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
    return ["aside", mergeAttributes(HTMLAttributes, { "data-nn": "transmission" }), 0];
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

/** Bloc violence : passage violent mis en avant (avertissement fort). */
export const Violence = Node.create({
  name: "violence",
  group: "block",
  content: "block+",
  defining: true,
  parseHTML() {
    return [{ tag: 'aside[data-nn="violence"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["aside", mergeAttributes(HTMLAttributes, { "data-nn": "violence" }), 0];
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
