import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ className, size = "md", showText = true }: LogoProps) {
  const sizes = { sm: "h-7 w-7", md: "h-9 w-9", lg: "h-12 w-12" };
  const textSizes = { sm: "text-lg", md: "text-xl", lg: "text-2xl" };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-500/20",
          sizes[size]
        )}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-[55%] w-[55%] text-white" aria-hidden>
          <path d="M12 3c-4.5 0-8 3-8 7.2 0 2.4 1.2 4.5 3.1 5.8L6 21l4.2-2.3c.6.1 1.2.2 1.8.2 4.5 0 8-3 8-7.2S16.5 3 12 3z" fill="currentColor" opacity=".9"/>
        </svg>
      </div>
      {showText && (
        <span className={cn("font-semibold tracking-tight text-foreground", textSizes[size])}>
          sirbax
        </span>
      )}
    </div>
  );
}
