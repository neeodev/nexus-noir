"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { bookmarkApi } from "./api";
import { useAuthContext } from "@/modules/auth/store";

// Store module-level pour survivre à la navigation (même pattern que badgeQueue)
let _slugs: Set<string> = new Set();
let _loaded = false;
let _listeners: Set<() => void> = new Set();

function notify() { _listeners.forEach((fn) => fn()); }

export const bookmarkStore = {
  isBookmarked(slug: string) { return _slugs.has(slug); },
  set(slugs: string[]) { _slugs = new Set(slugs); _loaded = true; notify(); },
  toggle(slug: string): boolean {
    if (_slugs.has(slug)) { _slugs.delete(slug); }
    else { _slugs.add(slug); }
    notify();
    return _slugs.has(slug);
  },
  clear() { _slugs = new Set(); _loaded = false; notify(); },
  get loaded() { return _loaded; },
  subscribe(fn: () => void): () => void {
    _listeners.add(fn);
    return () => { _listeners.delete(fn); };
  },
};
