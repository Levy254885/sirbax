"use client";

import { AppShell } from "@/components/layout/AppShell";
import { ArrowLeft, Check } from "@/components/ui/Icons";
import Link from "next/link";
import { useState } from "react";

const langs = ["English", "Swahili", "French", "Spanish", "Arabic", "German", "Portuguese"];

export default function LanguagePage() {
  const [selected, setSelected] = useState("English");
  return (
    <AppShell showRight={false}>
      <div className="flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3">
        <Link href="/settings" className="rounded-full p-1 hover:bg-slate-100"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-lg font-bold">Language</h1>
      </div>
      <div className="divide-y divide-slate-100 bg-white">
        {langs.map((l) => (
          <button key={l} onClick={() => setSelected(l)} className="flex w-full items-center justify-between px-4 py-4 text-left hover:bg-slate-50">
            <span className="text-sm font-medium">{l}</span>
            {selected === l && <Check className="h-5 w-5 text-blue-600" />}
          </button>
        ))}
      </div>
    </AppShell>
  );
}
