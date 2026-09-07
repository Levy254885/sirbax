"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark } from "@/components/ui/Icons";
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

  return (
    <article className="border-b border-border px-4 py-3">
      <div className="mb-3 flex items-start gap-3">
        <Avatar src={post.authorAvatar} alt={post.authorNickname} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link href={`/post/${post.id}`} className="truncate text-sm font-semibold hover:underline">
              {post.authorNickname}
            </Link>
            <span className="text-xs text-muted-foreground">{formatRelativeTime(post.createdAt)}</span>
          </div>
          {post.communityName && (
            <p className="text-xs text-muted-foreground">in {post.communityName}</p>
          )}
        </div>
        <button className="rounded-full p-1.5 text-muted-foreground hover:bg-muted">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      <p className="mb-3 whitespace-pre-wrap text-[15px] leading-relaxed">{post.content}</p>

      {post.media?.[0] && (
        <div className="mb-3 overflow-hidden rounded-2xl border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.media[0].url} alt="" className="max-h-[480px] w-full object-cover" />
        </div>
      )}

      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatCount(likes)} reactions</span>
        <span>{formatCount(post.commentsCount)} comments · {formatCount(post.sharesCount)} shares</span>
      </div>

      <div className="relative flex items-center justify-between border-t border-border pt-1">
        <div className="relative">
          {showReactions && (
            <div className="absolute bottom-full left-0 z-20 mb-2 flex gap-1 rounded-full border border-border bg-card p-1.5 shadow-lg">
              {REACTIONS.map((r) => (
                <button key={r.type} onClick={() => onReact(r.type)} className="rounded-full p-1 text-xl hover:scale-125 transition-transform" title={r.label}>
                  {r.emoji}
                </button>
              ))}
            </div>
          )}
          <button
            className={cn("flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm hover:bg-muted", liked && "text-primary")}
            onClick={() => onReact(reaction || "like")}
            onMouseEnter={() => setShowReactions(true)}
            onMouseLeave={() => setTimeout(() => setShowReactions(false), 400)}
          >
            {active ? <span className="text-base">{active.emoji}</span> : <Heart className={cn("h-5 w-5", liked && "fill-current")} />}
            <span className="font-medium">{active?.label || "Like"}</span>
          </button>
        </div>
        <Link href={`/post/${post.id}`} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm hover:bg-muted">
          <MessageCircle className="h-5 w-5" />
          <span className="font-medium">Comment</span>
        </Link>
        <button className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm hover:bg-muted">
          <Share2 className="h-5 w-5" />
          <span className="font-medium">Share</span>
        </button>
        <button
          className={cn("flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm hover:bg-muted", saved && "text-primary")}
          onClick={() => setSaved(!saved)}
        >
          <Bookmark className={cn("h-5 w-5", saved && "fill-current")} />
        </button>
      </div>
    </article>
  );
}
