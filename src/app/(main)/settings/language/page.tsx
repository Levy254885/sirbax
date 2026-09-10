"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ArrowLeft } from "@/components/ui/Icons";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { useI18n } from "@/context/I18nContext";

export default function LanguageSettingsPage() {
  const { t, lang } = useI18n();
  return (
    <AppShell showRight={false}>
      <div className="flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3">
        <Link href="/settings" className="rounded-full p-1 hover:bg-slate-100">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-bold">{t.language}</h1>
      </div>
      <div className="bg-white px-4 py-8">
        <p className="mb-4 text-sm text-slate-600">
          {lang === "so"
            ? "Dooro luqadda aad rabto — dhammaan app-ka ayaa is beddelaya."
            : "Choose your language — the whole app updates immediately."}
        </p>
        <LanguageSwitcher className="w-full justify-center" />
      </div>
    </AppShell>
  );
}
