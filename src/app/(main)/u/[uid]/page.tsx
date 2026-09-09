"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Avatar } from "@/components/ui/Avatar";
import { PostCard } from "@/components/post/PostCard";
import { ArrowLeft, MessageCircle } from "@/components/ui/Icons";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { getUserById } from "@/services/userService";
import { getPostsByAuthor, followUser, unfollowUser, isFollowing, getLocalFollowCounts, conversationId } from "@/services/socialService";
import type { Post, UserProfile } from "@/types";
import { generateDefaultAvatar } from "@/utils/nickname";
import toast from "@/lib/toast";

export default function UserProfilePage() {
  const { uid } = useParams<{ uid: string }>();
  const { user } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!uid) return;
    (async () => {
      let p = await getUserById(uid);
      if (!p) {
        p = {
          uid,
          nickname: uid.startsWith("demo") ? "SilentWolf_732" : `User_${uid.slice(0, 6)}`,
          avatarUrl: generateDefaultAvatar(uid),
          bio: "",
          followersCount: 0, followingCount: 0, postsCount: 0,
          isPrivate: false, onboardingComplete: true,
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        };
      }
      setProfile(p);
      const localCounts = getLocalFollowCounts(uid);
      setFollowersCount(p.followersCount || localCounts.followers);
      setFollowingCount(p.followingCount || localCounts.following);
      const list = await getPostsByAuthor(uid);
      if (list.length === 0 && p.nickname) {
        const { getFeedPosts } = await import("@/services/postService");
        const all = await getFeedPosts(100);
        setPosts(all.filter((x) => x.authorId === uid || x.authorNickname === p!.nickname));
      } else setPosts(list);
      if (user?.uid) setFollowing(await isFollowing(user.uid, uid));
    })();
  }, [uid, user?.uid]);

  const toggleFollow = async () => {
    if (!user || !uid || user.uid === uid) return;
    setBusy(true);
    try {
      if (following) {
        await unfollowUser(user.uid, uid);
        setFollowing(false);
        setFollowersCount((n) => Math.max(0, n - 1));
      } else {
        await followUser(user.uid, uid);
        setFollowing(true);
        setFollowersCount((n) => n + 1);
      }
    } catch {
      toast.error("Could not update follow");
    } finally {
      setBusy(false);
    }
  };

  const openMessage = () => {
    if (!user || !profile) return;
    const cid = conversationId(user.uid, profile.uid);
    router.push(`/messages/${cid}?to=${profile.uid}&name=${encodeURIComponent(profile.nickname)}`);
  };

  if (!profile) {
    return (<AppShell showRight={false}><p className="py-16 text-center text-sm text-slate-400">{t.loading}</p></AppShell>);
  }

  const isSelf = user?.uid === profile.uid;

  return (
    <AppShell showRight={false}>
      <div className="flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3">
        <Link href="/home" className="rounded-full p-1 hover:bg-slate-100"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-lg font-bold text-slate-900">{profile.nickname}</h1>
      </div>
      <div className="bg-white px-4 py-6">
        <div className="flex items-start gap-4">
          <Avatar src={profile.avatarUrl} alt={profile.nickname} size="xl" className="ring-2 ring-slate-100" />
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-slate-900">{profile.nickname}</h2>
            {profile.bio && <p className="mt-1 text-sm text-slate-600">{profile.bio}</p>}
            <div className="mt-3 flex gap-5 text-sm">
              <div><span className="font-bold text-slate-900">{posts.length}</span> <span className="text-slate-500">{t.posts}</span></div>
              <div><span className="font-bold text-slate-900">{followersCount}</span> <span className="text-slate-500">{t.followers}</span></div>
              <div><span className="font-bold text-slate-900">{followingCount}</span> <span className="text-slate-500">{t.following}</span></div>
            </div>
          </div>
        </div>
        {!isSelf && user && (
          <div className="mt-4 flex gap-2">
            <button type="button" disabled={busy} onClick={toggleFollow} className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${following ? "border border-slate-200 bg-white text-slate-800" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
              {following ? t.unfollow : t.follow}
            </button>
            <button type="button" onClick={openMessage} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-800">
              <MessageCircle className="h-4 w-4" />{t.message}
            </button>
          </div>
        )}
      </div>
      <div className="border-t border-slate-100">
        {posts.length === 0 && <p className="py-12 text-center text-sm text-slate-400">{t.noResults}</p>}
        {posts.map((p) => (<PostCard key={p.id} post={p} />))}
      </div>
    </AppShell>
  );
}
