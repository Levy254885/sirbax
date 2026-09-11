"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { ThumbsUp, MessageCircle, Share2, MoreHorizontal, Bookmark, Globe } from "@/components/ui/Icons";
import { formatRelativeTime, formatCount, cn } from "@/lib/utils";
import type { Post, ReactionType } from "@/types";
import { useI18n } from "@/context/I18nContext";
import { useAuth } from "@/context/AuthContext";
import { deletePost, sharePost } from "@/services/postService";
import { toggleReaction, getMyReaction } from "@/services/reactionService";
import { createNotification, hidePost, submitReport } from "@/services/platformService";
import { pushNotify } from "@/lib/notify";
import toast from "@/lib/toast";
import { LinkifyText } from "@/components/common/LinkifyText";
import { displayImageUrl } from "@/services/cloudinary";
import { ImageLightbox } from "@/components/common/ImageLightbox";

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
  const [menu, setMenu] = useState(false);
  const [gone, setGone] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [reacting, setReacting] = useState(false);
  const [timeLabel, setTimeLabel] = useState(() => formatRelativeTime(post.createdAt));

  useEffect(() => {
    setTimeLabel(formatRelativeTime(post.createdAt));
    const id = setInterval(() => setTimeLabel(formatRelativeTime(post.createdAt)), 30_000);
    return () => clearInterval(id);
  }, [post.createdAt]);

  useEffect(() => {
    try {
      const ids = JSON.parse(localStorage.getItem("sirbax-saved") || "[]") as string[];
      setSaved(ids.includes(post.id));
    } catch { /* ignore */ }
  }, [post.id]);

  // Restore permanent reaction after refresh
  useEffect(() => {
    if (!user?.uid) return;
    let cancelled = false;
    getMyReaction(post.id, user.uid).then((r) => {
      if (cancelled) return;
      setReaction(r);
      setLiked(Boolean(r));
    });
    return () => { cancelled = true; };
  }, [post.id, user?.uid]);

  const onReact = async (type: ReactionType) => {
    if (!user?.uid || reacting) return;
    setShowReactions(false);
    setReacting(true);

    const was = reaction;
    // Optimistic — show mark immediately
    if (was === type) {
      setReaction(null);
      setLiked(false);
      setLikes((n) => Math.max(0, n - 1));
    } else {
      setReaction(type);
      setLiked(true);
      if (!was) setLikes((n) => n + 1);
    }

    try {
      const res = await toggleReaction(post.id, user.uid, type);
      setReaction(res.type);
      setLiked(Boolean(res.type));
      if (res.type && !res.previous && post.authorId !== user.uid) {
        createNotification({
          recipientId: post.authorId,
          actorId: user.uid,
          actorNickname: user.nickname,
          actorAvatar: user.avatarUrl,
          type: "like",
          postId: post.id,
          text: "reacted to your post",
        });
        pushNotify({
          title: "sirbax",
          body: `You reacted to ${post.authorNickname}'s post`,
          href: `/post/${post.id}`,
        });
      }
    } catch {
      setReaction(was);
      setLiked(Boolean(was));
      if (was === type) setLikes((n) => n + 1);
      else if (!was) setLikes((n) => Math.max(0, n - 1));
    } finally {
      setReacting(false);
    }
  };

  const active = REACTIONS.find((r) => r.type === reaction);
  const topEmojis = Object.entries(post.reactions || {})
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 3)
    .map(([typ]) => REACTIONS.find((r) => r.type === typ)?.glyph)
    .filter(Boolean);

  if (gone) return null;

  return (
    <article className="mx-3 mb-3 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.06)] animate-fade-in-up">
      <div className="flex items-center gap-2.5 px-3.5 pt-3.5">
        <Link href={`/u/${post.authorId}`} className="shrink-0">
          <Avatar src={post.authorAvatar} alt={post.authorNickname} size="md" className="ring-2 ring-slate-100" />
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={`/u/${post.authorId}`} className="block truncate text-[14px] font-semibold text-slate-900">{post.authorNickname}</Link>
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <time dateTime={post.createdAt}>{timeLabel}</time>
            <span>·</span>
            <Globe className="h-3 w-3" />
          </div>
        </div>
        <div className="relative">
          <button type="button" className="rounded-full p-1.5 text-slate-400 hover:bg-slate-50" onClick={(e) => { e.stopPropagation(); setMenu((m) => !m); }}>
            <MoreHorizontal className="h-5 w-5" />
          </button>
          {menu && (
            <div className="absolute right-0 z-50 mt-1 w-48 overflow-hidden rounded-xl border border-slate-100 bg-white py-1 shadow-xl">
              {user?.uid === post.authorId && (
                <button type="button" className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-slate-50" onClick={async () => {
                  try {
                    await deletePost(post.id, user.uid);
                    setGone(true);
                    setMenu(false);
                    toast.success("Deleted");
                    window.dispatchEvent(new Event("sirbax:feed-refresh"));
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Delete failed");
                  }
                }}>Delete</button>
              )}
              <button type="button" className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50" onClick={async () => {
                if (!user) return;
                await sharePost(post, { uid: user.uid, nickname: user.nickname, avatarUrl: user.avatarUrl });
                setMenu(false);
                toast.success("Shared to feed");
                window.dispatchEvent(new Event("sirbax:feed-refresh"));
              }}>Share to feed</button>
              <button type="button" className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50" onClick={() => {
                if (!user) return;
                hidePost(user.uid, post.id);
                setGone(true);
                setMenu(false);
                toast.success("Hidden");
              }}>Hide</button>
              <button type="button" className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50" onClick={async () => {
                if (!user) return;
                await submitReport({ reporterId: user.uid, targetType: "post", targetId: post.id, category: "other" });
                setMenu(false);
                toast.success("Reported");
              }}>Report</button>
            </div>
          )}
        </div>
      </div>

      {post.content && (
        <p className="whitespace-pre-wrap px-3.5 py-2.5 text-[14px] leading-relaxed text-slate-800">
          <LinkifyText text={post.content} />
        </p>
      )}

      {post.media && post.media.length > 0 && (
        <div className={`grid gap-0.5 bg-slate-50 ${post.media.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
          {post.media.slice(0, 4).map((m, i) => (
            <button key={i} type="button" className="relative block w-full overflow-hidden focus:outline-none" onClick={() => setLightbox(i)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayImageUrl(m.url, post.media!.length === 1 ? 1200 : 800)}
                alt=""
                className={`w-full bg-slate-100 object-cover ${post.media!.length === 1 ? "max-h-[min(70vh,560px)]" : "aspect-square max-h-72"}`}
                loading="lazy"
                decoding="async"
              />
              {i === 3 && post.media!.length > 4 && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-2xl font-bold text-white">+{post.media!.length - 4}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {lightbox !== null && post.media && (
        <ImageLightbox urls={post.media.map((m) => m.url)} index={lightbox} onClose={() => setLightbox(null)} onIndex={setLightbox} />
      )}

      <div className="flex items-center justify-between px-3.5 py-2 text-[12px] text-slate-500">
        <div className="flex items-center gap-1.5">
          {topEmojis.length > 0 && (
            <span className="flex -space-x-1">{topEmojis.map((e, i) => (<span key={i} className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-50 text-sm ring-1 ring-white">{e}</span>))}</span>
          )}
          <span>{formatCount(likes)}</span>
        </div>
        <div className="flex gap-3">
          <Link href={`/post/${post.id}`} className="hover:underline">{formatCount(post.commentsCount)} {t.comments}</Link>
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
            disabled={reacting}
            className={cn(
              "flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-[13px] font-medium transition active:bg-slate-50",
              liked ? active?.color || "text-blue-600" : "text-slate-600"
            )}
            onClick={() => onReact(reaction || "like")}
            onMouseEnter={() => setShowReactions(true)}
            onMouseLeave={() => setTimeout(() => setShowReactions(false), 350)}
          >
            {active ? <span className="text-base leading-none">{active.glyph}</span> : <ThumbsUp className={cn("h-[17px] w-[17px]", liked && "fill-current")} />}
            <span>{active?.label || t.like}</span>
          </button>
        </div>
        <Link href={`/post/${post.id}`} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-[13px] font-medium text-slate-600 active:bg-slate-50"><MessageCircle className="h-[17px] w-[17px]" /><span>{t.comment}</span></Link>
        <button type="button" className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-[13px] font-medium text-slate-600 active:bg-slate-50"><Share2 className="h-[17px] w-[17px]" /><span>{t.share}</span></button>
        <button type="button" className={cn("flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-[13px] font-medium active:bg-slate-50", saved ? "text-blue-600" : "text-slate-600")} onClick={() => {
          setSaved((s) => {
            const next = !s;
            try {
              const ids = new Set(JSON.parse(localStorage.getItem("sirbax-saved") || "[]") as string[]);
              if (next) ids.add(post.id); else ids.delete(post.id);
              localStorage.setItem("sirbax-saved", JSON.stringify([...ids]));
            } catch { /* ignore */ }
            return next;
          });
        }}>
          <Bookmark className={cn("h-[17px] w-[17px]", saved && "fill-current")} />
        </button>
      </div>
    </article>
  );
}
