/**
 * One reaction per user per post. Persistent in Firestore + localStorage.
 * Same reaction again = remove. Different = switch.
 */
import {
  doc, getDoc, setDoc, deleteDoc, updateDoc, increment, serverTimestamp,
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
  localStorage.setItem(LS_KEY, JSON.stringify(map));
}

export async function getMyReaction(postId: string, uid: string): Promise<ReactionType | null> {
  const local = loadMine()[postId];
  if (local) return local;
  if (!isFirebaseConfigured) return null;
  try {
    const snap = await getDoc(doc(db, "posts", postId, "reactions", uid));
    if (!snap.exists()) return null;
    return (snap.data().type as ReactionType) || null;
  } catch {
    return null;
  }
}

export async function toggleReaction(
  postId: string,
  uid: string,
  type: ReactionType
): Promise<{ type: ReactionType | null; previous: ReactionType | null }> {
  const previous = await getMyReaction(postId, uid);
  const mine = loadMine();

  if (previous === type) {
    delete mine[postId];
    saveMine(mine);
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
      }
    } else {
      try {
        const posts = JSON.parse(localStorage.getItem("sirbax-posts") || "[]");
        const next = posts.map((p: { id: string; likesCount?: number; reactions?: Record<string, number> }) => {
          if (p.id !== postId) return p;
          return {
            ...p,
            likesCount: Math.max(0, (p.likesCount || 1) - 1),
            reactions: { ...p.reactions, [type]: Math.max(0, ((p.reactions?.[type] as number) || 1) - 1) },
          };
        });
        localStorage.setItem("sirbax-posts", JSON.stringify(next));
      } catch { /* ignore */ }
    }
    return { type: null, previous };
  }

  mine[postId] = type;
  saveMine(mine);

  if (isFirebaseConfigured) {
    try {
      await setDoc(doc(db, "posts", postId, "reactions", uid), {
        type,
        userId: uid,
        createdAt: serverTimestamp(),
      });
      const updates: Record<string, unknown> = {
        updatedAt: serverTimestamp(),
        [`reactions.${type}`]: increment(1),
      };
      if (previous) updates[`reactions.${previous}`] = increment(-1);
      else updates.likesCount = increment(1);
      await updateDoc(doc(db, "posts", postId), updates);
    } catch (e) {
      console.error("react", e);
    }
  } else {
    try {
      const posts = JSON.parse(localStorage.getItem("sirbax-posts") || "[]");
      const next = posts.map((p: { id: string; likesCount?: number; reactions?: Record<string, number> }) => {
        if (p.id !== postId) return p;
        const reactions = { ...(p.reactions || {}) };
        if (previous) reactions[previous] = Math.max(0, (reactions[previous] || 1) - 1);
        reactions[type] = (reactions[type] || 0) + 1;
        return {
          ...p,
          likesCount: previous ? p.likesCount || 0 : (p.likesCount || 0) + 1,
          reactions,
        };
      });
      localStorage.setItem("sirbax-posts", JSON.stringify(next));
    } catch { /* ignore */ }
  }

  return { type, previous };
}
