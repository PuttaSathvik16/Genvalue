"use client";

import { MotionConfig } from "framer-motion";

/**
 * Honors `prefers-reduced-motion` for all Framer Motion descendants.
 */
export function MotionPreferences({ children }: Readonly<{ children: React.ReactNode }>) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
