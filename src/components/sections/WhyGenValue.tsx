"use client";

import { motion } from "framer-motion";
import type { IconType } from "react-icons";
import {
  FaBriefcase,
  FaDiagramProject,
  FaListCheck,
  FaPersonChalkboard,
} from "react-icons/fa6";

export type FeatureItem = {
  readonly title: string;
  readonly description: string;
  readonly Icon: IconType;
  readonly eyebrow: string;
  readonly badgeText: string;
  readonly illustration: React.ReactNode;
};

// Custom Duotone SVG Illustrations
const AdaptivePathSvg = (
  <svg viewBox="0 0 400 280" fill="none" className="h-full w-full">
    <rect width="400" height="280" rx="16" fill="#EDE6D3" />
    <path d="M40 220 Q 120 180, 200 140 T 360 60" stroke="#1E3FE0" strokeWidth="4" strokeDasharray="8 8" />
    <circle cx="80" cy="200" r="16" fill="#1E3FE0" />
    <circle cx="80" cy="200" r="6" fill="#EDE6D3" />
    <circle cx="200" cy="140" r="22" fill="#E8622E" />
    <path d="M192 140 L208 140 M200 132 L200 148" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
    <circle cx="320" cy="80" r="18" fill="#1E3FE0" />
    <path d="M312 80 L318 86 L328 74" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    {/* Floating card nodes */}
    <rect x="110" y="70" width="130" height="46" rx="10" fill="#FFFFFF" />
    <rect x="122" y="84" width="60" height="6" rx="3" fill="#1E3FE0" />
    <rect x="122" y="96" width="90" height="4" rx="2" fill="#6B6558" opacity="0.6" />
    <rect x="230" y="170" width="130" height="46" rx="10" fill="#FFFFFF" />
    <rect x="242" y="184" width="70" height="6" rx="3" fill="#E8622E" />
    <rect x="242" y="196" width="85" height="4" rx="2" fill="#6B6558" opacity="0.6" />
  </svg>
);

const AIMentorSvg = (
  <svg viewBox="0 0 400 280" fill="none" className="h-full w-full">
    <rect width="400" height="280" rx="16" fill="#EDE6D3" />
    {/* Code Editor Window */}
    <rect x="50" y="40" width="300" height="200" rx="12" fill="#12266E" />
    <circle cx="70" cy="58" r="4" fill="#E8622E" />
    <circle cx="84" cy="58" r="4" fill="#F59E0B" />
    <circle cx="98" cy="58" r="4" fill="#10B981" />
    {/* Code Lines */}
    <rect x="70" y="85" width="120" height="8" rx="4" fill="#60A5FA" />
    <rect x="70" y="105" width="180" height="8" rx="4" fill="#FFFFFF" opacity="0.8" />
    <rect x="70" y="125" width="140" height="8" rx="4" fill="#FFFFFF" opacity="0.5" />
    <rect x="70" y="145" width="90" height="8" rx="4" fill="#60A5FA" />
    {/* AI Feedback Popup Annotation */}
    <rect x="180" y="110" width="150" height="85" rx="12" fill="#FFFFFF" />
    <path d="M195 110 L185 100 L195 105 Z" fill="#FFFFFF" />
    <circle cx="202" cy="130" r="10" fill="#E8622E" />
    <path d="M198 130 L206 130 M202 126 L202 134" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
    <rect x="220" y="125" width="90" height="6" rx="3" fill="#12266E" />
    <rect x="202" y="150" width="110" height="5" rx="2" fill="#6B6558" />
    <rect x="202" y="162" width="80" height="5" rx="2" fill="#1E3FE0" />
  </svg>
);

const InstantPortfolioSvg = (
  <svg viewBox="0 0 400 280" fill="none" className="h-full w-full">
    <rect width="400" height="280" rx="16" fill="#EDE6D3" />
    {/* Browser Card Showcase */}
    <rect x="40" y="50" width="200" height="180" rx="12" fill="#FFFFFF" />
    <rect x="52" y="66" width="176" height="95" rx="8" fill="#1E3FE0" />
    <circle cx="140" cy="113.5" r="20" fill="#E8622E" opacity="0.9" />
    <polygon points="135,105 150,113.5 135,122" fill="#FFFFFF" />
    <rect x="52" y="172" width="120" height="8" rx="4" fill="#12266E" />
    <rect x="52" y="188" width="90" height="6" rx="3" fill="#6B6558" opacity="0.7" />

    {/* Floating Success Stats Card */}
    <rect x="210" y="90" width="150" height="120" rx="12" fill="#12266E" />
    <text x="230" y="130" fill="#FFFFFF" fontSize="24" fontWeight="bold" fontFamily="sans-serif">100%</text>
    <text x="230" y="150" fill="#60A5FA" fontSize="11" fontWeight="bold" fontFamily="sans-serif">VERIFIED PROJECT</text>
    <rect x="230" y="168" width="110" height="6" rx="3" fill="#E8622E" />
    <rect x="230" y="182" width="70" height="6" rx="3" fill="#FFFFFF" opacity="0.4" />
  </svg>
);

