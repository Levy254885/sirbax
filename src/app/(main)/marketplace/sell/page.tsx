"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { MarketplaceHeader } from "@/components/marketplace/MarketplaceHeader";
import { SafetyNote } from "@/components/marketplace/SafetyNote";
import { useAuth } from "@/context/AuthContext";
import { uploadImage, validateImageFile } from "@/services/cloudinary";
import { createListing } from "@/services/marketplaceService";
import {
  MARKETPLACE_CATEGORIES, CATEGORY_ATTRIBUTES, CONDITIONS, DELIVERY_OPTIONS, getCategoryById,
} from "@/lib/marketplaceCategories";
import type { ListingImage } from "@/types/marketplace";
import type { DeliveryOptionId, ListingCondition } from "@/lib/marketplaceCategories";
import toast from "@/lib/toast";

type Step = 1 | 2 | 3 | 4 | 5;

export default function SellPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [busy, setBusy] = useState(false);
  const [images, setImages] = useState<ListingImage[]>([]);
  const [coverIdx, setCoverIdx] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("phones");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState<ListingCondition | "">("good");
  const [attrs, setAttrs] = useState<Record<string, string>>({});
  const [country, setCountry] = useState("Kenya");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [delivery, setDelivery] = useState<DeliveryOptionId[]>(["negotiable", "pickup"]);

  const cat = useMemo(() => getCategoryById(categoryId), [categoryId]);
  const attrFields = CATEGORY_ATTRIBUTES[categoryId] || [];

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const next = [...images];
      for (const f of Array.from(files).slice(0, 8 - images.length)) {
        const err = validateImageFile(f);
        if (err) { toast.error(err); continue; }
        const up = await uploadImage(f);
        next.push({ url: up.secureUrl, publicId: up.publicId, width: up.width, height: up.height });
      }
      setImages(next);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally { setBusy(false); }
  };

  const publish = async (asDraft: boolean) => {
    if (!user) { toast.error("Sign in to sell"); return; }
    if (!images.length) { toast.error("Add at least one photo"); setStep(1); return; }
    if (!title.trim() || !(Number(price) > 0)) { toast.error("Title and price required"); setStep(2); return; }
    setBusy(true);
    try {
      const listing = await createListing({
        sellerId: user.uid, sellerNickname: user.nickname, sellerAvatar: user.avatarUrl,
        title, description, categoryId, subcategoryId: subcategoryId || undefined,
        price: Number(price), condition: condition || undefined, images,
        coverImage: images[coverIdx]?.url || images[0]?.url,
        location: { country, region, city, area },
        deliveryOptions: delivery.length ? delivery : ["negotiable"],
        attributes: Object.fromEntries(Object.entries(attrs).filter(([, v]) => v)),
        status: asDraft ? "DRAFT" : "ACTIVE",
      });
      toast.success(asDraft ? "Draft saved" : "Listing published");
      router.push(`/marketplace/product/${listing.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not publish");
    } finally { setBusy(false); }
  };

  if (!user) {
    return (
      <AppShell showRight={false}>
        <MarketplaceHeader showSell={false} />
        <p className="py-16 text-center text-sm text-slate-500">Sign in to create a listing.</p>
      </AppShell>
    );
  }

  return (
    <AppShell showRight={false}>
      <MarketplaceHeader showSell={false} />
      <div className="mx-auto max-w-lg px-4 py-4 pb-28">
        <h1 className="text-lg font-bold">Sell an item</h1>
        <p className="mt-1 text-sm text-slate-500">Step {step} of 5</p>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full bg-slate-900" style={{ width: `${(step / 5) * 100}%` }} />
        </div>

        {step === 1 && (
          <div className="mt-6 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {images.map((im, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-lg border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={im.url} alt="" className="h-full w-full object-cover" />
                  <button type="button" onClick={() => setCoverIdx(i)} className={`absolute bottom-1 left-1 rounded px-1 text-[10px] font-semibold ${coverIdx === i ? "bg-slate-900 text-white" : "bg-white"}`}>Cover</button>
                  <button type="button" onClick={() => setImages((p) => p.filter((_, j) => j !== i))} className="absolute right-1 top-1 rounded bg-white px-1 text-xs">×</button>
                </div>
              ))}
              {images.length < 8 && (
                <label className="flex aspect-square cursor-pointer items-center justify-center rounded-lg border border-dashed text-sm text-slate-500">
                  + Add
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
                </label>
              )}
            </div>
            <button type="button" disabled={!images.length || busy} onClick={() => setStep(2)} className="w-full rounded-lg bg-slate-900 py-3 text-sm font-semibold text-white disabled:opacity-40">Continue</button>
          </div>
        )}

        {step === 2 && (
          <div className="mt-6 space-y-3">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="h-11 w-full rounded-lg border px-3 text-sm" />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={4} className="w-full rounded-lg border px-3 py-2 text-sm" />
            <select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setSubcategoryId(""); setAttrs({}); }} className="h-11 w-full rounded-lg border px-3 text-sm">
              {MARKETPLACE_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            {cat?.subcategories && (
              <select value={subcategoryId} onChange={(e) => setSubcategoryId(e.target.value)} className="h-11 w-full rounded-lg border px-3 text-sm">
                <option value="">Subcategory</option>
                {cat.subcategories.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            )}
            <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price (KES)" inputMode="numeric" className="h-11 w-full rounded-lg border px-3 text-sm" />
            <select value={condition} onChange={(e) => setCondition(e.target.value as ListingCondition)} className="h-11 w-full rounded-lg border px-3 text-sm">
              {CONDITIONS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            {attrFields.map((f) => (
              <input key={f.key} value={attrs[f.key] || ""} onChange={(e) => setAttrs((a) => ({ ...a, [f.key]: e.target.value }))} placeholder={f.label} className="h-11 w-full rounded-lg border px-3 text-sm" />
            ))}
            <div className="flex gap-2">
              <button type="button" onClick={() => setStep(1)} className="flex-1 rounded-lg border py-3 text-sm">Back</button>
              <button type="button" onClick={() => setStep(3)} className="flex-1 rounded-lg bg-slate-900 py-3 text-sm font-semibold text-white">Continue</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-6 space-y-3">
            <p className="text-sm text-slate-500">Area only — not your exact address.</p>
            <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country" className="h-11 w-full rounded-lg border px-3 text-sm" />
            <input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Region" className="h-11 w-full rounded-lg border px-3 text-sm" />
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="h-11 w-full rounded-lg border px-3 text-sm" />
            <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Area" className="h-11 w-full rounded-lg border px-3 text-sm" />
            <div className="flex gap-2">
              <button type="button" onClick={() => setStep(2)} className="flex-1 rounded-lg border py-3 text-sm">Back</button>
              <button type="button" onClick={() => setStep(4)} className="flex-1 rounded-lg bg-slate-900 py-3 text-sm font-semibold text-white">Continue</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="mt-6 space-y-3">
            {DELIVERY_OPTIONS.map((d) => (
              <label key={d.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={delivery.includes(d.id)} onChange={() => setDelivery((p) => p.includes(d.id) ? p.filter((x) => x !== d.id) : [...p, d.id])} />
                {d.label}
              </label>
            ))}
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setStep(3)} className="flex-1 rounded-lg border py-3 text-sm">Back</button>
              <button type="button" onClick={() => setStep(5)} className="flex-1 rounded-lg bg-slate-900 py-3 text-sm font-semibold text-white">Preview</button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="mt-6 space-y-4">
            <div className="overflow-hidden rounded-lg border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={images[coverIdx]?.url || images[0]?.url} alt="" className="aspect-[4/3] w-full object-cover" />
              <div className="p-3">
                <p className="text-lg font-bold">KES {Number(price || 0).toLocaleString()}</p>
                <p className="font-semibold">{title}</p>
                <p className="mt-1 line-clamp-3 text-sm text-slate-600">{description}</p>
              </div>
            </div>
            <SafetyNote />
            <div className="flex gap-2">
              <button type="button" disabled={busy} onClick={() => publish(true)} className="flex-1 rounded-lg border py-3 text-sm font-semibold">Save draft</button>
              <button type="button" disabled={busy} onClick={() => publish(false)} className="flex-1 rounded-lg bg-slate-900 py-3 text-sm font-semibold text-white">Publish</button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
