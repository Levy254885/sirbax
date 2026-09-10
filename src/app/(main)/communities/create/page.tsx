"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "@/components/ui/Icons";
import { useAuth } from "@/context/AuthContext";
import { createGroup } from "@/services/platformService";
import toast from "@/lib/toast";

export default function CreateCommunityPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!user || !name.trim()) { toast.error("Enter a group name"); return; }
    setBusy(true);
    try {
      const g = await createGroup({ name, description: desc, ownerId: user.uid });
      toast.success("Group created");
      router.push(`/communities/${g.id}`);
    } catch {
      toast.error("Failed to create group");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell showRight={false}>
      <div className="flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3">
        <Link href="/communities" className="rounded-full p-1 hover:bg-slate-100"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-lg font-bold">Create group</h1>
      </div>
      <div className="space-y-4 bg-white px-4 py-6">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Group name" className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-blue-500 focus:outline-none" />
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} placeholder="Description" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
        <Button className="w-full rounded-xl bg-blue-600" loading={busy} onClick={submit}>Create</Button>
      </div>
    </AppShell>
  );
}
