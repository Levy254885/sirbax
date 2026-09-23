/** Sirbax Marketplace — NO escrow/wallet. Payments arranged directly between parties. */
import {
  collection, doc, addDoc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, serverTimestamp, increment, type Timestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/firebase/config";
import { createNotification } from "@/services/platformService";
import { conversationId, sendMessage } from "@/services/socialService";
import type {
  MarketplaceListing, MarketplaceOffer, MarketplaceDeal, MarketplaceRating,
  ListingSearchParams, ListingStatus, DealStatus, OfferStatus, ListingImage,
} from "@/types/marketplace";

const COL = {
  listings: "marketplaceListings",
  offers: "marketplaceOffers",
  deals: "marketplaceDeals",
  saved: "marketplaceSaved",
  ratings: "marketplaceRatings",
  reports: "marketplaceReports",
} as const;

function toIso(v: unknown): string {
  if (!v) return new Date().toISOString();
  if (typeof v === "string") return v;
  if (typeof v === "object" && v && "toDate" in v) return (v as Timestamp).toDate().toISOString();
  return new Date().toISOString();
}

function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "listing";
}

function mapListing(id: string, data: Record<string, unknown>): MarketplaceListing {
  const images = (data.images as ListingImage[]) || [];
  return {
    id,
    sellerId: (data.sellerId as string) || "",
    sellerNickname: (data.sellerNickname as string) || "",
    sellerAvatar: (data.sellerAvatar as string) || undefined,
    title: (data.title as string) || "",
    slug: (data.slug as string) || slugify((data.title as string) || "item"),
    description: (data.description as string) || "",
    categoryId: (data.categoryId as string) || "other",
    subcategoryId: (data.subcategoryId as string) || undefined,
    price: Number(data.price) || 0,
    currency: (data.currency as string) || "KES",
    condition: data.condition as MarketplaceListing["condition"],
    brand: (data.brand as string) || undefined,
    model: (data.model as string) || undefined,
    quantity: Number(data.quantity) || 1,
    images,
    coverImage: (data.coverImage as string) || images[0]?.url || "",
    location: (data.location as MarketplaceListing["location"]) || { country: "Kenya" },
    deliveryOptions: (data.deliveryOptions as MarketplaceListing["deliveryOptions"]) || ["negotiable"],
    attributes: (data.attributes as Record<string, string | number>) || {},
    tags: (data.tags as string[]) || [],
    status: (data.status as ListingStatus) || "ACTIVE",
    views: Number(data.views) || 0,
    saves: Number(data.saves) || 0,
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  };
}

export function formatMoney(amount: number, currency = "KES"): string {
  return `${currency} ${Number(amount).toLocaleString()}`;
}

export function dealStatusLabel(status: DealStatus): string {
  const map: Record<DealStatus, string> = {
    INQUIRY: "Inquiry", NEGOTIATING: "Negotiating", OFFER_MADE: "Offer made",
    OFFER_ACCEPTED: "Offer accepted", DEAL_AGREED: "Deal agreed",
    PAYMENT_PENDING: "Payment pending (arrange directly)",
    PAYMENT_REPORTED: "Payment reported by user", DELIVERY_PENDING: "Delivery pending",
    DELIVERED: "Delivered", COMPLETED: "Completed", CANCELLED: "Cancelled",
  };
  return map[status] || status;
}

export type CreateListingInput = {
  sellerId: string; sellerNickname: string; sellerAvatar?: string;
  title: string; description: string; categoryId: string; subcategoryId?: string;
  price: number; currency?: string; condition?: MarketplaceListing["condition"];
  brand?: string; model?: string; quantity?: number; images: ListingImage[];
  coverImage?: string; location: MarketplaceListing["location"];
  deliveryOptions: MarketplaceListing["deliveryOptions"];
  attributes?: Record<string, string | number>; tags?: string[]; status?: ListingStatus;
};

