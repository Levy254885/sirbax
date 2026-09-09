"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useI18n } from "@/context/I18nContext";
import { Plus, Users } from "@/components/ui/Icons";

const GROUPS = [
  { id: "g1", name: "Anonymous Voices", members: 12400, desc: "Share freely. Stay anonymous.", cover: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", joined: false },
  { id: "g2", name: "Tech Night Owls", members: 8320, desc: "Code, build, and ship after dark.", cover: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80", joined: true },
  { id: "g3", name: "Somali Stories", members: 22100, desc: "Culture, language, and daily life.", cover: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80", joined: false },
  { id: "g4", name: "Photo Walks", members: 5600, desc: "Share frames from around the world.", cover: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80", joined: false },
  { id: "g5", name: "Quiet Corner", members: 3100, desc: "Soft conversations. No pressure.", cover: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80", joined: true },
];

export default function CommunitiesPage() {
  const { t } = useI18n();
  const [joined, setJoined] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(GROUPS.map((g) => [g.id, g.joined]))
  );

  return (
    <AppShell showRight={false}>
      <div className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3">
        <h1 className="text-xl font-bold text-slate-900">{t.communities}</h1>
        <Link href="/communities/create" className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white" aria-label="Create group">
          <Plus className="h-5 w-5" />
        </Link>
      </div>
      <div className="space-y-3 bg-slate-50 px-3 py-3 pb-24">
        {GROUPS.map((g) => (
          <div key={g.id} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
            <Link href={`/communities/${g.id}`} className="block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.cover} alt="" className="h-28 w-full object-cover" />
            </Link>
            <div className="p-3.5">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Users className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/communities/${g.id}`} className="text-[15px] font-bold text-slate-900 hover:underline">{g.name}</Link>
                  <p className="mt-0.5 text-xs text-slate-500">{g.members.toLocaleString()} members</p>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">{g.desc}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Link href={`/communities/${g.id}`} className="flex-1 rounded-xl border border-slate-200 py-2 text-center text-sm font-semibold text-slate-800 hover:bg-slate-50">Open</Link>
                <button type="button" onClick={() => setJoined((s) => ({ ...s, [g.id]: !s[g.id] }))} className={`flex-1 rounded-xl py-2 text-sm font-semibold ${joined[g.id] ? "border border-slate-200 bg-white text-slate-800" : "bg-blue-600 text-white"}`}>
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
