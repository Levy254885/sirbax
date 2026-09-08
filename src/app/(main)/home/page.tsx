"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { StoriesBar } from "@/components/feed/StoriesBar";
import { Composer } from "@/components/post/Composer";
import { PostCard } from "@/components/post/PostCard";
import { getFeedPosts } from "@/services/postService";
import type { Post } from "@/types";
import { Bell, Search } from "@/components/ui/Icons";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import Link from "next/link";

export default function HomePage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const list = await getFeedPosts();
      setPosts(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <AppShell>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-100 bg-white px-4 py-2.5 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-white">
              <path d="M12 3c-4.5 0-8 3-8 7.2 0 2.4 1.2 4.5 3.1 5.8L6 21l4.2-2.3c.6.1 1.2.2 1.8.2 4.5 0 8-3 8-7.2S16.5 3 12 3z" fill="currentColor" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">sirbax</span>
        </div>
        <div className="flex items-center gap-1">
          <Link href="/explore" className="rounded-full p-2 text-slate-600 hover:bg-slate-100">
            <Search className="h-5 w-5" />
          </Link>
          <Link href="/notifications" className="rounded-full p-2 text-slate-600 hover:bg-slate-100">
            <Bell className="h-5 w-5" />
          </Link>
          <Link href="/profile" className="ml-0.5">
            <Avatar src={user?.avatarUrl} alt={user?.nickname || ""} className="h-8 w-8" />
          </Link>
        </div>
      </header>

      <div className="hidden border-b border-slate-100 bg-white px-4 py-3 md:block">
        <h1 className="text-xl font-bold text-slate-900">{t.home}</h1>
      </div>

      <div className="bg-slate-50 pb-20 md:pb-4">
        <div className="border-b border-slate-100 bg-white">
          <StoriesBar />
        </div>
        <div className="mt-2">
          <Composer onPosted={refresh} />
        </div>
        <div className="mt-1 space-y-0">
          {loading && (
            <p className="py-8 text-center text-sm text-slate-400">{t.loading}</p>
          )}
          {!loading && posts.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-400">{t.noResults}</p>
          )}
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
