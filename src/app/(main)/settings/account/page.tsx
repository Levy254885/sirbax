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
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  const save = async () => {
    setBusy(true);
    try {
      const nextNick = nickname.trim().replace(/\s+/g, "") || user.nickname;
      await updateProfile({ bio, nickname: nextNick });
      toast.success("Profile updated");
    } catch {
      toast.error("Could not save");
    } finally {
      setBusy(false);
    }
  };

  const onAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const err = validateImageFile(f);
    if (err) { toast.error(err); return; }
    setBusy(true);
    try {
      const up = await uploadImage(f);
      await updateProfile({ avatarUrl: up.secureUrl });
      toast.success("Avatar updated");
    } catch {
      toast.error("Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const deleteAccount = async () => {
    if (!confirm("Delete your account permanently?")) return;
    setBusy(true);
    try {
      if (isFirebaseConfigured && auth.currentUser) {
        try { await deleteDoc(doc(db, "users", user.uid)); } catch { /* */ }
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
        <Link href="/settings" className="rounded-full p-1 hover:bg-slate-100"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-lg font-bold">Edit profile</h1>
      </div>
      <div className="space-y-5 bg-white px-4 py-6">
        <div className="flex flex-col items-center gap-2">
          <Avatar src={user.avatarUrl} alt={user.nickname} size="xl" />
          <label className="cursor-pointer text-sm font-semibold text-blue-600">Change photo<input type="file" accept="image/*" className="hidden" onChange={onAvatar} /></label>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Anonymous username</label>
          <div className="flex gap-2">
            <input value={nickname} onChange={(e) => setNickname(e.target.value)} className="h-11 flex-1 rounded-xl border border-slate-200 px-3 text-sm focus:border-blue-500 focus:outline-none" />
            <button type="button" onClick={() => setNickname(generateAnonymousNickname())} className="rounded-xl border border-slate-200 px-3 text-xs font-semibold">Random</button>
          </div>
          <p className="mt-1 text-xs text-slate-400">No real name required — stay anonymous</p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Bio</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={160} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
        </div>
        <Button className="w-full rounded-xl bg-blue-600" loading={busy} onClick={save}>Save</Button>
        <button type="button" disabled={busy} onClick={deleteAccount} className="w-full rounded-xl border border-red-200 py-3 text-sm font-semibold text-red-600">Delete account</button>
      </div>
    </AppShell>
  );
}
