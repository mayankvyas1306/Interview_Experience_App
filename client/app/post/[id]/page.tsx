"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast"; // ✅ FIX: No Toaster import - handled by root layout
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
  upvotedBy?: string[];
  createdAt: string;
  rounds: Round[];
  authorId?: {
    fullName?: string;
    college?: string;
    year?: number;
  };
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

  // Check if current post is saved (when user is logged in)
  useEffect(() => {
    if (!user) return;
    const checkSaved = async () => {
      try {
        const res = await api.get("/users/saved");
        const savedIds = (res.data.savedPosts || []).map((p: any) => p._id);
        setIsSaved(savedIds.includes(postId));
      } catch {
        // Silent - not critical
      }
    };
    checkSaved();
  }, [user, postId]);

  // ─────────────────────────────────────────────
  // UPVOTE  – ✅ FIX: Redirect to login instead of just toasting
  // ─────────────────────────────────────────────
  // ─────────────────────────────────────────────
  // UPVOTE  – ✅ FIX: Redirect to login instead of just toasting
  // ─────────────────────────────────────────────
  const handleUpvote = async () => {
    if (!user) {
      toast.error("Please login to upvote");
      router.push("/auth/login");
      return;
    }

    if (upvoting || !post) return;

    // OPTIMISTIC UPDATE
    const previousPost = { ...post };
    const userId = user.id;
    const isUpvoted = post.upvotedBy?.includes(userId);

    const newUpvotesCount = isUpvoted ? Math.max(0, post.upvotesCount - 1) : post.upvotesCount + 1;
    const newUpvotedBy = isUpvoted
      ? post.upvotedBy?.filter(id => id !== userId) || []
      : [...(post.upvotedBy || []), userId];

    // Apply optimistic state
    setPost({
      ...post,
      upvotesCount: newUpvotesCount,
      upvotedBy: newUpvotedBy
    });

    try {
      setUpvoting(true);
      // API call in background
      const res = await api.patch(`/posts/${postId}/upvote`);

      // Update with actual server response (eventually consistent)
      setPost((prev) =>
        prev ? { ...prev, upvotesCount: res.data.upvotesCount, upvotedBy: isUpvoted ? prev.upvotedBy?.filter(id => id !== userId) : [...(prev.upvotedBy || []), userId] } : prev,
      );
      toast.success(res.data.message);
    } catch (err: any) {
      // Revert on failure
      setPost(previousPost);
      toast.error(err?.response?.data?.message || "Upvote failed");
    } finally {
      setUpvoting(false);
    }
  };

  // ─────────────────────────────────────────────
  // SAVE  – ✅ FIX: Redirect to login, optimistic UI
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
      toast.success(res.data.message, { icon: nowSaved ? "⭐" : "📌" });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
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
      const res = await api.post(`/comments/${postId}`, { text: commentText });
      toast.success(res.data.message);
      setCommentText("");
      // Refresh comments
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
  // RENDER
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
      {/* ✅ FIX: NO <Toaster /> here — handled by root layout.tsx */}

      {/* Header Card */}
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

            <div className="text-muted2 small mt-3">
              <i className="bi bi-person-circle me-2"></i>
              {post.authorId?.fullName || "Anonymous"}
              <span className="ms-2">
                • {post.authorId?.college || "College"} • Year{" "}
                {post.authorId?.year || "-"}
              </span>
            </div>
          </div>

          <div className="d-flex gap-2 flex-wrap">
            {/* ✅ FIX: Button works for everyone - redirects to login if not logged in */}
            <button
              onClick={handleUpvote}
              disabled={upvoting}
              className="btn btn-outline-light rounded-3"
              title={!user ? "Login to upvote" : ""}
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
                <i className="bi bi-pencil-square me-2"></i>Edit Post
              </Link>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className={`btn rounded-3 ${isSaved ? "btn-accent" : "btn-outline-light"}`}
              title={!user ? "Login to save" : isSaved ? "Unsave" : "Save post"}
            >
              {saving ? (
                <span className="spinner-border spinner-border-sm me-2"></span>
              ) : (
                <i
                  className={`bi ${isSaved ? "bi-bookmark-fill" : "bi-bookmark-star"} me-2`}
                ></i>
              )}
              {isSaved ? "Saved" : "Save"}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Rounds + Comments */}
      <div className="row g-4">
        {/* LEFT: Rounds */}
        <div className="col-lg-7">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="glass rounded-4 p-4"
          >
            <h4 className="fw-bold mb-3">
              Interview Rounds{" "}
              <span className="text-muted2">({post.rounds.length})</span>
            </h4>

            {post.rounds.length === 0 ? (
              <div className="text-muted2">No rounds added.</div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {post.rounds.map((round, idx) => (
                  <div key={idx} className="glass rounded-4 p-3">
                    <div className="d-flex justify-content-between flex-wrap gap-2">
                      <div className="fw-semibold">
                        <i className="bi bi-layers me-2"></i>
                        {round.roundName}
                      </div>
                      <span className="badge rounded-pill bg-secondary">
                        Round {idx + 1}
                      </span>
                    </div>

                    <p className="text-muted2 mt-2 mb-2">{round.description}</p>

                    {round.questions && round.questions.length > 0 && (
                      <div className="mt-2">
                        <div className="small text-muted2 mb-1">
                          Questions asked:
                        </div>
                        <ul className="mb-0 text-light">
                          {round.questions.map((q, i) => (
                            <li key={i} className="text-muted2">
                              {q}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* RIGHT: Comments */}
        <div className="col-lg-5">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="glass rounded-4 p-4"
          >
            <h4 className="fw-bold mb-3">
              Comments <span className="text-muted2">({comments.length})</span>
            </h4>

            {/* Add comment box */}
            {user ? (
              <div className="mb-3">
                <textarea
                  className="form-control bg-transparent text-light border-secondary"
                  placeholder="Write your comment..."
                  rows={3}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <button
                  disabled={commentLoading}
                  onClick={handleAddComment}
                  className="btn btn-accent w-100 mt-2 rounded-3"
                >
                  {commentLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Posting...
                    </>
                  ) : (
                    "Post Comment"
                  )}
                </button>
              </div>
            ) : (
              // ✅ FIX: Show clear CTA for guests instead of disabled state
              <div className="glass rounded-4 p-3 mb-3 text-center">
                <p className="text-muted2 mb-2">
                  <i className="bi bi-lock me-2"></i>
                  Please login to comment
                </p>
                <a
                  href="/auth/login"
                  className="btn btn-sm btn-accent rounded-3"
                >
                  Login to Comment
                </a>
              </div>
            )}

            {/* Comments list */}
            <div className="d-flex flex-column gap-3">
              {comments.length === 0 ? (
                <div className="text-muted2">
                  No comments yet. Be the first one ✨
                </div>
              ) : (
                comments.map((c) => (
                  <div key={c._id} className="glass rounded-4 p-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="fw-semibold small">
                        <i className="bi bi-person-circle me-2"></i>
                        {c.userId?.fullName || "User"}
                      </div>

                      <div className="d-flex align-items-center gap-2">
                        <div className="text-muted2 small">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </div>

                        {user?.id === c.userId?._id && (
                          <button
                            onClick={() => handleDeleteComment(c._id)}
                            className="btn btn-sm btn-outline-danger rounded-3"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="text-muted2 mt-2">{c.text}</div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
