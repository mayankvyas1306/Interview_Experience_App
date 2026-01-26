"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { api } from "@/lib/api";

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
    fullName?: string;
    college?: string;
    year?: number;
  };
};

export default function PostDetailsPage() {
  const params = useParams();
  const postId = params.id as string;

  const [post, setPost] = useState<PostDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);

  const fetchPostDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/posts/${postId}`);
      setPost(res.data.post);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load post");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await api.get(`/comments/${postId}`);
      setComments(res.data.comments);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load comments");
    }
  };

  const handleUpvote = async () => {
    try {
      const res = await api.patch(`/posts/${postId}/upvote`);
      toast.success(res.data.message);

      // ✅ update UI without refetch (fast UX)
      setPost((prev) =>
        prev ? { ...prev, upvotesCount: res.data.upvotesCount } : prev,
      );
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Upvote failed");
    }
  };

  const handleSave = async () => {
    try {
      const res = await api.patch(`/users/save/${postId}`);
      toast.success(res.data.message);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Save failed");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await api.delete(`/comments/${commentId}`);
      toast.success(res.data.message);
      fetchComments();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete comment");
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      toast.error("Write a comment first");
      return;
    }

    try {
      setCommentLoading(true);
      const res = await api.post(`/comments/${postId}`, { text: commentText });
      toast.success(res.data.message);

      setCommentText("");
      fetchComments();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to add comment");
    } finally {
      setCommentLoading(false);
    }
  };

  useEffect(() => {
    fetchPostDetails();
    fetchComments();
    setLoggedInUserId(localStorage.getItem("userId"));
  }, []);

  if (loading) {
    return (
      <div className="container py-5 text-center text-muted2">
        <Toaster position="top-right" />
        <div className="spinner-border text-light"></div>
        <div className="mt-3">Loading post...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container py-5 text-center text-muted2">
        <Toaster position="top-right" />
        Post not found
      </div>
    );
  }

  return (
    <div className="container py-5">
      <Toaster position="top-right" />

      {/* ✅ Header Card */}
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
              {post.authorId?.fullName || "Anonymous"}{" "}
              <span className="ms-2">
                • {post.authorId?.college || "College"} • Year{" "}
                {post.authorId?.year || "-"}
              </span>
            </div>
          </div>

          <div className="d-flex gap-2">
            <button
              onClick={handleUpvote}
              className="btn btn-outline-light rounded-3"
            >
              <i className="bi bi-arrow-up-circle me-2"></i>
              Upvote ({post.upvotesCount})
            </button>

            <button onClick={handleSave} className="btn btn-accent rounded-3">
              <i className="bi bi-bookmark-star me-2"></i>
              Save
            </button>
          </div>
        </div>
      </motion.div>

      {/* ✅ Rounds + Comments Layout */}
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

            {/* Add comment */}
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
                {commentLoading ? "Posting..." : "Post Comment"}
              </button>
            </div>

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

                        {/* ✅ delete button shown only to comment owner */}
                        {loggedInUserId &&
                          c.userId &&
                          (c.userId as any)._id === loggedInUserId && (
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
