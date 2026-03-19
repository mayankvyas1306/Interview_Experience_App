"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

type Round = {
  roundName: string;
  description: string;
  questions: string[];
};

type PostDetails = {
  _id: string;
  companyName: string;
  role: string;
  tags: string[];
  difficulty: "Easy" | "Medium" | "Hard";
  result: "Selected" | "Rejected" | "Waiting";
  upvotesCount: number;
  createdAt: string;
  rounds: Round[];
  isAnonymous: boolean;
  authorId?: {
    _id?: string;
    fullName?: string;
    college?: string;
    year?: number;
  } | null;  // ← add null here for anonymous posts
};

type Comment = {
  _id: string;
  text: string;
  createdAt: string;
  userId?: {
    _id?: string;
    fullName?: string;
    college?: string;
    year?: number;
  };
};

const DIFFICULTY_BADGE: Record<string, string> = {
  Easy: "success",
  Medium: "warning",
  Hard: "danger",
};

const RESULT_BADGE: Record<string, string> = {
  Selected: "success",
  Rejected: "danger",
  Waiting: "secondary",
};

export default function PostDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  const { user } = useAuth();

  const [post, setPost] = useState<PostDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const [upvoting, setUpvoting] = useState(false);
  const [saving, setSaving] = useState(false);

  const [isSaved, setIsSaved] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [hasReported, setHasReported] = useState(false);


  // ✅ ADDED STATE
  const [isUpvoted, setIsUpvoted] = useState(false);

  const isOwner =
    !!user && !!post?.authorId && user.id === (post.authorId as any)._id;

  // ─────────────────────────────────────────────
  // LOAD POST + COMMENTS
  // ─────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [postRes, commentsRes] = await Promise.all([
          api.get(`/posts/${postId}`),
          api.get(`/comments/${postId}`),
        ]);

        if (isMounted) {
          setPost(postRes.data.post);
          setComments(commentsRes.data.comments);
        }
      } catch (err: any) {
        if (isMounted) {
          toast.error(err?.response?.data?.message || "Failed to load post");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [postId]);

  // ─────────────────────────────────────────────
  // CHECK SAVE + UPVOTE STATUS
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const checkStatus = async () => {
      try {
        const [saveRes, upvoteRes] = await Promise.all([
          api.get(`/users/save-status/${postId}`),
          api.get(`/posts/${postId}/upvote-status`),
        ]);

        setIsSaved(saveRes.data.saved);
        setIsUpvoted(upvoteRes.data.upvoted);
      } catch {
        // silent
      }
    };

    checkStatus();
  }, [user, postId]);

  // ─────────────────────────────────────────────
  // UPVOTE
  // ─────────────────────────────────────────────
  const handleUpvote = async () => {
    if (!user) {
      toast.error("Please login to upvote");
      router.push("/auth/login");
      return;
    }

    if (upvoting || !post) return;

    // Optimistic update
    const prevCount = post.upvotesCount;
    const prevUpvoted = isUpvoted;

    setPost({
      ...post,
      upvotesCount: isUpvoted
        ? Math.max(0, post.upvotesCount - 1)
        : post.upvotesCount + 1,
    });

    setIsUpvoted(!isUpvoted);

    try {
      setUpvoting(true);

      const res = await api.patch(`/posts/${postId}/upvote`);

      setPost((prev) =>
        prev ? { ...prev, upvotesCount: res.data.upvotesCount } : prev
      );

      setIsUpvoted(res.data.upvoted);

      toast.success(res.data.message);
    } catch (err: any) {
      // revert
      setPost((prev) =>
        prev ? { ...prev, upvotesCount: prevCount } : prev
      );

      setIsUpvoted(prevUpvoted);

      toast.error(err?.response?.data?.message || "Upvote failed");
    } finally {
      setUpvoting(false);
    }
  };

  // ─────────────────────────────────────────────
  // SAVE
  // ─────────────────────────────────────────────
  const handleSave = async () => {
    if (!user) {
      toast.error("Please login to save posts");
      router.push("/auth/login");
      return;
    }

    if (saving) return;

    try {
      setSaving(true);

      const res = await api.patch(`/users/save/${postId}`);

      const nowSaved = res.data.saved;

      setIsSaved(nowSaved);

      toast.success(res.data.message, {
        icon: nowSaved ? "⭐" : "📌",
      });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };


  const handleReport = async () => {
    if (!user) {
      toast.error("Please login to report posts");
      router.push("/auth/login");
      return;
    }

    if (hasReported || reporting) return;

    const reason = prompt(
      "Why are you reporting this post?\n\nOptions: spam, inappropriate, fake, harassment, other\n\nType one of the above:"
    );

    if (!reason) return;

    const validReasons = ["spam", "inappropriate", "fake", "harassment", "other"];
    if (!validReasons.includes(reason.toLowerCase().trim())) {
      toast.error("Invalid reason. Use: spam, inappropriate, fake, harassment, or other");
      return;
    }

    try {
      setReporting(true);
      await api.post(`/reports/${postId}`, { reason: reason.toLowerCase().trim() });
      setHasReported(true);
      toast.success("Report submitted. Thank you for keeping the community safe.");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to submit report";
      toast.error(msg);
      if (err?.response?.status === 409) setHasReported(true);
    } finally {
      setReporting(false);
    }
  };

  // ─────────────────────────────────────────────
  // COMMENT
  // ─────────────────────────────────────────────
  const handleAddComment = async () => {
    if (!user) {
      toast.error("Please login to comment");
      router.push("/auth/login");
      return;
    }

    if (!commentText.trim()) {
      toast.error("Write a comment first");
      return;
    }

    try {
      setCommentLoading(true);

      const res = await api.post(`/comments/${postId}`, {
        text: commentText,
      });

      toast.success(res.data.message);

      setCommentText("");

      const commentsRes = await api.get(`/comments/${postId}`);

      setComments(commentsRes.data.comments);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to add comment");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await api.delete(`/comments/${commentId}`);

      toast.success(res.data.message);

      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete comment");
    }
  };

  // ─────────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="container py-5 text-center text-muted2">
        <div className="spinner-border text-light"></div>
        <div className="mt-3">Loading post...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container py-5 text-center text-muted2">
        Post not found
      </div>
    );
  }

  return (
    <div className="container py-5">

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="glass glow-border p-4 p-md-5 rounded-4 mb-4"
      >
        <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">

          <div>
            <h2 className="fw-bold mb-1">{post.companyName}</h2>

            <div className="text-muted2">
              <i className="bi bi-briefcase me-2"></i>
              {post.role}
            </div>

            <div className="mt-2 d-flex gap-2 flex-wrap">
              <span className={`badge bg-${DIFFICULTY_BADGE[post.difficulty]}`}>
                {post.difficulty}
              </span>

              <span className={`badge bg-${RESULT_BADGE[post.result]}`}>
                {post.result}
              </span>
            </div>

            <div className="mt-3 d-flex gap-2 flex-wrap">
              {post.tags?.map((tag) => (
                <span
                  key={tag}
                  className="badge rounded-pill"
                  style={{
                    background: "rgba(0,212,255,0.12)",
                    border: "1px solid rgba(0,212,255,0.30)",
                    color: "rgba(255,255,255,0.9)",
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <div className="d-flex gap-2 flex-wrap">

            <button
              onClick={handleUpvote}
              disabled={upvoting}
              className={`btn rounded-3 ${isUpvoted ? "btn-accent" : "btn-outline-light"
                }`}
            >
              {upvoting ? (
                <span className="spinner-border spinner-border-sm me-2"></span>
              ) : (
                <i className="bi bi-arrow-up-circle me-2"></i>
              )}
              Upvote ({post.upvotesCount})
            </button>

            {isOwner && (
              <Link
                href={`/edit/${post._id}`}
                className="btn btn-accent rounded-3"
              >
                <i className="bi bi-pencil-square me-2"></i>
                Edit Post
              </Link>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className={`btn rounded-3 ${isSaved ? "btn-accent" : "btn-outline-light"
                }`}
            >
              {saving ? (
                <span className="spinner-border spinner-border-sm me-2"></span>
              ) : (
                <i
                  className={`bi ${isSaved ? "bi-bookmark-fill" : "bi-bookmark-star"
                    } me-2`}
                ></i>
              )}
              {isSaved ? "Saved" : "Save"}
            </button>
            <button
              onClick={handleReport}
              disabled={reporting || hasReported}
              className="btn btn-outline-secondary rounded-3"
              title={hasReported ? "Already reported" : "Report post"}
            >
              <i className={`bi ${hasReported ? "bi-flag-fill" : "bi-flag"} me-1`}></i>
              {hasReported ? "Reported" : "Report"}
            </button>

          </div>
        </div>
      </motion.div>

    </div>
  );
}