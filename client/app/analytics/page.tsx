"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { api } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import Link from "next/link";
import SkeletonCard from "@/components/SkeletonCard";

export default function AnalyticsPage() {
  const fetchedRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [totalPosts, setTotalPosts] = useState(0);

  const [mostAskedTopics, setMostAskedTopics] = useState<any[]>([]);
  const [topCompanies, setTopCompanies] = useState<any[]>([]);
  const [companyTopics, setCompanyTopics] = useState<any[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [trending, setTrending] = useState<any[]>([]);

  const [companyQuery, setCompanyQuery] = useState("");

  // ---------------- FETCH FUNCTIONS ----------------

  const fetchOverview = async () => {
    const res = await api.get("/analytics/overview");

    setTotalPosts(res.data.totalPosts);

    setMostAskedTopics(
      res.data.mostAskedTopics.map((t: any) => ({
        name: t._id,
        value: t.count,
      })),
    );

    setTopCompanies(
      res.data.topCompanies.map((c: any) => ({
        name: c._id,
        value: c.count,
      })),
    );
  };

  const fetchCompanies = async () => {
    const res = await api.get("/analytics/companies");
    setCompanies(res.data.companies);
    setCompanyQuery(res.data.companies[0] || "");
  };

  const fetchCompanyTopics = async (company: string) => {
    if (!company) return;
    const res = await api.get(
      `/analytics/company-topics?company=${encodeURIComponent(company)}`,
    );

    setCompanyTopics(
      res.data.topics.map((t: any) => ({
        name: t._id,
        value: t.count,
      })),
    );
  };

  const fetchTrending = async () => {
    const res = await api.get("/analytics/trending");
    setTrending(res.data.trending);
  };

  // ---------------- EFFECTS ----------------

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    Promise.all([fetchOverview(), fetchTrending(), fetchCompanies()])
      .catch(() => toast.error("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (companyQuery) fetchCompanyTopics(companyQuery);
  }, [companyQuery]);

  // ---------------- UI ----------------

  return (
    <div className="container py-5">
      <Toaster position="top-right" />

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass glow-border p-4 p-md-5 rounded-4 mb-4"
      >
        <div className="d-flex justify-content-between flex-wrap gap-3">
          <div>
            <h2 className="fw-bold mb-1">Analytics Dashboard 📊</h2>
            <p className="text-muted2 mb-0">
              Interview trends from real community data.
            </p>
          </div>

          <div className="glass rounded-4 px-4 py-3">
            <div className="text-muted2 small">Total Interview Posts</div>
            <div className="fw-bold fs-3">{totalPosts}</div>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="row g-4">
          <div className="col-lg-6">
            <SkeletonCard />
          </div>
          <div className="col-lg-6">
            <SkeletonCard />
          </div>
          <div className="col-lg-7">
            <SkeletonCard />
          </div>
          <div className="col-lg-5">
            <SkeletonCard />
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {/* MOST ASKED TOPICS */}
          <div className="col-lg-6">
            <div className="glass rounded-4 p-4 chart-glow h-100">
              <h5 className="fw-bold">Most Asked Topics</h5>
              <p className="text-muted2 small">
                Number of interview posts where each topic appeared.
              </p>

              <div style={{ height: 260 }}>
                <ResponsiveContainer>
                  <BarChart data={mostAskedTopics}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Bar dataKey="value" fill="#00D4FF" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* TOP COMPANIES */}
          <div className="col-lg-6">
            <div className="glass rounded-4 p-4 chart-glow h-100">
              <h5 className="fw-bold">Top Companies</h5>
              <p className="text-muted2 small">
                Companies with highest interview activity.
              </p>

              <div style={{ height: 260 }}>
                <ResponsiveContainer>
                  <BarChart data={topCompanies}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Bar dataKey="value" fill="#6D5EF9" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* COMPANY ANALYZER */}
          <div className="col-lg-7">
            <div className="glass rounded-4 p-4 chart-glow h-100">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-1">
                <h5 className="fw-bold mb-1">Company Topic Analyzer</h5>

                <select
                  className="form-select bg-transparent text-light"
                  style={{ width: 200 }}
                  value={companyQuery}
                  onChange={(e) => setCompanyQuery(e.target.value)}
                >
                  {companies.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-muted2 small">
                Topics asked by a specific company.
              </p>
              <div style={{ height: 260 }}>
                <ResponsiveContainer>
                  <BarChart data={companyTopics}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Bar dataKey="value" fill="#00FFB2" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* TRENDING POSTS */}
          <div className="col-lg-5">
            <div className="glass rounded-4 p-4 h-100">
              <h5 className="fw-bold mb-3">Trending Posts 🔥</h5>

              {trending.map((p: any) => (
                <div key={p._id} className="glass rounded-4 p-3 mb-2">
                  <div className="fw-semibold">{p.companyName}</div>
                  <div className="text-muted2 small">{p.role}</div>
                  <Link
                    href={`/post/${p._id}`}
                    className="btn btn-sm btn-outline-light mt-2"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
