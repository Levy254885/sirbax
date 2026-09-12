/**
 * Unique reactions: 1 authenticated user + 1 post = max 1 reaction.
 *
 * Canonical path: posts/{postId}/likes/{userId}
 * Document ID = Firebase Auth UID → database-enforced uniqueness.
 *
 * All count changes run inside Firestore transactions.
 * setReaction is idempotent (safe under multi-tab concurrent likes).
 * clearReaction is idempotent (safe if already unliked).
 */
import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  type Firestore,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/firebase/config";
import type { ReactionType } from "@/types";

const LS_KEY = "sirbax-my-reactions";

type ToggleResult = { type: ReactionType | null; previous: ReactionType | null };

const inflight = new Map<string, Promise<ToggleResult>>();

function lockKey(postId: string, uid: string) {
  return `${postId}::${uid}`;
}

function loadMine(): Record<string, ReactionType> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  } catch {
    return {};
  }
}

function setLocalReaction(postId: string, type: ReactionType | null) {
  if (typeof window === "undefined") return;
  try {
    const mine = loadMine();
    if (type) mine[postId] = type;
    else delete mine[postId];
    localStorage.setItem(LS_KEY, JSON.stringify(mine));
  } catch {
    /* ignore */
  }
}

function likeRef(fs: Firestore, postId: string, uid: string) {
  return doc(fs, "posts", postId, "likes", uid);
}

function legacyRef(fs: Firestore, postId: string, uid: string) {
  return doc(fs, "posts", postId, "reactions", uid);
}

/** Firestore is source of truth. Cache is for instant paint only. */
export async function getMyReaction(
  postId: string,
  uid: string
): Promise<ReactionType | null> {
  if (!uid || !postId) return null;

  if (!isFirebaseConfigured || postId.startsWith("local-")) {
    return loadMine()[postId] || null;
  }

  try {
    const primary = await getDoc(likeRef(db, postId, uid));
    if (primary.exists()) {
      const type = (primary.data().type as ReactionType) || "like";
      setLocalReaction(postId, type);
      return type;
    }
    const legacy = await getDoc(legacyRef(db, postId, uid));
    if (legacy.exists()) {
      const type = (legacy.data().type as ReactionType) || "like";
      setLocalReaction(postId, type);
      return type;
    }
    setLocalReaction(postId, null);
    return null;
  } catch (e) {
    console.warn("getMyReaction failed, using cache", e);
    return loadMine()[postId] || null;
  }
}

/**
 * Ensure the user has exactly one reaction of `type` on the post.
 * Idempotent: if already liked with same type → no count change.
 */
export async function setReaction(
  postId: string,
  uid: string,
  type: ReactionType
): Promise<ToggleResult> {
  return enqueue(postId, uid, () => doSet(postId, uid, type));
}

/**
 * Remove the user's reaction if present.
 * Idempotent: if not liked → no count change.
 */
export async function clearReaction(
  postId: string,
  uid: string
): Promise<ToggleResult> {
  return enqueue(postId, uid, () => doClear(postId, uid));
}

/**
 * Toggle helper used by the UI:
 * - if current reaction === type → clear
 * - otherwise → set to type
 */
export async function toggleReaction(
  postId: string,
  uid: string,
  type: ReactionType
): Promise<ToggleResult> {
  if (!uid || !postId) throw new Error("Must be signed in to react");

  const previous = await getMyReaction(postId, uid);
  if (previous === type) {
    return clearReaction(postId, uid);
  }
  return setReaction(postId, uid, type);
}

async function enqueue(
  postId: string,
  uid: string,
  fn: () => Promise<ToggleResult>
): Promise<ToggleResult> {
  const key = lockKey(postId, uid);
  const prev = inflight.get(key);
  if (prev) {
    try {
      await prev;
    } catch {
      /* continue */
    }
  }
  const work = fn();
  inflight.set(key, work);
  try {
    return await work;
  } finally {
    if (inflight.get(key) === work) inflight.delete(key);
  }
}

