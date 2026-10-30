"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

const listeners = new Set<() => void>();
const memory = new Map<string, string>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};
const clientReady = () => true;
const serverReady = () => false;

function read(key: string): string | null {
  try { return sessionStorage.getItem(key) ?? memory.get(key) ?? null; }
  catch { return memory.get(key) ?? null; }
}

function write(key: string, value: string) {
  memory.set(key, value);
  try { sessionStorage.setItem(key, value); } catch { /* Storage may be disabled. */ }
}

/** Remember list controls within this tab, without storing post data. */
export function useListState<T>(key: string, initial: T) {
  const storageKey = `list-state:v1:${key}`;
  const fallback = JSON.stringify(initial);
  const snapshot = useSyncExternalStore(
    subscribe,
    () => read(storageKey) ?? fallback,
    () => fallback,
  );
  let value: T = initial;
  try { value = JSON.parse(snapshot) as T; } catch { /* Ignore damaged storage. */ }
  const setValue = useCallback((next: T | ((previous: T) => T)) => {
    let previous: T = JSON.parse(fallback);
    try { previous = JSON.parse(read(storageKey) ?? fallback); } catch { /* Use default. */ }
    write(storageKey, JSON.stringify(typeof next === "function"
      ? (next as (previous: T) => T)(previous) : next));
    listeners.forEach((listener) => listener());
  }, [storageKey, fallback]);
  return [value, setValue] as const;
}

/** Wait for both hydration and async list data before restoring the position. */
export function useListScroll(key: string, ready = true) {
  const hydrated = useSyncExternalStore(subscribe, clientReady, serverReady);
  useEffect(() => {
    if (!hydrated || !ready) return;
    const storageKey = `list-scroll:v1:${key}`;
    const pathname = window.location.pathname;
    const saved = read(storageKey);
    let frame = 0;
    let restoring = true;
    const save = () => {
      if (!restoring && window.location.pathname === pathname) {
        write(storageKey, String(window.scrollY));
      }
    };
    // Let Next's navigation scroll finish before restoring the expanded list.
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        if (window.location.pathname === pathname && saved !== null && !window.location.hash) {
          const top = Number(saved);
          if (Number.isFinite(top) && top >= 0) window.scrollTo({ top, behavior: "instant" });
        }
        restoring = false;
      });
    });
    window.addEventListener("scroll", save, { passive: true });
    window.addEventListener("pagehide", save);
    document.addEventListener("click", save, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", save);
      window.removeEventListener("pagehide", save);
      document.removeEventListener("click", save, true);
    };
  }, [key, ready, hydrated]);
}
