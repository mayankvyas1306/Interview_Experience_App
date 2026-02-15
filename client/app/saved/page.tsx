"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import PostCard from "@/components/PostCard";
import { useRouter } from "next/navigation";

export default function SavedPage() {
  const router = useRouter();

  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSavedPosts = async () => {
    try {
      setLoading(true);

      const res = await api.get("/users/saved");
      setSavedPosts(res.data.savedPosts);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load saved posts");

      // if token missing/invalid -> redirect to login
      router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  return (
    <div className="container py-5">

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="glass glow-border p-4 p-md-5 rounded-4 mb-4"
      >
        <h2 className="fw-bold mb-1">
          Saved Posts <i className="bi bi-bookmarks ms-2"></i>
        </h2>
        <p className="text-muted2 mb-0">
          Your bookmarked interview experiences for quick revision.
        </p>
      </motion.div>

      {loading ? (
        <div className="text-center text-muted2 py-5">
          <div className="spinner-border text-light"></div>
          <div className="mt-3">Loading saved posts...</div>
        </div>
      ) : savedPosts.length === 0 ? (
        <div className="glass rounded-4 p-5 text-center">
          <div className="fs-1 mb-2">📌</div>
          <h4 className="fw-bold">No saved posts yet</h4>
          <p className="text-muted2 mb-0">
            Explore posts and click Save to add them here.
          </p>
        </div>
      ) : (
        <div className="row g-3">
          {savedPosts.map((post) => (
            <div className="col-md-6 col-xl-4" key={post._id}>
              <PostCard post={post} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
