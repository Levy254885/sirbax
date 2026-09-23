"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { MarketplaceHeader } from "@/components/marketplace/MarketplaceHeader";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { getCategoryLabel } from "@/lib/marketplaceCategories";
import { searchListings } from "@/services/marketplaceService";
import type { MarketplaceListing } from "@/types/marketplace";

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const [items, setItems] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category) return;
    (async () => {
      setLoading(true);
      setItems(await searchListings({ categoryId: category, limit: 48 }));
      setLoading(false);
    })();
  }, [category]);

  return (
    <AppShell showRight={false}>
      <MarketplaceHeader />
      <div className="mx-auto max-w-6xl px-4 py-4 pb-28">
        <h1 className="mb-4 text-lg font-bold">{getCategoryLabel(category)}</h1>
        {loading && <p className="py-12 text-center text-sm text-slate-400">Loading…</p>}
        {!loading && items.length === 0 && <p className="py-12 text-center text-sm text-slate-400">No listings in this category.</p>}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {items.map((l) => <ProductCard key={l.id} listing={l} />)}
        </div>
      </div>
    </AppShell>
  );
}
