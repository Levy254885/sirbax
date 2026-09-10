"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PostCard } from "@/components/post/PostCard";
import { Avatar } from "@/components/ui/Avatar";
import { Search } from "@/components/ui/Icons";
import { useI18n } from "@/context/I18nContext";
import { searchEverything } from "@/services/socialService";
import type { Post } from "@/types";

const TOPICS = ["confession", "relationship", "school", "family", "work", "money", "kenya", "life"];

export default function ExplorePage() {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<{ uid: string; nickname: string; avatarUrl: string }[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!q.trim()) {
      setUsers([]);
      setPosts([]);
      setHashtags(TOPICS);
      return;
    }
    setSearching(true);
    const tmr = setTimeout(() => {
      searchEverything(q).then((res) => {
        setUsers(res.users);
        setPosts(res.posts);
        setHashtags(res.hashtags.length ? res.hashtags : TOPICS.filter((h) => h.includes(q.toLowerCase())));
        setSearching(false);
      });
    }, 250);
    return () => clearTimeout(tmr);
  }, [q]);

  return (
    <AppShell>
      <div className="sticky top-0 z-40 border-b border-slate-100 bg-white px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.searchPlaceholder || "Search Sirbax"} className="h-11 w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm focus:border-blue-500 focus:bg-white focus:outline-none" />
        </div>
      </div>
      <div className="bg-white pb-24">
        {!q.trim() && (
          <div className="px-4 py-4">
            <p className="mb-2 text-sm font-semibold text-slate-900">Topics</p>
            <div className="flex flex-wrap gap-2">
              {TOPICS.map((tag) => (
                <Link key={tag} href={`/hashtag/${tag}`} className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50">#{tag}</Link>
              ))}
            </div>
          </div>
        )}
        {searching && <p className="px-4 py-6 text-sm text-slate-400">Searching…</p>}
        {q.trim() && !searching && (
          <>
            {users.length > 0 && (
              <section className="border-b border-slate-100 px-4 py-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Users</p>
                {users.map((u) => (
                  <Link key={u.uid} href={`/u/${u.uid}`} className="flex items-center gap-3 py-2">
                    <Avatar src={u.avatarUrl} alt={u.nickname} size="md" />
                    <span className="text-sm font-semibold text-slate-900">@{u.nickname}</span>
                  </Link>
                ))}
              </section>
            )}
            {hashtags.length > 0 && (
              <section className="border-b border-slate-100 px-4 py-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Topics</p>
                <div className="flex flex-wrap gap-2">
                  {hashtags.map((tag) => (
                    <Link key={tag} href={`/hashtag/${tag}`} className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-blue-600">#{tag}</Link>
                  ))}
                </div>
              </section>
            )}
            <section className="bg-slate-50 pt-2">
              <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Posts</p>
              {posts.length === 0 && <p className="py-10 text-center text-sm text-slate-400">{t.noResults}</p>}
              {posts.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}
