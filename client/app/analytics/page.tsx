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
  const [companyTopics, setCompanyTopics] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);

  const [companyQuery, setCompanyQuery] = useState("Amazon");
  const [companyLoading, setCompanyLoading] = useState(false);

  // ---------------- FETCH DATA ----------------

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await api.get("/analytics/overview");

      setTotalPosts(res.data.totalPosts);

      setMostAskedTopics(
        res.data.mostAskedTopics.map((t: any) => ({
          name: t._id, // topic name (DSA, OS...)
          value: t.count, // number of posts
        })),
      );

      setTopCompanies(
        res.data.topCompanies.map((c: any) => ({
          name: c._id, // company name
          value: c.count, // number of posts
        })),
      );
    } catch {
      toast.error("Failed to load analytics overview");
    } finally {
      setLoading(false);
    }
  };

  const fetchTrending = async () => {
    try {
      const res = await api.get("/analytics/trending");
      setTrending(res.data.trending);
    } catch {
      toast.error("Failed to load trending posts");
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
          name: t._id, // topic
          value: t.count, // frequency
        })),
      );
    } catch {
      toast.error("Failed to analyze company topics");
    } finally {
      setCompanyLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    fetchTrending();
    fetchCompanyTopics();
  }, []);

  // ---------------- UI ----------------

  return (
    <div className="container py-5">
      <Toaster position="top-right" />

      {/* HEADER */}
      <motion.div className="glass glow-border p-4 p-md-5 rounded-4 mb-4">
        <div className="d-flex justify-content-between flex-wrap gap-3">
          <div>
            <h2 className="fw-bold mb-1">Analytics Dashboard 📊</h2>
            <p className="text-muted2 mb-0">
              Understand interview trends using real community data.
            </p>
          </div>

          <div className="glass rounded-4 px-4 py-3">
            <div className="text-muted2 small">Total Interview Posts</div>
            <div className="fw-bold fs-3">{totalPosts}</div>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="text-center py-5 text-muted2">
          <div className="spinner-border text-light"></div>
          <div className="mt-3">Loading analytics...</div>
        </div>
      ) : (
        <div className="row g-4">
          {/* MOST ASKED TOPICS */}
          <div className="col-lg-6">
            <div className="glass rounded-4 p-4 chart-glow">
              <h5 className="fw-bold mb-1">Most Asked Topics</h5>
              <p className="text-muted2 small mb-3">
                Number of interview experiences where each topic appeared.
              </p>

              <div style={{ height: 260 }}>
                <ResponsiveContainer>
                  <BarChart data={mostAskedTopics}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "rgba(255,255,255,0.85)", fontSize: 12 }}
                      label={{
                        value: "Topics",
                        position: "bottom",
                        offset: 10,
                        fill: "rgba(255,255,255,0.9)",
                      }}
                    />

                    <YAxis
                      tick={{ fill: "rgba(255,255,255,0.85)", fontSize: 12 }}
                      label={{
                        value: "Number of Interview Experiences",
                        angle: -90,
                        position: "left",
                        offset: 10,
                        fill: "rgba(255,255,255,0.9)",
                      }}
                    />

                    <Tooltip
                      formatter={(value) =>
                        `${value} interview experience${Number(value) === 1 ? "" : "s"}`
                      }
                      labelFormatter={(label) => `Topic: ${label}`}
                      contentStyle={{
                        background: "rgba(10,14,28,0.95)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        borderRadius: 12,
                        color: "white",
                      }}
                    />

                    <Bar dataKey="value" fill="#00D4FF" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* TOP COMPANIES */}
          <div className="col-lg-6">
            <div className="glass rounded-4 p-4 chart-glow">
              <h5 className="fw-bold mb-1">Top Companies</h5>
              <p className="text-muted2 small mb-3">
                Companies with the highest number of shared interview
                experiences.
              </p>

              <div style={{ height: 260 }}>
                <ResponsiveContainer>
                  <BarChart data={topCompanies}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "rgba(255,255,255,0.85)", fontSize: 12 }}
                      label={{
                        value: "Companies",
                        position: "bottom",
                        offset: 10,
                        fill: "rgba(255,255,255,0.9)",
                      }}
                    />

                    <YAxis
                      tick={{ fill: "rgba(255,255,255,0.85)", fontSize: 12 }}
                      label={{
                        value: "Number of Interview Experiences",
                        angle: -90,
                        position: "left",
                        offset: 10,
                        fill: "rgba(255,255,255,0.9)",
                      }}
                    />

                    <Tooltip
                      formatter={(value) =>
                        `${value} interview experience${Number(value) === 1 ? "" : "s"}`
                      }
                      labelFormatter={(label) => `Topic: ${label}`}
                      contentStyle={{
                        background: "rgba(10,14,28,0.95)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        borderRadius: 12,
                        color: "white",
                      }}
                    />

                    <Bar dataKey="value" fill="#6D5EF9" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* COMPANY ANALYZER */}
          <div className="col-lg-7">
            <div className="glass rounded-4 p-4 chart-glow">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <h5 className="fw-bold mb-1">Company Topic Analyzer</h5>
                  <p className="text-muted2 small mb-0">
                    Topics most frequently asked by a specific company.
                  </p>
                </div>

                <div className="d-flex gap-2">
                  <input
                    value={companyQuery}
                    onChange={(e) => setCompanyQuery(e.target.value)}
                    className="form-control bg-transparent text-light"
                    style={{ minWidth: 160 }}
                  />
                  <button
                    onClick={fetchCompanyTopics}
                    className="btn btn-accent"
                    disabled={companyLoading}
                  >
                    Analyze
                  </button>
                </div>
              </div>

              <div style={{ height: 260 }}>
                <ResponsiveContainer>
                  <BarChart data={companyTopics}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "rgba(255,255,255,0.85)", fontSize: 12 }}
                      label={{
                        value: "Topics",
                        position: "bottom",
                        offset: 10,
                        fill: "rgba(255,255,255,0.9)",
                      }}
                    />

                    <YAxis
                      tick={{ fill: "rgba(255,255,255,0.85)", fontSize: 12 }}
                      label={{
                        value: "Number of Interview Experiences",
                        angle: -90,
                        position: "left",
                        offset: 10,
                        fill: "rgba(255,255,255,0.9)",
                      }}
                    />

                    <Tooltip
                      formatter={(value) =>
                        `${value} interview experience${Number(value) === 1 ? "" : "s"}`
                      }
                      labelFormatter={(label) => `Topic: ${label}`}
                      contentStyle={{
                        background: "rgba(10,14,28,0.95)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        borderRadius: 12,
                        color: "white",
                      }}
                    />

                    <Bar dataKey="value" fill="#00FFB2" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* TRENDING POSTS */}
          <div className="col-lg-5">
            <div className="glass rounded-4 p-4">
              <h5 className="fw-bold mb-3">Trending Posts 🔥</h5>

              {trending.map((p: any) => (
                <div key={p._id} className="glass rounded-4 p-3 mb-2">
                  <div className="fw-semibold">{p.companyName}</div>
                  <div className="text-muted2 small mb-2">{p.role}</div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted2 small">
                      👍 {p.upvotesCount} upvotes
                    </span>
                    <Link
                      href={`/post/${p._id}`}
                      className="btn btn-sm btn-outline-light"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
