"use client";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { generateDefaultAvatar } from "@/utils/nickname";

const trending = [
  "#Motivation",
  "#Technology",
  "#Travel",
  "#Food",
  "#Relationships",
  "#Gaming",
  "#Kenya",
];

const suggested = [
  { nickname: "BrightRiver_421", followers: "3.2K" },
  { nickname: "Moonlight_508", followers: "1.8K" },
  { nickname: "ShadowLeaf_673", followers: "2.4K" },
];

export function RightSidebar() {
  return (
    <aside className="hidden w-80 shrink-0 flex-col gap-6 overflow-y-auto border-l border-border p-4 xl:flex">
      <div className="rounded-2xl border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold">Trending Topics</h3>
        <div className="flex flex-wrap gap-2">
          {trending.map((tag) => (
            <button
              key={tag}
              className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground hover:bg-accent"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Suggested People</h3>
          <button className="text-xs text-primary hover:underline">See all</button>
        </div>
        <div className="space-y-3">
          {suggested.map((u) => (
            <div key={u.nickname} className="flex items-center gap-3">
              <Avatar
                src={generateDefaultAvatar(u.nickname)}
                alt={u.nickname}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{u.nickname}</p>
                <p className="text-xs text-muted-foreground">
                  {u.followers} followers
                </p>
              </div>
              <Button size="sm" variant="outline">
                Follow
              </Button>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
