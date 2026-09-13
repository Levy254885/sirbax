"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "@/components/ui/Icons";
import { useAuth } from "@/context/AuthContext";
import { uploadImage, validateImageFile } from "@/services/cloudinary";
import {
  canChangeNow,
  daysUntilChangeAllowed,
  isNicknameTaken,
  reserveLocalNickname,
} from "@/services/userService";
import { nicknameRevealsRealName } from "@/utils/realNameGuard";
import { generateAnonymousNickname } from "@/utils/nickname";
import { deleteUser } from "firebase/auth";
import { auth, isFirebaseConfigured, db } from "@/firebase/config";
import { doc, deleteDoc } from "firebase/firestore";
import toast from "@/lib/toast";

export default function AccountSettingsPage() {
  const { user, updateProfile, logout } = useAuth();
  const router = useRouter();
  const [bio, setBio] = useState(user?.bio || "");
  const [nickname, setNickname] = useState(user?.nickname || "");
  /** Private only — never saved to profile / Firestore public fields */
  const [privateRealName, setPrivateRealName] = useState("");
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  const nickDays = daysUntilChangeAllowed(user.lastNicknameChangeAt);
  const avatarDays = daysUntilChangeAllowed(user.lastAvatarChangeAt);
  const canNick = canChangeNow(user.lastNicknameChangeAt);
  const canAvatar = canChangeNow(user.lastAvatarChangeAt);
  // Always show when nickname editing is allowed (not only after typing a new name)
  const showPrivateNameField = canNick;

  const save = async () => {
    setBusy(true);
    try {
      const nextNick = nickname.trim().replace(/\s+/g, "");
      const updates: Parameters<typeof updateProfile>[0] = { bio };

      if (nextNick && nextNick !== user.nickname) {
        if (!canNick) {
          toast.error(`Nickname can only change once every 7 days. Wait ${nickDays} day(s).`);
          setBusy(false);
          return;
        }
        if (nextNick.length < 3) {
          toast.error("Nickname must be at least 3 characters");
          setBusy(false);
          return;
        }

        const check = nicknameRevealsRealName(nextNick, privateRealName);
        if (!check.allowed) {
          toast.error(check.reason);
          setBusy(false);
          return;
        }

        const taken = await isNicknameTaken(nextNick, user.uid);
        if (taken) {
          toast.error("That nickname is already taken");
          setBusy(false);
          return;
        }
        updates.nickname = nextNick;
        updates.lastNicknameChangeAt = new Date().toISOString();
        reserveLocalNickname(nextNick, user.uid);
      }

      await updateProfile(updates);
      setPrivateRealName("");
      toast.success("Profile updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    } finally {
      setBusy(false);
    }
  };

  const onAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!canAvatar) {
      toast.error(`Avatar can only change once every 7 days. Wait ${avatarDays} day(s).`);
      e.target.value = "";
      return;
    }
    const err = validateImageFile(f);
    if (err) {
      toast.error(err);
      return;
    }
    setBusy(true);
    try {
      const up = await uploadImage(f);
      await updateProfile({
        avatarUrl: up.secureUrl,
        lastAvatarChangeAt: new Date().toISOString(),
      });
      toast.success("Avatar updated — next change in 7 days");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  const deleteAccount = async () => {
    if (!confirm("Delete your account permanently?")) return;
    setBusy(true);
    try {
      if (isFirebaseConfigured && auth.currentUser) {
        try {
          await deleteDoc(doc(db, "users", user.uid));
        } catch {
          /* */
        }
        await deleteUser(auth.currentUser);
      }
      await logout();
      localStorage.clear();
      router.push("/login");
      toast.success("Account deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Re-login required to delete");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell showRight={false}>
      <div className="flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3">
        <Link href="/settings" className="rounded-full p-1 hover:bg-slate-100">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-bold">Edit profile</h1>
      </div>
      <div className="space-y-5 bg-white px-4 py-6">
        <div className="flex flex-col items-center gap-2">
          <Avatar src={user.avatarUrl} alt={user.nickname} size="xl" />
          <label
            className={`text-sm font-semibold ${
              canAvatar ? "cursor-pointer text-blue-600" : "text-slate-400"
            }`}
          >
            {canAvatar ? "Change photo" : `Photo locked (${avatarDays}d left)`}
            {canAvatar && (
              <input type="file" accept="image/*" className="hidden" onChange={onAvatar} />
            )}
          </label>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Anonymous username
          </label>
          <div className="flex gap-2">
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              disabled={!canNick}
              autoComplete="off"
              className="h-11 flex-1 rounded-xl border border-slate-200 px-3 text-sm focus:border-blue-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500"
            />
            {canNick && (
              <button
                type="button"
                onClick={() => setNickname(generateAnonymousNickname())}
                className="rounded-xl border border-slate-200 px-3 text-xs font-semibold"
              >
                Random
              </button>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {canNick
              ? "Public identity only. Must be unique. Change once every 7 days."
              : `Locked · next change in ${nickDays} day(s)`}
          </p>
        </div>

        {showPrivateNameField && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <label className="mb-1 block text-sm font-semibold text-slate-800">
              Your real / legal name (private)
            </label>
            <input
              type="text"
              value={privateRealName}
              onChange={(e) => setPrivateRealName(e.target.value)}
              autoComplete="off"
              placeholder="Not shown publicly — used only to block real-name nicknames"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none"
            />
            <p className="mt-2 text-[12px] leading-relaxed text-slate-600">
              Required when you change your nickname. We only use this privately to stop real-name
              nicknames. Your real name is <strong>never</strong> saved on your profile or shown to
              anyone else.
            </p>
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            maxLength={160}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <Button className="w-full rounded-xl bg-blue-600" loading={busy} onClick={save}>
          Save
        </Button>
        <button
          type="button"
          disabled={busy}
          onClick={deleteAccount}
          className="w-full rounded-xl border border-red-200 py-3 text-sm font-semibold text-red-600"
        >
          Delete account
        </button>
      </div>
    </AppShell>
  );
}
