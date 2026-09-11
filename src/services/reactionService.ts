/**
 * One reaction per account per post — permanent until the same user unreacts.
 * Stored under posts/{postId}/reactions/{uid} so it survives refresh, devices, and years.
 * Click same reaction again = remove. Click a different one = switch (count stays 1).
 */
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  increment,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/firebase/config";
import type { ReactionType } from "@/types";

const LS_KEY = "sirbax-my-reactions";

function loadMine(): Record<string, ReactionType> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveMine(map: Record<string, ReactionType>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(map));
  } catch {
    /* quota */
  }
}

function setLocalReaction(postId: string, type: ReactionType | null) {
  const mine = loadMine();
  if (type) mine[postId] = type;
  else delete mine[postId];
  saveMine(mine);
}

/** Firebase is source of truth; local cache is for instant UI only. */
export async function getMyReaction(
  postId: string,
  uid: string
): Promise<ReactionType | null> {
  if (!uid || !postId) return null;

  if (isFirebaseConfigured) {
    try {
      const snap = await getDoc(doc(db, "posts", postId, "reactions", uid));
      if (snap.exists()) {
        const type = (snap.data().type as ReactionType) || null;
        if (type) setLocalReaction(postId, type);
        return type;
      }
      setLocalReaction(postId, null);
      return null;
    } catch {
      // offline fallback
    }
  }

  return loadMine()[postId] || null;
}

/**
 * Toggle reaction (Facebook / IG / X style):
 * - no prior reaction → add (count +1)
 * - same reaction again → remove (count -1)
 * - different reaction → switch type (count unchanged)
 * Never allows the same account to add more than one reaction.
 */
export async function toggleReaction(
  postId: string,
  uid: string,
  type: ReactionType
): Promise<{ type: ReactionType | null; previous: ReactionType | null }> {
  if (!uid || !postId) {
    throw new Error("Must be signed in to react");
  }

  const previous = await getMyReaction(postId, uid);

  if (previous === type) {
    setLocalReaction(postId, null);

    if (isFirebaseConfigured) {
      try {
        await deleteDoc(doc(db, "posts", postId, "reactions", uid));
        await updateDoc(doc(db, "posts", postId), {
          likesCount: increment(-1),
          [`reactions.${type}`]: increment(-1),
          updatedAt: serverTimestamp(),
        });
      } catch (e) {
        console.error("unreact", e);
        setLocalReaction(postId, previous);
        throw e;
      }
    } else {
      bumpLocalPostCounts(postId, type, previous, null);
    }

    return { type: null, previous };
  }

  setLocalReaction(postId, type);

  if (isFirebaseConfigured) {
    try {
      const reactionRef = doc(db, "posts", postId, "reactions", uid);
      const postRef = doc(db, "posts", postId);

      await runTransaction(db, async (tx) => {
        const existing = await tx.get(reactionRef);
        const existingType = existing.exists()
          ? ((existing.data().type as ReactionType) || null)
          : null;

        if (existingType === type) {
          return;
        }

        tx.set(reactionRef, {
          type,
          userId: uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        const updates: Record<string, unknown> = {
          updatedAt: serverTimestamp(),
          [`reactions.${type}`]: increment(1),
        };

        if (existingType) {
          updates[`reactions.${existingType}`] = increment(-1);
        } else {
          updates.likesCount = increment(1);
        }

        tx.update(postRef, updates);
      });
    } catch (e) {
      console.error("react", e);
      setLocalReaction(postId, previous);
      throw e;
    }
  } else {
    bumpLocalPostCounts(postId, type, previous, type);
  }

  return { type, previous };
}

function bumpLocalPostCounts(
  postId: string,
  newType: ReactionType,
  previous: ReactionType | null,
  result: ReactionType | null
) {
  try {
    const posts = JSON.parse(localStorage.getItem("sirbax-posts") || "[]") as Array<{
      id: string;
      likesCount?: number;
      reactions?: Record<string, number>;
    }>;
    const next = posts.map((p) => {
      if (p.id !== postId) return p;
      const reactions = { ...(p.reactions || {}) };
      if (result === null && previous) {
        reactions[previous] = Math.max(0, (reactions[previous] || 1) - 1);
        return {
          ...p,
          likesCount: Math.max(0, (p.likesCount || 1) - 1),
          reactions,
        };
      }
      if (previous && previous !== newType) {
        reactions[previous] = Math.max(0, (reactions[previous] || 1) - 1);
        reactions[newType] = (reactions[newType] || 0) + 1;
        return { ...p, reactions };
      }
      if (!previous && result) {
        reactions[newType] = (reactions[newType] || 0) + 1;
        return {
          ...p,
          likesCount: (p.likesCount || 0) + 1,
          reactions,
        };
      }
      return p;
    });
    localStorage.setItem("sirbax-posts", JSON.stringify(next));
  } catch {
    /* ignore */
  }
}
