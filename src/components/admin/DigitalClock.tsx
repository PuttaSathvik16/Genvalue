"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

function formatClockParts(date: Date) {
  const hours = date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    hour12: false,
  });
  const minutes = date.toLocaleTimeString(undefined, {
    minute: "2-digit",
    hour12: false,
  });
  const seconds = date.toLocaleTimeString(undefined, {
    second: "2-digit",
    hour12: false,
  });
  const meridiem =
    date
      .toLocaleTimeString(undefined, { hour: "numeric", hour12: true })
      .split(" ")
      .pop()
      ?.toLowerCase() ?? "";

  return {
    hours,
    minutes,
    seconds,
    meridiem,
    date: date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/_/g, " "),
    spoken: date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }),
  };
}

function ClockSegment({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span
        className="font-display-custom min-w-[2.75rem] rounded-xl border border-black/8 bg-white/80 px-2 py-1.5 text-center text-xl font-extrabold tabular-nums tracking-tight text-[#0D1B2A] shadow-sm dark:border-white/10 dark:bg-[#0D1B2A]/80 dark:text-white sm:min-w-[3rem] sm:text-2xl"
        aria-hidden="true"
      >
        {value}
      </span>
      <span className="mt-1 text-[9px] font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-400">
        {label}
      </span>
    </div>
  );
}

export function DigitalClock() {
  const reduceMotion = useReducedMotion();
  const [now, setNow] = useState(() => new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [reduceMotion]);

  const { hours, minutes, seconds, meridiem, date, timezone, spoken } = useMemo(
    () => formatClockParts(now),
    [now]
  );

  if (!mounted) {
    return (
      <div
        className="h-[88px] min-w-[240px] animate-pulse rounded-2xl border border-black/10 bg-white/50 dark:border-white/10 dark:bg-white/5"
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className="rounded-2xl border border-black/10 bg-white/60 p-4 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5"
      aria-label={`Current time: ${spoken}, ${date}, ${timezone}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {!reduceMotion ? (
            <motion.span
              className="relative flex h-2 w-2"
              aria-hidden="true"
              animate={{ opacity: [1, 0.35, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#10B981]" />
            </motion.span>
          ) : (
            <span className="h-2 w-2 rounded-full bg-[#10B981]" aria-hidden="true" />
          )}
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#10B981]">
            Live
          </span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-400">
          {meridiem}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-center gap-1.5 sm:gap-2" aria-hidden="true">
        <ClockSegment value={hours} label="Hr" />
        <span className="mb-4 text-xl font-extrabold text-[#1E3FE0]/70 dark:text-[#60A5FA]/80">
          :
        </span>
        <ClockSegment value={minutes} label="Min" />
        <span className="mb-4 text-xl font-extrabold text-[#1E3FE0]/70 dark:text-[#60A5FA]/80">
          :
        </span>
        <ClockSegment value={seconds} label="Sec" />
      </div>

      <div className="mt-3 border-t border-black/6 pt-3 text-center dark:border-white/8">
        <p className="text-xs font-semibold text-[#2A2A28] dark:text-white">{date}</p>
        <p className="mt-0.5 text-[10px] font-medium text-[#6B6558] dark:text-slate-400">
          {timezone}
        </p>
      </div>
    </div>
  );
}
