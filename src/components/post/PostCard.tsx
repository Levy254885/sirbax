"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark } from "@/components/ui/Icons";
import { formatRelativeTime, formatCount, cn } from "@/lib/utils";
import type { Post, ReactionType } from "@/types";

const REACTIONS: { type: ReactionType; emoji: string }[] = [
  { type: "like", emoji: "👍" },
  { type: "love", emoji: "❤️" },
  { type: "care", emoji: "🤗" },
  { type: "haha", emoji: "😂" },
  { type: "wow", emoji: "😮" },
  { type: "sad", emoji: "😢" },
  { type: "angry", emoji: "😡" },
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
    <article className="border-b border-border bg-card">
      <div className="flex items-center gap-3 px-4 py-3">
        <Avatar src={post.authorAvatar} alt={post.authorNickname} size="md" />
        <div className="min-w-0 flex-1">
          <Link href={`/post/${post.id}`} className="text-sm font-semibold hover:underline">
            {post.authorNickname}
          </Link>
          {post.location && (
            <p className="text-xs text-muted-foreground">{post.location}</p>
          )}
        </div>
        <button className="rounded-full p-1.5 text-muted-foreground hover:bg-muted">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      {post.media?.[0] && (
        <div className="relative aspect-square w-full bg-muted sm:aspect-[4/5] md:aspect-auto md:max-h-[600px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.media[0].url} alt="" className="h-full w-full object-cover" />
        </div>
      )}

      <div className="px-4 pt-3">
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              {showReactions && (
                <div className="absolute bottom-full left-0 z-20 mb-2 flex gap-1 rounded-full border border-border bg-card px-2 py-1.5 shadow-lg">
                  {REACTIONS.map((r) => (
                    <button key={r.type} onClick={() => onReact(r.type)} className="text-xl transition-transform hover:scale-125">
                      {r.emoji}
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={() => onReact(reaction || "love")}
                onMouseEnter={() => setShowReactions(true)}
                onMouseLeave={() => setTimeout(() => setShowReactions(false), 300)}
                className="p-0.5"
              >
                {active ? (
                  <span className="text-2xl leading-none">{active.emoji}</span>
                ) : (
                  <Heart className={cn("h-6 w-6", liked && "fill-destructive text-destructive")} />
                )}
              </button>
            </div>
            <Link href={`/post/${post.id}`} className="p-0.5">
              <MessageCircle className="h-6 w-6" />
            </Link>
            <button className="p-0.5">
              <Share2 className="h-6 w-6" />
            </button>
          </div>
          <button onClick={() => setSaved(!saved)} className="p-0.5">
            <Bookmark className={cn("h-6 w-6", saved && "fill-foreground")} />
          </button>
        </div>

        <p className="mt-2 text-sm font-semibold">{formatCount(likes)} likes</p>

        <p className="mt-1 text-sm">
          <span className="font-semibold">{post.authorNickname}</span>{" "}
          <span className="whitespace-pre-wrap">{post.content}</span>
        </p>

        {post.commentsCount > 0 && (
          <Link href={`/post/${post.id}`} className="mt-1 block text-sm text-muted-foreground">
            View all {post.commentsCount} comments
          </Link>
        )}

        <p className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
          {formatRelativeTime(post.createdAt)}
        </p>
      </div>
      <div className="h-2" />
    </article>
  );
}
