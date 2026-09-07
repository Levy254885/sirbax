import type { UserProfile } from "@/types";
import { generateAnonymousNickname, generateDefaultAvatar } from "@/utils/nickname";

export async function createUserProfile(
  uid: string,
  overrides?: Partial<UserProfile>
): Promise<UserProfile> {
  const nickname = overrides?.nickname || generateAnonymousNickname();
  const profile: UserProfile = {
    uid,
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
    ...overrides,
  };
  return profile;
}

export async function isNicknameAvailable(nickname: string): Promise<boolean> {
  void nickname;
  return true;
}

export async function updateNickname(
  uid: string,
  newNickname: string
): Promise<void> {
  void uid;
  void newNickname;
}
