"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "@/firebase/config";
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

async function fetchOrCreateProfile(fbUser: FirebaseUser): Promise<UserProfile> {
  const ref = doc(db, "users", fbUser.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const data = snap.data();
    return {
      uid: fbUser.uid,
      nickname: data.nickname || data.displayName || generateAnonymousNickname(),
      avatarUrl: data.avatarUrl || data.profileImageUrl || generateDefaultAvatar(data.nickname || "user"),
      bio: data.bio || "",
      followersCount: data.followersCount ?? 0,
      followingCount: data.followingCount ?? 0,
      postsCount: data.postsCount ?? 0,
      isPrivate: data.isPrivate ?? false,
      onboardingComplete: data.onboardingComplete ?? true,
      createdAt: data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || data.updatedAt || new Date().toISOString(),
      role: data.role || "user",
    };
  }

  const nickname = generateAnonymousNickname();
  const profile: UserProfile = {
    uid: fbUser.uid,
    nickname,
    avatarUrl: generateDefaultAvatar(nickname),
    bio: "",
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
    isPrivate: false,
    onboardingComplete: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    role: "user",
  };

  await setDoc(ref, {
    nickname: profile.nickname,
    displayName: profile.nickname,
    username: profile.nickname,
    bio: profile.bio,
    avatarUrl: profile.avatarUrl,
    profileImageUrl: profile.avatarUrl,
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
    isPrivate: false,
    onboardingComplete: false,
    role: "user",
    email: fbUser.email || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return profile;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      const demo = localStorage.getItem("sirbax-demo-user");
      if (demo) {
        try {
          setUser(JSON.parse(demo));
        } catch {
          localStorage.removeItem("sirbax-demo-user");
        }
      }
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      try {
        if (fbUser) {
          const profile = await fetchOrCreateProfile(fbUser);
          setUser(profile);
          localStorage.removeItem("sirbax-demo-user");
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error("Auth profile load failed", e);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const enterDemo = useCallback(() => {
    setUser(DEMO_USER);
    localStorage.setItem("sirbax-demo-user", JSON.stringify(DEMO_USER));
  }, []);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    if (!isFirebaseConfigured) {
      enterDemo();
      return;
    }
    await signInWithEmailAndPassword(auth, email.trim(), password);
  }, [enterDemo]);

  const registerWithEmail = useCallback(async (email: string, password: string) => {
    if (!isFirebaseConfigured) {
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
    await createUserWithEmailAndPassword(auth, email.trim(), password);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    if (!isFirebaseConfigured) {
      enterDemo();
      return;
    }
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }, [enterDemo]);

  const logout = useCallback(async () => {
    localStorage.removeItem("sirbax-demo-user");
    setUser(null);
    if (isFirebaseConfigured) {
      await signOut(auth);
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return prev;
      return { ...prev, ...data, updatedAt: new Date().toISOString() };
    });

    if (!isFirebaseConfigured || !auth.currentUser) {
      setUser((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...data, updatedAt: new Date().toISOString() };
        localStorage.setItem("sirbax-demo-user", JSON.stringify(next));
        return next;
      });
      return;
    }

    const uid = auth.currentUser.uid;
    const payload: Record<string, unknown> = { updatedAt: serverTimestamp() };
    if (data.nickname !== undefined) {
      payload.nickname = data.nickname;
      payload.displayName = data.nickname;
      payload.username = data.nickname;
    }
    if (data.bio !== undefined) payload.bio = data.bio;
    if (data.avatarUrl !== undefined) {
      payload.avatarUrl = data.avatarUrl;
      payload.profileImageUrl = data.avatarUrl;
    }
    if (data.onboardingComplete !== undefined) payload.onboardingComplete = data.onboardingComplete;
    if (data.isPrivate !== undefined) payload.isPrivate = data.isPrivate;

    await updateDoc(doc(db, "users", uid), payload);
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
