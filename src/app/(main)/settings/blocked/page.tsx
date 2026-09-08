"use client";

import { AppShell } from "@/components/layout/AppShell";
import { ArrowLeft } from "@/components/ui/Icons";
import { Avatar } from "@/components/ui/Avatar";
import { generateDefaultAvatar } from "@/utils/nickname";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const blocked = ["ShadowLeaf_673", "NovaSky_319"];

export default function BlockedPage() {
  return (
    <AppShell showRight={false}>
      <div className="flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3">
        <Link href="/settings" className="rounded-full p-1 hover:bg-slate-100"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-lg font-bold">Blocked users</h1>
      </div>
      {blocked.map((n) => (
        <div key={n} className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
          <Avatar src={generateDefaultAvatar(n)} alt={n} size="md" />
          <span className="flex-1 text-sm font-semibold">{n}</span>
          <Button size="sm" variant="outline">Unblock</Button>
        </div>
      ))}
    </AppShell>
  );
}
