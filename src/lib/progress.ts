"use client";
import { useCallback, useSyncExternalStore } from "react";

/**
 * Per-learner mastery, kept in this browser only. A lesson counts as mastered once
 * every checkpoint question has been answered correctly at least once.
 */
type Store = Record<string, number[]>;
const KEY = "algomotion.progress.v1";
const listeners = new Set<() => void>();
let cache: Store | null = null;

function read(): Store {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Store;
  } catch {
    cache = {};
  }
  return cache;
}

function write(next: Store) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable (private mode) — progress lives for this session only */
  }
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const EMPTY: Store = {};

export function useProgress() {
  const store = useSyncExternalStore(subscribe, read, () => EMPTY);
  const markCorrect = useCallback((slug: string, q: number) => {
    const cur = read();
    const have = cur[slug] ?? [];
    if (have.includes(q)) return;
    write({ ...cur, [slug]: [...have, q] });
  }, []);
  const reset = useCallback(() => write({}), []);
  return { store, markCorrect, reset };
}

export const masteredCount = (store: Store, slug: string) => (store[slug] ?? []).length;
export const isMastered = (store: Store, slug: string, total: number) => (store[slug] ?? []).length >= total;
