import type { Config } from "tailwindcss";

/** Class-based dark mode is paired with `@custom-variant dark` in `src/app/globals.css` (Tailwind v4 + next-themes). */
export default {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
} satisfies Config;
