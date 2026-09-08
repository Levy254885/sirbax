"use client";

import { AppShell } from "@/components/layout/AppShell";
import { ArrowLeft, ChevronRight, HelpCircle, FileText, Shield, Info } from "@/components/ui/Icons";
import Link from "next/link";

export default function HelpPage() {
  return (
    <AppShell showRight={false}>
      <div className="flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3">
        <Link href="/settings" className="rounded-full p-1 hover:bg-slate-100"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-lg font-bold">Help & Support</h1>
      </div>
      <div className="divide-y divide-slate-100 bg-white">
        {[
          { icon: HelpCircle, label: "Help Center" },
          { icon: FileText, label: "Report a problem" },
          { icon: Shield, label: "Safety tips" },
          { icon: FileText, label: "Terms of Service" },
          { icon: FileText, label: "Privacy Policy" },
          { icon: Info, label: "About sirbax" },
        ].map(({ icon: Icon, label }) => (
          <button key={label} className="flex w-full items-center gap-3.5 px-4 py-4 text-left hover:bg-slate-50">
            <Icon className="h-5 w-5 text-slate-600" />
            <span className="flex-1 text-sm font-medium">{label}</span>
            <ChevronRight className="h-5 w-5 text-slate-400" />
          </button>
        ))}
      </div>
    </AppShell>
  );
}
