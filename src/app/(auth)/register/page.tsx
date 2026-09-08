"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import toast from "@/lib/toast";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { registerWithEmail, loginWithGoogle } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || password.length < 6) {
      toast.error("Valid email and password (min 6 chars) required");
      return;
    }
    setLoading(true);
    try {
      await registerWithEmail(email, password);
      toast.success("Welcome to sirbax!");
      router.push("/onboarding");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-black">
      <div className="relative hidden w-1/2 flex-col items-center justify-center bg-[#f0f2f5] dark:bg-[#0a0a0a] lg:flex">
        <div className="absolute left-8 top-8"><Logo size="md" /></div>
        <div className="max-w-md px-12 text-center">
          <h2 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Join a community of{" "}
            <span className="text-primary">anonymous people.</span>
          </h2>
          <p className="mt-4 text-neutral-500">
            No real names. Just real conversations.
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 flex justify-center lg:hidden"><Logo size="lg" /></div>
          <h1 className="mb-2 text-2xl font-semibold tracking-tight">Create your account</h1>
          <p className="mb-6 text-sm text-muted-foreground">You&apos;ll get a random anonymous nickname.</p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <Input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 rounded-lg" />
            <Input type="password" placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="h-12 rounded-lg" />
            <Button type="submit" className="h-12 w-full rounded-lg text-base font-semibold" loading={loading}>Sign Up</Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="h-12 w-full rounded-lg" onClick={async () => { setLoading(true); try { await loginWithGoogle(); router.push("/home"); } finally { setLoading(false); } }}>
            Continue with Google
          </Button>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
