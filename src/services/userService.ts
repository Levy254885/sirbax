import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/firebase/config";
import type { UserProfile } from "@/types";

export async function getUserById(uid: string): Promise<UserProfile | null> {
  if (!isFirebaseConfigured) return null;
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    uid,
    nickname: data.nickname || "",
    avatarUrl: data.avatarUrl || data.profileImageUrl || "",
    bio: data.bio || "",
    followersCount: data.followersCount ?? 0,
    followingCount: data.followingCount ?? 0,
    postsCount: data.postsCount ?? 0,
    isPrivate: data.isPrivate ?? false,
    onboardingComplete: data.onboardingComplete ?? true,
    createdAt: data.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
    role: data.role || "user",
  };
}

export async function updateUserProfile(
  uid: string,
  data: Partial<Pick<UserProfile, "nickname" | "bio" | "avatarUrl" | "isPrivate" | "onboardingComplete">>
): Promise<void> {
  if (!isFirebaseConfigured) return;
  const payload: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (data.nickname !== undefined) {
    payload.nickname = data.nickname;
    payload.displayName = data.nickname;
    payload.username = data.nickname;
  }
  if (data.bio !== undefined) payload.bio = data.bio;
  if (data.avatarUrl !== undefined) {
    payload.avatarUrl = data.avatarUrl;
    payload.profileImageUrl = data.avatarUrl;
  }
  if (data.isPrivate !== undefined) payload.isPrivate = data.isPrivate;
  if (data.onboardingComplete !== undefined) payload.onboardingComplete = data.onboardingComplete;
  await updateDoc(doc(db, "users", uid), payload);
}

export async function searchUsersByNickname(q: string, max = 20): Promise<UserProfile[]> {
  if (!isFirebaseConfigured || !q.trim()) return [];
  const snap = await getDocs(
    query(collection(db, "users"), where("nickname", ">=", q), where("nickname", "<=", q + "\uf8ff"), limit(max))
  );
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      uid: d.id,
      nickname: data.nickname || "",
      avatarUrl: data.avatarUrl || "",
      bio: data.bio || "",
      followersCount: data.followersCount ?? 0,
      followingCount: data.followingCount ?? 0,
      postsCount: data.postsCount ?? 0,
      isPrivate: data.isPrivate ?? false,
      onboardingComplete: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      role: "user" as const,
    };
  });
}

export async function changeNickname(uid: string, newNickname: string): Promise<void> {
  await updateUserProfile(uid, { nickname: newNickname });
}
