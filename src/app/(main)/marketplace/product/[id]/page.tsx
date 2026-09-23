"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { MarketplaceHeader } from "@/components/marketplace/MarketplaceHeader";
import { SafetyNote } from "@/components/marketplace/SafetyNote";
import { useAuth } from "@/context/AuthContext";
import {
  formatMoney,
  getListingById,
  incrementListingViews,
  isListingSaved,
  openListingChat,
  saveListing,
  unsaveListing,
  createOffer,
  reportMarketplace,
} from "@/services/marketplaceService";
import { getCategoryLabel, DELIVERY_OPTIONS } from "@/lib/marketplaceCategories";
import type { MarketplaceListing } from "@/types/marketplace";
import toast from "@/lib/toast";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [listing, setListing] = useState<MarketplaceListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [saved, setSaved] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerMsg, setOfferMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const l = await getListingById(id);
      setListing(l);
      if (l) {
        incrementListingViews(l.id);
        setOfferAmount(String(l.price));
        if (user?.uid) setSaved(await isListingSaved(user.uid, l.id));
      }
      setLoading(false);
    })();
  }, [id, user?.uid]);

  const chat = async () => {
    if (!user || !listing) return;
    setBusy(true);
    try {
      const cid = await openListingChat({
        buyerId: user.uid,
        buyerNickname: user.nickname,
        buyerAvatar: user.avatarUrl,
        listing,
      });
      router.push(`/messages/${cid}?to=${listing.sellerId}&name=${encodeURIComponent(listing.sellerNickname)}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not open chat");
    } finally {
      setBusy(false);
    }
  };

  const toggleSave = async () => {
    if (!user || !listing) return;
    if (saved) {
      await unsaveListing(user.uid, listing.id);
      setSaved(false);
    } else {
      await saveListing(user.uid, listing.id);
      setSaved(true);
      toast.success("Saved");
    }
  };

  const submitOffer = async () => {
    if (!user || !listing) return;
    const amount = Number(offerAmount);
    if (!(amount > 0)) {
      toast.error("Enter a valid amount");
      return;
    }
    setBusy(true);
    try {
      await createOffer({
        listing,
        buyerId: user.uid,
        buyerNickname: user.nickname,
        buyerAvatar: user.avatarUrl,
        amount,
        message: offerMsg,
      });
      toast.success("Offer sent");
      setOfferOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  const report = async () => {
    if (!user || !listing) return;
    const reason = window.prompt("Reason (scam, counterfeit, misleading, other):");
    if (!reason) return;
    try {
      await reportMarketplace({
        reporterId: user.uid,
        targetType: "listing",
        targetId: listing.id,
        reason,
      });
      toast.success("Report submitted");
    } catch {
      toast.error("Could not report");
    }
  };

  if (loading) {
    return (
      <AppShell showRight={false}>
        <MarketplaceHeader />
        <p className="py-20 text-center text-sm text-slate-400">Loading…</p>
      </AppShell>
    );
  }

  if (!listing) {
    return (
      <AppShell showRight={false}>
        <MarketplaceHeader />
        <p className="py-20 text-center text-sm text-slate-500">Listing not found or removed.</p>
      </AppShell>
    );
  }

  const images = listing.images?.length
    ? listing.images
    : listing.coverImage
      ? [{ url: listing.coverImage }]
      : [];
  const isOwner = user?.uid === listing.sellerId;
  const loc = [listing.location.area, listing.location.city, listing.location.region, listing.location.country]
    .filter(Boolean)
    .join(", ");

  return (
    <AppShell showRight={false}>
      <MarketplaceHeader />
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-4 pb-32 md:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[imgIdx]?.url || listing.coverImage}
              alt={listing.title}
              className="h-full w-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="mt-2 flex gap-2 overflow-x-auto">
              {images.map((im, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setImgIdx(i)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded border ${
                    i === imgIdx ? "border-slate-900" : "border-slate-200"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={im.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-2xl font-bold text-slate-900">
            {formatMoney(listing.price, listing.currency)}
          </p>
          <h1 className="mt-1 text-xl font-semibold text-slate-900">{listing.title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {getCategoryLabel(listing.categoryId)}
            {listing.condition ? ` · ${listing.condition}` : ""}
            {loc ? ` · ${loc}` : ""}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {listing.views} views · Listed {new Date(listing.createdAt).toLocaleDateString()}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {!isOwner && user && listing.status === "ACTIVE" && (
              <>
                <button
                  type="button"
                  disabled={busy}
                  onClick={chat}
                  className="flex-1 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 sm:flex-none"
                >
                  Chat with seller
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setOfferOpen(true)}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 sm:flex-none"
                >
                  Make an offer
                </button>
              </>
            )}
            {user && (
              <button
                type="button"
                onClick={toggleSave}
                className="rounded-lg border border-slate-200 px-3 py-3 text-sm font-medium text-slate-700"
              >
                {saved ? "Saved" : "Save"}
              </button>
            )}
            {isOwner && (
              <Link
                href={`/marketplace/listings/${listing.id}/edit`}
                className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold"
              >
                Edit listing
              </Link>
            )}
          </div>

          {offerOpen && (
            <div className="mt-4 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm font-semibold">Your offer</p>
              <input
                type="number"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                placeholder="Amount"
              />
              <textarea
                value={offerMsg}
                onChange={(e) => setOfferMsg(e.target.value)}
                rows={2}
                placeholder="Optional message"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={submitOffer}
                  className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
                >
                  Send offer
                </button>
                <button type="button" onClick={() => setOfferOpen(false)} className="text-sm text-slate-500">
                  Cancel
                </button>
              </div>
              <SafetyNote compact />
            </div>
          )}

          <div className="mt-5 border-t border-slate-100 pt-4">
            <Link
              href={`/marketplace/seller/${listing.sellerId}`}
              className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={listing.sellerAvatar || `https://api.dicebear.com/9.x/adventurer/svg?seed=${listing.sellerNickname}`}
                alt=""
                className="h-10 w-10 rounded-full bg-slate-100"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900">{listing.sellerNickname}</p>
                <p className="text-xs text-slate-500">Seller · Sirbax identity</p>
              </div>
            </Link>
          </div>

          <div className="mt-5">
            <h2 className="text-sm font-semibold text-slate-900">Description</h2>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {listing.description || "No description."}
            </p>
          </div>

          {Object.keys(listing.attributes || {}).length > 0 && (
            <div className="mt-4">
              <h2 className="text-sm font-semibold text-slate-900">Details</h2>
              <dl className="mt-1 grid grid-cols-2 gap-2 text-sm">
                {Object.entries(listing.attributes).map(([k, v]) => (
                  <div key={k} className="rounded border border-slate-100 px-2 py-1.5">
                    <dt className="text-[11px] uppercase text-slate-400">{k}</dt>
                    <dd className="font-medium text-slate-800">{String(v)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {listing.deliveryOptions?.length > 0 && (
            <div className="mt-4">
              <h2 className="text-sm font-semibold text-slate-900">Delivery options</h2>
              <p className="mt-1 text-sm text-slate-600">
                {listing.deliveryOptions
                  .map((id) => DELIVERY_OPTIONS.find((d) => d.id === id)?.label || id)
                  .join(" · ")}
              </p>
            </div>
          )}

          <div className="mt-5">
            <SafetyNote />
          </div>

          {user && !isOwner && (
            <button type="button" onClick={report} className="mt-3 text-xs text-slate-400 underline">
              Report listing
            </button>
          )}
        </div>
      </div>

      {!isOwner && user && listing.status === "ACTIVE" && (
        <div className="fixed bottom-16 left-0 right-0 z-20 border-t border-slate-200 bg-white p-3 md:hidden">
          <div className="mx-auto flex max-w-lg gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={chat}
              className="flex-1 rounded-lg bg-slate-900 py-3 text-sm font-semibold text-white"
            >
              Chat with seller
            </button>
            <button
              type="button"
              onClick={() => setOfferOpen(true)}
              className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold"
            >
              Offer
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
