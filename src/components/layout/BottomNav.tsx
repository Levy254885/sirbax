"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusCircle, Heart, User } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Avatar } from "@/components/ui/Avatar";

const items = [
  { href: "/home", icon: Home, label: "Home" },
  { href: "/explore", icon: Search, label: "Search" },
  { href: "/create", icon: PlusCircle, label: "Create" },
  { href: "/notifications", icon: Heart, label: "Activity" },
  { href: "/profile", icon: User, label: "Profile", isProfile: true },
];

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md pb-safe md:hidden">
      <div className="flex h-14 items-center justify-around px-2">
        {items.map(({ href, icon: Icon, label, isProfile }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center p-2",
                active ? "text-foreground" : "text-muted-foreground"
              )}
              aria-label={label}
            >
              {isProfile && user ? (
                <Avatar
                  src={user.avatarUrl}
                  alt={user.nickname}
                  size="sm"
                  className={cn("h-6 w-6", active && "ring-2 ring-foreground")}
                />
              ) : (
                <Icon className="h-6 w-6" strokeWidth={active ? 2.5 : 1.8} />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
