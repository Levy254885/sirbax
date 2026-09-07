"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();

  const handleContinue = async () => {
    await updateProfile({ onboardingComplete: true });
    router.push("/home");
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-end overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
      </div>

      <div className="w-full max-w-md px-6 pb-16 text-center text-white">
        <h1 className="mb-3 text-3xl font-bold">Welcome to sirbax</h1>
        <p className="mb-2 text-lg text-slate-200">Your identity stays yours.</p>
        <p className="mb-8 text-sm text-slate-300">
          You are posting as{" "}
          <span className="font-semibold text-white">
            {user?.nickname || "SilentWolf_732"}
          </span>
          . Explore. Share. Connect.
        </p>
        <Button
          size="lg"
          className="w-full bg-blue-500 hover:bg-blue-600"
          onClick={handleContinue}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
