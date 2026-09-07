"use client";
import { AppShell } from "@/components/layout/AppShell";
import { Avatar } from "@/components/ui/Avatar";
import { generateDefaultAvatar } from "@/utils/nickname";
import { Search } from "@/components/ui/Icons";
import Link from "next/link";

const conversations = [
  { id: "c1", user: "BlueMoon_204", last: "Hey! How are you doing?", time: "2m", unread: 1 },
  { id: "c2", user: "StormRider_671", last: "That is awesome!", time: "15m", unread: 0 },
  { id: "c3", user: "NovaSky_319", last: "Sent an image", time: "1h", unread: 2 },
  { id: "c4", user: "LeafyMind_482", last: "Let us catch up soon!", time: "2h", unread: 0 },
];

export default function MessagesPage() {
  return (
    <AppShell showRight={false}>
      <div className="sticky top-0 z-40 border-b border-border bg-card px-4 py-3">
        <h1 className="text-xl font-bold">Messages</h1>
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="search" placeholder="Search conversations..." className="h-10 w-full rounded-full border border-border bg-muted pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>
      {conversations.map((c) => (
        <Link key={c.id} href={`/messages/${c.id}`} className="flex w-full items-center gap-3 border-b border-border px-4 py-3 hover:bg-muted/50">
          <Avatar src={generateDefaultAvatar(c.user)} alt={c.user} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <p className="truncate text-sm font-semibold">{c.user}</p>
              <span className="text-xs text-muted-foreground">{c.time}</span>
            </div>
            <p className="truncate text-sm text-muted-foreground">{c.last}</p>
          </div>
          {c.unread > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">{c.unread}</span>
          )}
        </Link>
      ))}
    </AppShell>
  );
}
