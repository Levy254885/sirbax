import {
  collection, doc, getDoc, getDocs, updateDoc, query, where, limit, serverTimestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/firebase/config";
import type { UserProfile } from "@/types";

const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function mapUser(id: string, data: Record<string, unknown>): UserProfile {
  return {
    uid: id,
    nickname: (data.nickname as string) || "",
    avatarUrl: (data.avatarUrl as string) || (data.profileImageUrl as string) || "",
    bio: (data.bio as string) || "",
    followersCount: (data.followersCount as number) ?? 0,
    followingCount: (data.followingCount as number) ?? 0,
    postsCount: (data.postsCount as number) ?? 0,
    isPrivate: (data.isPrivate as boolean) ?? false,
    onboardingComplete: (data.onboardingComplete as boolean) ?? true,
    createdAt: (data.createdAt as { toDate?: () => Date })?.toDate?.()?.toISOString?.() || (data.createdAt as string) || new Date().toISOString(),
    updatedAt: (data.updatedAt as { toDate?: () => Date })?.toDate?.()?.toISOString?.() || (data.updatedAt as string) || new Date().toISOString(),
    role: (data.role as UserProfile["role"]) || "user",
    lastNicknameChangeAt: (data.lastNicknameChangeAt as string) || undefined,
    lastAvatarChangeAt: (data.lastAvatarChangeAt as string) || undefined,
    nicknameLower: (data.nicknameLower as string) || ((data.nickname as string) || "").toLowerCase(),
  };
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!isFirebaseConfigured) return null;
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return mapUser(snap.id, snap.data() as Record<string, unknown>);
}

/** Alias used by profile routes */
export async function getUserById(uid: string): Promise<UserProfile | null> {
  return getUserProfile(uid);
}

export function daysUntilChangeAllowed(lastChangeAt?: string): number {
  if (!lastChangeAt) return 0;
  const elapsed = Date.now() - new Date(lastChangeAt).getTime();
  if (elapsed >= COOLDOWN_MS) return 0;
  return Math.ceil((COOLDOWN_MS - elapsed) / (24 * 60 * 60 * 1000));
}

export function canChangeNow(lastChangeAt?: string): boolean {
  return daysUntilChangeAllowed(lastChangeAt) === 0;
}

/** Returns true if nickname is taken by someone else */
export async function isNicknameTaken(nickname: string, excludeUid?: string): Promise<boolean> {
  const lower = nickname.trim().toLowerCase();
  if (!lower) return true;

  if (!isFirebaseConfigured) {
    try {
      const raw = localStorage.getItem("sirbax-nicknames");
      const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
      const owner = map[lower];
      return Boolean(owner && owner !== excludeUid);
    } catch {
      return false;
    }
  }

  try {
    const snap = await getDocs(
      query(collection(db, "users"), where("nicknameLower", "==", lower), limit(5))
    );
    if (!snap.empty) {
      return snap.docs.some((d) => d.id !== excludeUid);
    }
    // Fallback scan if nicknameLower not indexed yet
    const all = await getDocs(query(collection(db, "users"), limit(200)));
    return all.docs.some(
      (d) => d.id !== excludeUid && ((d.data().nickname as string) || "").toLowerCase() === lower
    );
  } catch {
    return false;
  }
}

export function reserveLocalNickname(nickname: string, uid: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("sirbax-nicknames");
    const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    map[nickname.trim().toLowerCase()] = uid;
    localStorage.setItem("sirbax-nicknames", JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export async function updateUserProfile(
  uid: string,
  data: Partial<Pick<UserProfile, "nickname" | "bio" | "avatarUrl" | "isPrivate" | "onboardingComplete" | "lastNicknameChangeAt" | "lastAvatarChangeAt">>
): Promise<void> {
  if (!isFirebaseConfigured) return;
  const payload: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (data.nickname !== undefined) {
    payload.nickname = data.nickname;
    payload.displayName = data.nickname;
    payload.username = data.nickname;
    payload.nicknameLower = data.nickname.toLowerCase();
  }
  if (data.bio !== undefined) payload.bio = data.bio;
  if (data.avatarUrl !== undefined) {
    payload.avatarUrl = data.avatarUrl;
    payload.profileImageUrl = data.avatarUrl;
  }
  if (data.isPrivate !== undefined) payload.isPrivate = data.isPrivate;
  if (data.onboardingComplete !== undefined) payload.onboardingComplete = data.onboardingComplete;
  if (data.lastNicknameChangeAt !== undefined) payload.lastNicknameChangeAt = data.lastNicknameChangeAt;
  if (data.lastAvatarChangeAt !== undefined) payload.lastAvatarChangeAt = data.lastAvatarChangeAt;
  await updateDoc(doc(db, "users", uid), payload);
}

export async function searchUsersByNickname(q: string, max = 20): Promise<UserProfile[]> {
  const term = q.trim().toLowerCase();
  if (!term) return [];

  if (!isFirebaseConfigured) {
    try {
      const raw = localStorage.getItem("sirbax-nicknames");
      const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
      const hits: UserProfile[] = [];
      for (const [nick, uid] of Object.entries(map)) {
        if (nick.includes(term)) {
          hits.push({
            uid,
            nickname: nick,
            avatarUrl: `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(nick)}`,
            followersCount: 0,
            followingCount: 0,
            postsCount: 0,
            isPrivate: false,
            onboardingComplete: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }
      return hits.slice(0, max);
    } catch {
      return [];
    }
  }

  try {
    const exact = await getDocs(
      query(collection(db, "users"), where("nicknameLower", "==", term), limit(max))
    );
    if (!exact.empty) {
      return exact.docs.map((d) => mapUser(d.id, d.data() as Record<string, unknown>));
    }

    const prefix = await getDocs(
      query(
        collection(db, "users"),
        where("nicknameLower", ">=", term),
        where("nicknameLower", "<=", term + "\uf8ff"),
        limit(max)
      )
    );
    if (!prefix.empty) {
      return prefix.docs.map((d) => mapUser(d.id, d.data() as Record<string, unknown>));
    }

    const all = await getDocs(query(collection(db, "users"), limit(300)));
    return all.docs
      .map((d) => mapUser(d.id, d.data() as Record<string, unknown>))
      .filter((u) => u.nickname.toLowerCase().includes(term))
      .slice(0, max);
  } catch (e) {
    console.error("searchUsersByNickname", e);
    return [];
  }
}

export async function changeNickname(uid: string, newNickname: string): Promise<void> {
  await updateUserProfile(uid, {
    nickname: newNickname,
    lastNicknameChangeAt: new Date().toISOString(),
  });
}
