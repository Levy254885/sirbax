"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PostCard } from "@/components/post/PostCard";
import { getFeedPosts } from "@/services/postService";
import type { Post } from "@/types";

export default function SavedPage() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    try {
      const ids = JSON.parse(localStorage.getItem("sirbax-saved") || "[]") as string[];
      getFeedPosts(80).then((all) => setPosts(all.filter((p) => ids.includes(p.id))));
    } catch {
      setPosts([]);
    }
  }, []);

  return (
    <AppShell showRight={false}>
      <div className="border-b border-slate-100 bg-white px-4 py-3">
        <h1 className="text-xl font-bold text-slate-900">Saved</h1>
      </div>
      <div className="bg-white pb-20">
        {posts.length === 0 && (
          <p className="px-4 py-16 text-center text-sm text-slate-400">Posts you save will appear here. Tap Save on any post.</p>
        )}
        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </AppShell>
  );
}
