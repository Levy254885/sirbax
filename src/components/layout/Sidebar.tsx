"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  Bell,
  MessageCircle,
  Users,
  Bookmark,
  Calendar,
  ShoppingBag,
  Clock,
  Settings,
  MoreHorizontal,
} from "@/components/ui/Icons";
import { Logo } from "@/components/common/Logo";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/home", icon: Home, label: "Home" },
  { href: "/explore", icon: Search, label: "Explore" },
  { href: "/notifications", icon: Bell, label: "Notifications" },
  { href: "/messages", icon: MessageCircle, label: "Messages" },
  { href: "/communities", icon: Users, label: "Groups" },
  { href: "/saved", icon: Bookmark, label: "Saved" },
  { href: "/events", icon: Calendar, label: "Events" },
  { href: "/marketplace", icon: ShoppingBag, label: "Marketplace" },
  { href: "/memories", icon: Clock, label: "Memories" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card px-3 py-4 md:flex lg:w-72">
      <div className="mb-6 px-3">
        <Logo />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground hover:bg-muted"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted">
          <MoreHorizontal className="h-5 w-5" />
          More
        </button>
      </nav>

      {user && (
        <Link
          href="/profile"
          className="mt-auto flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-muted"
        >
          <Avatar src={user.avatarUrl} alt={user.nickname} size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user.nickname}</p>
            <p className="truncate text-xs text-muted-foreground">View profile</p>
          </div>
        </Link>
      )}
    </aside>
  );
}
