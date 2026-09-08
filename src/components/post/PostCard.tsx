"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import {
  ThumbsUp,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Bookmark,
  Globe,
} from "@/components/ui/Icons";
import { formatRelativeTime, formatCount, cn } from "@/lib/utils";
import type { Post, ReactionType } from "@/types";

const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: "like", emoji: "👍", label: "Like" },
  { type: "love", emoji: "❤️", label: "Love" },
  { type: "care", emoji: "🤗", label: "Care" },
  { type: "haha", emoji: "😂", label: "Haha" },
  { type: "wow", emoji: "😮", label: "Wow" },
  { type: "sad", emoji: "😢", label: "Sad" },
  { type: "angry", emoji: "😡", label: "Angry" },
];

export function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false);
  const [reaction, setReaction] = useState<ReactionType | null>(null);
  const [showReactions, setShowReactions] = useState(false);
  const [likes, setLikes] = useState(post.likesCount);
  const [saved, setSaved] = useState(false);

  const onReact = (type: ReactionType) => {
    if (reaction === type) {
      setReaction(null);
      setLiked(false);
      setLikes((n) => Math.max(0, n - 1));
    } else {
      if (!liked) setLikes((n) => n + 1);
      setReaction(type);
      setLiked(true);
    }
    setShowReactions(false);
  };

  const active = REACTIONS.find((r) => r.type === reaction);
  const topEmojis = Object.entries(post.reactions || {})
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 3)
    .map(([t]) => REACTIONS.find((r) => r.type === t)?.emoji)
    .filter(Boolean);

  return (
    <article className="mx-3 mb-2 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-start gap-3 px-4 pt-3">
        <Avatar src={post.authorAvatar} alt={post.authorNickname} size="md" />
        <div className="min-w-0 flex-1">
          <Link href={`/post/${post.id}`} className="text-sm font-semibold hover:underline">
            {post.authorNickname}
          </Link>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>{formatRelativeTime(post.createdAt)}</span>
            <span>·</span>
            <Globe className="h-3 w-3" />
          </div>
        </div>
        <button className="rounded-full p-1.5 text-muted-foreground hover:bg-muted">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      <p className="whitespace-pre-wrap px-4 py-2 text-[15px] leading-relaxed">
        {post.content}
      </p>

      {post.media?.[0] && (
        <div className="relative w-full bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.media[0].url} alt="" className="max-h-[480px] w-full object-cover" />
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          {topEmojis.length > 0 ? (
            <>
              <span className="flex -space-x-1">
                {topEmojis.map((e, i) => (
                  <span key={i} className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-card text-sm ring-1 ring-border">
                    {e}
                  </span>
                ))}
              </span>
              <span className="ml-1">{formatCount(likes)}</span>
            </>
          ) : (
            <span>{formatCount(likes)} reactions</span>
          )}
        </div>
        <div className="flex gap-3">
          <span>{formatCount(post.commentsCount)} comments</span>
          <span>{formatCount(post.sharesCount)} shares</span>
        </div>
      </div>

      <div className="relative mx-3 flex items-center justify-between border-t border-border py-1">
        <div className="relative flex-1">
          {showReactions && (
            <div className="absolute bottom-full left-0 z-20 mb-1 flex gap-1 rounded-full border border-border bg-card px-2 py-1.5 shadow-lg">
              {REACTIONS.map((r) => (
                <button key={r.type} onClick={() => onReact(r.type)} className="text-xl transition-transform hover:scale-125" title={r.label}>
                  {r.emoji}
                </button>
              ))}
            </div>
          )}
          <button
            className={cn(
              "flex w-full items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium hover:bg-muted",
              liked && "text-primary"
            )}
            onClick={() => onReact(reaction || "like")}
            onMouseEnter={() => setShowReactions(true)}
            onMouseLeave={() => setTimeout(() => setShowReactions(false), 350)}
          >
            {active ? (
              <span className="text-base">{active.emoji}</span>
            ) : (
              <ThumbsUp className={cn("h-5 w-5", liked && "fill-current")} />
            )}
            <span>{active?.label || "Like"}</span>
          </button>
        </div>
        <Link href={`/post/${post.id}`} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted">
          <MessageCircle className="h-5 w-5" />
          <span>Comment</span>
        </Link>
        <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted">
          <Share2 className="h-5 w-5" />
          <span>Share</span>
        </button>
        <button
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium hover:bg-muted",
            saved ? "text-primary" : "text-muted-foreground"
          )}
          onClick={() => setSaved(!saved)}
        >
          <Bookmark className={cn("h-5 w-5", saved && "fill-current")} />
          <span className="hidden sm:inline">Save</span>
        </button>
      </div>
    </article>
  );
}
