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

/** Réplique de dialogue, avec un locuteur optionnel (affiché en CSS via data-speaker). */
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
    return ["p", mergeAttributes(HTMLAttributes, { "data-nn": "dialogue" }), 0];
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
