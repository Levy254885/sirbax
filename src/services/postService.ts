/**
 * Posts: Firebase Firestore is source of truth.
 * Image URLs are Cloudinary secure HTTPS URLs only — never binary/base64.
 */
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  updateDoc,
  increment,
  type Timestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/firebase/config";
import type { Post, ReactionType } from "@/types";
import { DEMO_POSTS } from "@/lib/demo-data";

const STORAGE_KEY = "sirbax-posts";

function loadLocal(): Post[] {
  if (typeof window === "undefined") return [...DEMO_POSTS];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Post[];
  } catch {
    /* ignore */
  }
  return [...DEMO_POSTS];
}

function saveLocal(posts: Post[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

function mapDoc(id: string, data: Record<string, unknown>): Post {
  const created = data.createdAt as Timestamp | string | undefined;
  const createdAt =
    created && typeof created === "object" && "toDate" in created
      ? (created as Timestamp).toDate().toISOString()
      : (created as string) || new Date().toISOString();

  return {
    id,
    authorId: (data.authorId as string) || "",
    authorNickname: (data.authorNickname as string) || "",
    authorAvatar: (data.authorAvatar as string) || "",
    content: (data.content as string) || "",
    media: (data.media as Post["media"]) || undefined,
    visibility: (data.visibility as Post["visibility"]) || "everyone",
    hashtags: (data.hashtags as string[]) || [],
    mentions: (data.mentions as string[]) || [],
    likesCount: (data.likesCount as number) ?? 0,
    commentsCount: (data.commentsCount as number) ?? 0,
    sharesCount: (data.sharesCount as number) ?? 0,
    reactions: (data.reactions as Post["reactions"]) || {},
    isEdited: Boolean(data.isEdited),
    commentsDisabled: Boolean(data.commentsDisabled),
    sharesDisabled: Boolean(data.sharesDisabled),
    createdAt,
    updatedAt: createdAt,
  };
}

export async function getFeedPosts(max = 30): Promise<Post[]> {
  if (!isFirebaseConfigured) {
    return loadLocal();
  }
  try {
    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      limit(max)
    );
    const snap = await getDocs(q);
    if (snap.empty) return loadLocal();
    return snap.docs.map((d) => mapDoc(d.id, d.data()));
  } catch (e) {
    console.error("getFeedPosts", e);
    return loadLocal();
  }
}

export async function getPostById(id: string): Promise<Post | null> {
  if (!isFirebaseConfigured) {
    return loadLocal().find((p) => p.id === id) || null;
  }
  const snap = await getDoc(doc(db, "posts", id));
  if (!snap.exists()) return null;
  return mapDoc(snap.id, snap.data());
}

export interface CreatePostInput {
  authorId: string;
  authorNickname: string;
  authorAvatar?: string;
  content: string;
  media?: Post["media"];
  visibility?: Post["visibility"];
  hashtags?: string[];
  mentions?: string[];
  commentsDisabled?: boolean;
  sharesDisabled?: boolean;
}

export async function createPost(input: CreatePostInput): Promise<Post> {
  const now = new Date().toISOString();
  const base = {
    authorId: input.authorId,
    authorNickname: input.authorNickname,
    authorAvatar: input.authorAvatar || "",
    content: input.content,
    media: input.media || null,
    visibility: input.visibility || "everyone",
    hashtags: input.hashtags || [],
    mentions: input.mentions || [],
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    reactions: {},
    isEdited: false,
    commentsDisabled: input.commentsDisabled ?? false,
    sharesDisabled: input.sharesDisabled ?? false,
  };

  if (!isFirebaseConfigured) {
    const post: Post = {
      id: `local-${Date.now()}`,
      ...base,
      media: input.media,
      createdAt: now,
      updatedAt: now,
    };
    const posts = [post, ...loadLocal()];
    saveLocal(posts);
    return post;
  }

  const ref = await addDoc(collection(db, "posts"), {
    ...base,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  try {
    await updateDoc(doc(db, "users", input.authorId), {
      postsCount: increment(1),
      updatedAt: serverTimestamp(),
    });
  } catch {
    /* ignore */
  }

  return {
    id: ref.id,
    ...base,
    media: input.media,
    createdAt: now,
    updatedAt: now,
  };
}

export async function reactToPost(
  postId: string,
  _uid: string,
  type: ReactionType
): Promise<void> {
  if (!isFirebaseConfigured) return;
  const ref = doc(db, "posts", postId);
  await updateDoc(ref, {
    likesCount: increment(1),
    [`reactions.${type}`]: increment(1),
    updatedAt: serverTimestamp(),
  });
}
