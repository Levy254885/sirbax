"use client";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "next/navigation";
import { User, Lock, Bell, Palette, Shield, HelpCircle, LogOut, ChevronRight } from "@/components/ui/Icons";

const sections = [
  { icon: User, label: "Account", desc: "Manage your profile", href: "/settings" },
  { icon: Lock, label: "Privacy", desc: "Control who can see your content", href: "/settings/privacy" },
  { icon: Bell, label: "Notifications", desc: "Manage notifications", href: "/settings" },
  { icon: Palette, label: "Appearance", desc: "Light, dark or system", href: null },
  { icon: Shield, label: "Security", desc: "Keep your account safe", href: "/settings" },
  { icon: HelpCircle, label: "Help", desc: "Support and resources", href: "/settings" },
];

export default function SettingsPage() {
  const { logout, user } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  return (
    <AppShell showRight={false}>
      <div className="border-b border-border px-4 py-3"><h1 className="text-xl font-bold">Settings</h1></div>
      <div className="divide-y divide-border">
        {sections.map(({ icon: Icon, label, desc, href }) => (
          <button key={label} className="flex w-full items-center gap-3 px-4 py-4 text-left hover:bg-muted/50" onClick={() => {
            if (label === "Appearance") {
              setTheme(theme === "light" ? "dark" : theme === "dark" ? "system" : "light");
              return;
            }
            if (href) router.push(href);
          }}>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted"><Icon className="h-5 w-5" /></div>
            <div className="flex-1">
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">{label === "Appearance" ? `Current: ${theme}` : desc}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        ))}
      </div>
      <div className="p-4">
        <button onClick={async () => { await logout(); router.push("/"); }} className="flex w-full items-center gap-3 rounded-xl border border-destructive/30 px-4 py-3 text-destructive hover:bg-destructive/10">
          <LogOut className="h-5 w-5" /><span className="text-sm font-medium">Log out</span>
        </button>
        <p className="mt-4 text-center text-xs text-muted-foreground">Signed in as {user?.nickname}</p>
      </div>
    </AppShell>
  );
}
