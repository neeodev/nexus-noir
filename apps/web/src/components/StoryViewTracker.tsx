"use client";

import { useEffect } from "react";
import { trackView } from "@/lib/api";

export function StoryViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      void trackView(slug);
    }, 5000);
    return () => clearTimeout(timer);
  }, [slug]);

  return null;
}
