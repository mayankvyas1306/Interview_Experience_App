export interface Author {
  _id: string;
  fullName: string;
  email?: string;
  college?: string;
  year?: number;
}

export interface Round {
  roundName: string;
  description: string;
  questions: string[];
}

export type Difficulty = "Easy" | "Medium" | "Hard";
export type Result = "Selected" | "Rejected" | "Waiting";
export type UserRole = "user" | "admin";
export type NotificationType = "upvote" | "comment" | "system";
export type ReportReason = "spam" | "inappropriate" | "fake" | "harassment" | "other";
export type ReportStatus = "pending" | "reviewed" | "dismissed" | "actioned";

export interface Post {
  _id: string;
  companyName: string;
  role: string;
  tags: string[];
  difficulty: Difficulty;
  result: Result;
  upvotesCount: number;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
  rounds: Round[];
  authorId?: Author | null;
}

export interface Comment {
  _id: string;
  text: string;
  createdAt: string;
  postId: string;
  userId?: {
    _id: string;
    fullName: string;
    college?: string;
    year?: number;
  };
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  college?: string;
  year?: number;
  reputation?: number;
  rank?: string;
}

export interface Notification {
  _id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: string;
  postId?: { _id: string; companyName: string; role: string } | null;
  senderId?: { fullName: string } | null;
}

export interface Report {
  _id: string;
  reason: ReportReason;
  status: ReportStatus;
  details: string;
  createdAt: string;
  reporterId?: { fullName: string; email: string } | null;
  postId?: { _id: string; companyName: string; role: string } | null;
}

export interface PaginatedResponse<T> {
  page: number;
  limit: number;
  totalPosts: number;
  totalPages: number;
  posts: T[];
}

export interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  topCompanies: { _id: string; count: number }[];
}