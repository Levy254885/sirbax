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
    if (!loading && isAuthenticated) {
      router.replace("/home");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40" />
      </div>

      <header className="flex items-center justify-between px-6 py-5 md:px-10">
        <Logo className="text-white [&_span]:text-white" />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/20 backdrop-blur-sm ring-1 ring-blue-400/30">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/30">
            <svg viewBox="0 0 24 24" className="h-7 w-7 text-white" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" opacity=".3" />
              <path d="M12 6c-3.31 0-6 2.69-6 6 0 1.66.68 3.15 1.76 4.24L12 12l4.24 4.24C17.32 15.15 18 13.66 18 12c0-3.31-2.69-6-6-6z" />
            </svg>
          </div>
        </div>

        <h1 className="mb-3 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
          sirbax
        </h1>
        <p className="mb-2 text-lg font-medium text-blue-200 sm:text-xl">
          Share freely. Connect anonymously.
        </p>
        <p className="mb-10 max-w-md text-sm text-slate-300 sm:text-base">
          Real conversations. New perspectives.
          <br />
          No real names. Just people.
        </p>

        <div className="flex w-full max-w-xs flex-col gap-3">
          <Link href="/register" className="w-full">
            <Button size="lg" className="w-full bg-blue-500 hover:bg-blue-600">
              Get Started
            </Button>
          </Link>
          <Link href="/login" className="w-full">
            <Button
              size="lg"
              variant="outline"
              className="w-full border-white/20 bg-white/5 text-white hover:bg-white/10"
            >
              Log In
            </Button>
          </Link>
          <button
            onClick={() => {
              enterDemo();
              router.push("/home");
            }}
            className="mt-2 text-sm text-slate-400 underline-offset-2 hover:text-slate-200 hover:underline"
          >
            Try demo mode
          </button>
        </div>
      </main>

      <footer className="pb-8 text-center text-xs text-slate-500">
        Your identity stays yours.
      </footer>
    </div>
  );
}
