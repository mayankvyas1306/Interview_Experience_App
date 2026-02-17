"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast"; // ✅ FIX: No Toaster import
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type Post = {
  _id: string;
  companyName: string;
  role: string;
  tags: string[];
  difficulty: "Easy" | "Medium" | "Hard";
  result: "Selected" | "Rejected" | "Waiting";
  upvotesCount: number;
  createdAt: string;
  authorId?: {
    fullName?: string;
    college?: string;
    year?: number;
  };
};

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: "#00FFB2",
  Medium: "#FFD166",
  Hard: "#FF6B6B",
};

const RESULT_COLOR: Record<string, string> = {
  Selected: "#00FFB2",
  Rejected: "#FF6B6B",
  Waiting: "#aaa",
};

export default function PostCard({ post }: { post: Post }) {
  const { user } = useAuth();
  const router = useRouter();

  const [upvotesCount, setUpvotesCount] = useState(post.upvotesCount || 0);
  const [upvoting, setUpvoting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // ─────────────────────────────────────────────
  // UPVOTE
  // ✅ FIX: Redirect to login if not authenticated
  //         Prevents unauthenticated upvotes from PostCard
  // ─────────────────────────────────────────────
  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent card navigation
    e.stopPropagation();

    if (!user) {
      toast.error("Please login to upvote");
      router.push("/auth/login");
      return;
    }

    if (upvoting) return;

    try {
      setUpvoting(true);
      const res = await api.patch(`/posts/${post._id}/upvote`);
      setUpvotesCount(res.data.upvotesCount);
      toast.success(res.data.message, { duration: 1500 });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Upvote failed");
    } finally {
      setUpvoting(false);
    }
  };

  // ─────────────────────────────────────────────
  // SAVE
  // ✅ FIX: Redirect to login if not authenticated
  //         Prevents unauthenticated saves from PostCard
  // ─────────────────────────────────────────────
  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please login to save posts");
      router.push("/auth/login");
      return;
    }

    if (saving) return;

    try {
      setSaving(true);
      const res = await api.patch(`/users/save/${post._id}`);
      const nowSaved = res.data.saved;
      setIsSaved(nowSaved);
      toast.success(res.data.message, {
        icon: nowSaved ? "⭐" : "📌",
        duration: 1500,
      });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass rounded-4 p-4 h-100 d-flex flex-column">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-2">
        <div>
          <h5 className="fw-bold mb-1">{post.companyName}</h5>
          <div className="text-muted2 small">
            <i className="bi bi-briefcase me-1"></i>
            {post.role}
          </div>
        </div>
        <div className="d-flex flex-column align-items-end gap-1">
          <span
            className="badge rounded-pill"
            style={{
              background: `${DIFFICULTY_COLOR[post.difficulty]}22`,
              color: DIFFICULTY_COLOR[post.difficulty],
              border: `1px solid ${DIFFICULTY_COLOR[post.difficulty]}44`,
            }}
          >
            {post.difficulty}
          </span>
          <span
            className="badge rounded-pill"
            style={{
              background: `${RESULT_COLOR[post.result]}22`,
              color: RESULT_COLOR[post.result],
              border: `1px solid ${RESULT_COLOR[post.result]}44`,
            }}
          >
            {post.result}
          </span>
        </div>
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="d-flex gap-1 flex-wrap mb-3">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="badge rounded-pill"
              style={{
                background: "rgba(0,212,255,0.10)",
                border: "1px solid rgba(0,212,255,0.25)",
                color: "rgba(255,255,255,0.8)",
                fontSize: "0.7rem",
              }}
            >
              #{tag}
            </span>
          ))}
          {post.tags.length > 3 && (
            <span className="text-muted2 small align-self-center">
              +{post.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Author */}
      <div className="text-muted2 small mb-3">
        <i className="bi bi-person-circle me-1"></i>
        {post.authorId?.fullName || "Anonymous"}
        {post.authorId?.college && (
          <span className="ms-1">• {post.authorId.college}</span>
        )}
        <div className="mt-1">
          <i className="bi bi-calendar-event me-1"></i>
          {new Date(post.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-grow-1"></div>

      {/* Footer: Actions */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div className="d-flex gap-2">
          {/* ✅ FIX: Auth-gated upvote button - always visible, redirects on click if not logged in */}
          <button
            onClick={handleUpvote}
            disabled={upvoting}
            className="btn btn-sm btn-outline-light rounded-3"
            title={!user ? "Login to upvote" : "Upvote"}
          >
            {upvoting ? (
              <span className="spinner-border spinner-border-sm"></span>
            ) : (
              <>
                <i className="bi bi-arrow-up-circle me-1"></i>
                {upvotesCount}
              </>
            )}
          </button>

          {/* ✅ FIX: Auth-gated save button - always visible, redirects on click if not logged in */}
          <button
            onClick={handleSave}
            disabled={saving}
            className={`btn btn-sm rounded-3 ${isSaved ? "btn-accent" : "btn-outline-light"}`}
            title={!user ? "Login to save" : isSaved ? "Unsave" : "Save"}
          >
            {saving ? (
              <span className="spinner-border spinner-border-sm"></span>
            ) : (
              <i
                className={`bi ${isSaved ? "bi-bookmark-fill" : "bi-bookmark"}`}
              ></i>
            )}
          </button>
        </div>

        <Link
          href={`/post/${post._id}`}
          className="btn btn-sm btn-outline-light rounded-3"
        >
          View <i className="bi bi-arrow-right ms-1"></i>
        </Link>
      </div>
    </div>
  );
}