export async function createListing(input: CreateListingInput): Promise<MarketplaceListing> {
  if (!input.sellerId) throw new Error("Sign in to create a listing");
  if (!input.title?.trim()) throw new Error("Title is required");
  if (!(input.price > 0)) throw new Error("Price must be greater than 0");
  if (!input.images?.length) throw new Error("Add at least one photo");
  const cover = input.coverImage || input.images.find((i) => i.url)?.url || "";
  const now = new Date().toISOString();
  const payload = {
    sellerId: input.sellerId, sellerNickname: input.sellerNickname, sellerAvatar: input.sellerAvatar || "",
    title: input.title.trim().slice(0, 120), slug: slugify(input.title),
    description: (input.description || "").trim().slice(0, 5000),
    categoryId: input.categoryId || "other", subcategoryId: input.subcategoryId || null,
    price: Number(input.price), currency: input.currency || "KES",
    condition: input.condition || null, brand: input.brand || null, model: input.model || null,
    quantity: input.quantity ?? 1, images: input.images.filter((i) => i.url?.startsWith("http")),
    coverImage: cover, location: input.location || { country: "Kenya" },
    deliveryOptions: input.deliveryOptions?.length ? input.deliveryOptions : ["negotiable"],
    attributes: input.attributes || {}, tags: input.tags || [],
    status: input.status || "ACTIVE", views: 0, saves: 0,
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  };
  if (!isFirebaseConfigured) {
    const id = `local-ml-${Date.now()}`;
    const local = mapListing(id, { ...payload, createdAt: now, updatedAt: now });
    const key = "sirbax-ml-listings";
    const prev = JSON.parse(localStorage.getItem(key) || "[]") as MarketplaceListing[];
    localStorage.setItem(key, JSON.stringify([local, ...prev]));
    return local;
  }
  const ref = await addDoc(collection(db, COL.listings), payload);
  return mapListing(ref.id, { ...payload, createdAt: now, updatedAt: now });
}

export async function updateListing(
  listingId: string, sellerId: string,
  patch: Partial<CreateListingInput> & { status?: ListingStatus }
): Promise<void> {
  if (!isFirebaseConfigured) {
    const key = "sirbax-ml-listings";
    const prev = JSON.parse(localStorage.getItem(key) || "[]") as MarketplaceListing[];
    localStorage.setItem(key, JSON.stringify(prev.map((l) =>
      l.id === listingId && l.sellerId === sellerId
        ? { ...l, ...patch, title: patch.title ?? l.title, updatedAt: new Date().toISOString() }
        : l
    )));
    return;
  }
  const snap = await getDoc(doc(db, COL.listings, listingId));
  if (!snap.exists()) throw new Error("Listing not found");
  if (snap.data().sellerId !== sellerId) throw new Error("Not your listing");
  const data: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (patch.title !== undefined) { data.title = patch.title.trim().slice(0, 120); data.slug = slugify(patch.title); }
  if (patch.description !== undefined) data.description = patch.description.trim().slice(0, 5000);
  if (patch.categoryId !== undefined) data.categoryId = patch.categoryId;
  if (patch.price !== undefined) { if (!(patch.price > 0)) throw new Error("Invalid price"); data.price = patch.price; }
  if (patch.images !== undefined) {
    data.images = patch.images.filter((i) => i.url?.startsWith("http"));
    data.coverImage = patch.coverImage || patch.images[0]?.url || "";
  }
  if (patch.status !== undefined) data.status = patch.status;
  if (patch.location !== undefined) data.location = patch.location;
  if (patch.deliveryOptions !== undefined) data.deliveryOptions = patch.deliveryOptions;
  if (patch.attributes !== undefined) data.attributes = patch.attributes;
  await updateDoc(doc(db, COL.listings, listingId), data);
}

export async function getListingById(id: string): Promise<MarketplaceListing | null> {
  if (!isFirebaseConfigured) {
    const prev = JSON.parse(localStorage.getItem("sirbax-ml-listings") || "[]") as MarketplaceListing[];
    return prev.find((l) => l.id === id) || null;
  }
  try {
    const snap = await getDoc(doc(db, COL.listings, id));
    if (!snap.exists()) return null;
    return mapListing(snap.id, snap.data());
  } catch { return null; }
}

