/**
 * One reaction per account per post — permanent until the user unreacts.
 * Path: posts/{postId}/reactions/{uid}
 */
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  increment,
  serverTimestamp,
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

export async function getMyReaction(
  postId: string,
  uid: string
): Promise<ReactionType | null> {
  if (!uid || !postId) return null;

  const cached = loadMine()[postId] || null;

  if (!isFirebaseConfigured) return cached;

  try {
    const snap = await getDoc(doc(db, "posts", postId, "reactions", uid));
    if (snap.exists()) {
      const type = (snap.data().type as ReactionType) || null;
      if (type) {
        setLocalReaction(postId, type);
        return type;
      }
    }
    if (cached) setLocalReaction(postId, null);
    return null;
  } catch (e) {
    console.warn("getMyReaction offline, using cache", e);
    return cached;
  }
}

export async function toggleReaction(
  postId: string,
  uid: string,
  type: ReactionType
): Promise<{ type: ReactionType | null; previous: ReactionType | null }> {
  if (!uid || !postId) throw new Error("Must be signed in to react");

  const previous = await getMyReaction(postId, uid);
  const canWriteRemote = isFirebaseConfigured && !postId.startsWith("local-");

  if (previous === type) {
    setLocalReaction(postId, null);
    if (canWriteRemote) {
      try {
        await deleteDoc(doc(db, "posts", postId, "reactions", uid));
      } catch (e) {
        console.error("unreact delete", e);
      }
      try {
        await updateDoc(doc(db, "posts", postId), {
          likesCount: increment(-1),
          [`reactions.${type}`]: increment(-1),
          updatedAt: serverTimestamp(),
        });
      } catch (e) {
        console.warn("unreact count", e);
      }
    }
    return { type: null, previous };
  }

  // Optimistic durable cache FIRST so refresh keeps the mark
  setLocalReaction(postId, type);

  if (canWriteRemote) {
    try {
      await setDoc(doc(db, "posts", postId, "reactions", uid), {
        type,
        userId: uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      console.error("react setDoc FAILED", e);
    }
    try {
      const updates: Record<string, unknown> = {
        updatedAt: serverTimestamp(),
        [`reactions.${type}`]: increment(1),
      };
      if (previous) {
        updates[`reactions.${previous}`] = increment(-1);
      } else {
        updates.likesCount = increment(1);
      }
      await updateDoc(doc(db, "posts", postId), updates);
    } catch (e) {
      console.warn("react count update", e);
    }
  }

  return { type, previous };
}
