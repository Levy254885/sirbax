"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { MarketplaceHeader } from "@/components/marketplace/MarketplaceHeader";
import { SafetyNote } from "@/components/marketplace/SafetyNote";
import { useAuth } from "@/context/AuthContext";
import { dealStatusLabel, formatMoney, listDealsForUser, updateDealStatus, submitRating } from "@/services/marketplaceService";
import type { MarketplaceDeal, DealStatus } from "@/types/marketplace";
import toast from "@/lib/toast";

export default function DealsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<MarketplaceDeal[]>([]);
  const load = async () => { if (user) setItems(await listDealsForUser(user.uid)); };
  useEffect(() => { load(); }, [user?.uid]);

  const advance = async (deal: MarketplaceDeal, next: DealStatus) => {
    if (!user) return;
    if (next === "PAYMENT_REPORTED") {
      if (!confirm("Only mark this if you personally completed payment with the other party. Sirbax does not verify or hold funds.")) return;
    }
    try {
      await updateDealStatus(deal.id, user.uid, next);
      toast.success("Deal updated");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const rate = async (deal: MarketplaceDeal) => {
    if (!user) return;
    const stars = Number(window.prompt("Rate 1–5 stars:"));
    if (!(stars >= 1 && stars <= 5)) return;
    const review = window.prompt("Optional review:") || "";
    const toId = user.uid === deal.buyerId ? deal.sellerId : deal.buyerId;
    const toNickname = user.uid === deal.buyerId ? deal.sellerNickname : deal.buyerNickname;
    try {
      await submitRating({
        dealId: deal.id, listingId: deal.listingId, fromId: user.uid, fromNickname: user.nickname,
        toId, toNickname, stars, review,
      });
      toast.success("Rating submitted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <AppShell showRight={false}>
      <MarketplaceHeader />
      <div className="mx-auto max-w-2xl space-y-3 px-4 py-4 pb-28">
        <h1 className="text-lg font-bold">Deals</h1>
        <p className="text-sm text-slate-600">Deal records only — Sirbax does not hold money.</p>
        <SafetyNote />
        {user && items.length === 0 && <p className="py-12 text-center text-sm text-slate-400">No active deals.</p>}
        {items.map((d) => (
          <div key={d.id} className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="flex gap-3">
              {d.listingCover && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={d.listingCover} alt="" className="h-14 w-14 rounded object-cover" />
              )}
              <div className="min-w-0 flex-1">
                <Link href={`/marketplace/product/${d.listingId}`} className="text-sm font-semibold hover:underline">{d.listingTitle}</Link>
                <p className="text-sm">Agreed price: <strong>{formatMoney(d.agreedPrice, d.currency)}</strong></p>
                <p className="text-xs text-slate-500">{dealStatusLabel(d.status)} · {user?.uid === d.buyerId ? `Seller ${d.sellerNickname}` : `Buyer ${d.buyerNickname}`}</p>
                {d.conversationId && (
                  <Link href={`/messages/${d.conversationId}`} className="text-xs font-medium text-blue-600">Open chat</Link>
                )}
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {d.status === "DEAL_AGREED" && (
                <>
                  <button type="button" onClick={() => advance(d, "PAYMENT_REPORTED")} className="rounded bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white">Mark payment reported</button>
                  <button type="button" onClick={() => advance(d, "DELIVERY_PENDING")} className="rounded border px-2 py-1 text-[11px]">Delivery pending</button>
                </>
              )}
              {d.status === "PAYMENT_REPORTED" && (
                <button type="button" onClick={() => advance(d, "DELIVERED")} className="rounded bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white">Mark delivered</button>
              )}
              {d.status === "DELIVERED" && (
                <button type="button" onClick={() => advance(d, "COMPLETED")} className="rounded bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white">Mark deal complete</button>
              )}
              {d.status === "COMPLETED" && (
                <button type="button" onClick={() => rate(d)} className="rounded border px-2 py-1 text-[11px]">Rate</button>
              )}
              {!["COMPLETED", "CANCELLED"].includes(d.status) && (
                <button type="button" onClick={() => advance(d, "CANCELLED")} className="rounded border px-2 py-1 text-[11px] text-red-600">Cancel</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
