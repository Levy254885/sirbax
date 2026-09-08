"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function LandingPage() {
  const { isAuthenticated, loading, enterDemo } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) router.replace("/home");
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1400&q=80)",
        }}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/30">
          <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-white">
            <path
              d="M12 3c-4.5 0-8 3-8 7.2 0 2.4 1.2 4.5 3.1 5.8L6 21l4.2-2.3c.6.1 1.2.2 1.8.2 4.5 0 8-3 8-7.2S16.5 3 12 3z"
              fill="currentColor"
            />
          </svg>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white">sirbax</h1>
        <p className="mt-3 text-base leading-relaxed text-white/80">
          Share freely.
          <br />
          Connect anonymously.
        </p>
      </div>

      <div className="mx-auto w-full max-w-sm space-y-3 px-6 pb-14">
        <Link href="/register" className="block">
          <Button size="lg" className="w-full rounded-xl bg-blue-600 text-base font-semibold hover:bg-blue-700">
            Get Started
          </Button>
        </Link>
        <Link href="/login" className="block">
          <button className="flex h-12 w-full items-center justify-center rounded-xl border border-white/30 bg-white/10 text-base font-semibold text-white backdrop-blur-sm hover:bg-white/20">
            Log In
          </button>
        </Link>
        <button
          onClick={() => {
            enterDemo();
            router.push("/home");
          }}
          className="w-full pt-1 text-center text-sm text-white/60 hover:text-white"
        >
          Try demo mode
        </button>
      </div>
    </div>
  );
}
