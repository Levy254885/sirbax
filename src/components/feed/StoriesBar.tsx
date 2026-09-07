"use client";

import { Avatar } from "@/components/ui/Avatar";
import { DEMO_STORIES } from "@/lib/demo-data";
import { useAuth } from "@/context/AuthContext";
import { Plus } from "@/components/ui/Icons";

export function StoriesBar() {
  const { user } = useAuth();

  return (
    <div className="no-scrollbar flex gap-3 overflow-x-auto border-b border-border px-4 py-3">
      <button className="flex shrink-0 flex-col items-center gap-1">
        <div className="relative">
          <Avatar
            src={user?.avatarUrl}
            alt="You"
            size="lg"
            className="ring-2 ring-border"
          />
          <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Plus className="h-3 w-3" strokeWidth={3} />
          </span>
        </div>
        <span className="max-w-[64px] truncate text-xs text-muted-foreground">
          Add story
        </span>
      </button>

      {DEMO_STORIES.map((story) => (
        <button
          key={story.id}
          className="flex shrink-0 flex-col items-center gap-1"
        >
          <div className="rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 p-[2px]">
            <Avatar
              src={story.authorAvatar}
              alt={story.authorNickname}
              size="lg"
              className="ring-2 ring-card"
            />
          </div>
          <span className="max-w-[64px] truncate text-xs">
            {story.authorNickname}
          </span>
        </button>
      ))}
    </div>
  );
}
