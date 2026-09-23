"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { MarketplaceHeader } from "@/components/marketplace/MarketplaceHeader";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { getUserById } from "@/services/userService";
import { getMyListings, getSellerRatings } from "@/services/marketplaceService";
import type { MarketplaceListing } from "@/types/marketplace";
import type { UserProfile } from "@/types";

export default function SellerPage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [rating, setRating] = useState({ average: 0, count: 0 });

  useEffect(() => {
    if (!id) return;
    (async () => {
      const [p, list, r] = await Promise.all([
        getUserById(id),
        getMyListings(id),
        getSellerRatings(id),
      ]);
      setProfile(p);
      setListings(list.filter((l) => l.status === "ACTIVE"));
      setRating({ average: r.average, count: r.count });
    })();
  }, [id]);

  return (
    <AppShell showRight={false}>
      <MarketplaceHeader />
      <div className="mx-auto max-w-6xl px-4 py-4 pb-28">
        <div className="mb-6 flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile?.avatarUrl || `https://api.dicebear.com/9.x/adventurer/svg?seed=${id}`}
            alt=""
            className="h-16 w-16 rounded-full bg-slate-100"
          />
          <div>
            <h1 className="text-lg font-bold">{profile?.nickname || "Seller"}</h1>
            <p className="text-sm text-slate-500">
              {rating.count > 0 ? `${rating.average.toFixed(1)}★ · ${rating.count} ratings` : "No ratings yet"}
              {" · "}{listings.length} active listings
            </p>
            <p className="text-xs text-slate-400">Anonymous Sirbax identity</p>
          </div>
        </div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Listings</h2>
        {listings.length === 0 && <p className="text-sm text-slate-400">No active listings.</p>}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {listings.map((l) => <ProductCard key={l.id} listing={l} />)}
        </div>
      </div>
    </AppShell>
  );
}
