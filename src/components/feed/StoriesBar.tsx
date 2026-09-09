"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { DEMO_STORIES } from "@/lib/demo-data";
import { Plus } from "@/components/ui/Icons";

/**
 * Instagram-style circular stories on a clean white background.
 * Perfect circles + gradient ring for unviewed, soft gray for "Your story".
 */
export function StoriesBar() {
  const { user } = useAuth();
  const { t } = useI18n();

  return (
    <div className="no-scrollbar flex gap-4 overflow-x-auto bg-white px-4 py-3">
      {/* Your story */}
      <Link href="/create" className="flex w-[72px] shrink-0 flex-col items-center gap-1.5">
        <div className="relative">
          <div className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-slate-100 ring-2 ring-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user?.avatarUrl || "https://api.dicebear.com/9.x/adventurer/svg?seed=you"}
              alt=""
              className="h-[62px] w-[62px] rounded-full object-cover"
            />
          </div>
          <span className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border-[2.5px] border-white bg-blue-600 text-white shadow-sm">
            <Plus className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
        </div>
        <span className="w-full truncate text-center text-[11px] font-medium text-slate-700">
          {t.yourStory}
        </span>
      </Link>

      {DEMO_STORIES.map((story) => (
        <Link
          key={story.id}
          href={`/stories/${story.id}`}
          className="flex w-[72px] shrink-0 flex-col items-center gap-1.5"
        >
          <div className="story-ring flex h-[68px] w-[68px] items-center justify-center rounded-full">
            <div className="story-ring-inner flex items-center justify-center rounded-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={story.authorAvatar}
                alt={story.authorNickname}
                className="h-[56px] w-[56px] rounded-full object-cover bg-slate-100"
              />
            </div>
          </div>
          <span className="w-full truncate text-center text-[11px] font-medium text-slate-700">
            {story.authorNickname.split("_")[0]}
          </span>
        </Link>
      ))}
    </div>
  );
}
