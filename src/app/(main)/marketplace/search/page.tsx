"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { MarketplaceHeader } from "@/components/marketplace/MarketplaceHeader";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { MARKETPLACE_CATEGORIES, CONDITIONS } from "@/lib/marketplaceCategories";
import { searchListings } from "@/services/marketplaceService";
import type { MarketplaceListing, ListingSort } from "@/types/marketplace";

function SearchInner() {
  const sp = useSearchParams();
  const [q] = useState(sp.get("q") || "");
  const [categoryId, setCategoryId] = useState(sp.get("category") || "");
  const [sort, setSort] = useState<ListingSort>((sp.get("sort") as ListingSort) || "newest");
  const [condition, setCondition] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [items, setItems] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const list = await searchListings({
        q: q || undefined,
        categoryId: categoryId || undefined,
        condition: condition || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        sort,
        limit: 48,
      });
      setItems(list);
      setLoading(false);
    })();
  }, [q, categoryId, sort, condition, minPrice, maxPrice]);

  return (
    <>
      <MarketplaceHeader initialQuery={q} />
      <div className="mx-auto max-w-6xl px-4 py-4 pb-28">
        <div className="mb-4 flex flex-wrap gap-2">
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="h-9 rounded-lg border border-slate-200 px-2 text-sm">
            <option value="">All categories</option>
            {MARKETPLACE_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <select value={condition} onChange={(e) => setCondition(e.target.value)} className="h-9 rounded-lg border px-2 text-sm">
            <option value="">Any condition</option>
            {CONDITIONS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as ListingSort)} className="h-9 rounded-lg border px-2 text-sm">
            <option value="newest">Newest</option>
            <option value="price_asc">Price ↑</option>
            <option value="price_desc">Price ↓</option>
            <option value="most_viewed">Most viewed</option>
          </select>
          <input value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="Min" inputMode="numeric" className="h-9 w-20 rounded-lg border px-2 text-sm" />
          <input value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Max" inputMode="numeric" className="h-9 w-20 rounded-lg border px-2 text-sm" />
        </div>
        {loading && <p className="py-12 text-center text-sm text-slate-400">Searching…</p>}
        {!loading && items.length === 0 && <p className="py-12 text-center text-sm text-slate-400">Nothing matches your search.</p>}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {items.map((l) => <ProductCard key={l.id} listing={l} />)}
        </div>
      </div>
    </>
  );
}

export default function SearchPage() {
  return (
    <AppShell showRight={false}>
      <Suspense fallback={<p className="p-8 text-center text-sm text-slate-400">Loading…</p>}>
        <SearchInner />
      </Suspense>
    </AppShell>
  );
}
