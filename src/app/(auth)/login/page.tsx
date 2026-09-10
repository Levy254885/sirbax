"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import toast from "@/lib/toast";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginWithEmail, loginWithGoogle, enterDemo } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error(t.emailOrUsername);
      return;
    }
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      router.push("/home");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
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
            <span className="text-xl font-bold text-white">S</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t.appName}</h1>
          <p className="mt-2 text-sm text-slate-500">
            {t.tagline1} {t.tagline2}
          </p>
        </div>

        <h2 className="mb-1 text-center text-xl font-semibold text-slate-900">{t.welcomeBack}</h2>
        <p className="mb-6 text-center text-sm text-slate-500">{t.signInContinue}</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            placeholder={t.emailOrUsername}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-[15px] text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <input
            type="password"
            placeholder={t.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-[15px] text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-sm font-medium text-blue-600 hover:underline">
              {t.forgotPassword}
            </Link>
          </div>
          <Button type="submit" className="h-12 w-full rounded-xl bg-blue-600 text-base font-semibold hover:bg-blue-700" loading={loading}>
            {t.logIn}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs text-slate-400">{t.orContinueWith}</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <button
          type="button"
          onClick={async () => {
            try {
              await loginWithGoogle();
              router.push("/home");
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Google login failed");
            }
          }}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          Google
        </button>

        <button
          type="button"
          onClick={() => {
            enterDemo();
            router.push("/home");
          }}
          className="mt-3 w-full text-center text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          {t.tryDemo}
        </button>

        <p className="mt-8 text-center text-sm text-slate-500">
          {t.noAccount}{" "}
          <Link href="/register" className="font-semibold text-blue-600 hover:underline">
            {t.signUp}
          </Link>
        </p>
      </div>
    </div>
  );
}
