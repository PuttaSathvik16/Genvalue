interface SkeletonProps {
  className?: string;
}

/** Pulse placeholder block - respects prefers-reduced-motion via motion-safe. */
export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-2xl bg-black/[0.08] motion-safe:animate-pulse dark:bg-white/10 ${className}`}
    />
  );
}
