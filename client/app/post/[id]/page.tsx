"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import AIInsights from "@/components/AIInsights";

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
  } | null;
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
  const [isUpvoted, setIsUpvoted] = useState(false);

  const [reporting, setReporting] = useState(false);
  const [hasReported, setHasReported] = useState(false);

  const isOwner =
    !!user && !!post?.authorId && user.id === (post.authorId as any)._id;

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
      } catch { }
    };

    checkStatus();
  }, [user, postId]);

  const handleUpvote = async () => {
    if (!user) {
      toast.error("Please login to upvote");
      router.push("/auth/login");
      return;
    }
    if (upvoting || !post) return;

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
      setPost((prev) =>
        prev ? { ...prev, upvotesCount: prevCount } : prev
      );
      setIsUpvoted(prevUpvoted);
      toast.error(err?.response?.data?.message || "Upvote failed");
    } finally {
      setUpvoting(false);
    }
  };

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
      setIsSaved(res.data.saved);
      toast.success(res.data.message);
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

    const reason = prompt("Reason for reporting (spam/inappropriate/fake/harassment/other):");
    if (!reason) return;

    try {
      setReporting(true);
      await api.post(`/reports/${postId}`, { reason });
      setHasReported(true);
      toast.success("Report submitted");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to report");
    } finally {
      setReporting(false);
    }
  };

  const handleAddComment = async () => {
    if (!user) {
      toast.error("Please login to comment");
      router.push("/auth/login");
      return;
    }
    if (!commentText.trim()) return;

    try {
      setCommentLoading(true);
      const res = await api.post(`/comments/${postId}`, { text: commentText });
      setComments((prev) => [res.data.comment, ...prev]);
      setCommentText("");
      toast.success("Comment added");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to add comment");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success("Comment deleted");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete comment");
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container py-5 text-center">
        <div className="glass rounded-4 p-5">
          <h4 className="fw-bold">Post not found</h4>
          <Link href="/explore" className="btn btn-accent mt-3">
            Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="btn btn-outline-light rounded-3 mb-4"
      >
        <i className="bi bi-arrow-left me-2"></i>Back
      </button>

      <div className="row g-4">
        {/* LEFT: Post Details */}
        <div className="col-lg-7">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-4 p-4 mb-4"
          >
            {/* Header */}
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
              <div>
                <h2 className="fw-bold mb-1">{post.companyName}</h2>
                <div className="text-muted2 mb-2">
                  <i className="bi bi-briefcase me-1"></i>
                  {post.role}
                </div>
              </div>
              <div className="d-flex flex-column gap-2 align-items-end">
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
              <div className="d-flex flex-wrap gap-2 mb-3">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="badge rounded-pill"
                    style={{
                      background: "rgba(0,212,255,0.10)",
                      border: "1px solid rgba(0,212,255,0.25)",
                      color: "rgba(255,255,255,0.8)",
                      fontSize: "0.75rem",
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Author & Date */}
            <div className="d-flex justify-content-between align-items-center text-muted2 small mb-4 flex-wrap gap-2">
              <div>
                <i className="bi bi-person-circle me-1"></i>
                {post.isAnonymous || !post.authorId
                  ? "Anonymous"
                  : post.authorId.fullName}
                {!post.isAnonymous && post.authorId?.college && (
                  <span className="ms-1">• {post.authorId.college}</span>
                )}
                {!post.isAnonymous && post.authorId?.year && (
                  <span className="ms-1">• Year {post.authorId.year}</span>
                )}
              </div>
              <div>
                <i className="bi bi-calendar-event me-1"></i>
                {new Date(post.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="d-flex gap-2 flex-wrap">
              <button
                onClick={handleUpvote}
                disabled={upvoting}
                className={`btn rounded-3 ${isUpvoted ? "btn-accent" : "btn-outline-light"
                  }`}
              >
                {upvoting ? (
                  <span className="spinner-border spinner-border-sm me-1"></span>
                ) : (
                  <i className="bi bi-arrow-up-circle me-1"></i>
                )}
                {post.upvotesCount} Upvotes
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className={`btn rounded-3 ${isSaved ? "btn-accent" : "btn-outline-light"
                  }`}
              >
                {saving ? (
                  <span className="spinner-border spinner-border-sm me-1"></span>
                ) : (
                  <i
                    className={`bi ${isSaved ? "bi-bookmark-fill" : "bi-bookmark"
                      } me-1`}
                  ></i>
                )}
                {isSaved ? "Saved" : "Save"}
              </button>

              {isOwner && (
                <>
                  <Link
                    href={`/edit/${post._id}`}
                    className="btn btn-outline-warning rounded-3"
                  >
                    <i className="bi bi-pencil me-1"></i>Edit
                  </Link>
                </>
              )}

              {!isOwner && (
                <button
                  onClick={handleReport}
                  disabled={reporting || hasReported}
                  className="btn btn-outline-danger rounded-3"
                >
                  <i className="bi bi-flag me-1"></i>
                  {hasReported ? "Reported" : "Report"}
                </button>
              )}
            </div>
          </motion.div>

          {/* Rounds */}
          <div className="d-flex flex-column gap-3">
            {post.rounds.map((round, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass rounded-4 p-4"
              >
                <h5 className="fw-bold mb-2">
                  <span
                    className="badge me-2 rounded-3"
                    style={{
                      background: "rgba(109,94,249,0.25)",
                      color: "rgba(255,255,255,0.9)",
                      fontSize: "0.75rem",
                    }}
                  >
                    Round {idx + 1}
                  </span>
                  {round.roundName}
                </h5>

                {round.description && (
                  <p className="text-muted2 mb-3">{round.description}</p>
                )}

                {round.questions && round.questions.length > 0 && (
                  <div>
                    <div className="fw-semibold small text-muted2 mb-2 text-uppercase">
                      Questions Asked
                    </div>
                    <ul className="mb-0 ps-3">
                      {round.questions
                        .filter((q) => q.trim())
                        .map((q, qIdx) => (
                          <li key={qIdx} className="text-light small mb-1">
                            {q}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* AI Insights */}
          <AIInsights postId={postId} />
        </div>

        {/* RIGHT: Comments */}
        <div className="col-lg-5">
          <motion.div
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-4 p-4"
            style={{ position: "sticky", top: "80px" }}
          >
            <h5 className="fw-bold mb-4">
              <i className="bi bi-chat-dots me-2"></i>
              Comments ({comments.length})
            </h5>

            {/* Add Comment */}
            {user ? (
              <div className="mb-4">
                <textarea
                  className="form-control bg-transparent text-light border-secondary mb-2"
                  placeholder="Share your thoughts..."
                  rows={3}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  maxLength={500}
                />
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted2 small">
                    {commentText.length}/500
                  </span>
                  <button
                    onClick={handleAddComment}
                    disabled={commentLoading || !commentText.trim()}
                    className="btn btn-accent rounded-3 btn-sm"
                  >
                    {commentLoading ? (
                      <span className="spinner-border spinner-border-sm me-1"></span>
                    ) : (
                      <i className="bi bi-send me-1"></i>
                    )}
                    Post Comment
                  </button>
                </div>
              </div>
            ) : (
              <div className="glass rounded-3 p-3 mb-4 text-center">
                <p className="text-muted2 small mb-2">
                  Login to join the discussion
                </p>
                <Link href="/auth/login" className="btn btn-accent btn-sm rounded-3">
                  Login
                </Link>
              </div>
            )}

            {/* Comments List */}
            <div
              className="d-flex flex-column gap-3"
              style={{ maxHeight: "500px", overflowY: "auto" }}
            >
              <AnimatePresence>
                {comments.length === 0 ? (
                  <div className="text-center text-muted2 py-4">
                    <i className="bi bi-chat-square-dots fs-3 d-block mb-2"></i>
                    No comments yet. Be the first!
                  </div>
                ) : (
                  comments.map((comment) => (
                    <motion.div
                      key={comment._id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="glass rounded-3 p-3"
                    >
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <div className="fw-semibold small">
                          {comment.userId?.fullName || "Anonymous"}
                          {comment.userId?.college && (
                            <span className="text-muted2 fw-normal ms-1">
                              • {comment.userId.college}
                            </span>
                          )}
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <span className="text-muted2" style={{ fontSize: "0.7rem" }}>
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                          {user && user.id === comment.userId?._id && (
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              className="btn btn-sm btn-link text-danger p-0"
                              style={{ fontSize: "0.75rem" }}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-light small mb-0">{comment.text}</p>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}