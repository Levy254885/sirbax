"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { uploadImage, validateImageFile } from "@/services/cloudinary";
import { conversationId } from "@/services/socialService";
import {
  listActiveListings, createListing, placeOrder, payOrder, markOrderShipped,
  confirmOrderReceived, listOrdersForUser, computeTotals, formatMoney, statusLabel,
  type Listing, type Order,
} from "@/services/marketplaceService";
import toast from "@/lib/toast";

export default function MarketplacePage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [tab, setTab] = useState<"browse" | "orders" | "sell">("browse");
  const [items, setItems] = useState<Listing[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setItems(await listActiveListings());
    if (user) setOrders(await listOrdersForUser(user.uid));
  };

  useEffect(() => { load(); }, [user]);

  const publish = async () => {
    if (!user || !title.trim() || !price.trim()) { toast.error("Title and price required"); return; }
    const num = Number(price.replace(/,/g, ""));
    if (!Number.isFinite(num) || num <= 0) { toast.error("Invalid price"); return; }
    setBusy(true);
    try {
      let imageUrl = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80";
      if (file) {
        const err = validateImageFile(file);
        if (err) throw new Error(err);
        imageUrl = (await uploadImage(file)).secureUrl;
      }
      await createListing({ title, price: num, description, imageUrl, sellerId: user.uid, sellerNickname: user.nickname });
      toast.success(t.postListing);
      setTitle(""); setPrice(""); setDescription(""); setFile(null); setTab("browse"); load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  const buy = async (listing: Listing) => {
    if (!user) return;
    if (listing.sellerId === user.uid) { toast.error("You cannot buy your own listing"); return; }
    setBusy(true);
    try {
      const order = await placeOrder({ listing, buyerId: user.uid, buyerNickname: user.nickname });
      await payOrder(order.id, user.uid);
      toast.success(`${t.orderPlaced} — ${t.escrowHeld}`);
      setTab("orders");
      load();
    } catch {
      toast.error("Order failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell showRight={false}>
      <div className="border-b border-slate-100 bg-white px-4 py-3">
        <h1 className="text-xl font-bold text-slate-900">{t.marketplace}</h1>
        <div className="mt-3 flex gap-2">
          {([["browse", t.marketplace], ["orders", t.myOrders], ["sell", t.sell]] as const).map(([id, label]) => (
            <button key={id} type="button" onClick={() => setTab(id)} className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${tab === id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"}`}>{label}</button>
          ))}
        </div>
      </div>

      {tab === "sell" && (
        <div className="space-y-3 border-b border-slate-100 bg-white px-4 py-4">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t.listingTitle} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" />
          <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder={`${t.listingPrice} (KES)`} inputMode="numeric" className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t.listingDesc} rows={3} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <button type="button" disabled={busy} onClick={publish} className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white disabled:opacity-50">{t.postListing}</button>
          <p className="text-xs text-slate-400">{t.platformFee}: 5%. {t.escrowHeld} until buyer confirms delivery.</p>
        </div>
      )}

      {tab === "browse" && (
        <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 pb-24">
          {items.map((l) => {
            const { platformFee, total } = computeTotals(l.price);
            return (
              <div key={l.id} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={l.imageUrl} alt="" className="aspect-square w-full object-cover" />
                <div className="p-2.5">
                  <p className="truncate text-sm font-semibold text-slate-900">{l.title}</p>
                  <p className="text-sm font-bold text-blue-600">{formatMoney(l.price, l.currency)}</p>
                  <p className="truncate text-xs text-slate-400">{l.sellerNickname}</p>
                  <p className="mt-0.5 text-[10px] text-slate-400">{t.totalDue}: {formatMoney(total)} (+{formatMoney(platformFee)} fee)</p>
                  {user && user.uid !== l.sellerId && (
                    <div className="mt-2 flex flex-col gap-1">
                      <button type="button" disabled={busy} onClick={() => buy(l)} className="w-full rounded-lg bg-blue-600 py-1.5 text-xs font-semibold text-white">{t.buyNow}</button>
                      <button type="button" onClick={() => { const cid = conversationId(user.uid, l.sellerId); router.push(`/messages/${cid}?to=${l.sellerId}&name=${encodeURIComponent(l.sellerNickname)}`); }} className="w-full rounded-lg bg-slate-100 py-1.5 text-xs font-semibold text-slate-800">{t.contactSeller}</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "orders" && (
        <div className="space-y-3 bg-slate-50 p-3 pb-24">
          {orders.length === 0 && <p className="py-16 text-center text-sm text-slate-400">No orders yet</p>}
          {orders.map((o) => {
            const isBuyer = user?.uid === o.buyerId;
            const isSeller = user?.uid === o.sellerId;
            return (
              <div key={o.id} className="overflow-hidden rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                <div className="flex gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={o.listingImage} alt="" className="h-16 w-16 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">{o.listingTitle}</p>
                    <p className="text-sm text-blue-600">{formatMoney(o.total, o.currency)}</p>
                    <p className="text-xs text-slate-500">{statusLabel(o.status, t as unknown as Record<string, string>)}</p>
                    <p className="text-[11px] text-slate-400">{isBuyer ? `Seller: ${o.sellerNickname}` : `Buyer: ${o.buyerNickname}`}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  {o.status === "paid_held" && isSeller && (
                    <button type="button" className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white" onClick={async () => { await markOrderShipped(o.id, user!.uid); toast.success(t.markShipped); load(); }}>{t.markShipped}</button>
                  )}
                  {o.status === "shipped" && isBuyer && (
                    <button type="button" className="w-full rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white" onClick={async () => { await confirmOrderReceived(o.id, user!.uid); toast.success(t.fundsReleased); load(); }}>{t.confirmReceived}</button>
                  )}
                  {o.status === "paid_held" && isBuyer && (
                    <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">{t.escrowHeld}. Seller will ship soon.</p>
                  )}
                  {o.status === "completed" && (
                    <p className="rounded-xl bg-green-50 px-3 py-2 text-xs text-green-800">{t.fundsReleased}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
