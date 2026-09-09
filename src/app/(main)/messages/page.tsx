"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { listConversations, type ConversationMeta } from "@/services/socialService";
import { formatRelativeTime } from "@/lib/utils";

export default function MessagesPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [convos, setConvos] = useState<ConversationMeta[]>([]);

  useEffect(() => {
    if (!user) return;
    listConversations(user.uid).then(setConvos);
  }, [user]);

  return (
    <AppShell showRight={false}>
      <div className="border-b border-slate-100 bg-white px-4 py-3">
        <h1 className="text-xl font-bold text-slate-900">{t.messages}</h1>
      </div>
      <div className="bg-white">
        {convos.length === 0 && (
          <p className="px-4 py-16 text-center text-sm text-slate-400">
            No messages yet. Open a profile and tap Message.
          </p>
        )}
        {convos.map((c) => {
          const otherId = c.participantIds.find((id) => id !== user?.uid) || c.participantIds[0];
          const name = c.participantNicknames[otherId] || "User";
          const avatar = c.participantAvatars[otherId];
          return (
            <Link
              key={c.id}
              href={`/messages/${c.id}?to=${otherId}&name=${encodeURIComponent(name)}`}
              className="flex items-center gap-3 border-b border-slate-50 px-4 py-3.5 hover:bg-slate-50"
            >
              <Avatar src={avatar} alt={name} size="md" className="ring-2 ring-slate-100" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-slate-900">{name}</p>
                  <span className="shrink-0 text-[11px] text-slate-400">{formatRelativeTime(c.updatedAt)}</span>
                </div>
                <p className="truncate text-sm text-slate-500">{c.lastMessage}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