export async function incrementListingViews(listingId: string): Promise<void> {
  if (!isFirebaseConfigured || listingId.startsWith("local-")) return;
  try { await updateDoc(doc(db, COL.listings, listingId), { views: increment(1) }); } catch { /* */ }
}

function sortListings(items: MarketplaceListing[], sort?: ListingSearchParams["sort"]): MarketplaceListing[] {
  const arr = [...items];
  switch (sort) {
    case "price_asc": return arr.sort((a, b) => a.price - b.price);
    case "price_desc": return arr.sort((a, b) => b.price - a.price);
    case "most_viewed": return arr.sort((a, b) => b.views - a.views);
    default: return arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export async function searchListings(params: ListingSearchParams = {}): Promise<MarketplaceListing[]> {
  const max = Math.min(params.limit || 40, 80);
  if (!isFirebaseConfigured) {
    let items = JSON.parse(localStorage.getItem("sirbax-ml-listings") || "[]") as MarketplaceListing[];
    items = items.filter((l) => (params.status ? l.status === params.status : l.status === "ACTIVE"));
    if (params.categoryId) items = items.filter((l) => l.categoryId === params.categoryId);
    if (params.sellerId) items = items.filter((l) => l.sellerId === params.sellerId);
    if (params.q) {
      const q = params.q.toLowerCase();
      items = items.filter((l) => l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q));
    }
    return sortListings(items, params.sort).slice(0, max);
  }
  try {
    const constraints = [where("status", "==", params.status || "ACTIVE")];
    if (params.categoryId) constraints.push(where("categoryId", "==", params.categoryId));
    if (params.sellerId) constraints.push(where("sellerId", "==", params.sellerId));
    let snap;
    try {
      snap = await getDocs(query(collection(db, COL.listings), ...constraints, orderBy("createdAt", "desc"), limit(max)));
    } catch {
      snap = await getDocs(query(collection(db, COL.listings), ...constraints, limit(max)));
    }
    let items = snap.docs.map((d) => mapListing(d.id, d.data()));
    if (params.q) {
      const q = params.q.toLowerCase();
      items = items.filter((l) => l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q));
    }
    if (params.minPrice != null) items = items.filter((l) => l.price >= params.minPrice!);
    if (params.maxPrice != null) items = items.filter((l) => l.price <= params.maxPrice!);
    if (params.condition) items = items.filter((l) => l.condition === params.condition);
    return sortListings(items, params.sort).slice(0, max);
  } catch (e) {
    console.error("searchListings", e);
    return [];
  }
}

export async function getMyListings(sellerId: string): Promise<MarketplaceListing[]> {
  if (!isFirebaseConfigured) {
    return (JSON.parse(localStorage.getItem("sirbax-ml-listings") || "[]") as MarketplaceListing[]).filter((l) => l.sellerId === sellerId);
  }
  try {
    const snap = await getDocs(query(collection(db, COL.listings), where("sellerId", "==", sellerId), limit(60)));
    return snap.docs.map((d) => mapListing(d.id, d.data())).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return searchListings({ sellerId, limit: 50 });
  }
}

export async function saveListing(userId: string, listingId: string): Promise<void> {
  if (!userId || !listingId) return;
  if (!isFirebaseConfigured) {
    const key = `sirbax-ml-saved-${userId}`;
    const ids = JSON.parse(localStorage.getItem(key) || "[]") as string[];
    if (!ids.includes(listingId)) localStorage.setItem(key, JSON.stringify([listingId, ...ids]));
    return;
  }
  await setDoc(doc(db, COL.saved, userId, "items", listingId), { listingId, savedAt: serverTimestamp() });
  try { await updateDoc(doc(db, COL.listings, listingId), { saves: increment(1) }); } catch { /* */ }
}

