"use client";

import { useSyncExternalStore } from "react";

function subscribe(onStoreChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getSnapshot(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * Matches OS-level reduced motion preference (for non-Framer Motion UI).
 * Framer Motion trees should also use {@link MotionPreferences} with `reducedMotion="user"`.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
