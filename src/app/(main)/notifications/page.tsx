"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { listNotifications, markNotificationsRead, type AppNotification } from "@/services/platformService";
import { formatRelativeTime } from "@/lib/utils";
import { generateDefaultAvatar } from "@/utils/nickname";

export default function NotificationsPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [items, setItems] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (!user) return;
    listNotifications(user.uid).then((list) => {
      setItems(list);
      markNotificationsRead(user.uid);
    });
  }, [user]);

  return (
    <AppShell>
      <div className="border-b border-slate-100 bg-white px-4 py-3">
        <h1 className="text-xl font-bold text-slate-900">{t.notifications}</h1>
      </div>
      <div className="bg-white pb-24">
        {items.length === 0 && (
          <p className="px-4 py-16 text-center text-sm text-slate-400">No notifications yet</p>
        )}
        {items.map((n) => (
          <Link
            key={n.id}
            href={n.postId ? `/post/${n.postId}` : `/u/${n.actorId}`}
            className={`flex items-center gap-3 border-b border-slate-50 px-4 py-3.5 ${n.read ? "bg-white" : "bg-blue-50/50"}`}
          >
            <Avatar src={n.actorAvatar || generateDefaultAvatar(n.actorNickname)} alt={n.actorNickname} size="md" />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-slate-800">
                <span className="font-semibold">{n.actorNickname}</span> {n.text}
              </p>
              <p className="text-xs text-slate-400">{formatRelativeTime(n.createdAt)}</p>
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