export async function unsaveListing(userId: string, listingId: string): Promise<void> {
  if (!isFirebaseConfigured) {
    const key = `sirbax-ml-saved-${userId}`;
    localStorage.setItem(key, JSON.stringify((JSON.parse(localStorage.getItem(key) || "[]") as string[]).filter((id) => id !== listingId)));
    return;
  }
  await deleteDoc(doc(db, COL.saved, userId, "items", listingId));
}

export async function isListingSaved(userId: string, listingId: string): Promise<boolean> {
  if (!userId) return false;
  if (!isFirebaseConfigured) {
    return (JSON.parse(localStorage.getItem(`sirbax-ml-saved-${userId}`) || "[]") as string[]).includes(listingId);
  }
  try { return (await getDoc(doc(db, COL.saved, userId, "items", listingId))).exists(); } catch { return false; }
}

export async function listSavedListings(userId: string): Promise<MarketplaceListing[]> {
  if (!isFirebaseConfigured) {
    const ids = JSON.parse(localStorage.getItem(`sirbax-ml-saved-${userId}`) || "[]") as string[];
    const all = JSON.parse(localStorage.getItem("sirbax-ml-listings") || "[]") as MarketplaceListing[];
    return ids.map((id) => all.find((l) => l.id === id)).filter(Boolean) as MarketplaceListing[];
  }
  try {
    const snap = await getDocs(collection(db, COL.saved, userId, "items"));
    const listings = await Promise.all(snap.docs.map((d) => getListingById(d.id)));
    return listings.filter(Boolean) as MarketplaceListing[];
  } catch { return []; }
}

export async function openListingChat(input: {
  buyerId: string; buyerNickname: string; buyerAvatar?: string;
  listing: MarketplaceListing; firstMessage?: string;
}): Promise<string> {
  const { listing, buyerId, buyerNickname, buyerAvatar } = input;
  if (buyerId === listing.sellerId) throw new Error("You cannot chat with yourself");
  const cid = conversationId(buyerId, listing.sellerId);
  const intro = input.firstMessage?.trim() || `Hi — interested in "${listing.title}" (${formatMoney(listing.price, listing.currency)}).`;
  const card = `[Listing] ${listing.title} · ${formatMoney(listing.price, listing.currency)} · /marketplace/product/${listing.id}`;
  await sendMessage({
    fromId: buyerId, fromNickname: buyerNickname, fromAvatar: buyerAvatar,
    toId: listing.sellerId, toNickname: listing.sellerNickname, toAvatar: listing.sellerAvatar,
    text: `${card}\n\n${intro}`,
  });
  try {
    await createNotification({
      recipientId: listing.sellerId, actorId: buyerId, actorNickname: buyerNickname, actorAvatar: buyerAvatar,
      type: "marketplace", text: `messaged you about ${listing.title}`,
    });
  } catch { /* */ }
  return cid;
}

export async function createOffer(input: {
  listing: MarketplaceListing; buyerId: string; buyerNickname: string; buyerAvatar?: string;
  amount: number; message?: string;
}): Promise<MarketplaceOffer> {
  const { listing } = input;
  if (input.buyerId === listing.sellerId) throw new Error("Cannot offer on your own listing");
  if (!(input.amount > 0)) throw new Error("Invalid offer amount");
  if (listing.status !== "ACTIVE") throw new Error("Listing is not available");
  const now = new Date().toISOString();
  const payload = {
    listingId: listing.id, listingTitle: listing.title, listingCover: listing.coverImage || "",
    listingPrice: listing.price, buyerId: input.buyerId, buyerNickname: input.buyerNickname,
    buyerAvatar: input.buyerAvatar || "", sellerId: listing.sellerId, sellerNickname: listing.sellerNickname,
    amount: Number(input.amount), currency: listing.currency || "KES",
    message: (input.message || "").trim().slice(0, 500), status: "PENDING" as OfferStatus,
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  };
  let id = `local-off-${Date.now()}`;
  if (isFirebaseConfigured) {
    const ref = await addDoc(collection(db, COL.offers), payload);
    id = ref.id;
  } else {
    const key = "sirbax-ml-offers";
    const prev = JSON.parse(localStorage.getItem(key) || "[]") as MarketplaceOffer[];
    localStorage.setItem(key, JSON.stringify([{ id, ...payload, status: "PENDING", createdAt: now, updatedAt: now }, ...prev]));
  }
  try {
    await createNotification({
      recipientId: listing.sellerId, actorId: input.buyerId, actorNickname: input.buyerNickname,
      type: "marketplace", text: `offered ${formatMoney(input.amount, listing.currency)} on ${listing.title}`,
    });
  } catch { /* */ }
  return {
    id, listingId: listing.id, listingTitle: listing.title, listingCover: listing.coverImage,
    listingPrice: listing.price, buyerId: input.buyerId, buyerNickname: input.buyerNickname,
    buyerAvatar: input.buyerAvatar, sellerId: listing.sellerId, sellerNickname: listing.sellerNickname,
    amount: input.amount, currency: listing.currency || "KES", message: input.message,
    status: "PENDING", createdAt: now, updatedAt: now,
  };
}

