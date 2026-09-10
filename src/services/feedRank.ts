import type { Post } from "@/types";

/**
 * Sirbax feed ranking:
 * score = engagement + recency + following boost + content quality
 */
export function rankPosts(
  posts: Post[],
  opts?: { followingIds?: string[]; currentUserId?: string }
): Post[] {
  const now = Date.now();
  const following = new Set(opts?.followingIds || []);
  const me = opts?.currentUserId;

  return [...posts].sort((a, b) => score(b, now, following, me) - score(a, now, following, me));
}

function score(p: Post, now: number, following: Set<string>, me?: string): number {
  const ageH = Math.max(0, (now - new Date(p.createdAt).getTime()) / 3_600_000);

  let recency = 0;
  if (ageH < 6) recency = 80 - ageH * 8;
  else if (ageH < 24) recency = 40 - (ageH - 6) * 1.5;
  else if (ageH < 72) recency = Math.max(0, 20 - (ageH - 24) * 0.4);

  const engagement =
    (p.likesCount || 0) * 2.5 +
    (p.commentsCount || 0) * 4 +
    (p.sharesCount || 0) * 5 +
    Object.values(p.reactions || {}).reduce((s, n) => s + (n || 0), 0) * 1.5;

  const engScore = Math.log10(1 + engagement) * 35;
  const followBoost = following.has(p.authorId) ? 25 : 0;
  const ownBoost = me && p.authorId === me ? 15 : 0;
  const mediaBoost = p.media && p.media.length > 0 ? 8 : 0;
  const hashtagBoost = (p.hashtags?.length || 0) > 0 ? 3 : 0;

  return recency + engScore + followBoost + ownBoost + mediaBoost + hashtagBoost;
}
