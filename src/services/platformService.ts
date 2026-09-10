/**
 * Groups, events, marketplace, notifications, blocks, reports — Firebase + local fallback.
 */
import {
  collection, getDocs, setDoc, addDoc, updateDoc, deleteDoc, doc,
  query, where, orderBy, limit, serverTimestamp, type Timestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/firebase/config";

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
function toIso(v: unknown): string {
  if (!v) return new Date().toISOString();
  if (typeof v === "string") return v;
  if (typeof v === "object" && v && "toDate" in v) return (v as Timestamp).toDate().toISOString();
  return new Date().toISOString();
}

export type NotifType = "like" | "comment" | "follow" | "message" | "mention" | "share";

export interface AppNotification {
  id: string;
  recipientId: string;
  actorId: string;
  actorNickname: string;
  actorAvatar?: string;
  type: NotifType;
  postId?: string;
  text: string;
  read: boolean;
  createdAt: string;
}

export async function createNotification(n: Omit<AppNotification, "id" | "read" | "createdAt">): Promise<void> {
  if (n.recipientId === n.actorId) return;
  const item: AppNotification = { ...n, id: `n-${Date.now()}`, read: false, createdAt: new Date().toISOString() };
  if (!isFirebaseConfigured) {
    const key = `sirbax-notifs-${n.recipientId}`;
    lsSet(key, [item, ...lsGet<AppNotification[]>(key, [])].slice(0, 100));
    return;
  }
  try {
    await addDoc(collection(db, "notifications"), { ...n, read: false, createdAt: serverTimestamp() });
  } catch (e) {
    console.error(e);
  }
}

export async function listNotifications(uid: string): Promise<AppNotification[]> {
  if (!isFirebaseConfigured) return lsGet<AppNotification[]>(`sirbax-notifs-${uid}`, []);
  try {
    const snap = await getDocs(query(collection(db, "notifications"), where("recipientId", "==", uid), orderBy("createdAt", "desc"), limit(50)));
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id, recipientId: data.recipientId, actorId: data.actorId, actorNickname: data.actorNickname,
        actorAvatar: data.actorAvatar, type: data.type, postId: data.postId, text: data.text,
        read: Boolean(data.read), createdAt: toIso(data.createdAt),
      };
    });
  } catch {
    return lsGet<AppNotification[]>(`sirbax-notifs-${uid}`, []);
  }
}

export async function markNotificationsRead(uid: string): Promise<void> {
  if (!isFirebaseConfigured) {
    lsSet(`sirbax-notifs-${uid}`, lsGet<AppNotification[]>(`sirbax-notifs-${uid}`, []).map((n) => ({ ...n, read: true })));
    return;
  }
  try {
    const snap = await getDocs(query(collection(db, "notifications"), where("recipientId", "==", uid), where("read", "==", false), limit(50)));
    await Promise.all(snap.docs.map((d) => updateDoc(d.ref, { read: true })));
  } catch { /* ignore */ }
}

export async function blockUser(blockerId: string, blockedId: string): Promise<void> {
  if (!isFirebaseConfigured) {
    const key = `sirbax-blocks-${blockerId}`;
    const list = lsGet<string[]>(key, []);
    if (!list.includes(blockedId)) lsSet(key, [...list, blockedId]);
    return;
  }
  await setDoc(doc(db, "blocks", `${blockerId}_${blockedId}`), { blockerId, blockedId, createdAt: serverTimestamp() });
}

export async function unblockUser(blockerId: string, blockedId: string): Promise<void> {
  if (!isFirebaseConfigured) {
    lsSet(`sirbax-blocks-${blockerId}`, lsGet<string[]>(`sirbax-blocks-${blockerId}`, []).filter((id) => id !== blockedId));
    return;
  }
  await deleteDoc(doc(db, "blocks", `${blockerId}_${blockedId}`));
}

export async function listBlocked(blockerId: string): Promise<string[]> {
  if (!isFirebaseConfigured) return lsGet<string[]>(`sirbax-blocks-${blockerId}`, []);
  try {
    const snap = await getDocs(query(collection(db, "blocks"), where("blockerId", "==", blockerId)));
    return snap.docs.map((d) => d.data().blockedId as string);
  } catch {
    return lsGet<string[]>(`sirbax-blocks-${blockerId}`, []);
  }
}

