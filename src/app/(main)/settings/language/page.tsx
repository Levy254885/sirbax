"use client";

import { AppShell } from "@/components/layout/AppShell";
import { ArrowLeft, Check } from "@/components/ui/Icons";
import { useI18n } from "@/context/I18nContext";
import Link from "next/link";

export default function LanguagePage() {
  const { lang, setLang, t } = useI18n();

  const options = [
    { code: "so" as const, label: "Soomaali", native: "Af-Soomaali" },
    { code: "en" as const, label: "English", native: "English" },
  ];

  return (
    <AppShell showRight={false}>
      <div className="flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3">
        <Link href="/settings" className="rounded-full p-1 hover:bg-slate-100">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-bold">{t.language}</h1>
      </div>
      <div className="divide-y divide-slate-100 bg-white">
        {options.map((o) => (
          <button
            key={o.code}
            onClick={() => setLang(o.code)}
            className="flex w-full items-center justify-between px-4 py-4 text-left hover:bg-slate-50"
          >
            <div>
              <p className="text-sm font-semibold text-slate-900">{o.label}</p>
              <p className="text-xs text-slate-500">{o.native}</p>
            </div>
            {lang === o.code && <Check className="h-5 w-5 text-blue-600" />}
          </button>
        ))}
      </div>
    </AppShell>
  );
}
