"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { Badge } from "@/modules/auth/api";
import { BadgeToast } from "./BadgeToast";
import { badgeQueue } from "./badgeQueue";

type NotifyFn = (badges: Badge[]) => void;

const Ctx = createContext<NotifyFn>(() => {});

export function useBadgeNotify(): NotifyFn {
  return useContext(Ctx);
}

type ToastItem = { id: number; badge: Badge };

export function BadgeNotificationProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<ToastItem[]>([]);
  const nextIdRef = useRef(0);

  const addToast = useCallback((badges: Badge[]) => {
    if (!badges.length) return;
    const items = badges.map((badge) => ({ id: ++nextIdRef.current, badge }));
    setQueue((q) => [...q, ...items]);
    items.forEach(({ id }) => {
      setTimeout(() => {
        setQueue((q) => q.filter((t) => t.id !== id));
      }, 5000);
    });
  }, []);

  // Subscribe to the module-level queue so notifications survive navigation.
  useEffect(() => {
    const pending = badgeQueue.flush();
    if (pending.length) addToast(pending);

    return badgeQueue.subscribe(() => {
      addToast(badgeQueue.flush());
    });
  }, [addToast]);

  // expose a stable notify that goes through the module-level queue
  const notify = useCallback<NotifyFn>((badges) => {
    badgeQueue.push(badges);
  }, []);

  const dismiss = useCallback((id: number) => {
    setQueue((q) => q.filter((t) => t.id !== id));
  }, []);

  return (
    <Ctx.Provider value={notify}>
      {children}
      {queue.length > 0 && (
        <div className="fixed bottom-6 right-4 z-50 flex flex-col gap-3 sm:right-6" aria-live="polite">
          {queue.map((item) => (
            <BadgeToast
              key={item.id}
              badge={item.badge}
              onDismiss={() => dismiss(item.id)}
            />
          ))}
        </div>
      )}
    </Ctx.Provider>
  );
}
