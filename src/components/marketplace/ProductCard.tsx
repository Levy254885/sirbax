"use client";

import Link from "next/link";
import type { MarketplaceListing } from "@/types/marketplace";
import { formatMoney } from "@/services/marketplaceService";
import { getCategoryLabel } from "@/lib/marketplaceCategories";

export function ProductCard({ listing }: { listing: MarketplaceListing }) {
  const loc = [listing.location.city, listing.location.region].filter(Boolean).join(", ");
  return (
    <Link
      href={`/marketplace/product/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-sm"
    >
      <div className="relative aspect-[4/3] bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={listing.coverImage || "/placeholder-product.svg"}
          alt={listing.title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        {listing.status === "SOLD" && (
          <span className="absolute left-2 top-2 rounded bg-slate-900/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            Sold
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <p className="text-base font-semibold text-slate-900">{formatMoney(listing.price, listing.currency)}</p>
        <p className="mt-0.5 line-clamp-2 text-sm text-slate-700">{listing.title}</p>
        <p className="mt-auto pt-2 text-[11px] text-slate-400">
          {getCategoryLabel(listing.categoryId)}
          {loc ? ` · ${loc}` : ""}
        </p>
      </div>
    </Link>
  );
}
