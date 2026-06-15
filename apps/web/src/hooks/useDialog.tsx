"use client";

import { useCallback, useState } from "react";
import { Modal } from "@/components/Modal";

type DialogState =
  | { type: "confirm"; message: string; title?: string; danger?: boolean; confirmLabel?: string; resolve: (v: boolean) => void }
  | { type: "alert";   message: string; title?: string;                                          resolve: () => void }
  | null;

const btnBase = "rounded border px-4 py-2 text-xs uppercase tracking-widest transition-colors";

/**
 * Hook partagé — remplace window.confirm et window.alert dans tout l'admin.
 *
 * Usage :
 *   const { confirm, alert, dialogNode } = useDialog();
 *   const ok = await confirm("Supprimer ?", { danger: true });
 *   await alert("Opération échouée.");
 *   // Rendre {dialogNode} dans le JSX.
 */
export function useDialog() {
  const [state, setState] = useState<DialogState>(null);

  const confirm = useCallback(
    (message: string, opts?: { title?: string; danger?: boolean; confirmLabel?: string }): Promise<boolean> =>
      new Promise((resolve) =>
        setState({ type: "confirm", message, resolve, ...opts }),
      ),
    [],
  );

  const alert = useCallback(
    (message: string, opts?: { title?: string }): Promise<void> =>
      new Promise((resolve) =>
        setState({ type: "alert", message, resolve, ...opts }),
      ),
    [],
  );

  function close() { setState(null); }

  const dialogNode =
    state === null ? null : state.type === "confirm" ? (
      <Modal onClose={() => { state.resolve(false); close(); }}>
        {state.title && (
          <p className="mb-3 text-xs uppercase tracking-widest text-zinc-600">{state.title}</p>
        )}
        <p className="mb-6 text-sm leading-relaxed text-zinc-300">{state.message}</p>
        <div className="flex justify-end gap-2">
          <button type="button"
            onClick={() => { state.resolve(false); close(); }}
            className={`${btnBase} border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300`}>
            Annuler
          </button>
          <button type="button"
            onClick={() => { state.resolve(true); close(); }}
            className={state.danger
              ? `${btnBase} border-red-900 bg-red-950/50 text-red-300 hover:bg-red-900/60`
              : `${btnBase} border-zinc-700 bg-zinc-800/60 text-zinc-200 hover:bg-zinc-700/60`}>
            {state.confirmLabel ?? "Confirmer"}
          </button>
        </div>
      </Modal>
    ) : (
      <Modal onClose={() => { state.resolve(); close(); }}>
        {state.title && (
          <p className="mb-3 text-xs uppercase tracking-widest text-zinc-600">{state.title}</p>
        )}
        <p className="mb-6 text-sm leading-relaxed text-zinc-300">{state.message}</p>
        <div className="flex justify-end">
          <button type="button"
            onClick={() => { state.resolve(); close(); }}
            className={`${btnBase} border-zinc-700 bg-zinc-800/60 text-zinc-200 hover:bg-zinc-700/60`}>
            Fermer
          </button>
        </div>
      </Modal>
    );

  return { confirm, alert, dialogNode };
}
