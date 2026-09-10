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
import { canChangeNow, daysUntilChangeAllowed, isNicknameTaken, reserveLocalNickname } from "@/services/userService";

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
  nicknameLower: "silentwolf_732",
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
    const nick = data.nickname || data.displayName || generateAnonymousNickname();
    if (!data.nicknameLower && data.nickname) {
      updateDoc(ref, { nicknameLower: String(data.nickname).toLowerCase() }).catch(() => {});
    }
    return {
      uid: fbUser.uid,
      nickname: nick,
      nicknameLower: data.nicknameLower || String(nick).toLowerCase(),
      avatarUrl: data.avatarUrl || data.profileImageUrl || generateDefaultAvatar(nick),
      bio: data.bio || "",
      followersCount: data.followersCount ?? 0,
      followingCount: data.followingCount ?? 0,
      postsCount: data.postsCount ?? 0,
      isPrivate: data.isPrivate ?? false,
      onboardingComplete: data.onboardingComplete ?? true,
      createdAt: data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || data.updatedAt || new Date().toISOString(),
      role: data.role || "user",
      lastNicknameChangeAt: data.lastNicknameChangeAt || undefined,
      lastAvatarChangeAt: data.lastAvatarChangeAt || undefined,
    };
  }

  const nickname = generateAnonymousNickname();
  const profile: UserProfile = {
    uid: fbUser.uid,
    nickname,
    nicknameLower: nickname.toLowerCase(),
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
    nicknameLower: nickname.toLowerCase(),
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
    reserveLocalNickname(DEMO_USER.nickname, DEMO_USER.uid);
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
        nicknameLower: nickname.toLowerCase(),
        avatarUrl: generateDefaultAvatar(nickname),
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        onboardingComplete: false,
      };
      setUser(newUser);
      localStorage.setItem("sirbax-demo-user", JSON.stringify(newUser));
      reserveLocalNickname(nickname, newUser.uid);
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
    const current = user;
    if (!current) return;

    let patch: Partial<UserProfile> = { ...data };

    if (patch.nickname !== undefined && patch.nickname !== current.nickname) {
      if (!canChangeNow(current.lastNicknameChangeAt)) {
        throw new Error(
          `Nickname can only change once every 7 days. Wait ${daysUntilChangeAllowed(current.lastNicknameChangeAt)} day(s).`
        );
      }
      const taken = await isNicknameTaken(patch.nickname, current.uid);
      if (taken) throw new Error("That nickname is already taken");
      patch = {
        ...patch,
        nicknameLower: patch.nickname.toLowerCase(),
        lastNicknameChangeAt: new Date().toISOString(),
      };
      reserveLocalNickname(patch.nickname, current.uid);
    }

    if (patch.avatarUrl !== undefined && patch.avatarUrl !== current.avatarUrl) {
      if (!canChangeNow(current.lastAvatarChangeAt)) {
        throw new Error(
          `Avatar can only change once every 7 days. Wait ${daysUntilChangeAllowed(current.lastAvatarChangeAt)} day(s).`
        );
      }
      patch = { ...patch, lastAvatarChangeAt: new Date().toISOString() };
    }

    const nextUser: UserProfile = {
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    setUser(nextUser);

    if (!isFirebaseConfigured || !auth.currentUser) {
      localStorage.setItem("sirbax-demo-user", JSON.stringify(nextUser));
      return;
    }

    const uid = auth.currentUser.uid;
    const payload: Record<string, unknown> = { updatedAt: serverTimestamp() };
    if (patch.nickname !== undefined) {
      payload.nickname = patch.nickname;
      payload.displayName = patch.nickname;
      payload.username = patch.nickname;
      payload.nicknameLower = String(patch.nickname).toLowerCase();
    }
    if (patch.bio !== undefined) payload.bio = patch.bio;
    if (patch.avatarUrl !== undefined) {
      payload.avatarUrl = patch.avatarUrl;
      payload.profileImageUrl = patch.avatarUrl;
    }
    if (patch.onboardingComplete !== undefined) payload.onboardingComplete = patch.onboardingComplete;
    if (patch.isPrivate !== undefined) payload.isPrivate = patch.isPrivate;
    if (patch.lastNicknameChangeAt !== undefined) payload.lastNicknameChangeAt = patch.lastNicknameChangeAt;
    if (patch.lastAvatarChangeAt !== undefined) payload.lastAvatarChangeAt = patch.lastAvatarChangeAt;

    await updateDoc(doc(db, "users", uid), payload);
  }, [user]);

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
