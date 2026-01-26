"use client";

import Link from "next/link";
import { motion } from "framer-motion";

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

export default function PostCard({ post }: { post: Post }) {
  const difficultyBadge =
    post.difficulty === "Hard"
      ? "bg-danger"
      : post.difficulty === "Medium"
      ? "bg-warning text-dark"
      : "bg-success";

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="glass rounded-4 p-4 h-100"
    >
      <div className="d-flex justify-content-between align-items-start gap-2">
        <div>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <h5 className="fw-bold mb-0">{post.companyName}</h5>
            <span className={`badge ${difficultyBadge} rounded-pill`}>
              {post.difficulty}
            </span>
          </div>

          <div className="text-muted2 mt-1">
            <i className="bi bi-briefcase me-2"></i>
            {post.role}
          </div>
        </div>

        <div className="text-muted2 small text-end">
          <div>
            <i className="bi bi-arrow-up-circle me-1"></i>
            {post.upvotesCount}
          </div>
        </div>
      </div>

      <div className="mt-3 d-flex gap-2 flex-wrap">
        {post.tags?.slice(0, 5).map((tag) => (
          <span
            key={tag}
            className="badge rounded-pill"
            style={{
              background: "rgba(109,94,249,0.18)",
              border: "1px solid rgba(109,94,249,0.35)",
              color: "rgba(255,255,255,0.9)",
            }}
          >
            #{tag}
          </span>
        ))}
      </div>

      <div className="mt-3 d-flex justify-content-between align-items-center">
        <div className="text-muted2 small">
          <i className="bi bi-person-circle me-2"></i>
          {post.authorId?.fullName || "Anonymous"}
        </div>

        <Link
          href={`/post/${post._id}`}
          className="btn btn-outline-light btn-sm rounded-3"
        >
          View <i className="bi bi-arrow-right ms-1"></i>
        </Link>
      </div>
    </motion.div>
  );
}
