"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PostCard } from "@/components/post/PostCard";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Users } from "@/components/ui/Icons";
import { DEMO_POSTS } from "@/lib/demo-data";
import { useState } from "react";

const META: Record<string, { name: string; members: number; desc: string; cover: string }> = {
  g1: { name: "Anonymous Voices", members: 12400, desc: "Share freely. Stay anonymous.", cover: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80" },
  g2: { name: "Tech Night Owls", members: 8320, desc: "Code, build, and ship after dark.", cover: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80" },
  g3: { name: "Somali Stories", members: 22100, desc: "Culture, language, and daily life.", cover: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80" },
  g4: { name: "Photo Walks", members: 5600, desc: "Share frames from around the world.", cover: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80" },
  g5: { name: "Quiet Corner", members: 3100, desc: "Soft conversations. No pressure.", cover: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80" },
};

export default function CommunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const meta = META[id] || { name: "Group", members: 100, desc: "Community on sirbax", cover: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80" };
  const [joined, setJoined] = useState(false);

  return (
    <AppShell showRight={false}>
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={meta.cover} alt="" className="h-40 w-full object-cover md:h-52" />
        <Link href="/communities" className="absolute left-3 top-3 rounded-full bg-black/50 p-2 text-white">
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </div>
      <div className="border-b border-slate-100 bg-white px-4 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Users className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-slate-900">{meta.name}</h1>
            <p className="text-sm text-slate-500">{meta.members.toLocaleString()} members</p>
            <p className="mt-1 text-sm text-slate-600">{meta.desc}</p>
          </div>
        </div>
        <Button className={`mt-4 w-full rounded-xl ${joined ? "border border-slate-200 bg-white text-slate-800" : "bg-blue-600 hover:bg-blue-700"}`} onClick={() => setJoined(!joined)}>
          {joined ? "Joined" : "Join group"}
        </Button>
      </div>
      <div className="bg-white pb-20">
        {DEMO_POSTS.map((p) => (
          <PostCard key={p.id} post={{ ...p, communityName: meta.name, communityId: id }} />
        ))}
      </div>
    </AppShell>
  );
}
