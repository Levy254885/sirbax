"use client";

import { useParams, useRouter } from "next/navigation";
import { DEMO_STORIES } from "@/lib/demo-data";
import { X, Heart, Send } from "@/components/ui/Icons";
import { useState, useEffect } from "react";

export default function StoryViewerPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const idx = Math.max(0, DEMO_STORIES.findIndex((s) => s.id === id));
  const [current, setCurrent] = useState(idx >= 0 ? idx : 0);
  const [progress, setProgress] = useState(0);
  const story = DEMO_STORIES[current] || DEMO_STORIES[0];

  useEffect(() => {
    setProgress(0);
    const t = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          if (current < DEMO_STORIES.length - 1) setCurrent((c) => c + 1);
          else router.back();
          return 0;
        }
        return p + 2;
      });
    }, 100);
    return () => clearInterval(t);
  }, [current, router]);

  if (!story) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black">
      <div className="flex gap-1 px-2 pt-3">
        {DEMO_STORIES.map((_, i) => (
          <div key={i} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30">
            <div
              className="h-full bg-white transition-all"
              style={{ width: i < current ? "100%" : i === current ? `${progress}%` : "0%" }}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={story.authorAvatar} alt="" className="h-8 w-8 rounded-full object-cover ring-2 ring-white/50" />
          <span className="text-sm font-semibold text-white">{story.authorNickname}</span>
          <span className="text-xs text-white/60">2h</span>
        </div>
        <button onClick={() => router.back()} className="rounded-full p-1.5 text-white hover:bg-white/10">
          <X className="h-6 w-6" />
        </button>
      </div>

      <div
        className="relative flex-1"
        onClick={(e) => {
          const x = e.clientX;
          const mid = window.innerWidth / 2;
          if (x < mid && current > 0) setCurrent((c) => c - 1);
          else if (x >= mid && current < DEMO_STORIES.length - 1) setCurrent((c) => c + 1);
          else if (x >= mid) router.back();
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={story.mediaUrl || story.authorAvatar}
          alt=""
          className="absolute inset-0 h-full w-full object-contain"
        />
      </div>

      <div className="flex items-center gap-2 px-3 pb-6 pt-3">
        <input
          type="text"
          placeholder="Reply..."
          className="h-10 flex-1 rounded-full border border-white/30 bg-transparent px-4 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-1 focus:ring-white/50"
        />
        <button className="rounded-full p-2 text-white hover:bg-white/10">
          <Heart className="h-6 w-6" />
        </button>
        <button className="rounded-full p-2 text-white hover:bg-white/10">
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
