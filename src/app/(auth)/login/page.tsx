"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import toast from "@/lib/toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginWithEmail, loginWithGoogle, enterDemo } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Enter email and password");
      return;
    }
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      router.push("/home");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-black">
      <div className="relative hidden w-1/2 flex-col items-center justify-center overflow-hidden bg-[#f0f2f5] dark:bg-[#0a0a0a] lg:flex">
        <div className="absolute left-8 top-8">
          <Logo size="md" />
        </div>

        <div className="relative h-[420px] w-[380px]">
          <div className="absolute left-4 top-8 rotate-[-6deg] overflow-hidden rounded-2xl shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=280&h=320&fit=crop"
              alt=""
              className="h-56 w-44 object-cover"
            />
            <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-xs">😂</span>
          </div>
          <div className="absolute right-0 top-0 rotate-[4deg] overflow-hidden rounded-2xl shadow-2xl ring-4 ring-white dark:ring-neutral-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=320&h=380&fit=crop"
              alt=""
              className="h-64 w-52 object-cover"
            />
            <span className="absolute right-2 top-2 rounded-full bg-blue-500 px-2 py-0.5 text-xs text-white">3h</span>
            <span className="absolute bottom-3 right-3 text-2xl">❤️</span>
          </div>
          <div className="absolute bottom-8 left-12 rotate-[-3deg] overflow-hidden rounded-2xl bg-white p-2 shadow-xl dark:bg-neutral-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop"
              alt=""
              className="h-16 w-16 rounded-full object-cover"
            />
          </div>
          <div className="absolute bottom-16 right-8 rounded-full bg-white p-2 shadow-lg dark:bg-neutral-800">
            <span className="text-xl">📷</span>
          </div>
        </div>

        <div className="mt-8 max-w-sm px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Explore the things{" "}
            <span className="text-primary">you love.</span>
          </h2>
          <p className="mt-3 text-sm text-neutral-500">
            Share freely. Connect anonymously. Your identity stays yours.
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo size="lg" />
          </div>

          <h1 className="mb-6 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white">
            Log into sirbax
          </h1>

          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              type="email"
              placeholder="Email or username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="h-12 rounded-lg border-neutral-300 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="h-12 rounded-lg border-neutral-300 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900"
            />
            <Button
              type="submit"
              className="h-12 w-full rounded-lg text-base font-semibold"
              loading={loading}
            >
              Log in
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/forgot-password" className="text-sm text-primary hover:underline">
              Forgot password?
            </Link>
          </div>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium uppercase text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-12 w-full rounded-lg border-2 border-primary/30 text-primary"
            onClick={async () => {
              setLoading(true);
              try {
                await loginWithGoogle();
                router.push("/home");
              } finally {
                setLoading(false);
              }
            }}
          >
            Continue with Google
          </Button>

          <Link href="/register" className="mt-4 block">
            <Button
              type="button"
              variant="outline"
              className="h-12 w-full rounded-lg text-primary"
            >
              Create new account
            </Button>
          </Link>

          <button
            type="button"
            onClick={() => {
              enterDemo();
              router.push("/home");
            }}
            className="mt-6 w-full text-center text-sm text-muted-foreground hover:text-foreground hover:underline"
          >
            Try demo mode
          </button>
        </div>
      </div>
    </div>
  );
}
