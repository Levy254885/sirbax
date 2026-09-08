"use client";

import { Avatar } from "@/components/ui/Avatar";
import { DEMO_STORIES } from "@/lib/demo-data";
import { useAuth } from "@/context/AuthContext";
import { Plus } from "@/components/ui/Icons";

export function StoriesBar() {
  const { user } = useAuth();

  return (
    <div className="no-scrollbar flex gap-4 overflow-x-auto border-b border-border bg-card px-4 py-3">
      <button className="flex shrink-0 flex-col items-center gap-1.5">
        <div className="relative">
          <Avatar src={user?.avatarUrl} alt="You" size="lg" className="h-16 w-16 ring-2 ring-border" />
          <span className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full border-2 border-card bg-primary text-white">
            <Plus className="h-3 w-3" strokeWidth={3} />
          </span>
        </div>
        <span className="max-w-[72px] truncate text-xs text-foreground">Your story</span>
      </button>

      {DEMO_STORIES.map((story, i) => (
        <button key={story.id} className="flex shrink-0 flex-col items-center gap-1.5">
          <div className="story-ring relative">
            <div className="story-ring-inner">
              <Avatar src={story.authorAvatar} alt={story.authorNickname} size="lg" className="h-16 w-16" />
            </div>
            {i === 1 && (
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 rounded bg-destructive px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                Live
              </span>
            )}
          </div>
          <span className="max-w-[72px] truncate text-xs">{story.authorNickname.split("_")[0]}</span>
        </button>
      ))}
    </div>
  );
}
