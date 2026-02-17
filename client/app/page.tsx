"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function Home() {
  const [radar, setRadar] = useState({
    topTopic: "—",
    trendingCompany: "—",
    mostSaved: "—",
  });

  useEffect(() => {
    const fetchRadar = async () => {
      try {
        const [overviewRes, trendingRes] = await Promise.all([
          api.get("/analytics/overview"),
          api.get("/analytics/trending-stats"),
        ]);

        setRadar({
          topTopic: overviewRes.data.mostAskedTopics?.[0]?._id || "—",
          trendingCompany: overviewRes.data.topCompanies?.[0]?._id || "—",
          mostSaved:
            trendingRes.data.trendingPosts?.[0]?.tags?.slice(0, 2).join(" + ") ||
            "—",
        });
      } catch (error) {
        console.error("Failed to load prep radar", error);
      }
    };

    fetchRadar();
  }, []);

  return (
    <div className="min-vh-100 d-flex align-items-center">
      <div className="container py-5">
        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="glass glow-border p-4 p-md-5 rounded-4"
        >
          <div className="row g-4 align-items-center">
            {/* LEFT */}
            <div className="col-lg-7">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
              >
                <h1 className="display-5 fw-bold mt-4">
                  InterviewPulse <span style={{ color: "#00D4FF" }}>⚡</span>
                </h1>

                <p className="fs-5 text-muted2 mt-3">
                  Share real interview experiences, discover the most asked
                  topics, and prepare smarter with analytics.
                </p>

                <div className="d-flex gap-3 flex-wrap mt-4">
                  <Link
                    href="/explore"
                    className="btn btn-accent btn-lg rounded-3 px-4"
                  >
                    Explore Posts
                  </Link>

                  <Link
                    href="/create"
                    className="btn btn-outline-light btn-lg rounded-3 px-4"
                  >
                    Share Experience
                  </Link>
                </div>

                <div className="d-flex gap-4 flex-wrap mt-4 text-muted2">
                  <span>
                    <i className="bi bi-check2-circle me-2"></i>Company Filters
                  </span>
                  <span>
                    <i className="bi bi-check2-circle me-2"></i>Upvotes & Saves
                  </span>
                  <span>
                    <i className="bi bi-check2-circle me-2"></i>Analytics
                    Dashboard
                  </span>
                </div>
              </motion.div>
            </div>

            {/* RIGHT – PREP RADAR */}
            <div className="col-lg-5">
              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.6 }}
                className="glass rounded-4 p-4"
              >
                <h5 className="fw-semibold mb-3">Today’s Prep Radar</h5>

                <div className="d-flex justify-content-between align-items-center py-2 border-bottom border-secondary">
                  <span className="text-muted2">Top Topic</span>
                  <span className="fw-bold">{radar.topTopic}</span>
                </div>

                <div className="d-flex justify-content-between align-items-center py-2 border-bottom border-secondary">
                  <span className="text-muted2">Trending Company</span>
                  <span className="fw-bold">{radar.trendingCompany}</span>
                </div>

                <div className="d-flex justify-content-between align-items-center py-2">
                  <span className="text-muted2">Most Saved Topics</span>
                  <span className="fw-bold">{radar.mostSaved}</span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* FEATURE CARDS */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="row g-3 mt-4"
        >
          <div className="col-md-4">
            <Link href="/analytics" className="text-decoration-none">
              <div className="glass rounded-4 p-4 h-100 card-hover">
                <div className="fs-3 mb-2">📌</div>
                <h5 className="fw-semibold text-light">
                  Company-wise Patterns
                </h5>
                <p className="text-muted2 mb-0">
                  Analyze repeated questions asked by companies.
                </p>
              </div>
            </Link>
          </div>

          <div className="col-md-4">
            <Link
              href="/explore?sort=top"
              className="text-decoration-none"
            >
              <div className="glass rounded-4 p-4 h-100 card-hover">
                <div className="fs-3 mb-2">🔥</div>
                <h5 className="fw-semibold text-light">
                  Trending Experiences
                </h5>
                <p className="text-muted2 mb-0">
                  Most upvoted interview experiences right now.
                </p>
              </div>
            </Link>
          </div>

          <div className="col-md-4">
            <Link href="/analytics" className="text-decoration-none">
              <div className="glass rounded-4 p-4 h-100 card-hover">
                <div className="fs-3 mb-2">📊</div>
                <h5 className="fw-semibold text-light">
                  Analytics Dashboard
                </h5>
                <p className="text-muted2 mb-0">
                  Topics, companies, trends & preparation insights.
                </p>
              </div>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
