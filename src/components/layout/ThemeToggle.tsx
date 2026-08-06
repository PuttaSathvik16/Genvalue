"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { HiOutlineMoon, HiOutlineSun } from "react-icons/hi";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      disabled={!mounted}
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-800 shadow-sm transition-colors duration-300 hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] disabled:pointer-events-none disabled:opacity-50 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
      aria-label={
        !mounted ? "Toggle color theme" : isDark ? "Switch to light mode" : "Switch to dark mode"
      }
    >
      <span className="relative h-5 w-5" aria-hidden>
        <HiOutlineSun
          className={`absolute inset-0 h-5 w-5 transition-all duration-300 ease-out ${
            mounted && !isDark ? "scale-75 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
          }`}
        />
        <HiOutlineMoon
          className={`absolute inset-0 h-5 w-5 transition-all duration-300 ease-out ${
            mounted && !isDark ? "scale-100 rotate-0 opacity-100" : "scale-75 -rotate-90 opacity-0"
          }`}
        />
      </span>
    </button>
  );
}
