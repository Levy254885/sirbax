"use client";

import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, ChevronRight } from "@/components/ui/Icons";
import Link from "next/link";

export default function AccountSettingsPage() {
  const { user } = useAuth();
  return (
    <AppShell showRight={false}>
      <div className="flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3">
        <Link href="/settings" className="rounded-full p-1 hover:bg-slate-100"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-lg font-bold">Account</h1>
      </div>
      <div className="divide-y divide-slate-100 bg-white">
        {[
          { label: "Nickname", value: user?.nickname },
          { label: "Bio", value: user?.bio || "Not set" },
          { label: "Email", value: "Hidden (private)" },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between px-4 py-4">
            <div>
              <p className="text-sm font-medium text-slate-900">{row.label}</p>
              <p className="text-xs text-slate-500">{row.value}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-400" />
          </div>
        ))}
      </div>
    </AppShell>
  );
}
