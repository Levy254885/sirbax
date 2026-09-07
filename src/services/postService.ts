/**
 * Post service — designed for Firebase Firestore.
 * In demo mode, operates on in-memory / localStorage data.
 */

import type { Post, ReactionType } from "@/types";
import { DEMO_POSTS } from "@/lib/demo-data";

const STORAGE_KEY = "sirbax-posts";

function loadPosts(): Post[] {
  if (typeof window === "undefined") return DEMO_POSTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return DEMO_POSTS;
}

function savePosts(posts: Post[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

export async function getFeedPosts(limit = 20): Promise<Post[]> {
  const posts = loadPosts();
  return posts
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, limit);
}

export async function getPostById(id: string): Promise<Post | null> {
  return loadPosts().find((p) => p.id === id) || null;
}

export async function createPost(
  data: Omit<Post, "id" | "createdAt" | "updatedAt" | "likesCount" | "commentsCount" | "sharesCount" | "reactions" | "isEdited">
): Promise<Post> {
  const post: Post = {
    ...data,
    id: `p-${Date.now()}`,
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    reactions: {},
    isEdited: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const posts = [post, ...loadPosts()];
  savePosts(posts);
  return post;
}

export async function toggleReaction(
  postId: string,
  uid: string,
  type: ReactionType
): Promise<void> {
  void postId;
  void uid;
  void type;
}
