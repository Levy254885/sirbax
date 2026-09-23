"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { MarketplaceHeader } from "@/components/marketplace/MarketplaceHeader";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { useAuth } from "@/context/AuthContext";
import { listSavedListings } from "@/services/marketplaceService";
import type { MarketplaceListing } from "@/types/marketplace";

export default function SavedPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<MarketplaceListing[]>([]);
  useEffect(() => {
    if (!user) return;
    listSavedListings(user.uid).then(setItems);
  }, [user?.uid]);
  return (
    <AppShell showRight={false}>
      <MarketplaceHeader />
      <div className="mx-auto max-w-6xl px-4 py-4 pb-28">
        <h1 className="mb-4 text-lg font-bold">Saved listings</h1>
        {!user && <p className="text-sm text-slate-500">Sign in to see saved items.</p>}
        {user && items.length === 0 && <p className="py-12 text-center text-sm text-slate-400">No saved listings yet.</p>}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {items.map((l) => <ProductCard key={l.id} listing={l} />)}
        </div>
      </div>
    </AppShell>
  );
}
