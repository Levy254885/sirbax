"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PostCard } from "@/components/post/PostCard";
import { useAuth } from "@/context/AuthContext";
import { getFeedPosts } from "@/services/postService";
import type { Post } from "@/types";

export default function MemoriesPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    getFeedPosts(80).then((all) => {
      const mine = user ? all.filter((p) => p.authorId === user.uid) : all;
      const week = 7 * 86400000;
      const old = mine.filter((p) => Date.now() - new Date(p.createdAt).getTime() > week);
      setPosts(old.length ? old : mine.slice(0, 5));
    });
  }, [user]);

  return (
    <AppShell showRight={false}>
      <div className="border-b border-slate-100 bg-white px-4 py-3">
        <h1 className="text-xl font-bold">Memories</h1>
        <p className="text-sm text-slate-500">Posts from your past</p>
      </div>
      <div className="bg-slate-50 pb-24 pt-2">
        {posts.length === 0 && <p className="py-16 text-center text-sm text-slate-400">No memories yet</p>}
        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </AppShell>
  );
}
