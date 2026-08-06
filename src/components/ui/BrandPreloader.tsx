"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

export function BrandPreloader() {
  const [showPreloader, setShowPreloader] = useState(true);

  useEffect(() => {
    // Lock page scrolling while preloader animation is active
    document.body.style.overflow = "hidden";

    // Play full intro sequence then trigger curtain reveal up after 2.6 seconds
    const timer = setTimeout(() => {
      setShowPreloader(false);
      document.body.style.overflow = "";
    }, 2600);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence mode="wait">
      {showPreloader && (
        <motion.div
          key="brand-preloader-screen"
          initial={{ opacity: 1, y: "0%" }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#EDE6D3] text-[#2A2A28] dark:bg-[#070B19] dark:text-white"
        >
          {/* Blueprint Grid Overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(#000_1px,transparent_1px),linear-gradient(90deg,#000_1px,transparent_1px)] [background-size:28px_28px] dark:opacity-[0.08] dark:[background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)]"
            aria-hidden="true"
          />

          {/* Central Logo & Brand Animation */}
          <div className="relative z-10 flex flex-col items-center justify-center px-4 text-center">
            {/* Animated Existing Brand Logo Graphic */}
            <div className="relative mb-6 flex items-center justify-center">
              {/* Soft Ambient Radial Light Aura */}
              <motion.div
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: [0.4, 1.4, 1], opacity: [0, 0.6, 0.3] }}
                transition={{ duration: 1.6, ease: "easeOut" }}
                className="absolute h-32 w-32 rounded-full bg-[#1E3FE0]/25 blur-3xl dark:bg-[#60A5FA]/35"
              />

              {/* Slow Premium Reveal of Existing Logo File */}
              <motion.div
                initial={{ scale: 0.4, opacity: 0, y: -20, filter: "brightness(0.3) blur(8px)" }}
                animate={{
                  scale: [0.4, 1.12, 1],
                  opacity: 1,
                  y: 0,
                  filter: ["brightness(0.3) blur(8px)", "brightness(1.3) blur(0px)", "brightness(1) blur(0px)"],
                }}
                transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10"
              >
                {/* Gentle Continuous Floating Wave */}
                <motion.div
                  animate={{ y: [0, -8, 0], scale: [1, 1.04, 1] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative h-20 w-20 sm:h-24 sm:w-24"
                >
                  <Image
                    src="/Genvalue Light.svg"
                    alt="GenValue Brand Logo"
                    fill
                    className="h-full w-full object-contain dark:hidden drop-shadow-[0_10px_25px_rgba(30,63,224,0.3)]"
                    priority
                  />
                  <Image
                    src="/Genvalue Dark.svg"
                    alt="GenValue Brand Logo"
                    fill
                    className="hidden h-full w-full object-contain dark:block drop-shadow-[0_12px_30px_rgba(96,165,250,0.45)]"
                    priority
                  />
                </motion.div>
              </motion.div>
            </div>

            {/* Split Wordmark: Gen (black/white) + Value (blue) */}
            <div className="flex items-center justify-center overflow-hidden font-display-custom text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
              <motion.span
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.65, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="text-[#2A2A28] dark:text-white"
              >
                Gen
              </motion.span>

              <motion.span
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.65, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="text-[#1E3FE0] dark:text-[#60A5FA]"
              >
                Value
              </motion.span>
            </div>

            {/* Tagline Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="font-annotation mt-3 text-xs font-bold uppercase tracking-widest text-[#6B6558] dark:text-slate-400 sm:text-sm"
            >
              ★ Learning at the Speed of Curiosity
            </motion.p>

            {/* Animated Loading Progress Bar */}
            <div className="mt-8 h-1 w-48 overflow-hidden rounded-full bg-black/10 dark:bg-white/10 sm:w-64">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.1, ease: [0.65, 0, 0.35, 1] }}
                className="h-full bg-gradient-to-r from-[#1E3FE0] via-[#E8622E] to-[#10B981]"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
