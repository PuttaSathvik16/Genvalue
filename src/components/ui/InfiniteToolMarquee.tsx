"use client";

import { motion } from "framer-motion";

const ROW_1_TOOLS = [
  "ChatGPT Plus",
  "Claude 3.5 Sonnet",
  "Gemini 1.5 Pro",
  "Midjourney v6",
  "Cursor AI",
  "GitHub Copilot",
  "Perplexity Pro",
  "Runway Gen-2",
  "ElevenLabs",
  "Luma Dream Machine",
  "Notion AI",
  "Zapier Central",
  "Make.com AI",
  "v0.dev by Vercel",
  "Bolt.new",
] as const;

const ROW_2_TOOLS = [
  "Sora by OpenAI",
  "DeepSeek V3",
  "Kling AI",
  "Pika Labs",
  "Suno AI v3.5",
  "Udio Music",
  "FLUX.1 Schnell",
  "ComfyUI Workflows",
  "LangChain JS",
  "LlamaIndex",
  "Ollama Local LLMs",
  "vLLM Inference",
  "Replicate API",
  "Pinecone Vector Database",
  "Groq LPU",
] as const;

export function InfiniteToolMarquee() {
  return (
    <div className="relative my-6 w-full max-w-none overflow-hidden py-4">
      {/* Edge-to-Edge Gradient Vignette Fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#EDE6D3] to-transparent sm:w-32 md:w-44 dark:from-[#070B19]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#EDE6D3] to-transparent sm:w-32 md:w-44 dark:from-[#070B19]" />

      <div className="flex flex-col gap-3">
        {/* Row 1 - Moving Left */}
        <div className="flex overflow-hidden">
          <motion.div
            className="flex shrink-0 gap-3"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 30, ease: "linear", repeat: Infinity }}
          >
            {[...ROW_1_TOOLS, ...ROW_1_TOOLS].map((tool, idx) => (
              <span
                key={`r1-${tool}-${idx}`}
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-black/10 bg-white/90 px-4 py-2 text-xs font-bold text-[#2A2A28] shadow-sm backdrop-blur-md transition hover:scale-105 hover:bg-[#1E3FE0] hover:text-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-[#1E3FE0]"
              >
                <span className="h-2 w-2 rounded-full bg-[#1E3FE0] dark:bg-[#60A5FA]" />
                {tool}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Row 2 - Moving Right */}
        <div className="flex overflow-hidden">
          <motion.div
            className="flex shrink-0 gap-3"
            animate={{ x: ["-50%", "0%"] }}
            transition={{ duration: 35, ease: "linear", repeat: Infinity }}
          >
            {[...ROW_2_TOOLS, ...ROW_2_TOOLS].map((tool, idx) => (
              <span
                key={`r2-${tool}-${idx}`}
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-black/10 bg-[#F6F1E4] px-4 py-2 text-xs font-bold text-[#2A2A28] shadow-sm backdrop-blur-md transition hover:scale-105 hover:bg-[#E8622E] hover:text-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-[#E8622E]"
              >
                <span className="h-2 w-2 rounded-full bg-[#E8622E]" />
                {tool}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
