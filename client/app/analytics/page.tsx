"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { api } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import Link from "next/link";

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);

  const [totalPosts, setTotalPosts] = useState(0);
  const [mostAskedTopics, setMostAskedTopics] = useState<any[]>([]);
  const [topCompanies, setTopCompanies] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);

  const [companyQuery, setCompanyQuery] = useState("Amazon");
  const [companyTopics, setCompanyTopics] = useState<any[]>([]);
  const [companyLoading, setCompanyLoading] = useState(false);

  const fetchOverview = async () => {
    try {
      setLoading(true);

      const res = await api.get("/analytics/overview");

      setTotalPosts(res.data.totalPosts);

      // recharts expects {name, value}
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
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const fetchTrending = async () => {
    try {
      const res = await api.get("/analytics/trending");
      setTrending(res.data.trending);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to load trending posts",
      );
    }
  };

  const fetchCompanyTopics = async () => {
    if (!companyQuery.trim()) return;

    try {
      setCompanyLoading(true);

      const res = await api.get(
        `/analytics/company-topics?company=${encodeURIComponent(companyQuery)}`,
      );

      setCompanyTopics(
        res.data.topics.map((t: any) => ({
          name: t._id,
          value: t.count,
        })),
      );
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to load company topics",
      );
    } finally {
      setCompanyLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    fetchTrending();
    fetchCompanyTopics();
  }, []);

  return (
    <div className="container py-5">
      <Toaster position="top-right" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="glass glow-border p-4 p-md-5 rounded-4 mb-4"
      >
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <h2 className="fw-bold mb-1">
              Analytics Dashboard <i className="bi bi-graph-up-arrow ms-2"></i>
            </h2>
            <p className="text-muted2 mb-0">
              Track trending companies, most asked topics, and interview
              patterns.
            </p>
          </div>

          <div className="glass rounded-4 px-4 py-3">
            <div className="text-muted2 small">Total Posts</div>
            <div className="fw-bold fs-3">{totalPosts}</div>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="text-center text-muted2 py-5">
          <div className="spinner-border text-light"></div>
          <div className="mt-3">Loading analytics...</div>
        </div>
      ) : (
        <div className="row g-4">
          {/* Most Asked Topics */}
          <div className="col-lg-6">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="glass rounded-4 p-4"
            >
              <h5 className="fw-bold mb-3">Most Asked Topics</h5>

              {mostAskedTopics.length === 0 ? (
                <div className="text-muted2">No data yet.</div>
              ) : (
                <div className="glass rounded-4 p-4 chart-glow" style={{ width: "100%", height: 280 }}>
                  <ResponsiveContainer>
                    <BarChart data={mostAskedTopics}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "rgba(255,255,255,0.75)" }}
                      />
                      <YAxis tick={{ fill: "rgba(255,255,255,0.75)" }} />
                      <Tooltip
                        contentStyle={{
                          background: "rgba(10, 14, 28, 0.92)",
                          border: "1px solid rgba(255,255,255,0.14)",
                          borderRadius: 14,
                          color: "white",
                        }}
                        labelStyle={{ color: "rgba(255,255,255,0.9)" }}
                        itemStyle={{ color: "rgba(255,255,255,0.85)" }}
                        cursor={{ opacity: 0.1 }}
                      />
                      <Bar dataKey="value" fill="rgba(0,212,255,0.85)" radius={[10, 10, 0, 0]} />

                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </motion.div>
          </div>

          {/* Top Companies */}
          <div className="col-lg-6">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="glass rounded-4 p-4"
            >
              <h5 className="fw-bold mb-3">Top Companies (by posts)</h5>

              {topCompanies.length === 0 ? (
                <div className="text-muted2">No data yet.</div>
              ) : (
                <div className="glass rounded-4 p-4 chart-glow" style={{ width: "100%", height: 280 }}>
                  <ResponsiveContainer>
                    <BarChart data={mostAskedTopics}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "rgba(255,255,255,0.75)" }}
                      />
                      <YAxis tick={{ fill: "rgba(255,255,255,0.75)" }} />
                      <Tooltip
                        contentStyle={{
                          background: "rgba(10, 14, 28, 0.92)",
                          border: "1px solid rgba(255,255,255,0.14)",
                          borderRadius: 14,
                          color: "white",
                        }}
                        labelStyle={{ color: "rgba(255,255,255,0.9)" }}
                        itemStyle={{ color: "rgba(255,255,255,0.85)" }}
                        cursor={{ opacity: 0.1 }}
                      />
                      <Bar dataKey="value" fill="rgba(0,212,255,0.85)" radius={[10, 10, 0, 0]} />

                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </motion.div>
          </div>

          {/* Company Topic Analyzer */}
          <div className="col-lg-7">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="glass rounded-4 p-4"
            >
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <h5 className="fw-bold mb-0">Company Topic Analyzer</h5>

                <div className="d-flex gap-2">
                  <input
                    className="form-control bg-transparent text-light border-secondary"
                    value={companyQuery}
                    onChange={(e) => setCompanyQuery(e.target.value)}
                    placeholder="Amazon"
                    style={{ minWidth: 180 }}
                  />
                  <button
                    onClick={fetchCompanyTopics}
                    className="btn btn-accent rounded-3"
                    disabled={companyLoading}
                  >
                    {companyLoading ? "Loading..." : "Analyze"}
                  </button>
                </div>
              </div>

              {companyTopics.length === 0 ? (
                <div className="text-muted2">
                  No tag data found for this company.
                </div>
              ) : (
                <div className="glass rounded-4 p-4 chart-glow" style={{ width: "100%", height: 280 }}>
                  <ResponsiveContainer>
                    <BarChart data={mostAskedTopics}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "rgba(255,255,255,0.75)" }}
                      />
                      <YAxis tick={{ fill: "rgba(255,255,255,0.75)" }} />
                      <Tooltip
                        contentStyle={{
                          background: "rgba(10, 14, 28, 0.92)",
                          border: "1px solid rgba(255,255,255,0.14)",
                          borderRadius: 14,
                          color: "white",
                        }}
                        labelStyle={{ color: "rgba(255,255,255,0.9)" }}
                        itemStyle={{ color: "rgba(255,255,255,0.85)" }}
                        cursor={{ opacity: 0.1 }}
                      />
                      <Bar dataKey="value" fill="rgba(0,212,255,0.85)" radius={[10, 10, 0, 0]} />

                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </motion.div>
          </div>

          {/* Trending Posts */}
          <div className="col-lg-5">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.12 }}
              className="glass rounded-4 p-4"
            >
              <h5 className="fw-bold mb-3">Trending Posts 🔥</h5>

              {trending.length === 0 ? (
                <div className="text-muted2">No trending posts yet.</div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {trending.slice(0, 6).map((p: any) => (
                    <div key={p._id} className="glass rounded-4 p-3">
                      <div className="d-flex justify-content-between align-items-start gap-2">
                        <div>
                          <div className="fw-semibold">{p.companyName}</div>
                          <div className="text-muted2 small">
                            <i className="bi bi-briefcase me-2"></i>
                            {p.role}
                          </div>
                        </div>

                        <div className="text-muted2 small text-end">
                          <i className="bi bi-arrow-up-circle me-1"></i>
                          {p.upvotesCount}
                        </div>
                      </div>

                      <div className="mt-2 d-flex justify-content-end">
                        <Link
                          href={`/post/${p._id}`}
                          className="btn btn-sm btn-outline-light rounded-3"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
