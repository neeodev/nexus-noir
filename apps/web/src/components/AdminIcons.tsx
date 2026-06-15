/** Icônes SVG pour les actions admin. Taille via className (défaut h-3.5 w-3.5). */

type P = { className?: string };
const D = "h-3.5 w-3.5";

export const IcoEdit    = ({ className = D }: P) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

export const IcoTrash   = ({ className = D }: P) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

export const IcoEye     = ({ className = D }: P) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

export const IcoPublish = ({ className = D }: P) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"/>
    <line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
);

export const IcoUnpublish = ({ className = D }: P) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="3" x2="12" y2="15"/>
    <polyline points="8 11 12 15 16 11"/>
    <path d="M20 21H4"/>
  </svg>
);

export const IcoArchive = ({ className = D }: P) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="21 8 21 21 3 21 3 8"/>
    <rect x="1" y="3" width="22" height="5"/>
    <line x1="10" y1="12" x2="14" y2="12"/>
  </svg>
);

export const IcoRestore = ({ className = D }: P) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"/>
    <path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
  </svg>
);

export const IcoPlus    = ({ className = D }: P) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

export const IcoExternalLink = ({ className = D }: P) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/>
    <line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

// ──────────────────────────────────────────────────────────────
// Bouton icône réutilisable pour les listes admin
// ──────────────────────────────────────────────────────────────

type BtnVariant = "neutral" | "green" | "red";

const BTN_CLS: Record<BtnVariant, string> = {
  neutral: "border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-200",
  green:   "border-emerald-900/50 text-emerald-700 hover:border-emerald-700 hover:text-emerald-400",
  red:     "border-red-900/40 text-red-900 hover:border-red-700 hover:text-red-500",
};

export function AdminIconBtn({
  icon,
  title,
  onClick,
  variant = "neutral",
  disabled = false,
  href,
  target,
}: {
  icon: React.ReactNode;
  title: string;
  onClick?: () => void;
  variant?: BtnVariant;
  disabled?: boolean;
  href?: string;
  target?: string;
}) {
  const cls = `inline-flex h-7 w-7 items-center justify-center rounded border transition-colors disabled:opacity-30 ${BTN_CLS[variant]}`;

  if (href) {
    return (
      <a href={href} target={target} title={title} className={cls}>
        {icon}
      </a>
    );
  }

  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cls}
    >
      {icon}
    </button>
  );
}
