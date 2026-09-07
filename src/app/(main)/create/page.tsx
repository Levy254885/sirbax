"use client";
import { AppShell } from "@/components/layout/AppShell";
import { Composer } from "@/components/post/Composer";

export default function CreatePage() {
  return (
    <AppShell showRight={false}>
      <div className="border-b border-border px-4 py-3"><h1 className="text-xl font-bold">Create post</h1></div>
      <Composer />
    </AppShell>
  );
}
