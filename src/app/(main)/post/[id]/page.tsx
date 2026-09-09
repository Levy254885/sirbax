"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PostCard } from "@/components/post/PostCard";
import { Avatar } from "@/components/ui/Avatar";
import { ArrowLeft, Send } from "@/components/ui/Icons";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { getPostById } from "@/services/postService";
import { addComment, getComments, type CommentItem } from "@/services/socialService";
import { formatRelativeTime } from "@/lib/utils";
import type { Post } from "@/types";
import toast from "@/lib/toast";

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { t } = useI18n();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      setPost(await getPostById(id));
      setComments(await getComments(id));
      setLoading(false);
    })();
  }, [id]);

  const submit = async () => {
    if (!text.trim() || !user || !id) return;
    setSending(true);
    try {
      const c = await addComment(id, { uid: user.uid, nickname: user.nickname, avatarUrl: user.avatarUrl }, text);
      setComments((prev) => [c, ...prev]);
      setText("");
      if (post) setPost({ ...post, commentsCount: (post.commentsCount || 0) + 1 });
    } catch {
      toast.error("Comment failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <AppShell showRight={false}>
      <div className="flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3">
        <Link href="/home" className="rounded-full p-1 hover:bg-slate-100"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-lg font-bold text-slate-900">Post</h1>
      </div>
      {loading && <p className="py-10 text-center text-sm text-slate-400">{t.loading}</p>}
      {!loading && !post && <p className="py-10 text-center text-sm text-slate-400">{t.noResults}</p>}
      {post && <PostCard post={post} />}
      <div className="border-t border-slate-100 bg-white px-4 py-3 pb-24">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">{t.comments}</h2>
        <div className="space-y-3">
          {comments.length === 0 && <p className="text-sm text-slate-400">No comments yet</p>}
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2.5">
              <Link href={`/u/${c.authorId}`}><Avatar src={c.authorAvatar} alt={c.authorNickname} size="sm" /></Link>
              <div className="min-w-0 flex-1">
                <div className="rounded-2xl bg-slate-100 px-3 py-2">
                  <Link href={`/u/${c.authorId}`} className="text-xs font-semibold text-slate-900 hover:underline">{c.authorNickname}</Link>
                  <p className="text-sm text-slate-800">{c.text}</p>
                </div>
                <p className="mt-1 px-1 text-xs text-slate-400">{formatRelativeTime(c.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {user && (
        <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-slate-100 bg-white px-3 py-2 md:bottom-0">
          <div className="mx-auto flex max-w-2xl items-center gap-2">
            <Avatar src={user.avatarUrl} alt={user.nickname} size="sm" />
            <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder={t.writeComment} className="h-10 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm focus:border-blue-500 focus:outline-none" />
            <button type="button" disabled={!text.trim() || sending} onClick={submit} className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white disabled:opacity-40"><Send className="h-4 w-4" /></button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