async function getOfferById(id: string): Promise<MarketplaceOffer | null> {
  if (!isFirebaseConfigured) {
    return (JSON.parse(localStorage.getItem("sirbax-ml-offers") || "[]") as MarketplaceOffer[]).find((o) => o.id === id) || null;
  }
  const snap = await getDoc(doc(db, COL.offers, id));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    id: snap.id, listingId: d.listingId, listingTitle: d.listingTitle, listingCover: d.listingCover,
    listingPrice: d.listingPrice, buyerId: d.buyerId, buyerNickname: d.buyerNickname, buyerAvatar: d.buyerAvatar,
    sellerId: d.sellerId, sellerNickname: d.sellerNickname, amount: d.amount, currency: d.currency || "KES",
    message: d.message, status: d.status, counterAmount: d.counterAmount,
    createdAt: toIso(d.createdAt), updatedAt: toIso(d.updatedAt),
  };
}

async function createDealFromOffer(offer: MarketplaceOffer): Promise<MarketplaceDeal> {
  const now = new Date().toISOString();
  const cid = conversationId(offer.buyerId, offer.sellerId);
  const payload = {
    listingId: offer.listingId, listingTitle: offer.listingTitle, listingCover: offer.listingCover || "",
    offerId: offer.id, conversationId: cid, buyerId: offer.buyerId, buyerNickname: offer.buyerNickname,
    sellerId: offer.sellerId, sellerNickname: offer.sellerNickname, agreedPrice: offer.amount,
    currency: offer.currency || "KES", status: "DEAL_AGREED" as DealStatus,
    paymentNotes: "Payment and delivery are arranged directly between buyer and seller. Sirbax does not hold funds.",
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  };
  if (!isFirebaseConfigured) {
    const id = `local-deal-${Date.now()}`;
    const deal: MarketplaceDeal = {
      id, listingId: offer.listingId, listingTitle: offer.listingTitle, listingCover: offer.listingCover,
      offerId: offer.id, conversationId: cid, buyerId: offer.buyerId, buyerNickname: offer.buyerNickname,
      sellerId: offer.sellerId, sellerNickname: offer.sellerNickname, agreedPrice: offer.amount,
      currency: offer.currency, status: "DEAL_AGREED", paymentNotes: payload.paymentNotes,
      createdAt: now, updatedAt: now,
    };
    const key = "sirbax-ml-deals";
    localStorage.setItem(key, JSON.stringify([deal, ...(JSON.parse(localStorage.getItem(key) || "[]") as MarketplaceDeal[])]));
    return deal;
  }
  const ref = await addDoc(collection(db, COL.deals), payload);
  return {
    id: ref.id, listingId: offer.listingId, listingTitle: offer.listingTitle, listingCover: offer.listingCover,
    offerId: offer.id, conversationId: cid, buyerId: offer.buyerId, buyerNickname: offer.buyerNickname,
    sellerId: offer.sellerId, sellerNickname: offer.sellerNickname, agreedPrice: offer.amount,
    currency: offer.currency, status: "DEAL_AGREED", paymentNotes: payload.paymentNotes,
    createdAt: now, updatedAt: now,
  };
}

