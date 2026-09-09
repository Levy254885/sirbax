import type { Post } from "@/types";

/** Rank: engagement + recency (viral + fresh first) */
export function rankPosts(posts: Post[]): Post[] {
  const now = Date.now();
  return [...posts].sort((a, b) => {
    const ageA = Math.max(0, (now - new Date(a.createdAt).getTime()) / 3600000);
    const ageB = Math.max(0, (now - new Date(b.createdAt).getTime()) / 3600000);
    const recencyA = Math.max(0, 48 - ageA) * 5;
    const recencyB = Math.max(0, 48 - ageB) * 5;
    const engA = (a.likesCount || 0) * 2 + (a.commentsCount || 0) * 3 + (a.sharesCount || 0) * 4;
    const engB = (b.likesCount || 0) * 2 + (b.commentsCount || 0) * 3 + (b.sharesCount || 0) * 4;
    return engB + recencyB - (engA + recencyA);
  });
}
