"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { api, getErrorMessage } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { AuthUser, Post } from "@/types/api";

interface ProfileData extends AuthUser {
  reputation: number;
  rank: string;
}

interface SavedPost {
  _id: string;
  companyName: string;
  role: string;
}

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<ProfileData | null>(null);
  const [savedCount, setSavedCount] = useState(0);
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [myPostsLoading, setMyPostsLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  // ✅ useCallback makes fetchProfile stable
  // useEffect can now safely list it as a dependency
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);

      const profileRes = await api.get("/auth/me");
      setUser(profileRes.data.user as ProfileData);

      setMyPostsLoading(true);
      const [savedRes, myPostsRes] = await Promise.all([
        api.get("/users/saved"),
        api.get("/users/my-posts?page=1&limit=6"),
      ]);

      setSavedCount(savedRes.data.totalSaved);
      setSavedPosts(savedRes.data.savedPosts || []);
      setMyPosts(myPostsRes.data.posts || []);
    } catch (err) {
      toast.error(getErrorMessage(err, "Please login again"));
      router.push("/auth/login");
    } finally {
      setLoading(false);
      setMyPostsLoading(false);
    }
  }, [router]); // router is stable (Next.js guarantees this)

  // ✅ Honest dependency array — no eslint-disable needed
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleToggleSave = async (postId: string) => {
    setSavingId(postId);
    try {
      await api.patch(`/users/save/${postId}`);
      const savedRes = await api.get("/users/saved");
      setSavedCount(savedRes.data.totalSaved);
      setSavedPosts(savedRes.data.savedPosts || []);
      toast.success("Saved list updated ✅");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update saved list"));
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-light" />
        <p className="text-muted2 mt-3">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-5 text-center">
        <p className="text-muted2">No user data found.</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="glass glow-border p-4 p-md-5 rounded-4 mb-4"
      >
        <h2 className="fw-bold mb-1">
          Profile <i className="bi bi-person-badge ms-2" />
        </h2>
        <p className="text-muted2 mb-0">
          Your account details and activity summary.
        </p>
      </motion.div>

      <div className="row g-4">
        {/* Left card — user info */}
        <div className="col-lg-5">
          <div className="glass rounded-4 p-4">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-4 d-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                  width: 60,
                  height: 60,
                  background:
                    "linear-gradient(120deg, rgba(109,94,249,1), rgba(0,212,255,1))",
                }}
              >
                <i className="bi bi-person-fill fs-3" />
              </div>
              <div>
                <h4 className="fw-bold mb-0">{user.fullName}</h4>
                <div className="text-muted2">{user.email}</div>
              </div>
            </div>

            <hr className="border-secondary mt-4" />

            <div className="text-muted2">
              <div className="mb-2">
                <i className="bi bi-mortarboard me-2" />
                College:{" "}
                <span className="text-light">{user.college || "N/A"}</span>
              </div>
              <div className="mb-2">
                <i className="bi bi-calendar3 me-2" />
                Year:{" "}
                <span className="text-light">{user.year || "–"}</span>
              </div>
              <div>
                <i className="bi bi-shield-check me-2" />
                Role: <span className="text-light">{user.role}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right — stats */}
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
                <div className="text-muted2 small">Reputation</div>
                <div className="fw-bold display-6">{user.reputation || 0}</div>
                <div className="text-muted2 small mt-1">
                  <span className="badge bg-primary bg-opacity-50">
                    {user.rank || "Newcomer"}
                  </span>
                </div>
              </div>
            </div>
            <div className="col-12">
              <div className="glass rounded-4 p-4">
                <h5 className="fw-bold">Next Goal 🚀</h5>
                <p className="text-muted2 mb-0">
                  Share 3 interview experiences and help 50+ students prepare
                  better.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Saved posts */}
        <div className="col-12">
          <div className="glass rounded-4 p-4">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
              <div>
                <h5 className="fw-bold mb-1">Saved Experiences</h5>
                <p className="text-muted2 mb-0">
                  Quickly revisit the interview stories you bookmarked.
                </p>
              </div>
              <span className="text-muted2 small">
                Total saved:{" "}
                <span className="text-light fw-semibold">{savedCount}</span>
              </span>
            </div>

            {savedPosts.length === 0 ? (
              <p className="text-muted2">
                No saved posts yet. Explore and save your favorites!
              </p>
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
                        <Link
                          href={`/post/${post._id}`}
                          className="btn btn-accent btn-sm rounded-3"
                        >
                          View Post
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* My posts */}
        <div className="col-12">
          <div className="glass rounded-4 p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-bold mb-1">My Created Posts</h5>
                <p className="text-muted2 mb-0">Posts you authored.</p>
              </div>
              <span className="text-muted2 small">Total: {myPosts.length}</span>
            </div>

            {myPostsLoading ? (
              <div className="text-muted2">Loading your posts...</div>
            ) : myPosts.length === 0 ? (
              <p className="text-muted2">You have not created any posts yet.</p>
            ) : (
              <div className="row g-3">
                {myPosts.map((post) => (
                  <div key={post._id} className="col-md-6 col-xl-4">
                    <div className="glass rounded-4 p-4 h-100">
                      <h6 className="fw-bold mb-1">{post.companyName}</h6>
                      <div className="text-muted2 small mb-2">{post.role}</div>
                      <div className="text-muted2 small mb-3">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </div>
                      <div className="d-flex gap-2">
                        <Link
                          href={`/post/${post._id}`}
                          className="btn btn-outline-light btn-sm"
                        >
                          View
                        </Link>
                        <Link
                          href={`/edit/${post._id}`}
                          className="btn btn-accent btn-sm"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}