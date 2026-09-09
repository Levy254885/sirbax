"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Composer } from "@/components/post/Composer";
import { useAuth } from "@/context/AuthContext";
import { Avatar } from "@/components/ui/Avatar";
import Link from "next/link";
import { ArrowLeft } from "@/components/ui/Icons";

export default function CreatePage() {
  const { user } = useAuth();

  return (
    <AppShell showRight={false}>
      <div className="flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3">
        <Link href="/home" className="rounded-full p-1 hover:bg-slate-100">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-bold text-slate-900">Create Post</h1>
      </div>
      <div className="bg-white px-4 py-3">
        <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
          <Avatar src={user?.avatarUrl} alt={user?.nickname || ""} size="sm" />
          <span>
            Posting as <span className="font-semibold text-slate-900">{user?.nickname}</span>
          </span>
        </div>
      </div>
      <Composer redirectToHome />
    </AppShell>
  );
}
