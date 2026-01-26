"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import PostCard from "@/components/PostCard";
import { api } from "@/lib/api";

export default function ExplorePage() {
  const [posts, setPosts] = useState<any[]>([]);

  //Controls spinner UI while fetching.
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    try {
      setLoading(true);

      //Calls our backend pagination API.
      const res = await api.get("/posts?page=1&limit=9");

      setPosts(res.data.posts);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

    //Runs once when the page loads.
    //So posts are fetched automatically.
  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="container py-5">
      <Toaster position="top-right" />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="glass glow-border p-4 rounded-4 mb-4"
      >
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div>
            <h2 className="fw-bold mb-1">Explore Experiences</h2>
            <p className="text-muted2 mb-0">
              Discover company-wise patterns and trending interview posts.
            </p>
          </div>

          <button onClick={fetchPosts} className="btn btn-outline-light rounded-3">
            <i className="bi bi-arrow-clockwise me-2"></i>
            Refresh
          </button>
        </div>
      </motion.div>

      {loading ? (
        <div className="text-center text-muted2 py-5">
          <div className="spinner-border text-light" role="status"></div>
          <div className="mt-3">Loading posts...</div>
        </div>
      ) : (
        <div className="row g-3">
          {posts.map((post) => (
            <div className="col-md-6 col-lg-4" key={post._id}>
              <PostCard post={post} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
