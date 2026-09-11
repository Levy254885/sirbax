"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { RightSidebar } from "./RightSidebar";

function Splash() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-600 to-indigo-700 px-6">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 shadow-lg backdrop-blur">
        <svg viewBox="0 0 24 24" fill="none" className="h-9 w-9 text-white">
          <path
            d="M12 3c-4.5 0-8 3-8 7.2 0 2.4 1.2 4.5 3.1 5.8L6 21l4.2-2.3c.6.1 1.2.2 1.8.2 4.5 0 8-3 8-7.2S16.5 3 12 3z"
            fill="currentColor"
          />
        </svg>
      </div>
      <p className="text-xl font-bold tracking-tight text-white">sirbax</p>
      <p className="mt-1 text-sm text-blue-100">Si xor ah u wadaag</p>
      <div className="mt-8 h-1.5 w-32 overflow-hidden rounded-full bg-white/20">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-white" />
      </div>
    </div>
  );
}

export function AppShell({
  children,
  showRight = true,
}: {
  children: React.ReactNode;
  showRight?: boolean;
}) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) return <Splash />;
  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col">
        <div className="mx-auto w-full max-w-2xl flex-1 pb-20 md:pb-0 lg:max-w-none lg:px-0">
          {children}
        </div>
      </main>
      {showRight && <RightSidebar />}
      <BottomNav />
    </div>
  );
}
