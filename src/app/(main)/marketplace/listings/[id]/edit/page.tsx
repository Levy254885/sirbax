"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { MarketplaceHeader } from "@/components/marketplace/MarketplaceHeader";
import { useAuth } from "@/context/AuthContext";
import { getListingById, updateListing } from "@/services/marketplaceService";
import toast from "@/lib/toast";

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const l = await getListingById(id);
      if (!l) return;
      if (user && l.sellerId !== user.uid) {
        toast.error("Not your listing");
        router.replace("/marketplace/listings");
        return;
      }
      setTitle(l.title);
      setDescription(l.description);
      setPrice(String(l.price));
    })();
  }, [id, user?.uid]);

  const save = async () => {
    if (!user || !id) return;
    setBusy(true);
    try {
      await updateListing(id, user.uid, { title, description, price: Number(price) });
      toast.success("Saved");
      router.push(`/marketplace/product/${id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally { setBusy(false); }
  };

  return (
    <AppShell showRight={false}>
      <MarketplaceHeader showSell={false} />
      <div className="mx-auto max-w-lg space-y-3 px-4 py-6">
        <h1 className="text-lg font-bold">Edit listing</h1>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="h-11 w-full rounded-lg border px-3 text-sm" />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full rounded-lg border px-3 py-2 text-sm" />
        <input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="numeric" className="h-11 w-full rounded-lg border px-3 text-sm" />
        <button type="button" disabled={busy} onClick={save} className="w-full rounded-lg bg-slate-900 py-3 text-sm font-semibold text-white">Save</button>
      </div>
    </AppShell>
  );
}
