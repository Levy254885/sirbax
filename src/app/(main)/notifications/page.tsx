"use client";
import { AppShell } from "@/components/layout/AppShell";
import { Avatar } from "@/components/ui/Avatar";
import { generateDefaultAvatar } from "@/utils/nickname";

const items = [
  { user: "BlueMoon_204", text: "liked your post", time: "2m", unread: true },
  { user: "StormRider_671", text: "commented on your post", time: "15m", unread: true },
  { user: "NovaSky_319", text: "started following you", time: "1h", unread: false },
  { user: "LeafyMind_482", text: "mentioned you in a comment", time: "3h", unread: false },
];

export default function NotificationsPage() {
  return (
    <AppShell>
      <div className="sticky top-0 z-40 border-b border-border bg-card/95 px-4 py-3 backdrop-blur-md">
        <h1 className="text-xl font-bold">Notifications</h1>
      </div>
      {items.map((n, i) => (
        <button key={i} className={`flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left hover:bg-muted/50 ${n.unread ? "bg-accent/30" : ""}`}>
          <Avatar src={generateDefaultAvatar(n.user)} alt={n.user} size="md" />
          <div className="min-w-0 flex-1">
            <p className="text-sm"><span className="font-semibold">{n.user}</span> {n.text}</p>
            <p className="text-xs text-muted-foreground">{n.time}</p>
          </div>
        </button>
      ))}
    </AppShell>
  );
}
