"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { listListings, createListing, type ListingItem } from "@/services/platformService";
import { uploadImage, validateImageFile } from "@/services/cloudinary";
import { conversationId } from "@/services/socialService";
import toast from "@/lib/toast";

export default function MarketplacePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<ListingItem[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () => listListings().then(setItems);
  useEffect(() => { load(); }, []);

  const publish = async () => {
    if (!user || !title.trim() || !price.trim()) { toast.error("Title and price required"); return; }
    setBusy(true);
    try {
      let imageUrl = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80";
      if (file) {
        const err = validateImageFile(file);
        if (err) throw new Error(err);
        imageUrl = (await uploadImage(file)).secureUrl;
      }
      await createListing({ title, price, description, imageUrl, sellerId: user.uid, sellerNickname: user.nickname });
      toast.success("Listing posted");
      setShowCreate(false); setTitle(""); setPrice(""); setDescription(""); setFile(null); load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  const messageSeller = (l: ListingItem) => {
    if (!user) return;
    const cid = conversationId(user.uid, l.sellerId);
    router.push(`/messages/${cid}?to=${l.sellerId}&name=${encodeURIComponent(l.sellerNickname)}`);
  };

  return (
    <AppShell showRight={false}>
      <div className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3">
        <h1 className="text-xl font-bold">Marketplace</h1>
        <button type="button" onClick={() => setShowCreate((s) => !s)} className="rounded-full bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white">Sell</button>
      </div>
      {showCreate && (
        <div className="space-y-2 border-b border-slate-100 bg-white px-4 py-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="h-10 w-full rounded-xl border px-3 text-sm" />
          <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" className="h-10 w-full rounded-xl border px-3 text-sm" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={2} className="w-full rounded-xl border px-3 py-2 text-sm" />
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <button type="button" disabled={busy} onClick={publish} className="w-full rounded-xl bg-blue-600 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Posting..." : "Post listing"}</button>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 pb-24">
        {items.map((l) => (
          <div key={l.id} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={l.imageUrl} alt="" className="aspect-square w-full object-cover" />
            <div className="p-2.5">
              <p className="truncate text-sm font-semibold">{l.title}</p>
              <p className="text-sm font-bold text-blue-600">{l.price}</p>
              <p className="truncate text-xs text-slate-400">{l.sellerNickname}</p>
              {user && user.uid !== l.sellerId && (
                <button type="button" onClick={() => messageSeller(l)} className="mt-2 w-full rounded-lg bg-slate-100 py-1.5 text-xs font-semibold">Message</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
