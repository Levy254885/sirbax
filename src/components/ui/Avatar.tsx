"use client";

import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  fallback?: string;
}

const sizeMap = {
  xs: "h-6 w-6",
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
  "2xl": "h-24 w-24",
};

export function Avatar({
  src,
  alt = "Avatar",
  size = "md",
  className,
  fallback,
}: AvatarProps) {
  const initials = fallback?.slice(0, 2).toUpperCase() || "?";

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 overflow-hidden rounded-full bg-muted",
        sizeMap[size],
        className
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-xs font-medium text-muted-foreground">
          {initials}
        </span>
      )}
    </div>
  );
}
