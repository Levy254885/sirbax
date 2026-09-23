"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { MarketplaceHeader } from "@/components/marketplace/MarketplaceHeader";
import { SafetyNote } from "@/components/marketplace/SafetyNote";
import { useAuth } from "@/context/AuthContext";
import { formatMoney, listOffersForUser, respondToOffer } from "@/services/marketplaceService";
import type { MarketplaceOffer } from "@/types/marketplace";
import toast from "@/lib/toast";

export default function OffersPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<MarketplaceOffer[]>([]);
  const load = async () => { if (user) setItems(await listOffersForUser(user.uid)); };
  useEffect(() => { load(); }, [user?.uid]);

  const act = async (id: string, action: "accept" | "reject" | "counter") => {
    if (!user) return;
    let counter: number | undefined;
    if (action === "counter") {
      const v = window.prompt("Counter offer amount (KES):");
      if (!v) return;
      counter = Number(v);
    }
    try {
      await respondToOffer(id, user.uid, action, counter);
      toast.success("Updated");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <AppShell showRight={false}>
      <MarketplaceHeader />
      <div className="mx-auto max-w-2xl space-y-3 px-4 py-4 pb-28">
        <h1 className="text-lg font-bold">Offers</h1>
        <SafetyNote compact />
        {!user && <p className="text-sm text-slate-500">Sign in to view offers.</p>}
        {user && items.length === 0 && <p className="py-12 text-center text-sm text-slate-400">No offers yet.</p>}
        {items.map((o) => {
          const isSeller = user?.uid === o.sellerId;
          return (
            <div key={o.id} className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex gap-3">
                {o.listingCover && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={o.listingCover} alt="" className="h-14 w-14 rounded object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <Link href={`/marketplace/product/${o.listingId}`} className="text-sm font-semibold hover:underline">{o.listingTitle}</Link>
                  <p className="text-sm text-slate-700">
                    Offer {formatMoney(o.amount, o.currency)}
                    {o.counterAmount ? ` · Counter ${formatMoney(o.counterAmount, o.currency)}` : ""}
                  </p>
                  <p className="text-xs text-slate-400">{o.status} · {isSeller ? `from ${o.buyerNickname}` : `to ${o.sellerNickname}`}</p>
                  {o.message && <p className="mt-1 text-xs text-slate-600">{o.message}</p>}
                </div>
              </div>
              {isSeller && o.status === "PENDING" && (
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={() => act(o.id, "accept")} className="rounded bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">Accept</button>
                  <button type="button" onClick={() => act(o.id, "counter")} className="rounded border px-3 py-1.5 text-xs font-semibold">Counter</button>
                  <button type="button" onClick={() => act(o.id, "reject")} className="rounded border px-3 py-1.5 text-xs">Reject</button>
                </div>
              )}
              {!isSeller && o.status === "COUNTERED" && (
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={() => act(o.id, "accept")} className="rounded bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">Accept counter</button>
                  <button type="button" onClick={() => act(o.id, "reject")} className="rounded border px-3 py-1.5 text-xs">Reject</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
