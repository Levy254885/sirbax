/**
 * Sirbax Marketplace types.
 * NO escrow, NO wallet, NO platform-held funds.
 * Payments & delivery are arranged directly between buyer and seller.
 */

import type { DeliveryOptionId, ListingCondition } from "@/lib/marketplaceCategories";

export type ListingStatus =
  | "DRAFT"
  | "ACTIVE"
  | "PAUSED"
  | "SOLD"
  | "ARCHIVED"
  | "REMOVED";

export type OfferStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "COUNTERED"
  | "EXPIRED"
  | "CANCELLED";

/** Deal records an agreement — NOT payment custody */
export type DealStatus =
  | "INQUIRY"
  | "NEGOTIATING"
  | "OFFER_MADE"
  | "OFFER_ACCEPTED"
  | "DEAL_AGREED"
  | "PAYMENT_PENDING"
  | "PAYMENT_REPORTED"
  | "DELIVERY_PENDING"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED";

export interface ListingImage {
  url: string;
  publicId?: string;
  width?: number;
  height?: number;
}

export interface ListingLocation {
  country: string;
  region?: string;
  city?: string;
  area?: string;
}

export interface MarketplaceListing {
  id: string;
  sellerId: string;
  sellerNickname: string;
  sellerAvatar?: string;
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  subcategoryId?: string;
  price: number;
  currency: string;
  condition?: ListingCondition;
  brand?: string;
  model?: string;
  quantity: number;
  images: ListingImage[];
  coverImage: string;
  location: ListingLocation;
  deliveryOptions: DeliveryOptionId[];
  attributes: Record<string, string | number>;
  tags: string[];
  status: ListingStatus;
  views: number;
  saves: number;
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceOffer {
  id: string;
  listingId: string;
  listingTitle: string;
  listingCover?: string;
  listingPrice: number;
  buyerId: string;
  buyerNickname: string;
  buyerAvatar?: string;
  sellerId: string;
  sellerNickname: string;
  amount: number;
  currency: string;
  message?: string;
  status: OfferStatus;
  counterAmount?: number;
  parentOfferId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceDeal {
  id: string;
  listingId: string;
  listingTitle: string;
  listingCover?: string;
  offerId?: string;
  conversationId?: string;
  buyerId: string;
  buyerNickname: string;
  sellerId: string;
  sellerNickname: string;
  agreedPrice: number;
  currency: string;
  deliveryNotes?: string;
  paymentNotes?: string;
  /** User-reported only — Sirbax does NOT verify payment */
  status: DealStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface MarketplaceRating {
  id: string;
  dealId: string;
  listingId: string;
  fromId: string;
  fromNickname: string;
  toId: string;
  toNickname: string;
  stars: number;
  communication?: number;
  reliability?: number;
  accuracy?: number;
  review?: string;
  createdAt: string;
}

export interface MarketplaceReport {
  id: string;
  reporterId: string;
  targetType: "listing" | "seller" | "buyer" | "message";
  targetId: string;
  reason: string;
  details?: string;
  createdAt: string;
}

export type ListingSort =
  | "newest"
  | "price_asc"
  | "price_desc"
  | "most_viewed"
  | "relevance";

export interface ListingSearchParams {
  q?: string;
  categoryId?: string;
  subcategoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  city?: string;
  sellerId?: string;
  sort?: ListingSort;
  status?: ListingStatus;
  limit?: number;
}
