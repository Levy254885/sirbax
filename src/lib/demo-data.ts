import type { Post, Story } from "@/types";
import { generateDefaultAvatar } from "@/utils/nickname";

export const DEMO_STORIES: Story[] = [
  {
    id: "s1",
    authorId: "u1",
    authorNickname: "QuietFox_421",
    authorAvatar: generateDefaultAvatar("QuietFox_421"),
    type: "image",
    mediaUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
    viewersCount: 42,
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    privacy: "everyone",
  },
  {
    id: "s2",
    authorId: "u2",
    authorNickname: "BlueMoon_204",
    authorAvatar: generateDefaultAvatar("BlueMoon_204"),
    type: "image",
    mediaUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80",
    viewersCount: 18,
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    privacy: "everyone",
  },
  {
    id: "s3",
    authorId: "u3",
    authorNickname: "StormRider_731",
    authorAvatar: generateDefaultAvatar("StormRider_731"),
    type: "image",
    mediaUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80",
    viewersCount: 67,
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    privacy: "everyone",
  },
];

/** Single sample post with image for empty feeds / demo */
export const DEMO_POSTS: Post[] = [
  {
    id: "p1",
    authorId: "demo-uid-001",
    authorNickname: "SilentWolf_732",
    authorAvatar: generateDefaultAvatar("SilentWolf_732"),
    content:
      "Sometimes the smallest changes bring the biggest results. Keep going.",
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&q=80",
        width: 900,
        height: 600,
      },
    ],
    visibility: "everyone",
    hashtags: ["Motivation"],
    mentions: [],
    isEdited: false,
    commentsDisabled: false,
    sharesDisabled: false,
    likesCount: 24,
    commentsCount: 3,
    sharesCount: 1,
    reactions: { love: 12, like: 10, wow: 2 },
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
];
