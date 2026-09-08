"use client";

import { AppShell } from "@/components/layout/AppShell";
import { StoriesBar } from "@/components/feed/StoriesBar";
import { Composer } from "@/components/post/Composer";
import { PostCard } from "@/components/post/PostCard";
import { DEMO_POSTS } from "@/lib/demo-data";
import { Logo } from "@/components/common/Logo";
import { Bell, Search } from "@/components/ui/Icons";
import Link from "next/link";

export default function HomePage() {
  return (
    <AppShell>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card/95 px-4 py-2.5 backdrop-blur-md md:hidden">
        <Logo size="sm" />
        <div className="flex items-center gap-1">
          <Link href="/explore" className="rounded-full p-2 hover:bg-muted">
            <Search className="h-5 w-5" />
          </Link>
          <Link href="/notifications" className="rounded-full p-2 hover:bg-muted">
            <Bell className="h-5 w-5" />
          </Link>
        </div>
      </header>

      <div className="hidden border-b border-border bg-card px-4 py-3 md:block">
        <h1 className="text-xl font-bold">Home</h1>
      </div>

      <div className="bg-muted/40 pb-4 pt-1">
        <div className="bg-card">
          <StoriesBar />
        </div>
        <div className="mt-2">
          <Composer />
        </div>
        <div className="mt-1 space-y-0">
          {DEMO_POSTS.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
