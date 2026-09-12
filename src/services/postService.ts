/**
 * Posts: Firebase when available, always mirrored to localStorage so the
 * author (and this browser) always sees new posts immediately.
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
  deleteDoc,
  increment,
  type Timestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/firebase/config";
import type { Post, ReactionType } from "@/types";
import { DEMO_POSTS } from "@/lib/demo-data";
import { rankPosts } from "@/services/feedRank";

const STORAGE_KEY = "sirbax-posts";

function loadLocal(): Post[] {
  if (typeof window === "undefined") return [...DEMO_POSTS];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Post[];
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch {
    /* ignore */
  }
  return [...DEMO_POSTS];
}

function saveLocal(posts: Post[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  } catch {
    /* quota */
  }
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

function mergeUnique(primary: Post[], secondary: Post[]): Post[] {
  const seen = new Set(primary.map((p) => p.id));
  const out = [...primary];
  for (const p of secondary) {
    if (!seen.has(p.id)) {
      seen.add(p.id);
      out.push(p);
    }
  }
  return out;
}

function sanitizeMedia(p: Post): Post {
  if (!p.media?.length) return p;
  const media = p.media.filter(
    (m) => m?.url && !m.url.startsWith("blob:") && !m.url.startsWith("data:")
  );
  return { ...p, media: media.length ? media : undefined };
}

export async function getFeedPosts(max = 50): Promise<Post[]> {
  const local = loadLocal().map(sanitizeMedia);

  if (!isFirebaseConfigured) {
    return rankPosts(local).slice(0, max);
  }

  try {
    let remote: Post[] = [];
    try {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(100));
      const snap = await getDocs(q);
      remote = snap.docs.map((d) => sanitizeMedia(mapDoc(d.id, d.data())));
    } catch (idxErr) {
      console.warn("getFeedPosts orderBy failed, fallback", idxErr);
      const snap = await getDocs(query(collection(db, "posts"), limit(100)));
      remote = snap.docs
        .map((d) => sanitizeMedia(mapDoc(d.id, d.data())))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    const merged = mergeUnique(remote, local);
    return rankPosts(merged).slice(0, max);
  } catch (e) {
    console.error("getFeedPosts", e);
    return rankPosts(local).slice(0, max);
  }
}

export async function getPostById(id: string): Promise<Post | null> {
  const localHit = loadLocal().find((p) => p.id === id);
  if (localHit) return localHit;
  if (!isFirebaseConfigured) return null;
  try {
    const snap = await getDoc(doc(db, "posts", id));
    if (!snap.exists()) return null;
    return mapDoc(snap.id, snap.data());
  } catch {
    return null;
  }
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
  const localId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const media = (input.media || []).filter(
    (m) => m?.url && (m.url.startsWith("https://") || m.url.startsWith("http://"))
  );
  const mediaOrUndef = media.length ? media : undefined;

  const baseFields = {
    authorId: input.authorId,
    authorNickname: input.authorNickname,
    authorAvatar: input.authorAvatar || "",
    content: input.content || "",
    media: mediaOrUndef || null,
    visibility: input.visibility || "everyone",
    hashtags: input.hashtags || [],
    mentions: input.mentions || [],
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    reactions: {} as Record<string, number>,
    isEdited: false,
    commentsDisabled: input.commentsDisabled ?? false,
    sharesDisabled: input.sharesDisabled ?? false,
  };

  const localPost: Post = {
    id: localId,
    ...baseFields,
    media: mediaOrUndef,
    createdAt: now,
    updatedAt: now,
  };
  saveLocal([localPost, ...loadLocal().filter((p) => p.id !== localId)]);

  if (!isFirebaseConfigured) {
    return localPost;
  }

  try {
    const ref = await addDoc(collection(db, "posts"), {
      ...baseFields,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    try {
      await updateDoc(doc(db, "users", input.authorId), {
        postsCount: increment(1),
        updatedAt: serverTimestamp(),
      });
    } catch {
      /* optional */
    }

    const remotePost: Post = { ...localPost, id: ref.id };
    const posts = loadLocal().map((p) => (p.id === localId ? remotePost : p));
    saveLocal(posts);
    return remotePost;
  } catch (e) {
    console.error("createPost firebase failed", e);
    throw new Error(
      e instanceof Error
        ? `Post saved only on this device: ${e.message}. Check Firestore rules / network.`
        : "Could not publish post to the server"
    );
  }
}

/**
 * @deprecated Use toggleReaction from reactionService.
 * This wrapper exists so any leftover callers cannot inflate counts.
 */
export async function reactToPost(
  postId: string,
  uid: string,
  type: ReactionType
): Promise<void> {
  const { toggleReaction } = await import("@/services/reactionService");
  await toggleReaction(postId, uid, type);
}

export async function deletePost(postId: string, authorId: string): Promise<void> {
  const existing = loadLocal().find((p) => p.id === postId);
  if (existing && existing.authorId !== authorId) {
    throw new Error("You can only delete your own posts");
  }

  if (isFirebaseConfigured) {
    try {
      const snap = await getDoc(doc(db, "posts", postId));
      if (snap.exists()) {
        const data = snap.data();
        if (data.authorId && data.authorId !== authorId) {
          throw new Error("You can only delete your own posts");
        }
        await deleteDoc(doc(db, "posts", postId));
      }
    } catch (e) {
      console.error("deletePost firebase", e);
      throw e instanceof Error ? e : new Error("Failed to delete post");
    }
  }

  saveLocal(loadLocal().filter((p) => p.id !== postId));
}

export async function editPost(postId: string, content: string, authorId: string): Promise<void> {
  const now = new Date().toISOString();
  saveLocal(
    loadLocal().map((p) =>
      p.id === postId ? { ...p, content, isEdited: true, updatedAt: now } : p
    )
  );
  if (!isFirebaseConfigured) return;
  try {
    await updateDoc(doc(db, "posts", postId), {
      content,
      isEdited: true,
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    console.error("editPost", e);
  }
}

export async function sharePost(
  original: Post,
  sharer: { uid: string; nickname: string; avatarUrl?: string },
  caption?: string
): Promise<Post> {
  return createPost({
    authorId: sharer.uid,
    authorNickname: sharer.nickname,
    authorAvatar: sharer.avatarUrl,
    content: caption?.trim() || `Shared a post by ${original.authorNickname}`,
    media: original.media,
    visibility: "everyone",
    hashtags: original.hashtags || [],
  });
}