export async function respondToOffer(
  offerId: string, actorId: string, action: "accept" | "reject" | "counter", counterAmount?: number
): Promise<MarketplaceOffer | null> {
  const offer = await getOfferById(offerId);
  if (!offer) throw new Error("Offer not found");
  if (offer.sellerId !== actorId && offer.buyerId !== actorId) throw new Error("Not authorized");
  let status: OfferStatus = offer.status;
  let counter: number | undefined = offer.counterAmount;
  if (action === "accept") status = "ACCEPTED";
  else if (action === "reject") status = "REJECTED";
  else if (action === "counter") {
    if (offer.sellerId !== actorId) throw new Error("Only seller can counter");
    if (!(counterAmount && counterAmount > 0)) throw new Error("Invalid counter");
    status = "COUNTERED";
    counter = counterAmount;
  }
  const now = new Date().toISOString();
  if (isFirebaseConfigured) {
    await updateDoc(doc(db, COL.offers, offerId), { status, counterAmount: counter ?? null, updatedAt: serverTimestamp() });
  } else {
    const key = "sirbax-ml-offers";
    const prev = JSON.parse(localStorage.getItem(key) || "[]") as MarketplaceOffer[];
    localStorage.setItem(key, JSON.stringify(prev.map((o) => o.id === offerId ? { ...o, status, counterAmount: counter, updatedAt: now } : o)));
  }
  if (status === "ACCEPTED") {
    const agreed = offer.status === "COUNTERED" && offer.counterAmount ? offer.counterAmount : offer.amount;
    await createDealFromOffer({ ...offer, amount: agreed, status: "ACCEPTED" });
  }
  return { ...offer, status, counterAmount: counter, updatedAt: now };
}

export async function listOffersForUser(uid: string): Promise<MarketplaceOffer[]> {
  if (!isFirebaseConfigured) {
    return (JSON.parse(localStorage.getItem("sirbax-ml-offers") || "[]") as MarketplaceOffer[]).filter((o) => o.buyerId === uid || o.sellerId === uid);
  }
  try {
    const [asBuyer, asSeller] = await Promise.all([
      getDocs(query(collection(db, COL.offers), where("buyerId", "==", uid), limit(40))),
      getDocs(query(collection(db, COL.offers), where("sellerId", "==", uid), limit(40))),
    ]);
    const map = new Map<string, MarketplaceOffer>();
    for (const snap of [asBuyer, asSeller]) {
      snap.docs.forEach((d) => {
        const data = d.data();
        map.set(d.id, {
          id: d.id, listingId: data.listingId, listingTitle: data.listingTitle, listingCover: data.listingCover,
          listingPrice: data.listingPrice, buyerId: data.buyerId, buyerNickname: data.buyerNickname,
          buyerAvatar: data.buyerAvatar, sellerId: data.sellerId, sellerNickname: data.sellerNickname,
          amount: data.amount, currency: data.currency || "KES", message: data.message, status: data.status,
          counterAmount: data.counterAmount, createdAt: toIso(data.createdAt), updatedAt: toIso(data.updatedAt),
        });
      });
    }
    return [...map.values()].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch { return []; }
}

export async function getDealById(id: string): Promise<MarketplaceDeal | null> {
  if (!isFirebaseConfigured) {
    return (JSON.parse(localStorage.getItem("sirbax-ml-deals") || "[]") as MarketplaceDeal[]).find((d) => d.id === id) || null;
  }
  const snap = await getDoc(doc(db, COL.deals, id));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    id: snap.id, listingId: d.listingId, listingTitle: d.listingTitle, listingCover: d.listingCover,
    offerId: d.offerId, conversationId: d.conversationId, buyerId: d.buyerId, buyerNickname: d.buyerNickname,
    sellerId: d.sellerId, sellerNickname: d.sellerNickname, agreedPrice: d.agreedPrice,
    currency: d.currency || "KES", deliveryNotes: d.deliveryNotes, paymentNotes: d.paymentNotes,
    status: d.status, createdAt: toIso(d.createdAt), updatedAt: toIso(d.updatedAt),
    completedAt: d.completedAt ? toIso(d.completedAt) : undefined,
  };
}

