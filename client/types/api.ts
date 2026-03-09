// Shared types for API responses

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

export interface Post {
  _id: string;
  companyName: string;
  role: string;
  tags: string[];
  difficulty: Difficulty;
  result: Result;
  upvotesCount: number;
  upvotedBy?: string[];
  createdAt: string;
  updatedAt: string;
  rounds: Round[];
  authorId?: Author;
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