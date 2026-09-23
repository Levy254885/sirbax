"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { MarketplaceHeader } from "@/components/marketplace/MarketplaceHeader";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { useAuth } from "@/context/AuthContext";
import { getMyListings, updateListing } from "@/services/marketplaceService";
import type { MarketplaceListing } from "@/types/marketplace";
import toast from "@/lib/toast";

export default function MyListingsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<MarketplaceListing[]>([]);

  const load = async () => {
    if (!user) return;
    setItems(await getMyListings(user.uid));
  };
  useEffect(() => { load(); }, [user?.uid]);

  const setStatus = async (id: string, status: MarketplaceListing["status"]) => {
    if (!user) return;
    try {
      await updateListing(id, user.uid, { status });
      toast.success("Updated");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <AppShell showRight={false}>
      <MarketplaceHeader />
      <div className="mx-auto max-w-6xl px-4 py-4 pb-28">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-bold">My listings</h1>
          <Link href="/marketplace/sell" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">Sell</Link>
        </div>
        {!user && <p className="text-sm text-slate-500">Sign in to manage listings.</p>}
        {user && items.length === 0 && <p className="py-12 text-center text-sm text-slate-400">You haven&apos;t created any listings.</p>}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {items.map((l) => (
            <div key={l.id}>
              <ProductCard listing={l} />
              <div className="mt-1 flex flex-wrap gap-1 text-[11px]">
                <span className="rounded bg-slate-100 px-1.5 py-0.5">{l.status}</span>
                <Link href={`/marketplace/listings/${l.id}/edit`} className="underline">Edit</Link>
                {l.status === "ACTIVE" && <button type="button" onClick={() => setStatus(l.id, "PAUSED")} className="underline">Pause</button>}
                {l.status === "PAUSED" && <button type="button" onClick={() => setStatus(l.id, "ACTIVE")} className="underline">Activate</button>}
                <button type="button" onClick={() => setStatus(l.id, "ARCHIVED")} className="underline text-red-600">Archive</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
