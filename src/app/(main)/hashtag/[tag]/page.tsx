"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PostCard } from "@/components/post/PostCard";
import { ArrowLeft } from "@/components/ui/Icons";
import { getFeedPosts } from "@/services/postService";
import type { Post } from "@/types";

export default function HashtagPage() {
  const { tag } = useParams<{ tag: string }>();
  const name = decodeURIComponent(tag || "").replace(/^#/, "");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeedPosts(80).then((all) => {
      const filtered = all.filter(
        (p) =>
          (p.hashtags || []).some((h) => h.toLowerCase() === name.toLowerCase()) ||
          p.content.toLowerCase().includes(`#${name.toLowerCase()}`)
      );
      setPosts(filtered);
      setLoading(false);
    });
  }, [name]);

  return (
    <AppShell showRight={false}>
      <div className="flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3">
        <Link href="/explore" className="rounded-full p-1 hover:bg-slate-100">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-slate-900">#{name}</h1>
          <p className="text-xs text-slate-500">{posts.length} posts</p>
        </div>
      </div>
      <div className="bg-slate-50 pb-24 pt-2">
        {loading && <p className="py-12 text-center text-sm text-slate-400">Loading...</p>}
        {!loading && posts.length === 0 && (
          <p className="py-16 text-center text-sm text-slate-400">No posts with #{name} yet. Be the first!</p>
        )}
        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </AppShell>
  );
}
