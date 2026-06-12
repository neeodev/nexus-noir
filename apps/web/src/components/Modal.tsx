"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  onClose?: () => void;
  children: React.ReactNode;
  /** Largeur max du panneau (défaut sm) */
  size?: "sm" | "md";
};

export function Modal({ onClose, children, size = "sm" }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const maxW = size === "md" ? "max-w-md" : "max-w-sm";

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(2px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className={`w-full ${maxW} rounded-xl border border-zinc-800 bg-[#0d0d10] p-6 shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

const btnBase =
  "rounded border px-4 py-2 text-xs uppercase tracking-widest transition-colors";

export function ConfirmModal({
  title,
  message,
  confirmLabel = "Confirmer",
  danger = false,
  onConfirm,
  onCancel,
}: {
  title?: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal onClose={onCancel}>
      {title && (
        <p className="mb-3 text-xs uppercase tracking-widest text-zinc-600">{title}</p>
      )}
      <p className="mb-6 text-sm leading-relaxed text-zinc-300">{message}</p>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className={`${btnBase} border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300`}
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={
            danger
              ? `${btnBase} border-red-900 bg-red-950/50 text-red-300 hover:bg-red-900/60`
              : `${btnBase} border-zinc-700 bg-zinc-800/60 text-zinc-200 hover:bg-zinc-700/60`
          }
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
