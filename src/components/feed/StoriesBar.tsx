"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { DEMO_STORIES } from "@/lib/demo-data";
import { Plus } from "@/components/ui/Icons";

export function StoriesBar() {
  const { user } = useAuth();

  return (
    <div className="no-scrollbar flex gap-2.5 overflow-x-auto px-3 py-3">
      <Link
        href="/create"
        className="relative h-[170px] w-[100px] shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="flex h-[110px] items-center justify-center bg-slate-100">
          {user?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-blue-400 to-indigo-500" />
          )}
        </div>
        <div className="absolute left-1/2 top-[95px] flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border-4 border-white bg-blue-600 text-white shadow">
          <Plus className="h-4 w-4" strokeWidth={3} />
        </div>
        <p className="absolute bottom-2 left-0 right-0 px-1 text-center text-[11px] font-semibold text-slate-800">
          Create story
        </p>
      </Link>

      {DEMO_STORIES.map((story) => (
        <Link
          key={story.id}
          href={`/stories/${story.id}`}
          className="relative h-[170px] w-[100px] shrink-0 overflow-hidden rounded-xl shadow-sm"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={story.mediaUrl || story.authorAvatar}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
          <div className="absolute left-2 top-2 h-9 w-9 overflow-hidden rounded-full border-2 border-blue-500">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={story.authorAvatar} alt="" className="h-full w-full object-cover" />
          </div>
          <p className="absolute bottom-2 left-1.5 right-1.5 line-clamp-2 text-[11px] font-semibold leading-tight text-white">
            {story.authorNickname}
          </p>
        </Link>
      ))}
    </div>
  );
}
