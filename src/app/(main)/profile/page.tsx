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
      <div className="relative h-36 bg-gradient-to-r from-blue-600 to-indigo-700 md:h-48" />
      <div className="px-4 pb-4">
        <div className="-mt-12 mb-3 flex items-end justify-between">
          <Avatar src={user.avatarUrl} alt={user.nickname} size="2xl" className="border-4 border-card" />
          <div className="flex gap-2">
            <Link href="/settings"><Button variant="outline" size="icon"><Settings className="h-5 w-5" /></Button></Link>
            <Button variant="outline" size="sm">Edit profile</Button>
          </div>
        </div>
        <h1 className="text-xl font-bold">{user.nickname}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{user.bio}</p>
        <div className="mt-3 flex gap-4 text-sm">
          <span><strong>{user.postsCount}</strong> posts</span>
          <span><strong>{user.followersCount}</strong> followers</span>
          <span><strong>{user.followingCount}</strong> following</span>
        </div>
      </div>
      <div className="flex border-b border-border">
        {["Posts", "Replies", "Media", "Likes"].map((t, i) => (
          <button key={t} className={`flex-1 py-3 text-sm font-medium ${i === 0 ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>{t}</button>
        ))}
      </div>
      {DEMO_POSTS.map((p) => <PostCard key={p.id} post={p} />)}
    </AppShell>
  );
}
