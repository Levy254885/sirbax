"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { Plus, Users } from "@/components/ui/Icons";
import { listGroups, joinGroupLocal, isJoinedGroup, type GroupItem } from "@/services/platformService";

export default function CommunitiesPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [joined, setJoined] = useState<Record<string, boolean>>({});

  useEffect(() => {
    listGroups().then((g) => {
      setGroups(g);
      if (user) {
        const map: Record<string, boolean> = {};
        g.forEach((x) => { map[x.id] = isJoinedGroup(user.uid, x.id); });
        setJoined(map);
      }
    });
  }, [user]);

  return (
    <AppShell showRight={false}>
      <div className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3">
        <h1 className="text-xl font-bold text-slate-900">{t.communities}</h1>
        <Link href="/communities/create" className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white">
          <Plus className="h-5 w-5" />
        </Link>
      </div>
      <div className="space-y-3 bg-slate-50 px-3 py-3 pb-24">
        {groups.map((g) => (
          <div key={g.id} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <Link href={`/communities/${g.id}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.coverUrl} alt="" className="h-28 w-full object-cover" />
            </Link>
            <div className="p-3.5">
              <div className="flex gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Users className="h-5 w-5" /></div>
                <div className="min-w-0 flex-1">
                  <Link href={`/communities/${g.id}`} className="font-bold text-slate-900 hover:underline">{g.name}</Link>
                  <p className="text-xs text-slate-500">{g.membersCount.toLocaleString()} members</p>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">{g.description}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Link href={`/communities/${g.id}`} className="flex-1 rounded-xl border border-slate-200 py-2 text-center text-sm font-semibold">Open</Link>
                <button type="button" className={`flex-1 rounded-xl py-2 text-sm font-semibold ${joined[g.id] ? "border border-slate-200" : "bg-blue-600 text-white"}`} onClick={() => { if (!user) return; joinGroupLocal(user.uid, g.id); setJoined((s) => ({ ...s, [g.id]: true })); }}>
                  {joined[g.id] ? "Joined" : t.join}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
