"use client";

import { AppShell } from "@/components/layout/AppShell";
import { useTheme } from "@/context/ThemeContext";
import { ArrowLeft, Sun, Moon, Monitor, Check } from "@/components/ui/Icons";
import Link from "next/link";
import { cn } from "@/lib/utils";

const options = [
  { value: "light" as const, label: "Light", icon: Sun, desc: "White background" },
  { value: "dark" as const, label: "Dark", icon: Moon, desc: "Dark elegant theme" },
  { value: "system" as const, label: "System", icon: Monitor, desc: "Match device settings" },
];

export default function AppearancePage() {
  const { theme, setTheme } = useTheme();

  return (
    <AppShell showRight={false}>
      <div className="flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3">
        <Link href="/settings" className="rounded-full p-1 hover:bg-slate-100">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-bold text-slate-900">Appearance</h1>
      </div>
      <div className="space-y-2 p-4">
        {options.map(({ value, label, icon: Icon, desc }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors",
              theme === value ? "border-blue-600 bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50"
            )}
          >
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", theme === value ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600")}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900">{label}</p>
              <p className="text-xs text-slate-500">{desc}</p>
            </div>
            {theme === value && <Check className="h-5 w-5 text-blue-600" />}
          </button>
        ))}
      </div>
    </AppShell>
  );
}
