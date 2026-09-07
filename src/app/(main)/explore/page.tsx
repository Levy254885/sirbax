"use client";
import { AppShell } from "@/components/layout/AppShell";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Search } from "@/components/ui/Icons";
import { generateDefaultAvatar } from "@/utils/nickname";

const trending = ["#Motivation","#Technology","#Travel","#Food","#Gaming","#Kenya"];
const people = [
  { n: "BrightRiver_421", f: "3.2K" },
  { n: "Moonlight_508", f: "1.8K" },
  { n: "ShadowLeaf_673", f: "2.4K" },
];

export default function ExplorePage() {
  return (
    <AppShell>
      <div className="sticky top-0 z-40 border-b border-border bg-card/95 px-4 py-3 backdrop-blur-md">
        <h1 className="text-xl font-bold">Explore</h1>
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="search" placeholder="Search people, posts, communities..." className="h-10 w-full rounded-full border border-border bg-muted pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>
      <div className="p-4">
        <h2 className="mb-3 text-sm font-semibold">Trending</h2>
        <div className="mb-6 flex flex-wrap gap-2">
          {trending.map((t) => (
            <button key={t} className="rounded-full bg-muted px-3 py-1.5 text-sm font-medium hover:bg-accent">{t}</button>
          ))}
        </div>
        <h2 className="mb-3 text-sm font-semibold">Suggested people</h2>
        <div className="space-y-3">
          {people.map((p) => (
            <div key={p.n} className="flex items-center gap-3">
              <Avatar src={generateDefaultAvatar(p.n)} alt={p.n} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.n}</p>
                <p className="text-xs text-muted-foreground">{p.f} followers</p>
              </div>
              <Button size="sm" variant="outline">Follow</Button>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
