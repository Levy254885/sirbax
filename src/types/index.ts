export type Theme = "light" | "dark" | "system";

export type ReactionType = "like" | "love" | "care" | "haha" | "wow" | "sad" | "angry";

export type PostVisibility = "everyone" | "followers" | "community" | "only_me";

export type CommunityPrivacy = "public" | "private" | "hidden";

export type ReportCategory =
  | "spam"
  | "harassment"
  | "hate"
  | "threats"
  | "sexual_content"
  | "violence"
  | "scam"
  | "impersonation"
  | "other";

export interface UserProfile {
  uid: string;
  nickname: string;
  avatarUrl: string;
  coverUrl?: string;
  bio?: string;
  website?: string;
  interests?: string[];
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isPrivate: boolean;
  isOnline?: boolean;
  lastSeen?: string;
  createdAt: string;
  updatedAt: string;
  onboardingComplete: boolean;
  role?: "user" | "moderator" | "admin";
}

export interface Post {
  id: string;
  authorId: string;
  authorNickname: string;
  authorAvatar: string;
  content: string;
  media?: MediaItem[];
  visibility: PostVisibility;
  communityId?: string;
  communityName?: string;
  hashtags: string[];
  mentions: string[];
  feeling?: string;
  location?: string;
  poll?: Poll;
  isEdited: boolean;
  commentsDisabled: boolean;
  sharesDisabled: boolean;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  reactions: Partial<Record<ReactionType, number>>;
  createdAt: string;
  updatedAt: string;
  sharedPostId?: string;
  sharedPost?: Post;
}

export interface MediaItem {
  type: "image" | "video" | "gif";
  url: string;
  publicId?: string;
  width?: number;
  height?: number;
  thumbnailUrl?: string;
}

export interface Poll {
  question: string;
  options: { id: string; text: string; votes: number }[];
  endsAt?: string;
  totalVotes: number;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorNickname: string;
  authorAvatar: string;
  content: string;
  parentId?: string;
  media?: MediaItem[];
  likesCount: number;
  repliesCount: number;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Story {
  id: string;
  authorId: string;
  authorNickname: string;
  authorAvatar: string;
  type: "text" | "image" | "video" | "poll" | "question";
  content?: string;
  mediaUrl?: string;
  backgroundColor?: string;
  viewersCount: number;
  expiresAt: string;
  createdAt: string;
  privacy: "everyone" | "followers" | "close_friends";
}

export interface Conversation {
  id: string;
  participants: string[];
  participantProfiles: { uid: string; nickname: string; avatarUrl: string }[];
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderNickname: string;
  content: string;
  media?: MediaItem[];
  replyToId?: string;
  reactions?: Partial<Record<ReactionType, string[]>>;
  isRead: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type:
    | "like"
    | "reaction"
    | "comment"
    | "reply"
    | "follow"
    | "follow_request"
    | "mention"
    | "message"
    | "group"
    | "story"
    | "share"
    | "system";
  actorId: string;
  actorNickname: string;
  actorAvatar: string;
  targetId?: string;
  targetType?: "post" | "comment" | "story" | "community";
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
  coverUrl?: string;
  privacy: CommunityPrivacy;
  membersCount: number;
  postsCount: number;
  rules?: string[];
  createdBy: string;
  admins: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  date: string;
  time: string;
  location?: string;
  isOnline: boolean;
  organizerId: string;
  organizerNickname: string;
  interestedCount: number;
  goingCount: number;
  createdAt: string;
}

export interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  condition: "new" | "used" | "refurbished";
  images: string[];
  location?: string;
  sellerId: string;
  sellerNickname: string;
  sellerAvatar: string;
  status: "active" | "sold" | "removed";
  createdAt: string;
}

export interface SavedCollection {
  id: string;
  userId: string;
  name: string;
  icon?: string;
  postsCount: number;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  targetId: string;
  targetType: "post" | "comment" | "user" | "message" | "story" | "community";
  category: ReportCategory;
  description?: string;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  createdAt: string;
}
