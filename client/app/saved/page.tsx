"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import PostCard from "@/components/PostCard";
import { useRouter } from "next/navigation";
import type { Post } from "@/types/api";

export default function SavedPage() {
  const router = useRouter();
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fixed: useCallback so useEffect can safely depend on it
  const fetchSavedPosts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/users/saved");
      setSavedPosts(res.data.savedPosts);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load saved posts";
      toast.error(message);
      router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  }, [router]); // router is stable in Next.js

  // ✅ Fixed: honest dependency array, no eslint-disable needed
  useEffect(() => {
    fetchSavedPosts();
  }, [fetchSavedPosts]);

  return (
    <div className="container py-5">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="glass glow-border p-4 p-md-5 rounded-4 mb-4"
      >
        <h2 className="fw-bold mb-1">
          Saved Posts <i className="bi bi-bookmarks ms-2" />
        </h2>
        <p className="text-muted2 mb-0">
          Your bookmarked interview experiences for quick revision.
        </p>
      </motion.div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-light" />
          <div className="text-muted2 mt-3">Loading saved posts...</div>
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