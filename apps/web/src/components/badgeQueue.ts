import type { Badge } from "@/modules/auth/api";

// Module-level queue — persists across component mounts/unmounts and navigations.
let _pending: Badge[] = [];
let _listener: (() => void) | null = null;

export const badgeQueue = {
  push(badges: Badge[]) {
    if (!badges.length) return;
    _pending = [..._pending, ...badges];
    _listener?.();
  },
  flush(): Badge[] {
    const items = [..._pending];
    _pending = [];
    return items;
  },
  subscribe(fn: () => void): () => void {
    _listener = fn;
    return () => {
      _listener = null;
    };
  },
};
