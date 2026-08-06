"use client";

import { motion } from "framer-motion";

const ROW_LTR: readonly string[] = [
  "ChatGPT",
  "Claude",
  "Gemini",
  "Cursor",
  "Midjourney",
  "Sora",
  "ElevenLabs",
  "Perplexity",
  "Notion AI",
  "Figma AI",
  "Julius AI",
  "Zapier AI",
] as const;

const ROW_RTL: readonly string[] = [
  "GitHub Copilot",
  "Runway",
  "HeyGen",
  "Grammarly",
  "DALL-E",
  "Replit",
  "Kling AI",
  "Descript",
  "Adobe Firefly",
  "Motion",
  "Power BI",
  "AutoGPT",
] as const;

type AccentKey = "blue" | "orange" | "emerald";

const ACCENT_BORDER: Record<AccentKey, string> = {
  blue: "border-l-[#1E3FE0]",
  orange: "border-l-[#E8622E]",
  emerald: "border-l-[#10B981]",
};

const ACCENT_CYCLE: readonly AccentKey[] = ["blue", "orange", "emerald"];

function accentForIndex(index: number): AccentKey {
  return ACCENT_CYCLE[index % ACCENT_CYCLE.length] ?? "blue";
}

function MarqueeRow({
  direction,
  tools,
}: {
  direction: "ltr" | "rtl";
  tools: readonly string[];
}) {
  const animationClass =
    direction === "ltr"
      ? "animate-tools-marquee-ltr"
      : "animate-tools-marquee-rtl";

  return (
    <div className="group/marquee relative w-full overflow-hidden py-3" aria-hidden="true">
      <div
        className={`flex w-max ${animationClass} motion-reduce:animate-none group-hover/marquee:[animation-play-state:paused]`}
      >
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            className="flex w-max shrink-0 items-center gap-4 pr-4 md:gap-6 md:pr-6"
            aria-hidden={copy === 1}
          >
            {tools.map((name, index) => {
              const accent = accentForIndex(index);
              const accentClass = ACCENT_BORDER[accent];
              return (
                <li key={`${copy}-${name}-${index}`}>
                  <span
                    className={`inline-flex items-center rounded-full border border-black/10 bg-[#F6F1E4] px-6 py-3 text-base font-bold text-[#2A2A28] shadow-md backdrop-blur-sm transition-transform hover:scale-105 md:px-8 md:text-lg dark:border-white/10 dark:bg-[#0D1B2A] dark:text-white ${accentClass} border-l-4`}
                  >
                    {name}
                  </span>
                </li>
              );
            })}
          </ul>
        ))}
      </div>
    </div>
  );
}

export function ToolsShowcase() {
  return (
    <section
      className="relative w-full overflow-hidden py-24"
      aria-labelledby="tools-showcase-heading"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-3xl px-4 text-center sm:px-6"
      >
        <span className="font-annotation inline-block -rotate-2 text-sm font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-400">
          ★ HANDPICKED & TAUGHT IN CONTEXT
        </span>
        <h2
          id="tools-showcase-heading"
          className="font-display-custom mt-2 text-balance text-3xl font-extrabold tracking-tight text-[#2A2A28] dark:text-white sm:text-5xl md:text-6xl"
        >
          40+ Tools. One Program.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-pretty text-base text-[#6B6558] dark:text-slate-300 sm:text-lg">
          No generic demos. Master every major LLM, visual generator, coding assistant, and workflow automation platform.
        </p>
      </motion.div>

      {/* Full-Bleed Edge-to-Edge Continuous Marquee */}
      <div className="mt-12 flex w-full flex-col gap-6 md:gap-8">
        <MarqueeRow direction="ltr" tools={ROW_LTR} />
        <MarqueeRow direction="rtl" tools={ROW_RTL} />
      </div>
    </section>
  );
}
