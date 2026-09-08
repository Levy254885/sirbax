"use client";

import { createContext, useContext, useMemo, useState, useCallback, useEffect } from "react";
import { so, type Translations } from "@/lib/i18n/so";

type Lang = "so" | "en";

interface I18nValue {
  lang: Lang;
  t: Translations;
  setLang: (l: Lang) => void;
}

const I18nContext = createContext<I18nValue | undefined>(undefined);

const en: Translations = {
  ...so,
  appName: "sirbax",
  tagline1: "Share freely.",
  tagline2: "Connect anonymously.",
  welcomeBack: "Welcome back",
  signInContinue: "Sign in to continue to sirbax",
  emailOrUsername: "Email or username",
  password: "Password",
  forgotPassword: "Forgot password?",
  logIn: "Log in",
  orContinueWith: "Or continue with",
  noAccount: "Don't have an account?",
  signUp: "Sign up",
  tryDemo: "Try demo mode",
  createAccount: "Create your account",
  joinSirbax: "Join sirbax and be part of something bigger",
  emailAddress: "Email address",
  confirmPassword: "Confirm password",
  createAccountBtn: "Create account",
  haveAccount: "Already have an account?",
  getStarted: "Get Started",
  logInBtn: "Log In",
  yourAnonymousIdentity: "Your anonymous identity",
  knownByNickname: "You'll be known by a random nickname",
  canChangeLater: "(you can change it later)",
  newNickname: "New",
  addBioOptional: "Add a bio (optional)",
  fewWordsAboutYou: "A few words about you...",
  continue: "Continue",
  welcomeToSirbax: "Welcome to sirbax",
  realConversations: "Real conversations.",
  anonymousIdentities: "Anonymous identities.",
  skip: "Skip",
  home: "Home",
  explore: "Explore",
  messages: "Messages",
  profile: "Profile",
  create: "Create",
  notifications: "Notifications",
  settings: "Settings",
  saved: "Saved",
  communities: "Communities",
  events: "Events",
  marketplace: "Marketplace",
  memories: "Memories",
  whatsOnYourMind: "What's on your mind?",
  photo: "Photo",
  video: "Video",
  poll: "Poll",
  feeling: "Feeling",
  location: "Location",
  post: "Post",
  like: "Like",
  comment: "Comment",
  share: "Share",
  save: "Save",
  comments: "comments",
  shares: "shares",
  reactions: "reactions",
  createStory: "Create story",
  yourStory: "Your story",
  posts: "Posts",
  replies: "Replies",
  media: "Media",
  likes: "Likes",
  followers: "Followers",
  following: "Following",
  follow: "Follow",
  unfollow: "Unfollow",
  editProfile: "Edit profile",
  shareProfile: "Share profile",
  message: "Message",
  account: "Account",
  privacy: "Privacy",
  appearance: "Appearance",
  security: "Security",
  language: "Language",
  helpSupport: "Help & Support",
  blockedUsers: "Blocked users",
  mutedUsers: "Muted users",
  logOut: "Log out",
  signedInAs: "Signed in as",
  light: "Light",
  dark: "Dark",
  system: "System",
  whiteBackground: "White background",
  darkElegant: "Dark elegant theme",
  matchDevice: "Match device settings",
  searchConversations: "Search conversations...",
  writeComment: "Write a comment...",
  reply: "Reply",
  searchPlaceholder: "Search users, posts, hashtags...",
  forYou: "For You",
  trending: "Trending",
  people: "People",
  trendingTopics: "Trending Topics",
  suggestedPeople: "Suggested People",
  suggestedCommunities: "Suggested Communities",
  seeAll: "See all",
  join: "Join",
  all: "All",
  likedYourPost: "liked your post",
  commentedOnYourPost: "commented on your post",
  startedFollowingYou: "started following you",
  mentionedYou: "mentioned you",
  search: "Search",
  back: "Back",
  cancel: "Cancel",
  saveBtn: "Save",
  delete: "Delete",
  report: "Report",
  unblock: "Unblock",
  unmute: "Unmute",
  loading: "Loading...",
  noResults: "No results",
  posted: "Posted",
  sendResetLink: "Send reset link",
  resetPassword: "Reset your password",
  checkEmail: "Check your email",
  openEmailApp: "Open Email App",
  resendEmail: "Resend email",
  backToLogin: "Back to login",
};

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("so");

  useEffect(() => {
    const stored = localStorage.getItem("sirbax-lang") as Lang | null;
    if (stored === "en" || stored === "so") setLangState(stored);
    else {
      localStorage.setItem("sirbax-lang", "so");
      setLangState("so");
    }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("sirbax-lang", l);
  }, []);

  const t = useMemo(() => (lang === "en" ? en : so), [lang]);

  return (
    <I18nContext.Provider value={{ lang, t, setLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
