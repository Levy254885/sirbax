"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Calendar } from "@/components/ui/Icons";

const EVENTS = [
  { id: "e1", title: "Anonymous Meetup Online", when: "Sat · 7:00 PM", place: "sirbax Live", cover: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80" },
  { id: "e2", title: "Photo Walk — City Lights", when: "Sun · 5:30 PM", place: "Downtown", cover: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80" },
];

export default function EventsPage() {
  return (
    <AppShell showRight={false}>
      <div className="border-b border-slate-100 bg-white px-4 py-3">
        <h1 className="text-xl font-bold text-slate-900">Events</h1>
      </div>
      <div className="space-y-3 bg-slate-50 px-3 py-3 pb-24">
        {EVENTS.map((e) => (
          <div key={e.id} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={e.cover} alt="" className="h-36 w-full object-cover" />
            <div className="p-3.5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{e.title}</p>
                  <p className="text-sm text-slate-500">{e.when} · {e.place}</p>
                </div>
              </div>
              <button type="button" className="mt-3 w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white">Interested</button>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
