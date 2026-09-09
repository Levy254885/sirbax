"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { generateAnonymousNickname, generateDefaultAvatar } from "@/utils/nickname";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const { t } = useI18n();
  const [nickname, setNickname] = useState(user?.nickname || generateAnonymousNickname());
  const [bio, setBio] = useState(user?.bio || "");
  const [step, setStep] = useState<"identity" | "welcome">("identity");
  const [saving, setSaving] = useState(false);

  const avatarUrl = useMemo(() => generateDefaultAvatar(nickname), [nickname]);

  const reshuffle = () => setNickname(generateAnonymousNickname());

  const continueIdentity = async () => {
    setSaving(true);
    try {
      await updateProfile({
        nickname,
        avatarUrl,
        bio: bio.trim() || undefined,
        onboardingComplete: false,
      });
      setStep("welcome");
    } finally {
      setSaving(false);
    }
  };

  const finish = async () => {
    setSaving(true);
    try {
      await updateProfile({ onboardingComplete: true, avatarUrl, nickname });
      router.replace("/home");
    } finally {
      setSaving(false);
    }
  };

  if (step === "welcome") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mb-5 h-24 w-24 overflow-hidden rounded-full bg-slate-100 ring-4 ring-blue-100 shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          </div>
          <p className="mb-1 text-sm font-semibold text-blue-600">{nickname}</p>
          <h1 className="mb-2 text-2xl font-bold tracking-tight text-slate-900">
            {t.welcomeToSirbax}
          </h1>
          <p className="text-[15px] leading-relaxed text-slate-600">{t.realConversations}</p>
          <p className="mb-8 text-[15px] leading-relaxed text-slate-600">{t.anonymousIdentities}</p>
          <Button
            size="lg"
            className="w-full rounded-2xl bg-blue-600 text-base font-semibold text-white shadow-md hover:bg-blue-700"
            loading={saving}
            onClick={finish}
          >
            {t.getStarted}
          </Button>
          <button
            type="button"
            onClick={finish}
            className="mt-4 w-full text-sm font-medium text-slate-500 hover:text-slate-800"
          >
            {t.skip}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-md">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-white">
              <path
                d="M12 3c-4.5 0-8 3-8 7.2 0 2.4 1.2 4.5 3.1 5.8L6 21l4.2-2.3c.6.1 1.2.2 1.8.2 4.5 0 8-3 8-7.2S16.5 3 12 3z"
                fill="currentColor"
              />
            </svg>
          </div>
          <h1 className="text-[22px] font-bold tracking-tight text-slate-900">
            {t.yourAnonymousIdentity}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            {t.knownByNickname}
            <br />
            {t.canChangeLater}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="h-28 w-28 overflow-hidden rounded-full bg-slate-100 ring-4 ring-blue-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={avatarUrl} alt={nickname} className="h-full w-full object-cover" />
              </div>
            </div>

            <div className="mt-5 flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="min-w-0 flex-1 truncate text-center text-lg font-semibold text-slate-900">
                {nickname}
              </span>
              <button
                type="button"
                onClick={reshuffle}
                className="shrink-0 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-blue-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-blue-50 active:scale-95"
              >
                ↻ {t.newNickname}
              </button>
            </div>
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-slate-700">{t.addBioOptional}</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={t.fewWordsAboutYou}
              rows={3}
              maxLength={160}
              className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <p className="mt-1 text-right text-[11px] text-slate-400">{bio.length}/160</p>
          </div>
        </div>

        <div className="mt-auto pt-8">
          <Button
            size="lg"
            className="w-full rounded-2xl bg-blue-600 text-[15px] font-semibold text-white shadow-md hover:bg-blue-700"
            loading={saving}
            onClick={continueIdentity}
          >
            {t.continue}
          </Button>
        </div>
      </div>
    </div>
  );
}
