"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import toast from "@/lib/toast";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const { registerWithEmail, loginWithGoogle } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || password.length < 6) {
      toast.error("Iimayl sax ah iyo furaha (ugu yaraan 6 xaraf)");
      return;
    }
    if (password !== confirm) {
      toast.error("Furayaashu isma dhigmaan");
      return;
    }
    setLoading(true);
    try {
      await registerWithEmail(email, password);
      toast.success("Ku soo dhawoow sirbax!");
      router.push("/onboarding");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Diiwaangelintu way fashilantay");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="flex justify-end px-4 pt-4">
        <LanguageSwitcher />
      </div>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-8">
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
            <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-white">
              <path d="M12 3c-4.5 0-8 3-8 7.2 0 2.4 1.2 4.5 3.1 5.8L6 21l4.2-2.3c.6.1 1.2.2 1.8.2 4.5 0 8-3 8-7.2S16.5 3 12 3z" fill="currentColor" />
            </svg>
          </div>
          <h1 className="text-[22px] font-bold tracking-tight text-slate-900">{t.createAccount}</h1>
          <p className="mt-1 text-sm text-slate-500">{t.joinSirbax}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="email" placeholder={t.emailAddress} value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email"
            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-[15px] text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          <input type="password" placeholder={t.password} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete="new-password"
            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-[15px] text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          <input type="password" placeholder={t.confirmPassword} value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={6} autoComplete="new-password"
            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-[15px] text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          <Button type="submit" size="lg" className="mt-2 w-full rounded-xl bg-blue-600 text-[15px] font-semibold hover:bg-blue-700" loading={loading}>
            {t.createAccountBtn}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs text-slate-400">{t.orContinueWith}</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={async () => { setLoading(true); try { await loginWithGoogle(); router.push("/home"); } finally { setLoading(false); } }}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50">
            Google
          </button>
          <button type="button" disabled className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 opacity-60">
            Apple
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          {t.haveAccount}{" "}
          <Link href="/login" className="font-semibold text-blue-600 hover:underline">{t.logIn}</Link>
        </p>
      </div>
    </div>
  );
}