const DEAL_TRANSITIONS: Partial<Record<DealStatus, DealStatus[]>> = {
  DEAL_AGREED: ["PAYMENT_PENDING", "PAYMENT_REPORTED", "DELIVERY_PENDING", "CANCELLED"],
  PAYMENT_PENDING: ["PAYMENT_REPORTED", "CANCELLED"],
  PAYMENT_REPORTED: ["DELIVERY_PENDING", "DELIVERED", "CANCELLED"],
  DELIVERY_PENDING: ["DELIVERED", "CANCELLED"],
  DELIVERED: ["COMPLETED", "CANCELLED"],
};

export async function updateDealStatus(
  dealId: string, actorId: string, next: DealStatus,
  notes?: { deliveryNotes?: string; paymentNotes?: string }
): Promise<void> {
  const deal = await getDealById(dealId);
  if (!deal) throw new Error("Deal not found");
  if (deal.buyerId !== actorId && deal.sellerId !== actorId) throw new Error("Not authorized");
  const allowed = DEAL_TRANSITIONS[deal.status] || [];
  if (!allowed.includes(next) && next !== "CANCELLED") throw new Error(`Cannot move from ${deal.status} to ${next}`);
  const patch: Record<string, unknown> = { status: next, updatedAt: serverTimestamp() };
  if (notes?.deliveryNotes) patch.deliveryNotes = notes.deliveryNotes;
  if (notes?.paymentNotes) patch.paymentNotes = notes.paymentNotes;
  if (next === "COMPLETED") patch.completedAt = serverTimestamp();
  if (isFirebaseConfigured) {
    await updateDoc(doc(db, COL.deals, dealId), patch);
  } else {
    const key = "sirbax-ml-deals";
    const prev = JSON.parse(localStorage.getItem(key) || "[]") as MarketplaceDeal[];
    localStorage.setItem(key, JSON.stringify(prev.map((d) => d.id === dealId ? {
      ...d, status: next, deliveryNotes: notes?.deliveryNotes ?? d.deliveryNotes,
      paymentNotes: notes?.paymentNotes ?? d.paymentNotes,
      completedAt: next === "COMPLETED" ? new Date().toISOString() : d.completedAt,
      updatedAt: new Date().toISOString(),
    } : d)));
  }
  if (next === "COMPLETED" && deal.listingId) {
    try { await updateListing(deal.listingId, deal.sellerId, { status: "SOLD" }); } catch { /* */ }
  }
}

