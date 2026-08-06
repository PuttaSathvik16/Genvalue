"use client";

import Image from "next/image";

type SiteLogoMarkProps = {
  /** Tailwind size classes for the icon, e.g. h-8 w-auto */
  className?: string;
  width?: number;
  height?: number;
  showText?: boolean;
  textClassName?: string;
};

export function SiteLogoMark({
  className = "h-8 w-auto",
  width = 160,
  height = 40,
  showText = true,
  textClassName = "",
}: SiteLogoMarkProps) {
  return (
    <span className="inline-flex shrink-0 items-center gap-2.5">
      <span className={`relative inline-flex shrink-0 items-center ${className}`} aria-hidden="true">
        {/* Light Mode Logo Icon */}
        <Image
          src="/Genvalue Light.svg"
          alt="GenValue Logo Icon"
          width={width}
          height={height}
          className="h-full w-auto object-contain dark:hidden"
          priority
        />
        {/* Dark Mode Logo Icon */}
        <Image
          src="/Genvalue Dark.svg"
          alt="GenValue Logo Icon"
          width={width}
          height={height}
          className="hidden h-full w-auto object-contain dark:block"
          priority
        />
      </span>

      {showText && (
        <span
          className={`font-display-custom text-base font-extrabold tracking-tight whitespace-nowrap sm:text-lg md:text-xl ${textClassName}`}
        >
          <span className="text-[#2A2A28] dark:text-white">Gen</span>
          <span className="text-[#1E3FE0] dark:text-[#60A5FA]">Value</span>
        </span>
      )}
    </span>
  );
}
