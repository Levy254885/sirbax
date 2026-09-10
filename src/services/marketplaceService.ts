/**
 * Marketplace listings + escrow-style orders.
 * Payment rails (M-Pesa/Stripe) not connected — status tracks platform-held funds
 * until buyer confirms delivery, then marks released to seller.
 */
import {
  collection, addDoc, getDocs, doc, updateDoc, query, where, orderBy, limit, serverTimestamp, type Timestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/firebase/config";

export type OrderStatus =
  | "pending_payment"
  | "paid_held"
  | "shipped"
  | "completed"
  | "cancelled"
  | "disputed";

export interface Listing {
  id: string;
  title: string;
  price: number;
  currency: string;
  description: string;
  imageUrl: string;
  sellerId: string;
  sellerNickname: string;
  status: "active" | "sold" | "removed";
  createdAt: string;
}

export interface Order {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImage: string;
  price: number;
  platformFee: number;
  total: number;
  currency: string;
  buyerId: string;
  buyerNickname: string;
  sellerId: string;
  sellerNickname: string;
  status: OrderStatus;
  paidAt?: string;
  shippedAt?: string;
  completedAt?: string;
  createdAt: string;
}

function lsGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function lsSet(key: string, v: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(v));
}
function toIso(v: unknown): string {
  if (!v) return new Date().toISOString();
  if (typeof v === "string") return v;
  if (typeof v === "object" && v && "toDate" in v) return (v as Timestamp).toDate().toISOString();
  return new Date().toISOString();
}

const LISTINGS_KEY = "sirbax-mkt-listings";
const ORDERS_KEY = "sirbax-mkt-orders";
const FEE_RATE = 0.05;

function seedListings(): Listing[] {
  return [
    {
      id: "l1",
      title: "MacBook Air M1",
      price: 95000,
      currency: "KES",
      description: "Great condition, 8GB/256GB",
      imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80",
      sellerId: "demo-seller-1",
      sellerNickname: "QuietFox_421",
      status: "active",
      createdAt: new Date().toISOString(),
    },
    {
      id: "l2",
      title: "iPhone 13",
      price: 55000,
      currency: "KES",
      description: "128GB, battery 88%",
      imageUrl: "https://images.unsplash.com/photo-1632661674590-df3e4e8e9e0c?w=600&q=80",
      sellerId: "demo-seller-2",
      sellerNickname: "BlueMoon_204",
      status: "active",
      createdAt: new Date().toISOString(),
    },
  ];
}

export async function listActiveListings(): Promise<Listing[]> {
  if (!isFirebaseConfigured) {
    return lsGet<Listing[]>(LISTINGS_KEY, seedListings()).filter((l) => l.status === "active");
  }
  try {
    const snap = await getDocs(query(collection(db, "listings"), orderBy("createdAt", "desc"), limit(50)));
    if (snap.empty) return seedListings();
    return snap.docs
      .map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title,
          price: Number(data.price) || 0,
          currency: data.currency || "KES",
          description: data.description || "",
          imageUrl: data.imageUrl,
          sellerId: data.sellerId,
          sellerNickname: data.sellerNickname,
          status: data.status || "active",
          createdAt: toIso(data.createdAt),
        } as Listing;
      })
      .filter((l) => l.status === "active");
  } catch {
    return lsGet<Listing[]>(LISTINGS_KEY, seedListings()).filter((l) => l.status === "active");
  }
}

export async function createListing(input: {
  title: string;
  price: number;
  description: string;
  imageUrl: string;
  sellerId: string;
  sellerNickname: string;
  currency?: string;
}): Promise<Listing> {
  const item: Listing = {
    id: `l-${Date.now()}`,
    title: input.title.trim(),
    price: input.price,
    currency: input.currency || "KES",
    description: input.description.trim(),
    imageUrl: input.imageUrl,
    sellerId: input.sellerId,
    sellerNickname: input.sellerNickname,
    status: "active",
    createdAt: new Date().toISOString(),
  };
  if (!isFirebaseConfigured) {
    lsSet(LISTINGS_KEY, [item, ...lsGet<Listing[]>(LISTINGS_KEY, seedListings())]);
    return item;
  }
  const ref = await addDoc(collection(db, "listings"), { ...item, createdAt: serverTimestamp() });
  return { ...item, id: ref.id };
}

export function computeTotals(price: number) {
  const platformFee = Math.round(price * FEE_RATE);
  return { platformFee, total: price + platformFee };
}

