"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { StoriesBar } from "@/components/feed/StoriesBar";
import { Composer } from "@/components/post/Composer";
import { PostCard } from "@/components/post/PostCard";
import { Avatar } from "@/components/ui/Avatar";
import { Search, Bell } from "@/components/ui/Icons";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { getFeedPosts } from "@/services/postService";
import type { Post } from "@/types";

export default function HomePage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const list = await getFeedPosts(50);
      setPosts(list);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onCreated = (e: Event) => {
      const detail = (e as CustomEvent<Post>).detail;
      if (detail?.id) {
        setPosts((prev) => [detail, ...prev.filter((p) => p.id !== detail.id)]);
      } else {
        refresh();
      }
    };
    window.addEventListener("sirbax:post-created", onCreated);
    return () => window.removeEventListener("sirbax:post-created", onCreated);
  }, [refresh]);

  return (
    <AppShell>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-100 bg-white/95 px-4 py-2.5 backdrop-blur md:hidden">
        <h1 className="text-lg font-bold tracking-tight text-slate-900">sirbax</h1>
        <div className="flex items-center gap-1">
          <Link href="/explore" className="rounded-full p-2 text-slate-600 transition hover:bg-slate-50">
            <Search className="h-5 w-5" />
          </Link>
          <Link href="/notifications" className="rounded-full p-2 text-slate-600 transition hover:bg-slate-50">
            <Bell className="h-5 w-5" />
          </Link>
          <Link href="/profile" className="ml-0.5">
            <Avatar src={user?.avatarUrl} alt={user?.nickname || ""} className="h-8 w-8 ring-2 ring-slate-100" />
          </Link>
        </div>
      </header>

      <div className="hidden border-b border-slate-100 bg-white px-4 py-3 md:block">
        <h1 className="text-xl font-bold text-slate-900">{t.home}</h1>
      </div>

      <div className="bg-slate-50 pb-24 md:pb-4">
        <div className="border-b border-slate-100 bg-white">
          <StoriesBar />
        </div>
        <div className="border-b border-slate-100 bg-white md:mt-2 md:border-0">
          <Composer onPosted={refresh} />
        </div>
        <div className="pt-2">
          {loading && <p className="py-10 text-center text-sm text-slate-400">{t.loading}</p>}
          {!loading && posts.length === 0 && (
            <p className="py-10 text-center text-sm text-slate-400">{t.noResults}</p>
          )}
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
