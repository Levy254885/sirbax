"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function MarketplaceHeader({
  initialQuery = "",
  showSell = true,
}: {
  initialQuery?: string;
  showSell?: boolean;
}) {
  const [q, setQ] = useState(initialQuery);
  const router = useRouter();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/marketplace/search?q=${encodeURIComponent(term)}` : "/marketplace/search");
  };

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
        <div className="flex items-center justify-between gap-3">
          <Link href="/marketplace" className="text-lg font-bold tracking-tight text-slate-900">
            Marketplace
          </Link>
          {showSell && (
            <Link
              href="/marketplace/sell"
              className="rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white hover:bg-slate-800 sm:hidden"
            >
              Sell
            </Link>
          )}
        </div>
        <form onSubmit={submit} className="flex flex-1 gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products, brands, cities…"
            className="h-10 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
          />
          <button
            type="submit"
            className="h-10 shrink-0 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Search
          </button>
        </form>
        {showSell && (
          <Link
            href="/marketplace/sell"
            className="hidden h-10 items-center rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 sm:inline-flex"
          >
            Sell an item
          </Link>
        )}
      </div>
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2 text-sm">
        {[
          { href: "/marketplace", label: "Home" },
          { href: "/marketplace/saved", label: "Saved" },
          { href: "/marketplace/listings", label: "My listings" },
          { href: "/marketplace/offers", label: "Offers" },
          { href: "/marketplace/deals", label: "Deals" },
          { href: "/marketplace/purchases", label: "Purchases" },
          { href: "/marketplace/sales", label: "Sales" },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="whitespace-nowrap rounded-full px-3 py-1 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
