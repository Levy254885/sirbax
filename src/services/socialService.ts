/**
 * Follows, comments, stories, DMs — Firestore + localStorage fallback.
 * Conversations keyed by sorted user UIDs so messages never go to the wrong profile.
 */
import {
  collection, doc, getDoc, getDocs, setDoc, deleteDoc, addDoc, updateDoc,
  query, where, orderBy, limit, serverTimestamp, increment, type Timestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/firebase/config";
import type { Post } from "@/types";
import { DEMO_POSTS, DEMO_STORIES } from "@/lib/demo-data";
import { generateDefaultAvatar } from "@/utils/nickname";

export { rankPosts } from "@/services/feedRank";

function lsGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function lsSet(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function conversationId(a: string, b: string): string {
  return [a, b].sort().join("__");
}

function toIso(v: unknown): string {
  if (!v) return new Date().toISOString();
  if (typeof v === "string") return v;
  if (typeof v === "object" && v && "toDate" in v) return (v as Timestamp).toDate().toISOString();
  return new Date().toISOString();
}

export async function followUser(followerId: string, targetId: string): Promise<void> {
  if (followerId === targetId) return;
  if (!isFirebaseConfigured) {
    const key = `sirbax-following-${followerId}`;
    const list = lsGet<string[]>(key, []);
    if (!list.includes(targetId)) {
      list.push(targetId);
      lsSet(key, list);
      const counts = lsGet<Record<string, { followers: number; following: number }>>("sirbax-follow-counts", {});
      counts[targetId] = { followers: (counts[targetId]?.followers || 0) + 1, following: counts[targetId]?.following || 0 };
      counts[followerId] = { followers: counts[followerId]?.followers || 0, following: (counts[followerId]?.following || 0) + 1 };
      lsSet("sirbax-follow-counts", counts);
    }
    return;
  }
  await setDoc(doc(db, "follows", `${followerId}_${targetId}`), { followerId, followingId: targetId, createdAt: serverTimestamp() });
  await updateDoc(doc(db, "users", targetId), { followersCount: increment(1) }).catch(() => {});
  await updateDoc(doc(db, "users", followerId), { followingCount: increment(1) }).catch(() => {});
}

export async function unfollowUser(followerId: string, targetId: string): Promise<void> {
  if (!isFirebaseConfigured) {
    lsSet(`sirbax-following-${followerId}`, lsGet<string[]>(`sirbax-following-${followerId}`, []).filter((id) => id !== targetId));
    const counts = lsGet<Record<string, { followers: number; following: number }>>("sirbax-follow-counts", {});
    if (counts[targetId]) counts[targetId].followers = Math.max(0, (counts[targetId].followers || 1) - 1);
    if (counts[followerId]) counts[followerId].following = Math.max(0, (counts[followerId].following || 1) - 1);
    lsSet("sirbax-follow-counts", counts);
    return;
  }
  await deleteDoc(doc(db, "follows", `${followerId}_${targetId}`));
  await updateDoc(doc(db, "users", targetId), { followersCount: increment(-1) }).catch(() => {});
  await updateDoc(doc(db, "users", followerId), { followingCount: increment(-1) }).catch(() => {});
}

export async function isFollowing(followerId: string, targetId: string): Promise<boolean> {
  if (!isFirebaseConfigured) return lsGet<string[]>(`sirbax-following-${followerId}`, []).includes(targetId);
  return (await getDoc(doc(db, "follows", `${followerId}_${targetId}`))).exists();
}

export function getLocalFollowCounts(uid: string): { followers: number; following: number } {
  const counts = lsGet<Record<string, { followers: number; following: number }>>("sirbax-follow-counts", {});
  return counts[uid] || { followers: 0, following: 0 };
}

export interface CommentItem {
  id: string; postId: string; authorId: string; authorNickname: string; authorAvatar: string;
  text: string; createdAt: string; likesCount: number;
}

export async function getComments(postId: string): Promise<CommentItem[]> {
  if (!isFirebaseConfigured) return lsGet<CommentItem[]>(`sirbax-comments-${postId}`, []);
  try {
    const snap = await getDocs(query(collection(db, "posts", postId, "comments"), orderBy("createdAt", "desc"), limit(100)));
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id, postId, authorId: data.authorId || "", authorNickname: data.authorNickname || "",
        authorAvatar: data.authorAvatar || generateDefaultAvatar(data.authorNickname || "u"),
        text: data.text || "", createdAt: toIso(data.createdAt), likesCount: data.likesCount || 0,
      };
    });
  } catch {
    return lsGet<CommentItem[]>(`sirbax-comments-${postId}`, []);
  }
}

