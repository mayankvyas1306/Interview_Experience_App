"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<any[]>([]);

  const fetchPosts = async () => {
    try {
      const res = await api.get("/admin/posts");
      setPosts(res.data.posts);
    } catch {
      toast.error("Failed to load posts");
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const deletePost = async (id: string) => {
    if (!confirm("Delete this post?")) return;

    try {
      await api.delete(`/admin/posts/${id}`);
      toast.success("Post deleted");
      fetchPosts();
    } catch {
      toast.error("Failed");
    }
  };

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-4">Manage Posts</h2>

      {posts.map((p) => (
        <div key={p._id} className="glass p-3 rounded-4 mb-3">

          <h5>{p.companyName} - {p.role}</h5>
          <p className="text-muted2">
            By {p.authorId?.fullName}
          </p>

          <button
            onClick={() => deletePost(p._id)}
            className="btn btn-sm btn-outline-danger"
          >
            Delete
          </button>

        </div>
      ))}
    </div>
  );
}
