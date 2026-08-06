"use client";

import { useEffect, useState } from "react";

export function CoordsOverlay() {
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCoords({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      id="coords"
      aria-hidden="true"
      className="pointer-events-none fixed left-4 top-4 z-[60] font-mono text-[11px] leading-tight text-[#6B6558] opacity-60 select-none dark:text-slate-400"
    >
      X {coords.x.toFixed(2)}
      <br />
      Y {coords.y.toFixed(2)}
    </div>
  );
}
