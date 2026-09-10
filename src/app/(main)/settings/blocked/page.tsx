"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ArrowLeft } from "@/components/ui/Icons";
import { useAuth } from "@/context/AuthContext";
import { listBlocked, unblockUser } from "@/services/platformService";
import toast from "@/lib/toast";

export default function BlockedPage() {
  const { user } = useAuth();
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    if (user) listBlocked(user.uid).then(setIds);
  }, [user]);

  return (
    <AppShell showRight={false}>
      <div className="flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3">
        <Link href="/settings" className="rounded-full p-1 hover:bg-slate-100">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-bold">Blocked users</h1>
      </div>
      <div className="bg-white">
        {ids.length === 0 && <p className="px-4 py-12 text-center text-sm text-slate-400">No blocked users</p>}
        {ids.map((id) => (
          <div key={id} className="flex items-center justify-between border-b border-slate-50 px-4 py-3">
            <Link href={`/u/${id}`} className="text-sm font-medium text-slate-900">{id.slice(0, 12)}…</Link>
            <button type="button" className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold" onClick={async () => {
              if (!user) return;
              await unblockUser(user.uid, id);
              setIds((s) => s.filter((x) => x !== id));
              toast.success("Unblocked");
            }}>Unblock</button>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
