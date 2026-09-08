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
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const { registerWithEmail, loginWithGoogle } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || password.length < 6) {
      toast.error("Valid email and password (min 6 chars) required");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
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
    <div className="flex min-h-screen flex-col bg-background">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-10">
        <div className="mb-10 flex flex-col items-center text-center">
          <Logo size="lg" showText={false} />
          <h1 className="mt-5 text-2xl font-bold tracking-tight">Create your account</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Join sirbax and be part of something bigger</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete="new-password" />
          <Input type="password" placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={6} autoComplete="new-password" />
          <Button type="submit" size="lg" className="mt-2 w-full" loading={loading}>Create account</Button>
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
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
