"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { MarketplaceHeader } from "@/components/marketplace/MarketplaceHeader";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { SafetyNote } from "@/components/marketplace/SafetyNote";
import { MARKETPLACE_CATEGORIES } from "@/lib/marketplaceCategories";
import { searchListings } from "@/services/marketplaceService";
import type { MarketplaceListing } from "@/types/marketplace";

export default function MarketplaceHomePage() {
  const [recent, setRecent] = useState<MarketplaceListing[]>([]);
  const [popular, setPopular] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [r, p] = await Promise.all([
          searchListings({ sort: "newest", limit: 12 }),
          searchListings({ sort: "most_viewed", limit: 8 }),
        ]);
        setRecent(r);
        setPopular(p);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <AppShell showRight={false}>
      <MarketplaceHeader />
      <div className="mx-auto max-w-6xl px-4 py-4 pb-28">
        <p className="mb-4 text-sm text-slate-600">
          Find something. Talk to the seller. Make the deal —{" "}
          <span className="font-medium text-slate-800">payment stays between you</span>.
        </p>

        <section className="mb-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Categories</h2>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {MARKETPLACE_CATEGORIES.map((c) => (
              <Link
                key={c.id}
                href={`/marketplace/category/${c.id}`}
                className="rounded-lg border border-slate-200 bg-white px-2 py-3 text-center text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              >
                {c.label}
              </Link>
            ))}
          </div>
        </section>

        <SafetyNote />

        <section className="mt-6">
          <h2 className="mb-3 text-base font-semibold text-slate-900">Recently added</h2>
          {loading && (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[4/3] animate-pulse rounded-lg bg-slate-100" />
              ))}
            </div>
          )}
          {!loading && recent.length === 0 && (
            <p className="rounded-lg border border-dashed border-slate-200 py-12 text-center text-sm text-slate-400">
              No listings yet. Be the first to{" "}
              <Link href="/marketplace/sell" className="font-semibold text-slate-700 underline">
                sell an item
              </Link>
              .
            </p>
          )}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {recent.map((l) => (
              <ProductCard key={l.id} listing={l} />
            ))}
          </div>
        </section>

        {popular.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 text-base font-semibold text-slate-900">Popular</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {popular.map((l) => (
                <ProductCard key={l.id} listing={l} />
              ))}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
