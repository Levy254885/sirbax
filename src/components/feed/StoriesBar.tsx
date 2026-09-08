"use client";

import { Avatar } from "@/components/ui/Avatar";
import { DEMO_STORIES } from "@/lib/demo-data";
import { useAuth } from "@/context/AuthContext";
import { Plus } from "@/components/ui/Icons";

export function StoriesBar() {
  const { user } = useAuth();

  return (
    <div className="no-scrollbar flex gap-3.5 overflow-x-auto px-4 py-3">
      <button className="flex w-[68px] shrink-0 flex-col items-center gap-1.5">
        <div className="relative">
          <Avatar src={user?.avatarUrl} alt="You" className="h-14 w-14 ring-2 ring-border" />
          <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-card bg-primary text-white">
            <Plus className="h-2.5 w-2.5" strokeWidth={3} />
          </span>
        </div>
        <span className="w-full truncate text-center text-[11px] text-muted-foreground">Your story</span>
      </button>

      {DEMO_STORIES.map((story) => (
        <button key={story.id} className="flex w-[68px] shrink-0 flex-col items-center gap-1.5">
          <div className="story-ring">
            <div className="story-ring-inner">
              <Avatar src={story.authorAvatar} alt={story.authorNickname} className="h-[52px] w-[52px]" />
            </div>
          </div>
          <span className="w-full truncate text-center text-[11px]">{story.authorNickname}</span>
        </button>
      ))}
    </div>
  );
}
