"use client";

import { AppShell } from "@/components/layout/AppShell";
import { ArrowLeft, ChevronRight, Key, Smartphone, Clock } from "@/components/ui/Icons";
import Link from "next/link";

export default function SecurityPage() {
  return (
    <AppShell showRight={false}>
      <div className="flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3">
        <Link href="/settings" className="rounded-full p-1 hover:bg-slate-100"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-lg font-bold">Security</h1>
      </div>
      <div className="divide-y divide-slate-100 bg-white">
        {[
          { icon: Key, label: "Change password", desc: "Update your password" },
          { icon: Smartphone, label: "Two-factor authentication", desc: "Off" },
          { icon: Clock, label: "Active sessions", desc: "1 device logged in" },
          { icon: Clock, label: "Login history", desc: "Recent activity" },
        ].map(({ icon: Icon, label, desc }) => (
          <button key={label} className="flex w-full items-center gap-3.5 px-4 py-4 text-left hover:bg-slate-50">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
              <Icon className="h-5 w-5 text-slate-700" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">{label}</p>
              <p className="text-xs text-slate-500">{desc}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-400" />
          </button>
        ))}
      </div>
    </AppShell>
  );
}