export interface GroupItem {
  id: string; name: string; description: string; coverUrl: string; ownerId: string; membersCount: number; createdAt: string;
}

function defaultGroups(): GroupItem[] {
  return [
    { id: "g1", name: "Anonymous Voices", description: "Share freely. Stay anonymous.", coverUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", ownerId: "system", membersCount: 12400, createdAt: new Date().toISOString() },
    { id: "g2", name: "Tech Night Owls", description: "Code, build, and ship after dark.", coverUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80", ownerId: "system", membersCount: 8320, createdAt: new Date().toISOString() },
    { id: "g3", name: "Somali Stories", description: "Culture, language, and daily life.", coverUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80", ownerId: "system", membersCount: 22100, createdAt: new Date().toISOString() },
  ];
}

export async function listGroups(): Promise<GroupItem[]> {
  if (!isFirebaseConfigured) return lsGet<GroupItem[]>("sirbax-groups", defaultGroups());
  try {
    const snap = await getDocs(query(collection(db, "groups"), orderBy("createdAt", "desc"), limit(40)));
    if (snap.empty) return defaultGroups();
    return snap.docs.map((d) => {
      const data = d.data();
      return { id: d.id, name: data.name, description: data.description || "", coverUrl: data.coverUrl || defaultGroups()[0].coverUrl, ownerId: data.ownerId, membersCount: data.membersCount || 1, createdAt: toIso(data.createdAt) };
    });
  } catch {
    return lsGet<GroupItem[]>("sirbax-groups", defaultGroups());
  }
}

export async function createGroup(input: { name: string; description: string; ownerId: string; coverUrl?: string }): Promise<GroupItem> {
  const item: GroupItem = { id: `g-${Date.now()}`, name: input.name.trim(), description: input.description.trim(), coverUrl: input.coverUrl || defaultGroups()[0].coverUrl, ownerId: input.ownerId, membersCount: 1, createdAt: new Date().toISOString() };
  if (!isFirebaseConfigured) {
    lsSet("sirbax-groups", [item, ...lsGet<GroupItem[]>("sirbax-groups", defaultGroups())]);
    return item;
  }
  const ref = await addDoc(collection(db, "groups"), { name: item.name, description: item.description, coverUrl: item.coverUrl, ownerId: item.ownerId, membersCount: 1, createdAt: serverTimestamp() });
  return { ...item, id: ref.id };
}

export async function getGroup(id: string): Promise<GroupItem | null> {
  return (await listGroups()).find((g) => g.id === id) || null;
}

export function joinGroupLocal(uid: string, groupId: string) {
  const key = `sirbax-joined-groups-${uid}`;
  const list = lsGet<string[]>(key, []);
  if (!list.includes(groupId)) lsSet(key, [...list, groupId]);
}

export function isJoinedGroup(uid: string, groupId: string) {
  return lsGet<string[]>(`sirbax-joined-groups-${uid}`, []).includes(groupId);
}

export interface EventItem {
  id: string; title: string; when: string; place: string; coverUrl: string; ownerId: string; interestedCount: number; createdAt: string;
}

function defaultEvents(): EventItem[] {
  return [
    { id: "e1", title: "Anonymous Meetup Online", when: "Sat · 7:00 PM", place: "sirbax Live", coverUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80", ownerId: "system", interestedCount: 48, createdAt: new Date().toISOString() },
    { id: "e2", title: "Photo Walk — City Lights", when: "Sun · 5:30 PM", place: "Downtown", coverUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80", ownerId: "system", interestedCount: 22, createdAt: new Date().toISOString() },
  ];
}

export async function listEvents(): Promise<EventItem[]> {
  if (!isFirebaseConfigured) return lsGet<EventItem[]>("sirbax-events", defaultEvents());
  try {
    const snap = await getDocs(query(collection(db, "events"), orderBy("createdAt", "desc"), limit(40)));
    if (snap.empty) return defaultEvents();
    return snap.docs.map((d) => {
      const data = d.data();
      return { id: d.id, title: data.title, when: data.when || "", place: data.place || "", coverUrl: data.coverUrl || defaultEvents()[0].coverUrl, ownerId: data.ownerId, interestedCount: data.interestedCount || 0, createdAt: toIso(data.createdAt) };
    });
  } catch {
    return lsGet<EventItem[]>("sirbax-events", defaultEvents());
  }
}

export async function createEvent(input: { title: string; when: string; place: string; ownerId: string; coverUrl?: string }): Promise<EventItem> {
  const item: EventItem = { id: `e-${Date.now()}`, title: input.title.trim(), when: input.when, place: input.place, coverUrl: input.coverUrl || defaultEvents()[0].coverUrl, ownerId: input.ownerId, interestedCount: 1, createdAt: new Date().toISOString() };
  if (!isFirebaseConfigured) {
    lsSet("sirbax-events", [item, ...lsGet<EventItem[]>("sirbax-events", defaultEvents())]);
    return item;
  }
  const ref = await addDoc(collection(db, "events"), { ...item, createdAt: serverTimestamp() });
  return { ...item, id: ref.id };
}

export function markInterested(uid: string, eventId: string) {
  const key = `sirbax-interested-${uid}`;
  const list = lsGet<string[]>(key, []);
  if (!list.includes(eventId)) lsSet(key, [...list, eventId]);
}

export function isInterested(uid: string, eventId: string) {
  return lsGet<string[]>(`sirbax-interested-${uid}`, []).includes(eventId);
}

export interface ListingItem {
  id: string; title: string; price: string; description: string; imageUrl: string; sellerId: string; sellerNickname: string; createdAt: string;
}

function defaultListings(): ListingItem[] {
  return [
    { id: "l1", title: "MacBook Air M1", price: "KSh 95,000", description: "Great condition", imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80", sellerId: "demo", sellerNickname: "QuietFox_421", createdAt: new Date().toISOString() },
    { id: "l2", title: "iPhone 13", price: "KSh 55,000", description: "128GB", imageUrl: "https://images.unsplash.com/photo-1632661674590-df3e4e8e9e0c?w=400&q=80", sellerId: "demo", sellerNickname: "BlueMoon_204", createdAt: new Date().toISOString() },
  ];
}

export async function listListings(): Promise<ListingItem[]> {
  if (!isFirebaseConfigured) return lsGet<ListingItem[]>("sirbax-listings", defaultListings());
  try {
    const snap = await getDocs(query(collection(db, "listings"), orderBy("createdAt", "desc"), limit(40)));
    if (snap.empty) return defaultListings();
    return snap.docs.map((d) => {
      const data = d.data();
      return { id: d.id, title: data.title, price: data.price, description: data.description || "", imageUrl: data.imageUrl, sellerId: data.sellerId, sellerNickname: data.sellerNickname, createdAt: toIso(data.createdAt) };
    });
  } catch {
    return lsGet<ListingItem[]>("sirbax-listings", defaultListings());
  }
}

export async function createListing(input: { title: string; price: string; description: string; imageUrl: string; sellerId: string; sellerNickname: string }): Promise<ListingItem> {
  const item: ListingItem = { id: `l-${Date.now()}`, ...input, createdAt: new Date().toISOString() };
  if (!isFirebaseConfigured) {
    lsSet("sirbax-listings", [item, ...lsGet<ListingItem[]>("sirbax-listings", defaultListings())]);
    return item;
  }
  const ref = await addDoc(collection(db, "listings"), { ...input, createdAt: serverTimestamp() });
  return { ...item, id: ref.id };
}

export async function submitReport(input: { reporterId: string; targetType: "post" | "user" | "comment"; targetId: string; category: string; details?: string }): Promise<void> {
  if (!isFirebaseConfigured) {
    lsSet("sirbax-reports", [...lsGet("sirbax-reports", [] as unknown[]), { ...input, createdAt: new Date().toISOString() }]);
    return;
  }
  await addDoc(collection(db, "reports"), { ...input, createdAt: serverTimestamp() });
}

export function hidePost(uid: string, postId: string) {
  const key = `sirbax-hidden-${uid}`;
  const list = lsGet<string[]>(key, []);
  if (!list.includes(postId)) lsSet(key, [...list, postId]);
}

export function getHiddenPosts(uid: string): string[] {
  return lsGet<string[]>(`sirbax-hidden-${uid}`, []);
}
