"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { useI18n } from "@/context/I18nContext";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/firebase/config";
import toast from "@/lib/toast";

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      if (isFirebaseConfigured) {
        await sendPasswordResetEmail(auth, email);
      } else {
        await new Promise((r) => setTimeout(r, 500));
      }
      setSent(true);
      toast.success("Reset link sent");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send reset email");
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
        {sent ? (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900">{t.checkEmail}</h1>
            <p className="mt-2 text-sm text-slate-500">{email}</p>
            <Link href="/login" className="mt-8 block">
              <Button className="w-full rounded-xl bg-blue-600">{t.backToLogin}</Button>
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-slate-900">{t.resetPassword}</h1>
            <p className="mt-2 text-sm text-slate-500">Enter your email to receive a reset link</p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-3">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder={t.emailAddress} className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm focus:border-blue-500 focus:outline-none" />
              <Button type="submit" loading={loading} className="h-12 w-full rounded-xl bg-blue-600">{t.sendResetLink}</Button>
            </form>
            <Link href="/login" className="mt-6 text-center text-sm text-blue-600">{t.backToLogin}</Link>
          </>
        )}
      </div>
    </div>
  );
}
