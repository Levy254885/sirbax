"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onNotify, requestNotifyPermission } from "@/lib/notify";

interface ToastItem {
  id: number;
  title: string;
  body: string;
  href?: string;
}

export function NotificationToaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    requestNotifyPermission();
    const unsubscribe = onNotify((n) => {
      const id = Date.now();
      setItems((prev) => [...prev, { id, ...n }].slice(-4));
      setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== id)), 5000);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  if (!items.length) return null;

  return (
    <div className="pointer-events-none fixed right-3 top-3 z-[100] flex w-[min(100%-1.5rem,320px)] flex-col gap-2">
      {items.map((n) => (
        <div
          key={n.id}
          className="pointer-events-auto animate-fade-in-up rounded-2xl border border-slate-100 bg-white p-3 shadow-lg"
        >
          {n.href ? (
            <Link href={n.href} className="block">
              <p className="text-sm font-semibold text-slate-900">{n.title}</p>
              <p className="text-xs text-slate-600">{n.body}</p>
            </Link>
          ) : (
            <>
              <p className="text-sm font-semibold text-slate-900">{n.title}</p>
              <p className="text-xs text-slate-600">{n.body}</p>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
