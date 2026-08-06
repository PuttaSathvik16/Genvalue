"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaPause, FaPlay, FaVolumeHigh, FaVolumeXmark } from "react-icons/fa6";
import { DownloadButton } from "@/components/ui/DownloadButton";
import { EnrollNowLink } from "@/components/ui/EnrollNowLink";
import { SITE } from "@/lib/constants";

const HERO_VIDEO_SRC = "/videos/Genvalue%20Intro.mp4" as const;

const STATS: readonly string[] = [
  "12 Weeks Immersion",
  "40+ AI Tools",
  "11 Categories",
  "1 Capstone Project",
] as const;

// Torn Paper Edge SVG Path
function TornPaperDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`relative w-full overflow-hidden leading-none ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 1200 60"
        preserveAspectRatio="none"
        className="relative block h-7 w-full fill-[#F6F1E4] text-[#F6F1E4] drop-shadow-[0_4px_6px_rgba(0,0,0,0.12)] dark:fill-[#0D1B2A] dark:text-[#0D1B2A] sm:h-10 md:h-12"
      >
        <path d="M0,0 C150,45 350,-15 500,30 C650,75 800,10 950,45 C1100,80 1150,15 1200,35 L1200,60 L0,60 Z" />
      </svg>
    </div>
  );
}

// Staggered Container Animation
const heroContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
} as const;

// Paper Rip Reveal Variants
const paperTearReveal = {
  hidden: { clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)", opacity: 0, y: 40 },
  visible: {
    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
} as const;

const badgeLeftVariants = {
  hidden: { opacity: 0, x: -40, rotate: -20, scale: 0.8 },
  visible: {
    opacity: 1,
    x: 0,
    rotate: -6,
    scale: 1,
    transition: { duration: 0.75, type: "spring", stiffness: 140, damping: 10 },
  },
} as const;

const badgeRightVariants = {
  hidden: { opacity: 0, x: 40, rotate: 20, scale: 0.8 },
  visible: {
    opacity: 1,
    x: 0,
    rotate: 3,
    scale: 1,
    transition: { duration: 0.75, type: "spring", stiffness: 140, damping: 10 },
  },
} as const;

const headlineVariants = {
  hidden: { opacity: 0, y: 35, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.8, ease: [0.215, 0.61, 0.355, 1] },
  },
} as const;

export function Hero() {
  const [zoomScale, setZoomScale] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const progress = Math.min(Math.max(window.scrollY / 600, 0), 1);
      setZoomScale(1 + progress * 0.2);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.play().catch(() => setIsPlaying(false));
  }, []);

  const toggleVideo = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !isMuted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  return (
    <section
      style={{ position: "relative" }}
      className="relative mx-auto w-full max-w-[1300px] px-4 pt-24 pb-16 sm:px-6 sm:pt-32 lg:px-8 lg:pt-36"
      aria-labelledby="hero-heading"
    >
      {/* Centered Editorial Layout with Animated Paper Tear Unfold */}
      <motion.div
        variants={heroContainerVariants}
        initial="hidden"
        animate="visible"
        className="relative mx-auto max-w-5xl text-center"
      >
        {/* Top-Left Handwritten Annotation Badge with Hover Tilt */}
        <motion.span
          variants={badgeLeftVariants}
          whileHover={{ scale: 1.12, rotate: -2 }}
          className="font-annotation absolute -top-10 left-2 sm:-top-12 sm:left-12 text-sm font-bold tracking-wider text-[#6B6558] underline decoration-[#E8622E]/50 underline-offset-4 dark:text-slate-400 sm:text-base md:text-lg cursor-pointer"
          aria-hidden="true"
        >
          PRACTITIONER-FIRST
        </motion.span>

        {/* Top-Right Handwritten Annotation Badge with Hover Tilt */}
        <motion.span
          variants={badgeRightVariants}
          whileHover={{ scale: 1.12, rotate: 0 }}
          className="font-annotation absolute -top-10 right-2 sm:-top-12 sm:right-12 text-sm font-bold tracking-wider text-[#1E3FE0] dark:text-[#60A5FA] sm:text-base md:text-lg cursor-pointer"
          aria-hidden="true"
        >
          → NOT LECTURES
        </motion.span>

        {/* Giant Display Headline */}
        <motion.h1
          variants={headlineVariants}
          id="hero-heading"
          className="font-display-custom mt-2 text-balance text-3xl font-extrabold leading-[1.05] tracking-tight text-[#2A2A28] dark:text-white xs:text-4xl sm:text-7xl md:text-8xl lg:text-[96px]"
        >
          Learning at the <br className="hidden sm:inline" />
          <span className="relative inline-block text-[#1E3FE0] dark:text-white">
            speed of curiosity
          </span>
        </motion.h1>

        <motion.p
          variants={headlineVariants}
          className="mx-auto mt-6 max-w-2xl text-pretty text-sm font-medium leading-relaxed text-[#6B6558] dark:text-slate-300 sm:text-lg md:text-xl"
        >
          A practical 12-week program covering 40+ AI tools across 11 categories - engineered for working professionals who demand clear judgment over hype.
        </motion.p>

        {/* Action Buttons with Spring Feedback */}
        <motion.div
          variants={headlineVariants}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
            <EnrollNowLink
              aria-label="Enroll in AI Tools Mastery program"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#E8622E] px-8 text-base font-bold uppercase tracking-wider text-white shadow-xl transition hover:bg-[#d55321] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8622E] sm:w-auto sm:px-10"
            >
              Enroll Now
            </EnrollNowLink>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
            <Link
              href="/syllabus"
              aria-label="View the 12-week course syllabus"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full border-2 border-[#2A2A28] bg-transparent px-8 text-base font-bold text-[#2A2A28] transition hover:bg-[#2A2A28]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2A2A28] dark:border-white dark:text-white dark:hover:bg-white/10 sm:w-auto"
            >
              View Syllabus
            </Link>
          </motion.div>
        </motion.div>

        <motion.div variants={headlineVariants} className="mt-4 flex items-center justify-center">
          <DownloadButton
            href={SITE.syllabusPdfUrl}
            filename={SITE.syllabusDownloadFilename}
            label="Download Full Syllabus PDF →"
            variant="ghost"
            size="sm"
            trackingLabel="Download GenValue syllabus PDF"
          />
        </motion.div>
      </motion.div>

      {/* Animated Torn Paper Tear Line */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        className="mt-12 w-full origin-center"
      >
        <TornPaperDivider />
      </motion.div>

      {/* Screen Frame Mockup Container with Paper Tear Unfold */}
      <motion.div
        variants={paperTearReveal}
        initial="hidden"
        animate="visible"
        className="relative overflow-hidden rounded-3xl border border-black/15 bg-[#0D1B2A] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.35)] ring-1 ring-black/10 dark:border-white/15 dark:shadow-[0_30px_70px_-15px_rgba(0,0,0,0.7)]"
      >
        {/* Screen / Browser Window Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#12266E] px-5 py-3.5 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#EF4444] shadow-sm" />
            <span className="h-3 w-3 rounded-full bg-[#F59E0B] shadow-sm" />
            <span className="h-3 w-3 rounded-full bg-[#10B981] shadow-sm" />
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-5 py-1 text-xs font-bold text-white/80">
            <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
            <span>genvalue.academy / ai-tools-mastery</span>
          </div>

          {/* Interactive Video Play/Pause + Mute/Unmute */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleVideo}
              aria-label={isPlaying ? "Pause promo video" : "Play promo video"}
              className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold text-white transition hover:bg-white/20"
            >
              {isPlaying ? (
                <>
                  <FaPause className="h-3 w-3 text-[#E8622E]" aria-hidden="true" />
                  <span className="hidden sm:inline">Pause</span>
                </>
              ) : (
                <>
                  <FaPlay className="h-3 w-3 text-[#10B981]" aria-hidden="true" />
                  <span className="hidden sm:inline">Play</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute promo video" : "Mute promo video"}
              aria-pressed={!isMuted}
              className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold text-white transition hover:bg-white/20"
            >
              {isMuted ? (
                <>
                  <FaVolumeXmark className="h-3.5 w-3.5 text-white/80" aria-hidden="true" />
                  <span className="hidden sm:inline">Unmute</span>
                </>
              ) : (
                <>
                  <FaVolumeHigh className="h-3.5 w-3.5 text-[#10B981]" aria-hidden="true" />
                  <span className="hidden sm:inline">Mute</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Video Display Area */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#070B19]">
          <motion.div
            style={{ scale: zoomScale }}
            transition={{ ease: "linear" }}
            className="relative h-full w-full"
          >
            <video
              ref={videoRef}
              src={HERO_VIDEO_SRC}
              poster="/images/poster/genvalue-poster.png"
              autoPlay
              loop
              muted
              playsInline
              controls={false}
              className="h-full w-full object-cover"
            />
          </motion.div>

          {/* Floating Caption Badge */}
          <div className="absolute bottom-5 right-6 rounded-full bg-black/65 px-5 py-2 font-annotation text-xs font-bold text-white backdrop-blur-md sm:text-sm">
            GenValue thinks with you, not at you.
          </div>
        </div>
      </motion.div>

      {/* Quick Stat Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="mt-10 border-t border-black/10 pt-6 dark:border-white/10"
      >
        <ul className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-400 sm:gap-8 sm:text-sm">
          {STATS.map((label, index) => (
            <li key={label} className="flex items-center gap-4 sm:gap-8">
              {index > 0 && <span className="opacity-25">|</span>}
              <span className="text-[#2A2A28] dark:text-white">{label}</span>
            </li>
          ))}
        </ul>
      </motion.div>
    </section>
  );
}
