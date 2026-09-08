"use client";

import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { useRouter } from "next/navigation";
import {
  User, Lock, Bell, Palette, Shield, HelpCircle, LogOut, ChevronRight, Globe, Ban, VolumeX, ArrowLeft,
} from "@/components/ui/Icons";
import Link from "next/link";

export default function SettingsPage() {
  const { logout, user } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  const sections = [
    { icon: User, label: t.account, desc: "Maamul profile-kaaga", href: "/settings/account" },
    { icon: Lock, label: t.privacy, desc: "Xakamee cidda arki karta", href: "/settings/privacy" },
    { icon: Bell, label: t.notifications, desc: "Push, iimayl & in-app", href: "/settings/notifications" },
    { icon: Palette, label: t.appearance, desc: "Iftiin, madow ama nidaam", href: "/settings/appearance" },
    { icon: Shield, label: t.security, desc: "Furaha, 2FA, sessions", href: "/settings/security" },
    { icon: Ban, label: t.blockedUsers, desc: "Dadka aad xayirtay", href: "/settings/blocked" },
    { icon: VolumeX, label: t.mutedUsers, desc: "Dadka aad aamusisay", href: "/settings/muted" },
    { icon: Globe, label: t.language, desc: "Soomaali / English", href: "/settings/language" },
    { icon: HelpCircle, label: t.helpSupport, desc: "Caawimaad, badbaado, xeerarka", href: "/settings/help" },
  ];

  return (
    <AppShell showRight={false}>
      <div className="flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3">
        <Link href="/profile" className="rounded-full p-1 hover:bg-slate-100 md:hidden">
          <ArrowLeft className="h-5 w-5 text-slate-700" />
        </Link>
        <h1 className="text-xl font-bold text-slate-900">{t.settings}</h1>
      </div>

      <div className="divide-y divide-slate-100 bg-white">
        {sections.map(({ icon: Icon, label, desc, href }) => (
          <Link key={href} href={href} className="flex w-full items-center gap-3.5 px-4 py-4 text-left hover:bg-slate-50">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700">
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">{label}</p>
              <p className="text-xs text-slate-500">{desc}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-400" />
          </Link>
        ))}
      </div>

      <div className="p-4">
        <button
          onClick={async () => {
            await logout();
            router.push("/");
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-3.5 text-sm font-semibold text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-5 w-5" />
          {t.logOut}
        </button>
        <p className="mt-4 text-center text-xs text-slate-400">
          {t.signedInAs} {user?.nickname}
        </p>
      </div>
    </AppShell>
  );
}