export async function addComment(
  postId: string,
  author: { uid: string; nickname: string; avatarUrl?: string },
  text: string
): Promise<CommentItem> {
  const item: CommentItem = {
    id: `c-${Date.now()}`, postId, authorId: author.uid, authorNickname: author.nickname,
    authorAvatar: author.avatarUrl || generateDefaultAvatar(author.nickname),
    text: text.trim(), createdAt: new Date().toISOString(), likesCount: 0,
  };
  if (!isFirebaseConfigured) {
    lsSet(`sirbax-comments-${postId}`, [item, ...lsGet<CommentItem[]>(`sirbax-comments-${postId}`, [])]);
    const posts = lsGet<Post[]>("sirbax-posts", DEMO_POSTS).map((p) =>
      p.id === postId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p
    );
    lsSet("sirbax-posts", posts);
    return item;
  }
  const ref = await addDoc(collection(db, "posts", postId, "comments"), {
    authorId: author.uid, authorNickname: author.nickname, authorAvatar: author.avatarUrl || "",
    text: text.trim(), likesCount: 0, createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, "posts", postId), { commentsCount: increment(1), updatedAt: serverTimestamp() }).catch(() => {});
  return { ...item, id: ref.id };
}

export interface StoryItem {
  id: string; authorId: string; authorNickname: string; authorAvatar: string;
  mediaUrl: string; createdAt: string; expiresAt: string;
}

export async function createStory(input: {
  authorId: string; authorNickname: string; authorAvatar?: string; mediaUrl: string;
}): Promise<StoryItem> {
  const now = Date.now();
  const story: StoryItem = {
    id: `st-${now}`, authorId: input.authorId, authorNickname: input.authorNickname,
    authorAvatar: input.authorAvatar || generateDefaultAvatar(input.authorNickname),
    mediaUrl: input.mediaUrl, createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + 86400000).toISOString(),
  };
  if (!isFirebaseConfigured) {
    lsSet("sirbax-stories", [story, ...lsGet<StoryItem[]>("sirbax-stories", [])]);
    return story;
  }
  const ref = await addDoc(collection(db, "stories"), {
    ...story, type: "image", privacy: "everyone", viewersCount: 0, createdAt: serverTimestamp(),
  });
  return { ...story, id: ref.id };
}

function demoStories(): StoryItem[] {
  return DEMO_STORIES.map((s) => ({
    id: s.id, authorId: s.authorId, authorNickname: s.authorNickname, authorAvatar: s.authorAvatar,
    mediaUrl: s.mediaUrl || s.authorAvatar, createdAt: s.createdAt, expiresAt: s.expiresAt,
  }));
}

export async function listStories(): Promise<StoryItem[]> {
  const local = lsGet<StoryItem[]>("sirbax-stories", []);
  if (!isFirebaseConfigured) return [...local, ...demoStories()];
  try {
    const snap = await getDocs(query(collection(db, "stories"), orderBy("createdAt", "desc"), limit(40)));
    const now = Date.now();
    const items = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id, authorId: data.authorId || "", authorNickname: data.authorNickname || "",
        authorAvatar: data.authorAvatar || generateDefaultAvatar(data.authorNickname || "u"),
        mediaUrl: data.mediaUrl || "", createdAt: toIso(data.createdAt),
        expiresAt: data.expiresAt || new Date(now + 86400000).toISOString(),
      };
    }).filter((s) => new Date(s.expiresAt).getTime() > now);
    return items.length ? items : [...local, ...demoStories()];
  } catch {
    return [...local, ...demoStories()];
  }
}

