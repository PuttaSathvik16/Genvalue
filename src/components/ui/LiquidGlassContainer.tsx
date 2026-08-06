"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { applyLiquidGlass, type LiquidGlassOptions } from "@/lib/liquid-glass";

type LiquidGlassContainerProps = {
  children: ReactNode;
  className?: string;
  options?: LiquidGlassOptions;
};

export function LiquidGlassContainer({
  children,
  className = "",
  options,
}: LiquidGlassContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const instance = applyLiquidGlass(el, options);
    return () => {
      instance.destroy();
    };
  }, [options]);

  return (
    <div ref={containerRef} className={`liquid-glass ${className}`}>
      {children}
    </div>
  );
}
