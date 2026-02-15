"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [savedCount, setSavedCount] = useState(0);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const profileRes = await api.get("/auth/me");
      setUser(profileRes.data.user);

      // ✅ fetch saved count
      const savedRes = await api.get("/users/saved");
      setSavedCount(savedRes.data.totalSaved);
      setSavedPosts(savedRes.data.savedPosts || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Please login again");
      router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleToggleSave = async (postId: string) => {
    try {
      setSavingId(postId);
      await api.patch(`/users/save/${postId}`);
      const savedRes = await api.get("/users/saved");
      setSavedCount(savedRes.data.totalSaved);
      setSavedPosts(savedRes.data.savedPosts || []);
      toast.success("Saved list updated ✅");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update saved list");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="container py-5">

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="glass glow-border p-4 p-md-5 rounded-4 mb-4"
      >
        <h2 className="fw-bold mb-1">
          Profile <i className="bi bi-person-badge ms-2"></i>
        </h2>
        <p className="text-muted2 mb-0">
          Your account details and activity summary.
        </p>
      </motion.div>

      {loading ? (
        <div className="text-center text-muted2 py-5">
          <div className="spinner-border text-light"></div>
          <div className="mt-3">Loading profile...</div>
        </div>
      ) : user ? (
        <div className="row g-4">
          {/* Left Card */}
          <div className="col-lg-5">
            <div className="glass rounded-4 p-4">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-4 d-flex align-items-center justify-content-center"
                  style={{
                    width: 60,
                    height: 60,
                    background:
                      "linear-gradient(120deg, rgba(109,94,249,1), rgba(0,212,255,1))",
                  }}
                >
                  <i className="bi bi-person-fill fs-3"></i>
                </div>

                <div>
                  <h4 className="fw-bold mb-0">{user.fullName}</h4>
                  <div className="text-muted2">{user.email}</div>
                </div>
              </div>

              <hr className="border-secondary mt-4" />

              <div className="text-muted2">
                <div className="mb-2">
                  <i className="bi bi-mortarboard me-2"></i>
                  College: <span className="text-light">{user.college || "N/A"}</span>
                </div>
                <div className="mb-2">
                  <i className="bi bi-calendar3 me-2"></i>
                  Year: <span className="text-light">{user.year || "-"}</span>
                </div>
                <div className="mb-2">
                  <i className="bi bi-shield-check me-2"></i>
                  Role: <span className="text-light">{user.role}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Stats */}
          <div className="col-lg-7">
            <div className="row g-3">
              <div className="col-md-6">
                <div className="glass rounded-4 p-4 h-100">
                  <div className="text-muted2 small">Saved Posts</div>
                  <div className="fw-bold display-6">{savedCount}</div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="glass rounded-4 p-4 h-100">
                  <div className="text-muted2 small">Status</div>
                  <div className="fw-bold display-6">Active</div>
                </div>
              </div>

              <div className="col-12">
                <div className="glass rounded-4 p-4">
                  <h5 className="fw-bold">Next Goal 🚀</h5>
                  <p className="text-muted2 mb-0">
                    Share 3 interview experiences and help 50+ students prepare better.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Saved Posts */}
          <div className="col-12">
            <div className="glass rounded-4 p-4">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <div>
                  <h5 className="fw-bold mb-1">Saved Experiences</h5>
                  <p className="text-muted2 mb-0">
                    Quickly revisit the interview stories you bookmarked.
                  </p>
                </div>
                <div className="text-muted2 small">
                  Total saved: <span className="text-light fw-semibold">{savedCount}</span>
                </div>
              </div>

              {savedPosts.length === 0 ? (
                <div className="text-muted2">No saved posts yet. Explore and save your favorites!</div>
              ) : (
                <div className="row g-3">
                  {savedPosts.map((post) => (
                    <div key={post._id} className="col-md-6 col-xl-4">
                      <div className="glass rounded-4 p-4 h-100">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="fw-bold mb-1">{post.companyName}</h6>
                            <div className="text-muted2 small">{post.role}</div>
                          </div>
                          <button
                            type="button"
                            className="btn btn-outline-light btn-sm"
                            disabled={savingId === post._id}
                            onClick={() => handleToggleSave(post._id)}
                          >
                            {savingId === post._id ? "Updating..." : "Unsave"}
                          </button>
                        </div>
                        <div className="mt-3">
                          <a
                            href={`/post/${post._id}`}
                            className="btn btn-accent btn-sm rounded-3"
                          >
                            View Post
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-muted2">No user data found.</div>
      )}
    </div>
  );
}
