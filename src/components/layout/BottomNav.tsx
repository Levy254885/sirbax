"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, MessageCircle, User } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  const item = (href: string, Icon: typeof Home, label: string, badge?: number) => {
    const active = pathname.startsWith(href);
    return (
      <Link
        key={href}
        href={href}
        className={cn(
          "relative flex flex-1 flex-col items-center gap-0.5 py-1 text-[10px] font-medium",
          active ? "text-primary" : "text-muted-foreground"
        )}
      >
        <Icon className="h-6 w-6" strokeWidth={active ? 2.4 : 1.8} />
        {label}
        {badge ? (
          <span className="absolute right-[18%] top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-white">
            {badge}
          </span>
        ) : null}
      </Link>
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md pb-safe md:hidden">
      <div className="flex h-16 items-center px-1">
        {item("/home", Home, "Home")}
        {item("/explore", Search, "Explore")}
        <div className="flex flex-1 items-center justify-center">
          <Link
            href="/create"
            className="-mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30"
            aria-label="Create"
          >
            <span className="text-2xl font-light leading-none">+</span>
          </Link>
        </div>
        {item("/messages", MessageCircle, "Messages", 2)}
        {item("/profile", User, "Profile")}
      </div>
    </nav>
  );
}
