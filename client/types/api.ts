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

export interface AIPostAnalysis {
  postId: string;
  generatedAt: string;
  analysis: {
    difficulty_rating: "Easy" | "Medium" | "Hard";
    difficulty_explanation: string;
    key_topics: string[];
    preparation_tips: string[];
    resources: {
      title: string;
      type: "Book" | "Course" | "Website" | "Practice";
      description: string;
    }[];
    success_factors: string;
    common_mistakes: string;
  };
}

export interface AIPrepGuide {
  company: string;
  role: string | null;
  basedOnPosts: number;
  generatedAt: string;
  guide: {
    overview: string;
    difficulty: "Easy" | "Medium" | "Hard";
    typical_rounds: {
      name: string;
      description: string;
      duration: string;
    }[];
    key_topics: {
      topic: string;
      importance: "High" | "Medium" | "Low";
      description: string;
    }[];
    preparation_timeline: {
      week: string;
      focus: string;
      resources: string[];
    }[];
    tips: string[];
    red_flags: string[];
    salary_negotiation: string;
  };
}

export interface AIComparison {
  company1: string;
  company2: string;
  role: string | null;
  dataPoints: Record<string, number>;
  generatedAt: string;
  comparison: {
    summary: string;
    difficulty_comparison: Record<string, { rating: string; reason: string }>;
    process_comparison: Record<string, string>[];
    better_for_beginners: string;
    better_for_experienced: string;
    unique_challenges: Record<string, string[]>;
    recommendation: string;
  };
}

export interface AIPracticeQuestion {
  question: string;
  type: "Coding" | "System Design" | "Behavioral" | "Theory" | "Math";
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
  hint: string;
  what_they_test: string;
}

export interface AIPracticeSet {
  company: string | null;
  role: string | null;
  topic: string | null;
  basedOnRealData: boolean;
  generatedAt: string;
  questions: AIPracticeQuestion[];
}