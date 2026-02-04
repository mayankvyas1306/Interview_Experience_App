"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/stats");
        setStats(res.data);
      } catch {
        toast.error("Failed to load admin stats");
      }
    };

    fetchStats();
  }, []);

  if (!stats) return <p className="text-center mt-5">Loading...</p>;

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
