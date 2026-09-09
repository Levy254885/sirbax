"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { ThumbsUp, MessageCircle, Share2, MoreHorizontal, Bookmark, Globe } from "@/components/ui/Icons";
import { formatRelativeTime, formatCount, cn } from "@/lib/utils";
import type { Post, ReactionType } from "@/types";
import { useI18n } from "@/context/I18nContext";
import { useAuth } from "@/context/AuthContext";
import { reactToPost } from "@/services/postService";

const REACTIONS: { type: ReactionType; glyph: string; label: string; color: string }[] = [
  { type: "like", glyph: "👍", label: "Like", color: "text-blue-600" },
  { type: "love", glyph: "❤️", label: "Love", color: "text-red-500" },
  { type: "care", glyph: "🤗", label: "Care", color: "text-orange-500" },
  { type: "haha", glyph: "😂", label: "Haha", color: "text-yellow-500" },
  { type: "wow", glyph: "😮", label: "Wow", color: "text-yellow-500" },
  { type: "sad", glyph: "😢", label: "Sad", color: "text-yellow-600" },
  { type: "angry", glyph: "😡", label: "Angry", color: "text-orange-600" },
];

export function PostCard({ post }: { post: Post }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [reaction, setReaction] = useState<ReactionType | null>(null);
  const [showReactions, setShowReactions] = useState(false);
  const [likes, setLikes] = useState(post.likesCount);
  const [saved, setSaved] = useState(false);
  const [timeLabel, setTimeLabel] = useState(() => formatRelativeTime(post.createdAt));

  useEffect(() => {
    setTimeLabel(formatRelativeTime(post.createdAt));
    const id = setInterval(() => setTimeLabel(formatRelativeTime(post.createdAt)), 30_000);
    return () => clearInterval(id);
  }, [post.createdAt]);

  const onReact = async (type: ReactionType) => {
    if (reaction === type) {
      setReaction(null);
      setLiked(false);
      setLikes((n) => Math.max(0, n - 1));
      setShowReactions(false);
      return;
    }
    if (!liked) setLikes((n) => n + 1);
    setReaction(type);
    setLiked(true);
    setShowReactions(false);
    if (user?.uid) {
      try {
        await reactToPost(post.id, user.uid, type);
      } catch {
        /* optimistic */
      }
    }
  };

  const active = REACTIONS.find((r) => r.type === reaction);
  const topEmojis = Object.entries(post.reactions || {})
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 3)
    .map(([typ]) => REACTIONS.find((r) => r.type === typ)?.glyph)
    .filter(Boolean);

  return (
    <article className="sx-smooth mx-0 mb-0 border-b border-slate-100 bg-white animate-fade-in-up md:mx-3 md:mb-2.5 md:rounded-2xl md:border md:border-slate-100 md:shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <div className="flex items-start gap-3 px-4 pt-3.5">
        <Avatar src={post.authorAvatar} alt={post.authorNickname} size="md" className="ring-2 ring-slate-100" />
        <div className="min-w-0 flex-1">
          <Link href={`/post/${post.id}`} className="text-[15px] font-semibold text-slate-900 hover:underline">
            {post.authorNickname}
          </Link>
          <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-400" title={post.createdAt}>
            <time dateTime={post.createdAt}>{timeLabel}</time>
            <span>·</span>
            <Globe className="h-3 w-3" />
          </div>
        </div>
        <button type="button" className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-50">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      <p className="whitespace-pre-wrap px-4 py-2.5 text-[15px] leading-relaxed text-slate-800">
        {post.content}
      </p>

      {post.media?.[0] && (
        <div className="bg-slate-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.media[0].url} alt="" className="max-h-[480px] w-full object-cover" loading="lazy" />
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-2 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          {topEmojis.length > 0 && (
            <span className="flex -space-x-1">
              {topEmojis.map((e, i) => (
                <span key={i} className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-50 text-sm ring-1 ring-white">{e}</span>
              ))}
            </span>
          )}
          <span>{formatCount(likes)}</span>
        </div>
        <div className="flex gap-3">
          <Link href={`/post/${post.id}`} className="hover:underline">
            {formatCount(post.commentsCount)} {t.comments}
          </Link>
          <span>{formatCount(post.sharesCount)} {t.shares}</span>
        </div>
      </div>

      <div className="relative mx-2 flex border-t border-slate-100 py-0.5">
        <div className="relative flex-1">
          {showReactions && (
            <div className="absolute bottom-full left-0 z-20 mb-1 flex gap-0.5 rounded-full border border-slate-100 bg-white px-2 py-1.5 shadow-md">
              {REACTIONS.map((r) => (
                <button key={r.type} type="button" onClick={() => onReact(r.type)} className="px-1 text-xl transition-transform hover:scale-125" title={r.label}>{r.glyph}</button>
              ))}
            </div>
          )}
          <button
            type="button"
            className={cn(
              "flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium transition hover:bg-slate-50",
              liked ? active?.color || "text-blue-600" : "text-slate-600"
            )}
            onClick={() => onReact(reaction || "like")}
            onMouseEnter={() => setShowReactions(true)}
            onMouseLeave={() => setTimeout(() => setShowReactions(false), 350)}
          >
            {active ? (
              <span className="text-base leading-none">{active.glyph}</span>
            ) : (
              <ThumbsUp className={cn("h-[18px] w-[18px]", liked && "fill-current")} />
            )}
            <span>{active?.label || t.like}</span>
          </button>
        </div>
        <Link href={`/post/${post.id}`} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
          <MessageCircle className="h-[18px] w-[18px]" />
          <span>{t.comment}</span>
        </Link>
        <button type="button" className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
          <Share2 className="h-[18px] w-[18px]" />
          <span>{t.share}</span>
        </button>
        <button
          type="button"
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium transition hover:bg-slate-50",
            saved ? "text-blue-600" : "text-slate-600"
          )}
          onClick={() => setSaved(!saved)}
        >
          <Bookmark className={cn("h-[18px] w-[18px]", saved && "fill-current")} />
          <span className="hidden sm:inline">{t.save}</span>
        </button>
      </div>
    </article>
  );
}
