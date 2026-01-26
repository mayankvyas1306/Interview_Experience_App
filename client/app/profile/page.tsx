"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [savedCount, setSavedCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const profileRes = await api.get("/auth/me");
      setUser(profileRes.data.user);

      // ✅ fetch saved count
      const savedRes = await api.get("/users/saved");
      setSavedCount(savedRes.data.totalSaved);
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

  return (
    <div className="container py-5">
      <Toaster position="top-right" />

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
        </div>
      ) : (
        <div className="text-center text-muted2">No user data found.</div>
      )}
    </div>
  );
}
