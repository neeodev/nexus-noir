"use client";

import { useEffect } from "react";
import { trackView } from "@/lib/api";
import { useBadgeNotify } from "./BadgeNotificationProvider";

export function StoryViewTracker({ slug }: { slug: string }) {
  const notify = useBadgeNotify();

  useEffect(() => {
    const timer = setTimeout(async () => {
      const result = await trackView(slug);
      if (result.newBadges?.length) {
        notify(result.newBadges);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [slug, notify]);

  return null;
}
