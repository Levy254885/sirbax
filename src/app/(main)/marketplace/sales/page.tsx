"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { MarketplaceHeader } from "@/components/marketplace/MarketplaceHeader";
import { useAuth } from "@/context/AuthContext";
import { dealStatusLabel, formatMoney, listDealsForUser } from "@/services/marketplaceService";
import type { MarketplaceDeal } from "@/types/marketplace";
import Link from "next/link";

export default function SalesPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<MarketplaceDeal[]>([]);
  useEffect(() => {
    if (!user) return;
    listDealsForUser(user.uid).then((all) => setItems(all.filter((d) => d.sellerId === user.uid)));
  }, [user?.uid]);
  return (
    <AppShell showRight={false}>
      <MarketplaceHeader />
      <div className="mx-auto max-w-2xl px-4 py-4 pb-28">
        <h1 className="mb-4 text-lg font-bold">My sales</h1>
        {items.length === 0 && <p className="py-12 text-center text-sm text-slate-400">No sales yet.</p>}
        <div className="space-y-2">
          {items.map((d) => (
            <Link key={d.id} href="/marketplace/deals" className="block rounded-lg border p-3 hover:bg-slate-50">
              <p className="text-sm font-semibold">{d.listingTitle}</p>
              <p className="text-sm">{formatMoney(d.agreedPrice, d.currency)} · {dealStatusLabel(d.status)}</p>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
