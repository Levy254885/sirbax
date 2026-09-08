"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { PostCard } from "@/components/post/PostCard";
import { useAuth } from "@/context/AuthContext";
import { DEMO_POSTS } from "@/lib/demo-data";
import { Settings } from "@/components/ui/Icons";
import Link from "next/link";

export default function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <AppShell showRight={false}>
      <div className="flex items-center justify-between border-b border-border px-4 py-3 md:hidden">
        <h1 className="text-lg font-bold">{user.nickname}</h1>
        <Link href="/settings" className="p-1"><Settings className="h-6 w-6" /></Link>
      </div>

      <div className="px-4 py-6">
        <div className="flex items-start gap-6">
          <Avatar src={user.avatarUrl} alt={user.nickname} size="2xl" className="h-20 w-20 md:h-24 md:w-24" />
          <div className="flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <h1 className="hidden text-xl font-light md:block">{user.nickname}</h1>
              <Button variant="secondary" size="sm" className="font-semibold">Edit profile</Button>
              <Link href="/settings" className="hidden md:block">
                <Button variant="ghost" size="icon"><Settings className="h-5 w-5" /></Button>
              </Link>
            </div>
            <div className="mb-3 flex gap-6 text-sm">
              <span><strong className="font-semibold">{user.postsCount}</strong> posts</span>
              <button><strong className="font-semibold">{user.followersCount.toLocaleString()}</strong> followers</button>
              <button><strong className="font-semibold">{user.followingCount}</strong> following</button>
            </div>
            <p className="text-sm font-semibold">{user.nickname}</p>
            {user.bio && <p className="text-sm text-foreground/80">{user.bio}</p>}
          </div>
        </div>
      </div>

      <div className="flex border-t border-border">
        {["Posts", "Saved", "Tagged"].map((t, i) => (
          <button
            key={t}
            className={`flex-1 py-3 text-center text-xs font-semibold uppercase tracking-wider ${
              i === 0 ? "border-t-2 border-foreground text-foreground" : "text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {DEMO_POSTS.map((p) => (
        <PostCard key={p.id} post={p} />
      ))}
    </AppShell>
  );
}
