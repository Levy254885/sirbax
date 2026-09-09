"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * Entry: guests go to sign-in, signed-in users go to the feed.
 */
export default function RootPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(isAuthenticated ? "/home" : "/login");
  }, [isAuthenticated, loading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
    </div>
  );
}
