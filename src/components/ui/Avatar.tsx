import Image from "next/image";
import { getInitials, getAvatarColor } from "@/lib/utils/initials";

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  priority?: boolean;
}

const sizeClasses = {
  sm: "h-10 w-10 text-sm",
  md: "h-16 w-16 text-xl",
  lg: "h-24 w-24 text-3xl",
  xl: "h-32 w-32 text-4xl",
};

export default function Avatar({
  src,
  name,
  size = "md",
  className = "",
  priority = false,
}: AvatarProps) {
  const initials = getInitials(name);
  const colorClass = getAvatarColor(name);
  const sizeClass = sizeClasses[size];

  if (src) {
    return (
      <div className={`relative overflow-hidden rounded-full ${sizeClass} ${className}`}>
        <Image
          src={src}
          alt={name}
          fill
          sizes={size === "sm" ? "40px" : size === "md" ? "64px" : size === "lg" ? "96px" : "128px"}
          className="object-cover"
          priority={priority}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full ${sizeClass} ${colorClass} ${className}`}
    >
      <span className="font-bold text-white">{initials}</span>
    </div>
  );
}
