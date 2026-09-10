"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Calendar } from "@/components/ui/Icons";
import { useAuth } from "@/context/AuthContext";
import { listEvents, markInterested, isInterested, createEvent, type EventItem } from "@/services/platformService";
import toast from "@/lib/toast";

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [interested, setInterested] = useState<Record<string, boolean>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [when, setWhen] = useState("");
  const [place, setPlace] = useState("");

  const load = () =>
    listEvents().then((e) => {
      setEvents(e);
      if (user) {
        const m: Record<string, boolean> = {};
        e.forEach((x) => { m[x.id] = isInterested(user.uid, x.id); });
        setInterested(m);
      }
    });

  useEffect(() => { load(); }, [user]);

  const create = async () => {
    if (!user || !title.trim()) return;
    await createEvent({ title, when: when || "TBA", place: place || "Online", ownerId: user.uid });
    setShowCreate(false); setTitle(""); toast.success("Event created"); load();
  };

  return (
    <AppShell showRight={false}>
      <div className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3">
        <h1 className="text-xl font-bold text-slate-900">Events</h1>
        <button type="button" onClick={() => setShowCreate((s) => !s)} className="rounded-full bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white">Create</button>
      </div>
      {showCreate && (
        <div className="space-y-2 border-b border-slate-100 bg-white px-4 py-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" />
          <input value={when} onChange={(e) => setWhen(e.target.value)} placeholder="When" className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" />
          <input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Place" className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" />
          <button type="button" onClick={create} className="w-full rounded-xl bg-blue-600 py-2 text-sm font-semibold text-white">Publish event</button>
        </div>
      )}
      <div className="space-y-3 bg-slate-50 px-3 py-3 pb-24">
        {events.map((e) => (
          <div key={e.id} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={e.coverUrl} alt="" className="h-36 w-full object-cover" />
            <div className="p-3.5">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Calendar className="h-5 w-5" /></div>
                <div>
                  <p className="font-semibold text-slate-900">{e.title}</p>
                  <p className="text-sm text-slate-500">{e.when} · {e.place}</p>
                  <p className="text-xs text-slate-400">{e.interestedCount} interested</p>
                </div>
              </div>
              <button type="button" className={`mt-3 w-full rounded-xl py-2.5 text-sm font-semibold ${interested[e.id] ? "border border-slate-200 text-slate-800" : "bg-blue-600 text-white"}`} onClick={() => { if (!user) return; markInterested(user.uid, e.id); setInterested((s) => ({ ...s, [e.id]: true })); }}>
                {interested[e.id] ? "Interested ✓" : "Interested"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
