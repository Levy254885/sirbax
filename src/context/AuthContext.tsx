"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { UserProfile } from "@/types";
import { generateAnonymousNickname, generateDefaultAvatar } from "@/utils/nickname";

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  enterDemo: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const DEMO_USER: UserProfile = {
  uid: "demo-uid-001",
  nickname: "SilentWolf_732",
  avatarUrl: generateDefaultAvatar("SilentWolf_732"),
  bio: "Just a curious mind. Here for good vibes and great conversations.",
  followersCount: 1240,
  followingCount: 342,
  postsCount: 56,
  isPrivate: false,
  onboardingComplete: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  role: "user",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const demo = localStorage.getItem("sirbax-demo-user");
    if (demo) {
      try {
        setUser(JSON.parse(demo));
      } catch {
        localStorage.removeItem("sirbax-demo-user");
      }
    }
    setLoading(false);
  }, []);

  const enterDemo = useCallback(() => {
    setUser(DEMO_USER);
    localStorage.setItem("sirbax-demo-user", JSON.stringify(DEMO_USER));
  }, []);

  const loginWithEmail = useCallback(async (email: string, _password: string) => {
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      enterDemo();
      return;
    }
    throw new Error("Firebase not fully configured yet. Use demo mode.");
  }, [enterDemo]);

  const registerWithEmail = useCallback(async (email: string, _password: string) => {
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      const nickname = generateAnonymousNickname();
      const newUser: UserProfile = {
        ...DEMO_USER,
        uid: `demo-${Date.now()}`,
        nickname,
        avatarUrl: generateDefaultAvatar(nickname),
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        onboardingComplete: false,
      };
      setUser(newUser);
      localStorage.setItem("sirbax-demo-user", JSON.stringify(newUser));
      return;
    }
    throw new Error("Firebase not fully configured yet.");
  }, []);

  const loginWithGoogle = useCallback(async () => {
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      enterDemo();
      return;
    }
    throw new Error("Firebase not fully configured yet.");
  }, [enterDemo]);

  const logout = useCallback(async () => {
    setUser(null);
    localStorage.removeItem("sirbax-demo-user");
  }, []);

  const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...data, updatedAt: new Date().toISOString() };
      localStorage.setItem("sirbax-demo-user", JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      loginWithEmail,
      registerWithEmail,
      loginWithGoogle,
      logout,
      updateProfile,
      enterDemo,
    }),
    [user, loading, loginWithEmail, registerWithEmail, loginWithGoogle, logout, updateProfile, enterDemo]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
