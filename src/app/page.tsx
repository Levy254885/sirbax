"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/common/Logo";
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
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white dark:bg-black">
      <div className="relative hidden w-1/2 flex-col items-center justify-center overflow-hidden bg-[#f0f2f5] dark:bg-[#0a0a0a] lg:flex">
        <div className="absolute left-8 top-8"><Logo size="md" /></div>
        <div className="relative h-[420px] w-[380px]">
          <div className="absolute left-4 top-8 rotate-[-6deg] overflow-hidden rounded-2xl shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=280&h=320&fit=crop" alt="" className="h-56 w-44 object-cover" />
          </div>
          <div className="absolute right-0 top-0 rotate-[4deg] overflow-hidden rounded-2xl shadow-2xl ring-4 ring-white dark:ring-neutral-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=320&h=380&fit=crop" alt="" className="h-64 w-52 object-cover" />
            <span className="absolute bottom-3 right-3 text-2xl">❤️</span>
          </div>
        </div>
        <div className="mt-8 max-w-sm px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Explore the things <span className="text-primary">you love.</span>
          </h2>
          <p className="mt-3 text-sm text-neutral-500">Share freely. Connect anonymously.</p>
        </div>
      </div>

      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-[400px] text-center">
          <div className="mb-6 flex justify-center"><Logo size="lg" /></div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight">sirbax</h1>
          <p className="mb-8 text-muted-foreground">
            Real conversations. New perspectives.<br />No real names. Just people.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/register"><Button size="lg" className="h-12 w-full rounded-lg text-base font-semibold">Get Started</Button></Link>
            <Link href="/login"><Button size="lg" variant="outline" className="h-12 w-full rounded-lg">Log In</Button></Link>
            <button
              onClick={() => { enterDemo(); router.push("/home"); }}
              className="mt-2 text-sm text-muted-foreground hover:text-foreground hover:underline"
            >
              Try demo mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
