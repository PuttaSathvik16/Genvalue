"use client";

export function LiquidGlassFilter() {
  return (
    <svg
      width="0"
      height="0"
      className="pointer-events-none absolute h-0 w-0 overflow-hidden"
      aria-hidden="true"
    >
      <defs>
        <filter id="liquid-glass-refraction" colorInterpolationFilters="sRGB">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.015 0.015"
            numOctaves="3"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="14"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}