const CareerSkillsSvg = (
  <svg viewBox="0 0 400 280" fill="none" className="h-full w-full">
    <rect width="400" height="280" rx="16" fill="#EDE6D3" />
    {/* Certificate / Diploma Mockup */}
    <rect x="60" y="40" width="280" height="200" rx="14" fill="#FFFFFF" stroke="#1E3FE0" strokeWidth="2" />
    <rect x="80" y="65" width="140" height="12" rx="4" fill="#12266E" />
    <rect x="80" y="88" width="200" height="6" rx="3" fill="#6B6558" opacity="0.6" />
    <rect x="80" y="102" width="170" height="6" rx="3" fill="#6B6558" opacity="0.4" />

    {/* Verification Badge Stamp */}
    <circle cx="280" cy="165" r="32" fill="#1E3FE0" />
    <circle cx="280" cy="165" r="26" fill="#E8622E" />
    <path d="M268 165 L276 173 L294 155" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    {/* Ribbon */}
    <path d="M268 190 L260 215 L275 205 L290 215 L282 190 Z" fill="#1E3FE0" />
  </svg>
);

const FEATURES: readonly FeatureItem[] = [
  {
    eyebrow: "① JUDGMENT FIRST",
    title: "Tool Selection Mastery",
    description: "40+ tools taught in context, not in isolation. Learn exactly which AI assistant or specialized model to pick for every task.",
    Icon: FaListCheck,
    badgeText: "FRAMEWORK",
    illustration: AdaptivePathSvg,
  },
  {
    eyebrow: "② HANDS-ON BUILDS",
    title: "Real-World Projects",
    description: "12 hands-on assignments + 1 capstone project. Build recruiter-ready portfolio pieces instead of memorizing slide decks.",
    Icon: FaDiagramProject,
    badgeText: "PRACTICAL",
    illustration: AIMentorSvg,
  },
  {
    eyebrow: "③ PRACTITIONER LED",
    title: "Expert Instruction",
    description: "Taught by Sathvik Putta, Co-Founder & Instructor at GenValue. Learn grounded workflows from someone who builds with AI daily.",
    Icon: FaPersonChalkboard,
    badgeText: "MENTORSHIP",
    illustration: InstantPortfolioSvg,
  },
  {
    eyebrow: "④ CAREER IMPACT",
    title: "Career-Ready Skills",
    description: "Portfolio of AI projects employers actually want. Leave with verified credentials and clear execution confidence.",
    Icon: FaBriefcase,
    badgeText: "PORTFOLIO",
    illustration: CareerSkillsSvg,
  },
];

export function WhyGenValue() {
  return (
    <section
      className="relative mx-auto max-w-[1200px] px-4 py-20 sm:px-6 lg:px-8"
      aria-labelledby="why-genvalue-heading"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="mb-16 text-center"
      >
        <span className="font-annotation inline-block -rotate-2 text-sm font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-400">
          WHY CHOOSE GENVALUE
        </span>
        <h2
          id="why-genvalue-heading"
          className="font-display-custom mt-2 text-balance text-3xl font-extrabold tracking-tight text-[#2A2A28] dark:text-white sm:text-5xl lg:text-6xl"
        >
          Not just what to use - but when and why.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-base text-[#6B6558] dark:text-slate-300 sm:text-lg">
          Most AI courses teach tools. We teach judgment. You leave knowing how to pick the right AI for any professional task in seconds.
        </p>
      </motion.div>

      {/* Sticky Alternating Story Panels */}
      <div className="flex flex-col gap-24">
        {FEATURES.map((feature, index) => {
          const Icon = feature.Icon;
          const isEven = index % 2 === 0;

          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16 ${
                isEven ? "" : "md:[&>div:first-child]:order-2"
              }`}
            >
              {/* Sticky Media Container with SVG Illustration */}
              <div className="relative md:sticky md:top-28 aspect-[4/3] w-full overflow-hidden rounded-[20px] border border-black/10 bg-[#F6F1E4] p-3 sm:p-4 shadow-xl transition-all duration-300 hover:shadow-2xl dark:border-white/10 dark:bg-[#0D1B2A]">
                <div className="flex h-full flex-col justify-between">
                  <div className="flex items-center justify-between p-2">
                    <span className="rounded-full bg-[#1E3FE0]/10 px-3.5 py-1 font-annotation text-xs font-bold text-[#1E3FE0] dark:bg-white/10 dark:text-[#60A5FA]">
                      {feature.badgeText}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1E3FE0] text-white shadow-md">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  {/* SVG Illustration Container */}
                  <div className="relative my-2 flex-1 overflow-hidden rounded-xl border border-black/5 bg-white/50 p-2 backdrop-blur-sm dark:bg-white/5">
                    {feature.illustration}
                  </div>

                  <div className="rounded-xl border border-black/5 bg-white/90 p-4 shadow-sm backdrop-blur-sm dark:border-white/5 dark:bg-white/5">
                    <span className="font-annotation text-xs text-[#6B6558] dark:text-slate-400">
                      Module {index + 1} Highlight
                    </span>
                    <h4 className="font-display-custom mt-0.5 text-lg font-bold text-[#2A2A28] dark:text-white">
                      {feature.title}
                    </h4>
                  </div>
                </div>
              </div>

              {/* Scrolling Copy Container */}
              <div className="py-4">
                <span className="font-annotation flex items-center gap-2 text-sm font-bold text-[#6B6558] dark:text-slate-400">
                  {feature.eyebrow}
                </span>
                <h3 className="font-display-custom mt-2 text-3xl font-extrabold text-[#2A2A28] dark:text-white sm:text-4xl">
                  {feature.title}
                </h3>
                <p className="mt-4 text-base leading-relaxed text-[#6B6558] dark:text-slate-300 sm:text-lg">
                  {feature.description}
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#E8622E]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1E3FE0] dark:text-[#60A5FA]">
                    100% Practical & Verified
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
