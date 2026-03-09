"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/admin/posts");
      setPosts(res.data.posts);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to load posts";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const deletePost = async (id: string) => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    try {
      await api.delete(`/admin/posts/${id}`);
      toast.success("Post deleted");
      fetchPosts();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete post");
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-light" role="status" />
        <p className="text-muted2 mt-3">Loading posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="glass rounded-4 p-5 text-center">
          <i className="bi bi-exclamation-triangle fs-1 text-warning"></i>
          <h4 className="fw-bold mt-3">Error Loading Posts</h4>
          <p className="text-muted2">{error}</p>
          <button onClick={fetchPosts} className="btn btn-accent mt-3">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-4">Manage Posts</h2>

      {posts.length === 0 ? (
        <div className="glass rounded-4 p-5 text-center">
          <p className="text-muted2">No posts found.</p>
        </div>
      ) : (
        posts.map((p) => (
          <div key={p._id} className="glass p-3 rounded-4 mb-3">
            <h5>{p.companyName} — {p.role}</h5>
            <p className="text-muted2 mb-2">
              By {p.authorId?.fullName || "Unknown"} • {p.authorId?.email}
            </p>
            <button
              onClick={() => deletePost(p._id)}
              className="btn btn-sm btn-outline-danger"
            >
              <i className="bi bi-trash me-1"></i>Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}