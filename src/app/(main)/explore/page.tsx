"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PostCard } from "@/components/post/PostCard";
import { Search } from "@/components/ui/Icons";
import { useI18n } from "@/context/I18nContext";
import { getFeedPosts } from "@/services/postService";
import type { Post } from "@/types";

export default function ExplorePage() {
  const { t } = useI18n();
  const [posts, setPosts] = useState<Post[]>([]);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState(0);

  useEffect(() => {
    getFeedPosts(50).then(setPosts);
  }, []);

  const filtered = q.trim()
    ? posts.filter(
        (p) =>
          p.content.toLowerCase().includes(q.toLowerCase()) ||
          p.authorNickname.toLowerCase().includes(q.toLowerCase()) ||
          p.hashtags.some((h) => h.toLowerCase().includes(q.toLowerCase()))
      )
    : posts;

  const tabs = [t.forYou, t.trending, t.people];

  return (
    <AppShell>
      <div className="sticky top-0 z-40 border-b border-slate-100 bg-white px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="h-11 w-full rounded-xl border-0 bg-slate-100 pl-10 pr-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          {tabs.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => setTab(i)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                tab === i ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-white pb-20">
        {filtered.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
        {filtered.length === 0 && (
          <p className="py-16 text-center text-sm text-slate-400">{t.noResults}</p>
        )}
      </div>
    </AppShell>
  );
}
