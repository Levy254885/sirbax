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
    <div className="flex min-h-screen flex-col bg-background">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-10">
        <div className="mb-10 flex flex-col items-center text-center">
          <Logo size="lg" showText={false} />
          <h1 className="mt-5 text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Sign in to continue to sirbax</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input type="email" placeholder="Email or username" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">Forgot password?</Link>
          </div>
          <Button type="submit" size="lg" className="w-full" loading={loading}>Log in</Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">Or continue with</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button type="button" variant="outline" className="w-full" onClick={async () => { setLoading(true); try { await loginWithGoogle(); router.push("/home"); } finally { setLoading(false); } }}>Google</Button>
          <Button type="button" variant="outline" className="w-full" disabled>Apple</Button>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-primary hover:underline">Sign up</Link>
        </p>

        <button type="button" onClick={() => { enterDemo(); router.push("/home"); }} className="mt-4 text-center text-xs text-muted-foreground hover:text-foreground hover:underline">
          Try demo mode
        </button>
      </div>
    </div>
  );
}