export async function listDealsForUser(uid: string): Promise<MarketplaceDeal[]> {
  if (!isFirebaseConfigured) {
    return (JSON.parse(localStorage.getItem("sirbax-ml-deals") || "[]") as MarketplaceDeal[]).filter((d) => d.buyerId === uid || d.sellerId === uid);
  }
  try {
    const [asBuyer, asSeller] = await Promise.all([
      getDocs(query(collection(db, COL.deals), where("buyerId", "==", uid), limit(40))),
      getDocs(query(collection(db, COL.deals), where("sellerId", "==", uid), limit(40))),
    ]);
    const map = new Map<string, MarketplaceDeal>();
    for (const snap of [asBuyer, asSeller]) {
      snap.docs.forEach((d) => {
        const data = d.data();
        map.set(d.id, {
          id: d.id, listingId: data.listingId, listingTitle: data.listingTitle, listingCover: data.listingCover,
          offerId: data.offerId, conversationId: data.conversationId, buyerId: data.buyerId,
          buyerNickname: data.buyerNickname, sellerId: data.sellerId, sellerNickname: data.sellerNickname,
          agreedPrice: data.agreedPrice, currency: data.currency || "KES", deliveryNotes: data.deliveryNotes,
          paymentNotes: data.paymentNotes, status: data.status, createdAt: toIso(data.createdAt),
          updatedAt: toIso(data.updatedAt), completedAt: data.completedAt ? toIso(data.completedAt) : undefined,
        });
      });
    }
    return [...map.values()].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch { return []; }
}

export async function submitRating(input: {
  dealId: string; listingId: string; fromId: string; fromNickname: string;
  toId: string; toNickname: string; stars: number; communication?: number;
  reliability?: number; accuracy?: number; review?: string;
}): Promise<void> {
  if (input.fromId === input.toId) throw new Error("Cannot rate yourself");
  if (input.stars < 1 || input.stars > 5) throw new Error("Stars must be 1–5");
  const deal = await getDealById(input.dealId);
  if (!deal || deal.status !== "COMPLETED") throw new Error("You can only rate after a completed deal");
  if (deal.buyerId !== input.fromId && deal.sellerId !== input.fromId) throw new Error("Not a party to this deal");
  const rid = `${input.dealId}_${input.fromId}`;
  if (isFirebaseConfigured) {
    const existing = await getDoc(doc(db, COL.ratings, rid));
    if (existing.exists()) throw new Error("You already rated this deal");
    await setDoc(doc(db, COL.ratings, rid), { ...input, review: (input.review || "").slice(0, 1000), createdAt: serverTimestamp() });
  } else {
    const key = "sirbax-ml-ratings";
    const prev = JSON.parse(localStorage.getItem(key) || "[]") as MarketplaceRating[];
    if (prev.some((r) => r.dealId === input.dealId && r.fromId === input.fromId)) throw new Error("You already rated this deal");
    prev.push({ id: rid, ...input, createdAt: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(prev));
  }
}

export async function getSellerRatings(sellerId: string): Promise<{ average: number; count: number; items: MarketplaceRating[] }> {
  if (!isFirebaseConfigured) {
    const items = (JSON.parse(localStorage.getItem("sirbax-ml-ratings") || "[]") as MarketplaceRating[]).filter((r) => r.toId === sellerId);
    const average = items.length === 0 ? 0 : items.reduce((s, r) => s + r.stars, 0) / items.length;
    return { average, count: items.length, items };
  }
  try {
    const snap = await getDocs(query(collection(db, COL.ratings), where("toId", "==", sellerId), limit(50)));
    const items = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id, dealId: data.dealId, listingId: data.listingId, fromId: data.fromId,
        fromNickname: data.fromNickname, toId: data.toId, toNickname: data.toNickname,
        stars: data.stars, review: data.review, createdAt: toIso(data.createdAt),
      } as MarketplaceRating;
    });
    const average = items.length === 0 ? 0 : items.reduce((s, r) => s + r.stars, 0) / items.length;
    return { average, count: items.length, items };
  } catch { return { average: 0, count: 0, items: [] }; }
}

export async function reportMarketplace(input: {
  reporterId: string; targetType: "listing" | "seller" | "buyer" | "message";
  targetId: string; reason: string; details?: string;
}): Promise<void> {
  if (!input.reporterId || !input.reason) throw new Error("Invalid report");
  if (isFirebaseConfigured) {
    await addDoc(collection(db, COL.reports), {
      ...input, details: (input.details || "").slice(0, 1000), createdAt: serverTimestamp(),
    });
  }
}

export type Listing = MarketplaceListing;
export type Order = MarketplaceDeal;
export async function listListings() { return searchListings({ limit: 40 }); }
export async function placeOrder(): Promise<never> { throw new Error("Use offers and deals. Sirbax does not process payments."); }
export async function payOrder(): Promise<never> { throw new Error("Sirbax does not hold funds. Arrange payment directly with the seller."); }
export async function listOrdersForUser(uid: string) { return listDealsForUser(uid); }
export function statusLabel(s: string) { return dealStatusLabel(s as DealStatus); }
