"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState<string | null>(null); // Add error state

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true); // Start loading
        setError(null); // Clear any previous errors
        
        const res = await api.get("/admin/stats");
        setStats(res.data);
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || "Failed to load admin stats";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false); // Always stop loading
      }
    };

    fetchStats();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted2 mt-3">Loading admin dashboard...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container py-5">
        <div className="glass rounded-4 p-5 text-center">
          <i className="bi bi-exclamation-triangle fs-1 text-warning"></i>
          <h4 className="fw-bold mt-3">Error Loading Dashboard</h4>
          <p className="text-muted2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-accent mt-3"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No stats (shouldn't happen, but defensive programming)
  if (!stats) {
    return (
      <div className="container py-5 text-center">
        <p className="text-muted2">No statistics available</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-4">Admin Dashboard</h2>

      {/* ================= STATS ================= */}
      <div className="row g-4">
        <div className="col-md-4">
          <div className="glass rounded-4 p-4">
            <h6>Total Users</h6>
            <h2>{stats.totalUsers}</h2>
          </div>
        </div>

        <div className="col-md-4">
          <div className="glass rounded-4 p-4">
            <h6>Total Posts</h6>
            <h2>{stats.totalPosts}</h2>
          </div>
        </div>
      </div>

      {/* ================= QUICK ACTIONS ================= */}
      <h5 className="mt-5 mb-3">Quick Actions</h5>

      <div className="d-flex gap-3 flex-wrap">
        <Link
          href="/admin/users"
          className="btn btn-accent rounded-3"
        >
          Manage Users
        </Link>

        <Link
          href="/admin/posts"
          className="btn btn-outline-light rounded-3"
        >
          Manage Posts
        </Link>
      </div>

      {/* ================= TOP COMPANIES ================= */}
      <h5 className="mt-5 mb-3">Top Companies</h5>

      {stats.topCompanies.map((c: any) => (
        <div key={c._id} className="glass p-3 mb-2 rounded-3">
          {c._id} — {c.count} posts
        </div>
      ))}
    </div>
  );
}
