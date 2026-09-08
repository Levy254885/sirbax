"use client";

import { AppShell } from "@/components/layout/AppShell";
import { ArrowLeft } from "@/components/ui/Icons";
import Link from "next/link";
import { useState } from "react";

function Toggle({ on, set }: { on: boolean; set: (v: boolean) => void }) {
  return (
    <button onClick={() => set(!on)} className={`relative h-7 w-12 rounded-full transition-colors ${on ? "bg-blue-600" : "bg-slate-200"}`}>
      <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${on ? "left-5" : "left-0.5"}`} />
    </button>
  );
}

export default function NotificationSettingsPage() {
  const [likes, setLikes] = useState(true);
  const [comments, setComments] = useState(true);
  const [follows, setFollows] = useState(true);
  const [messages, setMessages] = useState(true);

  return (
    <AppShell showRight={false}>
      <div className="flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3">
        <Link href="/settings" className="rounded-full p-1 hover:bg-slate-100"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-lg font-bold">Notifications</h1>
      </div>
      <div className="divide-y divide-slate-100 bg-white">
        {[
          { label: "Likes", desc: "When someone likes your post", on: likes, set: setLikes },
          { label: "Comments", desc: "When someone comments", on: comments, set: setComments },
          { label: "Follows", desc: "When someone follows you", on: follows, set: setFollows },
          { label: "Messages", desc: "New direct messages", on: messages, set: setMessages },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between px-4 py-4">
            <div>
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-slate-500">{item.desc}</p>
            </div>
            <Toggle on={item.on} set={item.set} />
          </div>
        ))}
      </div>
    </AppShell>
  );
}
