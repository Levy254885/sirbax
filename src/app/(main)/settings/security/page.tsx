"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ArrowLeft } from "@/components/ui/Icons";
import { useAuth } from "@/context/AuthContext";
import toast from "@/lib/toast";

export default function SecurityPage() {
  const { logout } = useAuth();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");

  return (
    <AppShell showRight={false}>
      <div className="flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3">
        <Link href="/settings" className="rounded-full p-1 hover:bg-slate-100">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-bold">Security</h1>
      </div>
      <div className="space-y-4 bg-white p-4">
        <div>
          <p className="mb-2 text-sm font-semibold">Change password</p>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="New password" className="mb-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" />
          <input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="Confirm" className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" />
          <button
            type="button"
            className="mt-3 w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white"
            onClick={() => {
              if (pw.length < 6 || pw !== pw2) {
                toast.error("Passwords must match (min 6)");
                return;
              }
              toast.success("Password update requested");
              setPw("");
              setPw2("");
            }}
          >
            Update password
          </button>
        </div>
        <button
          type="button"
          className="w-full rounded-xl border border-red-200 py-3 text-sm font-semibold text-red-600"
          onClick={async () => {
            await logout();
            window.location.href = "/login";
          }}
        >
          Log out
        </button>
      </div>
    </AppShell>
  );
}
