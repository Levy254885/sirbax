"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { PostCard } from "@/components/post/PostCard";
import { useAuth } from "@/context/AuthContext";
import { DEMO_POSTS } from "@/lib/demo-data";
import { Settings } from "@/components/ui/Icons";
import Link from "next/link";
import { useState } from "react";

export default function ProfilePage() {
  const { user } = useAuth();
  const [tab, setTab] = useState(0);
  if (!user) return null;

  return (
    <AppShell showRight={false}>
      <div className="flex items-center justify-between border-b border-border px-4 py-3 md:hidden">
        <h1 className="text-lg font-bold">{user.nickname}</h1>
        <Link href="/settings" className="p-1"><Settings className="h-6 w-6" /></Link>
      </div>

      <div className="bg-card px-4 pb-4 pt-6">
        <div className="flex items-start gap-4">
          <Avatar src={user.avatarUrl} alt={user.nickname} className="h-20 w-20 ring-4 ring-primary/10 md:h-24 md:w-24" />
          <div className="min-w-0 flex-1 pt-1">
            <h1 className="truncate text-xl font-bold">{user.nickname}</h1>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {user.bio || "Just a curious mind. Here for good vibes and great conversations."}
            </p>
          </div>
        </div>

        <div className="mt-5 flex justify-around text-center">
          <div>
            <p className="text-lg font-bold">{user.postsCount}</p>
            <p className="text-xs text-muted-foreground">Posts</p>
          </div>
          <button>
            <p className="text-lg font-bold">{user.followersCount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Followers</p>
          </button>
          <button>
            <p className="text-lg font-bold">{user.followingCount}</p>
            <p className="text-xs text-muted-foreground">Following</p>
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          <Button variant="secondary" size="sm" className="flex-1">Edit profile</Button>
          <Button variant="outline" size="sm" className="flex-1">Share profile</Button>
          <Link href="/settings">
            <Button variant="outline" size="icon"><Settings className="h-4 w-4" /></Button>
          </Link>
        </div>
      </div>

      <div className="flex border-b border-border bg-card">
        {["Posts", "Replies", "Media", "Likes"].map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`flex-1 py-3 text-center text-sm font-semibold ${
              tab === i ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="pt-2">
        {DEMO_POSTS.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </AppShell>
  );
}