export async function placeOrder(input: {
  listing: Listing;
  buyerId: string;
  buyerNickname: string;
}): Promise<Order> {
  const { platformFee, total } = computeTotals(input.listing.price);
  const order: Order = {
    id: `o-${Date.now()}`,
    listingId: input.listing.id,
    listingTitle: input.listing.title,
    listingImage: input.listing.imageUrl,
    price: input.listing.price,
    platformFee,
    total,
    currency: input.listing.currency,
    buyerId: input.buyerId,
    buyerNickname: input.buyerNickname,
    sellerId: input.listing.sellerId,
    sellerNickname: input.listing.sellerNickname,
    status: "pending_payment",
    createdAt: new Date().toISOString(),
  };
  if (!isFirebaseConfigured) {
    lsSet(ORDERS_KEY, [order, ...lsGet<Order[]>(ORDERS_KEY, [])]);
    return order;
  }
  const ref = await addDoc(collection(db, "orders"), { ...order, createdAt: serverTimestamp() });
  return { ...order, id: ref.id };
}

export async function payOrder(orderId: string, buyerId: string): Promise<Order | null> {
  const now = new Date().toISOString();
  if (!isFirebaseConfigured) {
    const orders = lsGet<Order[]>(ORDERS_KEY, []).map((o) =>
      o.id === orderId && o.buyerId === buyerId ? { ...o, status: "paid_held" as const, paidAt: now } : o
    );
    lsSet(ORDERS_KEY, orders);
    return orders.find((o) => o.id === orderId) || null;
  }
  try {
    await updateDoc(doc(db, "orders", orderId), { status: "paid_held", paidAt: serverTimestamp() });
    const list = await listOrdersForUser(buyerId);
    return list.find((o) => o.id === orderId) || null;
  } catch {
    return null;
  }
}

export async function markOrderShipped(orderId: string, sellerId: string): Promise<void> {
  if (!isFirebaseConfigured) {
    lsSet(
      ORDERS_KEY,
      lsGet<Order[]>(ORDERS_KEY, []).map((o) =>
        o.id === orderId && o.sellerId === sellerId
          ? { ...o, status: "shipped" as const, shippedAt: new Date().toISOString() }
          : o
      )
    );
    return;
  }
  await updateDoc(doc(db, "orders", orderId), { status: "shipped", shippedAt: serverTimestamp() });
}

export async function confirmOrderReceived(orderId: string, buyerId: string): Promise<void> {
  if (!isFirebaseConfigured) {
    lsSet(
      ORDERS_KEY,
      lsGet<Order[]>(ORDERS_KEY, []).map((o) =>
        o.id === orderId && o.buyerId === buyerId
          ? { ...o, status: "completed" as const, completedAt: new Date().toISOString() }
          : o
      )
    );
    return;
  }
  await updateDoc(doc(db, "orders", orderId), { status: "completed", completedAt: serverTimestamp() });
}

export async function listOrdersForUser(uid: string): Promise<Order[]> {
  if (!isFirebaseConfigured) {
    return lsGet<Order[]>(ORDERS_KEY, []).filter((o) => o.buyerId === uid || o.sellerId === uid);
  }
  try {
    const [asBuyer, asSeller] = await Promise.all([
      getDocs(query(collection(db, "orders"), where("buyerId", "==", uid), limit(40))),
      getDocs(query(collection(db, "orders"), where("sellerId", "==", uid), limit(40))),
    ]);
    const map = new Map<string, Order>();
    for (const snap of [asBuyer, asSeller]) {
      snap.docs.forEach((d) => {
        const data = d.data();
        map.set(d.id, {
          id: d.id,
          listingId: data.listingId,
          listingTitle: data.listingTitle,
          listingImage: data.listingImage,
          price: data.price,
          platformFee: data.platformFee,
          total: data.total,
          currency: data.currency || "KES",
          buyerId: data.buyerId,
          buyerNickname: data.buyerNickname,
          sellerId: data.sellerId,
          sellerNickname: data.sellerNickname,
          status: data.status,
          paidAt: data.paidAt ? toIso(data.paidAt) : undefined,
          shippedAt: data.shippedAt ? toIso(data.shippedAt) : undefined,
          completedAt: data.completedAt ? toIso(data.completedAt) : undefined,
          createdAt: toIso(data.createdAt),
        });
      });
    }
    return [...map.values()].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return lsGet<Order[]>(ORDERS_KEY, []).filter((o) => o.buyerId === uid || o.sellerId === uid);
  }
}

export function formatMoney(amount: number, currency = "KES") {
  return `${currency} ${amount.toLocaleString()}`;
}

export function statusLabel(status: OrderStatus, t: Record<string, string>): string {
  switch (status) {
    case "pending_payment": return t.waitingPayment || "Waiting for payment";
    case "paid_held": return t.escrowHeld || "Funds held by platform";
    case "shipped": return t.waitingDelivery || "Shipped — confirm receipt";
    case "completed": return t.completed || "Completed";
    case "cancelled": return t.cancelled || "Cancelled";
    case "disputed": return "Disputed";
    default: return status;
  }
}