async function doSet(
  postId: string,
  uid: string,
  type: ReactionType
): Promise<ToggleResult> {
  if (!isFirebaseConfigured || postId.startsWith("local-")) {
    const previous = loadMine()[postId] || null;
    if (previous === type) {
      return { type, previous };
    }
    setLocalReaction(postId, type);
    if (!previous) bumpLocalCount(postId, 1);
    return { type, previous };
  }

  const likeDoc = likeRef(db, postId, uid);
  const legDoc = legacyRef(db, postId, uid);
  const postDoc = doc(db, "posts", postId);

  const result = await runTransaction(db, async (tx) => {
    const likeSnap = await tx.get(likeDoc);
    const legSnap = await tx.get(legDoc);
    const postSnap = await tx.get(postDoc);

    let previous: ReactionType | null = null;
    if (likeSnap.exists()) {
      previous = (likeSnap.data().type as ReactionType) || "like";
    } else if (legSnap.exists()) {
      previous = (legSnap.data().type as ReactionType) || "like";
    }

    const count = postSnap.exists()
      ? Math.max(0, Number(postSnap.data().likesCount) || 0)
      : 0;
    const reactions: Record<string, number> = {
      ...((postSnap.exists() && postSnap.data().reactions) || {}),
    };

    // Already this type → idempotent no-op (critical for multi-tab races)
    if (previous === type) {
      return { type, previous };
    }

    tx.set(likeDoc, {
      type,
      userId: uid,
      createdAt:
        likeSnap.exists() && likeSnap.data().createdAt
          ? likeSnap.data().createdAt
          : serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    if (legSnap.exists()) tx.delete(legDoc);

    if (postSnap.exists()) {
      if (previous) {
        reactions[previous] = Math.max(0, (Number(reactions[previous]) || 1) - 1);
        reactions[type] = (Number(reactions[type]) || 0) + 1;
        tx.update(postDoc, { reactions, updatedAt: serverTimestamp() });
      } else {
        reactions[type] = (Number(reactions[type]) || 0) + 1;
        tx.update(postDoc, {
          likesCount: count + 1,
          reactions,
          updatedAt: serverTimestamp(),
        });
      }
    }

    return { type, previous };
  });

  setLocalReaction(postId, result.type);
  return result;
}

async function doClear(postId: string, uid: string): Promise<ToggleResult> {
  if (!isFirebaseConfigured || postId.startsWith("local-")) {
    const previous = loadMine()[postId] || null;
    if (!previous) return { type: null, previous: null };
    setLocalReaction(postId, null);
    bumpLocalCount(postId, -1);
    return { type: null, previous };
  }

  const likeDoc = likeRef(db, postId, uid);
  const legDoc = legacyRef(db, postId, uid);
  const postDoc = doc(db, "posts", postId);

  const result = await runTransaction(db, async (tx) => {
    const likeSnap = await tx.get(likeDoc);
    const legSnap = await tx.get(legDoc);
    const postSnap = await tx.get(postDoc);

    let previous: ReactionType | null = null;
    if (likeSnap.exists()) {
      previous = (likeSnap.data().type as ReactionType) || "like";
    } else if (legSnap.exists()) {
      previous = (legSnap.data().type as ReactionType) || "like";
    }

    // Already cleared → idempotent no-op
    if (!previous) {
      return { type: null, previous: null };
    }

    if (likeSnap.exists()) tx.delete(likeDoc);
    if (legSnap.exists()) tx.delete(legDoc);

    if (postSnap.exists()) {
      const count = Math.max(0, Number(postSnap.data().likesCount) || 0);
      const reactions: Record<string, number> = {
        ...(postSnap.data().reactions || {}),
      };
      reactions[previous] = Math.max(0, (Number(reactions[previous]) || 1) - 1);
      tx.update(postDoc, {
        likesCount: Math.max(0, count - 1),
        reactions,
        updatedAt: serverTimestamp(),
      });
    }

    return { type: null, previous };
  });

  setLocalReaction(postId, null);
  return result;
}

function bumpLocalCount(postId: string, delta: number) {
  try {
    const posts = JSON.parse(localStorage.getItem("sirbax-posts") || "[]") as Array<{
      id: string;
      likesCount?: number;
    }>;
    localStorage.setItem(
      "sirbax-posts",
      JSON.stringify(
        posts.map((p) =>
          p.id === postId
            ? { ...p, likesCount: Math.max(0, (p.likesCount || 0) + delta) }
            : p
        )
      )
    );
  } catch {
    /* ignore */
  }
}

/** @deprecated — delegates to toggleReaction so callers cannot inflate counts */
export async function reactToPost(
  postId: string,
  uid: string,
  type: ReactionType = "like"
): Promise<void> {
  await toggleReaction(postId, uid, type);
}
