"use client";

import { useI18n } from "@/context/I18nContext";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({
  className,
  variant = "pills",
}: {
  className?: string;
  variant?: "pills" | "compact";
}) {
  const { lang, setLang } = useI18n();

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={() => setLang(lang === "so" ? "en" : "so")}
        className={cn(
          "rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50",
          className
        )}
      >
        {lang === "so" ? "English" : "Soomaali"}
      </button>
    );
  }

  return (
    <div
      className={cn("inline-flex rounded-full border border-slate-200 bg-slate-100 p-1", className)}
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => setLang("so")}
        className={cn(
          "rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
          lang === "so" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
        )}
      >
        Soomaali
      </button>
      <button
        type="button"
        onClick={() => setLang("en")}
        className={cn(
          "rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
          lang === "en" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
        )}
      >
        English
      </button>
    </div>
  );
}
