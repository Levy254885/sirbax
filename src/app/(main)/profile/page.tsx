"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Avatar } from "@/components/ui/Avatar";
import { PostCard } from "@/components/post/PostCard";
import { Settings } from "@/components/ui/Icons";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { getPostsByAuthor, getLocalFollowCounts } from "@/services/socialService";
import type { Post } from "@/types";

export default function ProfilePage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [posts, setPosts] = useState<Post[]>([]);
  const counts = user ? getLocalFollowCounts(user.uid) : { followers: 0, following: 0 };
  const followers = user?.followersCount || counts.followers || 0;
  const following = user?.followingCount || counts.following || 0;

  useEffect(() => {
    if (!user) return;
    getPostsByAuthor(user.uid).then(async (list) => {
      if (list.length) {
        setPosts(list);
        return;
      }
      const { getFeedPosts } = await import("@/services/postService");
      const all = await getFeedPosts(100);
      setPosts(all.filter((p) => p.authorId === user.uid || p.authorNickname === user.nickname));
    });
  }, [user]);

  if (!user) return null;

  return (
    <AppShell showRight={false}>
      <div className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3">
        <h1 className="text-xl font-bold text-slate-900">{user.nickname}</h1>
        <Link href="/settings" className="rounded-full p-2 text-slate-600 hover:bg-slate-50">
          <Settings className="h-5 w-5" />
        </Link>
      </div>
      <div className="bg-white px-4 py-6">
        <div className="flex items-start gap-4">
          <Avatar src={user.avatarUrl} alt={user.nickname} size="xl" className="ring-2 ring-slate-100" />
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-slate-900">{user.nickname}</h2>
            {user.bio && <p className="mt-1 text-sm text-slate-600">{user.bio}</p>}
            <div className="mt-3 flex gap-5 text-sm">
              <div><span className="font-bold text-slate-900">{posts.length}</span> <span className="text-slate-500">{t.posts}</span></div>
              <div><span className="font-bold text-slate-900">{followers}</span> <span className="text-slate-500">{t.followers}</span></div>
              <div><span className="font-bold text-slate-900">{following}</span> <span className="text-slate-500">{t.following}</span></div>
            </div>
          </div>
        </div>
        <Link href="/settings/account" className="mt-4 block rounded-xl border border-slate-200 py-2.5 text-center text-sm font-semibold text-slate-800 hover:bg-slate-50">{t.editProfile}</Link>
      </div>
      <div className="border-t border-slate-100">
        {posts.length === 0 && <p className="py-12 text-center text-sm text-slate-400">{t.noResults}</p>}
        {posts.map((p) => (<PostCard key={p.id} post={p} />))}
      </div>
    </AppShell>
  );
}
