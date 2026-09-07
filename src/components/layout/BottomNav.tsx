"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusCircle, MessageCircle, User } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

const items = [
  { href: "/home", icon: Home, label: "Home" },
  { href: "/explore", icon: Search, label: "Explore" },
  { href: "/create", icon: PlusCircle, label: "Create", primary: true },
  { href: "/messages", icon: MessageCircle, label: "Messages" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md pb-safe md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {items.map(({ href, icon: Icon, label, primary }) => {
          const active = pathname.startsWith(href);
          if (primary) {
            return (
              <Link
                key={href}
                href={href}
                className="flex -mt-5 h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                aria-label={label}
              >
                <Icon className="h-7 w-7" strokeWidth={2.5} />
              </Link>
            );
          }
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 text-xs",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-6 w-6" strokeWidth={active ? 2.5 : 2} />
              <span className="sr-only sm:not-sr-only">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