export interface ChatMessage {
  id: string; conversationId: string; senderId: string; senderNickname: string; text: string; createdAt: string;
}
export interface ConversationMeta {
  id: string; participantIds: [string, string];
  participantNicknames: Record<string, string>; participantAvatars: Record<string, string>;
  lastMessage: string; updatedAt: string;
}

export async function sendMessage(input: {
  fromId: string; fromNickname: string; fromAvatar?: string;
  toId: string; toNickname: string; toAvatar?: string; text: string;
}): Promise<ChatMessage> {
  const cid = conversationId(input.fromId, input.toId);
  const msg: ChatMessage = {
    id: `m-${Date.now()}`, conversationId: cid, senderId: input.fromId,
    senderNickname: input.fromNickname, text: input.text.trim(), createdAt: new Date().toISOString(),
  };
  const meta: ConversationMeta = {
    id: cid, participantIds: [input.fromId, input.toId].sort() as [string, string],
    participantNicknames: { [input.fromId]: input.fromNickname, [input.toId]: input.toNickname },
    participantAvatars: {
      [input.fromId]: input.fromAvatar || generateDefaultAvatar(input.fromNickname),
      [input.toId]: input.toAvatar || generateDefaultAvatar(input.toNickname),
    },
    lastMessage: msg.text, updatedAt: msg.createdAt,
  };
  if (!isFirebaseConfigured) {
    lsSet(`sirbax-msgs-${cid}`, [...lsGet<ChatMessage[]>(`sirbax-msgs-${cid}`, []), msg]);
    const convos = lsGet<ConversationMeta[]>("sirbax-conversations", []);
    const idx = convos.findIndex((c) => c.id === cid);
    if (idx >= 0) convos[idx] = meta; else convos.unshift(meta);
    lsSet("sirbax-conversations", convos);
    return msg;
  }
  await setDoc(doc(db, "conversations", cid), {
    participantIds: meta.participantIds, participantNicknames: meta.participantNicknames,
    participantAvatars: meta.participantAvatars, lastMessage: msg.text, updatedAt: serverTimestamp(),
  }, { merge: true });
  const ref = await addDoc(collection(db, "conversations", cid, "messages"), {
    senderId: input.fromId, senderNickname: input.fromNickname, text: msg.text, createdAt: serverTimestamp(),
  });
  return { ...msg, id: ref.id };
}

export async function getMessages(cid: string): Promise<ChatMessage[]> {
  if (!isFirebaseConfigured) return lsGet<ChatMessage[]>(`sirbax-msgs-${cid}`, []);
  try {
    const snap = await getDocs(query(collection(db, "conversations", cid, "messages"), orderBy("createdAt", "asc"), limit(200)));
    return snap.docs.map((d) => {
      const data = d.data();
      return { id: d.id, conversationId: cid, senderId: data.senderId || "", senderNickname: data.senderNickname || "", text: data.text || "", createdAt: toIso(data.createdAt) };
    });
  } catch {
    return lsGet<ChatMessage[]>(`sirbax-msgs-${cid}`, []);
  }
}

export async function listConversations(uid: string): Promise<ConversationMeta[]> {
  if (!isFirebaseConfigured) {
    return lsGet<ConversationMeta[]>("sirbax-conversations", []).filter((c) => c.participantIds.includes(uid));
  }
  try {
    const snap = await getDocs(query(collection(db, "conversations"), where("participantIds", "array-contains", uid), limit(50)));
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id, participantIds: data.participantIds || [], participantNicknames: data.participantNicknames || {},
        participantAvatars: data.participantAvatars || {}, lastMessage: data.lastMessage || "", updatedAt: toIso(data.updatedAt),
      };
    });
  } catch {
    return [];
  }
}

export async function getPostsByAuthor(authorId: string): Promise<Post[]> {
  const { getFeedPosts } = await import("./postService");
  return (await getFeedPosts(100)).filter((p) => p.authorId === authorId);
}
