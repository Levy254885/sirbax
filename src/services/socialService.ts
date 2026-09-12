/**
 * Follows, comments, stories, DMs — Firestore is source of truth.
 */
import {
  collection, doc, getDoc, getDocs, setDoc, deleteDoc, addDoc, updateDoc,
  query, where, orderBy, limit, serverTimestamp, increment, type Timestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/firebase/config";
import type { Post } from "@/types";
import { DEMO_POSTS, DEMO_STORIES } from "@/lib/demo-data";
import { generateDefaultAvatar } from "@/utils/nickname";
import { createNotification } from "@/services/platformService";

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

  const followRef = doc(db, "follows", `${followerId}_${targetId}`);
  const existing = await getDoc(followRef);
  if (existing.exists()) return;

  await setDoc(followRef, {
    followerId,
    followingId: targetId,
    createdAt: serverTimestamp(),
  });

  try {
    await updateDoc(doc(db, "users", targetId), {
      followersCount: increment(1),
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    console.error("followUser target count failed", e);
  }
  try {
    await updateDoc(doc(db, "users", followerId), {
      followingCount: increment(1),
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    console.error("followUser self count failed", e);
  }
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

  const followRef = doc(db, "follows", `${followerId}_${targetId}`);
  const existing = await getDoc(followRef);
  if (!existing.exists()) return;

  await deleteDoc(followRef);

  try {
    await updateDoc(doc(db, "users", targetId), {
      followersCount: increment(-1),
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    console.error("unfollowUser target count failed", e);
  }
  try {
    await updateDoc(doc(db, "users", followerId), {
      followingCount: increment(-1),
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    console.error("unfollowUser self count failed", e);
  }
}

export async function isFollowing(followerId: string, targetId: string): Promise<boolean> {
  if (!isFirebaseConfigured) return lsGet<string[]>(`sirbax-following-${followerId}`, []).includes(targetId);
  return (await getDoc(doc(db, "follows", `${followerId}_${targetId}`))).exists();
}

export function getLocalFollowCounts(uid: string): { followers: number; following: number } {
  const counts = lsGet<Record<string, { followers: number; following: number }>>("sirbax-follow-counts", {});
  return counts[uid] || { followers: 0, following: 0 };
}

/** Prefer Firestore user counters; recount from edges if counters are 0. */
export async function getFollowCounts(uid: string): Promise<{ followers: number; following: number }> {
  if (!isFirebaseConfigured) return getLocalFollowCounts(uid);
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) {
      const d = snap.data();
      let followers = Number(d.followersCount) || 0;
      let following = Number(d.followingCount) || 0;
      if (followers === 0 && following === 0) {
        const [asTarget, asFollower] = await Promise.all([
          getDocs(query(collection(db, "follows"), where("followingId", "==", uid), limit(500))),
          getDocs(query(collection(db, "follows"), where("followerId", "==", uid), limit(500))),
        ]);
        followers = asTarget.size;
        following = asFollower.size;
      }
      return { followers, following };
    }
  } catch (e) {
    console.warn("getFollowCounts", e);
  }
  return getLocalFollowCounts(uid);
}

export interface CommentItem {
  id: string;
  postId?: string;
  authorId: string;
  authorNickname: string;
  authorAvatar?: string;
  content: string;
  text?: string;
  createdAt: string;
  likesCount?: number;
  parentId?: string | null;
  replyCount?: number;
  isEdited?: boolean;
}

export async function getComments(postId: string): Promise<CommentItem[]> {
  if (!isFirebaseConfigured) {
    return lsGet<CommentItem[]>(`sirbax-comments-${postId}`, []).map((c) => ({
      ...c,
      content: c.content || c.text || "",
    }));
  }
  try {
    const snap = await getDocs(query(collection(db, "posts", postId, "comments"), orderBy("createdAt", "desc"), limit(100)));
    return snap.docs.map((d) => {
      const data = d.data();
      const body = data.content || data.text || "";
      return {
        id: d.id,
        postId,
        authorId: data.authorId || "",
        authorNickname: data.authorNickname || "",
        authorAvatar: data.authorAvatar || generateDefaultAvatar(data.authorNickname || "u"),
        content: body,
        text: body,
        createdAt: toIso(data.createdAt),
        likesCount: data.likesCount || 0,
        parentId: data.parentId || null,
        isEdited: Boolean(data.isEdited),
      };
    });
  } catch {
    return lsGet<CommentItem[]>(`sirbax-comments-${postId}`, []);
  }
}

export async function addComment(
  postId: string,
  input: { authorId: string; authorNickname: string; authorAvatar?: string; content: string; parentId?: string }
): Promise<CommentItem> {
  const body = input.content.trim();
  const item: CommentItem = {
    id: `c-${Date.now()}`,
    postId,
    authorId: input.authorId,
    authorNickname: input.authorNickname,
    authorAvatar: input.authorAvatar || generateDefaultAvatar(input.authorNickname),
    content: body,
    text: body,
    createdAt: new Date().toISOString(),
    likesCount: 0,
    parentId: input.parentId || null,
  };
  if (!isFirebaseConfigured) {
    lsSet(`sirbax-comments-${postId}`, [item, ...lsGet<CommentItem[]>(`sirbax-comments-${postId}`, [])]);
    return item;
  }
  const ref = await addDoc(collection(db, "posts", postId, "comments"), {
    authorId: input.authorId,
    authorNickname: input.authorNickname,
    authorAvatar: input.authorAvatar || "",
    content: body,
    text: body,
    likesCount: 0,
    parentId: input.parentId || null,
    createdAt: serverTimestamp(),
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
  if (!isFirebaseConfigured) {
    const { getFeedPosts } = await import("./postService");
    return (await getFeedPosts(100)).filter((p) => p.authorId === authorId);
  }
  try {
    const snap = await getDocs(
      query(collection(db, "posts"), where("authorId", "==", authorId), limit(50))
    );
    const posts = snap.docs.map((d) => {
      const data = d.data();
      const created = data.createdAt as Timestamp | string | undefined;
      const createdAt =
        created && typeof created === "object" && "toDate" in created
          ? (created as Timestamp).toDate().toISOString()
          : (created as string) || new Date().toISOString();
      return {
        id: d.id,
        authorId: (data.authorId as string) || authorId,
        authorNickname: (data.authorNickname as string) || "",
        authorAvatar: (data.authorAvatar as string) || "",
        content: (data.content as string) || "",
        media: data.media || undefined,
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
      } as Post;
    });
    return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (e) {
    console.warn("getPostsByAuthor", e);
    const { getFeedPosts } = await import("./postService");
    return (await getFeedPosts(100)).filter((p) => p.authorId === authorId);
  }
}

export async function likeComment(postId: string, commentId: string): Promise<void> {
  if (!isFirebaseConfigured) {
    lsSet(
      `sirbax-comments-${postId}`,
      lsGet<CommentItem[]>(`sirbax-comments-${postId}`, []).map((c) =>
        c.id === commentId ? { ...c, likesCount: (c.likesCount || 0) + 1 } : c
      )
    );
    return;
  }
  try {
    await updateDoc(doc(db, "posts", postId, "comments", commentId), { likesCount: increment(1) });
  } catch (e) {
    console.error(e);
  }
}

export async function listFollowingIds(followerId: string): Promise<string[]> {
  if (!isFirebaseConfigured) return lsGet<string[]>(`sirbax-following-${followerId}`, []);
  try {
    const snap = await getDocs(query(collection(db, "follows"), where("followerId", "==", followerId), limit(200)));
    return snap.docs.map((d) => d.data().followingId as string).filter(Boolean);
  } catch {
    return lsGet<string[]>(`sirbax-following-${followerId}`, []);
  }
}

export async function listFollowerIds(targetId: string): Promise<string[]> {
  if (!isFirebaseConfigured) return [];
  try {
    const snap = await getDocs(query(collection(db, "follows"), where("followingId", "==", targetId), limit(200)));
    return snap.docs.map((d) => d.data().followerId as string).filter(Boolean);
  } catch {
    return [];
  }
}

export async function notifyFollow(
  actor: { uid: string; nickname: string; avatarUrl?: string },
  targetId: string
) {
  await createNotification({
    recipientId: targetId,
    actorId: actor.uid,
    actorNickname: actor.nickname,
    actorAvatar: actor.avatarUrl,
    type: "follow",
    text: "started following you",
  });
}

export async function deleteMessage(cid: string, messageId: string, senderId: string): Promise<void> {
  if (!isFirebaseConfigured) {
    lsSet(
      `sirbax-msgs-${cid}`,
      lsGet<ChatMessage[]>(`sirbax-msgs-${cid}`, []).filter(
        (m) => !(m.id === messageId && m.senderId === senderId)
      )
    );
    return;
  }
  try {
    await deleteDoc(doc(db, "conversations", cid, "messages", messageId));
  } catch (e) {
    console.error(e);
  }
}

export async function markConversationRead(cid: string, uid: string): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    await updateDoc(doc(db, "conversations", cid), {
      [`readAt.${uid}`]: serverTimestamp(),
    });
  } catch {
    /* ignore */
  }
}

export function setTyping(cid: string, uid: string, typing: boolean) {
  if (typeof window === "undefined") return;
  const key = `sirbax-typing-${cid}`;
  const map = lsGet<Record<string, number>>(key, {});
  if (typing) map[uid] = Date.now();
  else delete map[uid];
  lsSet(key, map);
}

export function getTypingOthers(cid: string, me: string): boolean {
  const map = lsGet<Record<string, number>>(`sirbax-typing-${cid}`, {});
  const now = Date.now();
  return Object.entries(map).some(([uid, ts]) => uid !== me && now - ts < 3000);
}

export function setOnline(uid: string) {
  if (typeof window === "undefined") return;
  const map = lsGet<Record<string, number>>("sirbax-online", {});
  map[uid] = Date.now();
  lsSet("sirbax-online", map);
}

export function isOnline(uid: string): boolean {
  const map = lsGet<Record<string, number>>("sirbax-online", {});
  return Boolean(map[uid] && Date.now() - map[uid] < 60_000);
}

export async function deleteComment(postId: string, commentId: string, authorId: string): Promise<void> {
  if (!isFirebaseConfigured) {
    lsSet(
      `sirbax-comments-${postId}`,
      lsGet<CommentItem[]>(`sirbax-comments-${postId}`, []).filter(
        (c) => !(c.id === commentId && c.authorId === authorId)
      )
    );
    return;
  }
  try {
    await deleteDoc(doc(db, "posts", postId, "comments", commentId));
  } catch (e) {
    console.error(e);
  }
}

export async function editComment(
  postId: string,
  commentId: string,
  authorId: string,
  content: string
): Promise<void> {
  if (!isFirebaseConfigured) {
    lsSet(
      `sirbax-comments-${postId}`,
      lsGet<CommentItem[]>(`sirbax-comments-${postId}`, []).map((c) =>
        c.id === commentId && c.authorId === authorId
          ? { ...c, content, text: content, isEdited: true }
          : c
      )
    );
    return;
  }
  try {
    await updateDoc(doc(db, "posts", postId, "comments", commentId), {
      content,
      text: content,
      isEdited: true,
    });
  } catch (e) {
    console.error(e);
  }
}

export async function searchEverything(q: string): Promise<{
  users: { uid: string; nickname: string; avatarUrl: string }[];
  posts: Post[];
  hashtags: string[];
}> {
  const term = q.trim().toLowerCase().replace(/^#/, "").replace(/^@/, "");
  if (!term) return { users: [], posts: [], hashtags: [] };

  const posts = await (await import("@/services/postService")).getFeedPosts(80);
  const matchedPosts = posts.filter(
    (p) =>
      p.content.toLowerCase().includes(term) ||
      p.authorNickname.toLowerCase().includes(term) ||
      (p.hashtags || []).some((h) => h.toLowerCase().includes(term))
  );

  const userMap = new Map<string, { uid: string; nickname: string; avatarUrl: string }>();
  for (const p of posts) {
    if (p.authorNickname.toLowerCase().includes(term)) {
      userMap.set(p.authorId, {
        uid: p.authorId,
        nickname: p.authorNickname,
        avatarUrl: p.authorAvatar,
      });
    }
  }

  const tagSet = new Set<string>();
  for (const p of posts) {
    for (const h of p.hashtags || []) {
      if (h.toLowerCase().includes(term)) tagSet.add(h.toLowerCase());
    }
  }
  for (const h of ["confession", "relationship", "school", "family", "work", "money", "kenya", "life"]) {
    if (h.includes(term) || term.includes(h)) tagSet.add(h);
  }

  return {
    users: [...userMap.values()],
    posts: matchedPosts,
    hashtags: [...tagSet],
  };
}
