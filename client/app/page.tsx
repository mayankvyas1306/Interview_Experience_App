"use client";

import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-vh-100 d-flex align-items-center">
      <div className="container py-5">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="glass glow-border p-4 p-md-5 rounded-4"
        >
          <div className="row g-4 align-items-center">
            <div className="col-lg-7">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
              >
                {/* <div className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill glass">
                  <i className="bi bi-stars"></i>
                  <span className="small text-muted2">
                    Modern Interview Experience Platform
                  </span>
                </div> */}

                <h1 className="display-5 fw-bold mt-4">
                  InterviewPulse <span style={{ color: "#00D4FF" }}>⚡</span>
                </h1>

                <p className="fs-5 text-muted2 mt-3">
                  Share real interview experiences, discover the most asked topics,
                  and prepare smarter with analytics.
                </p>

                <div className="d-flex gap-3 flex-wrap mt-4">
                  <button className="btn btn-accent btn-lg rounded-3 px-4">
                    Explore Posts
                  </button>
                  <button className="btn btn-outline-light btn-lg rounded-3 px-4">
                    Share Experience
                  </button>
                </div>

                <div className="d-flex gap-4 flex-wrap mt-4 text-muted2">
                  <span><i className="bi bi-check2-circle me-2"></i>Company Filters</span>
                  <span><i className="bi bi-check2-circle me-2"></i>Upvotes & Saves</span>
                  <span><i className="bi bi-check2-circle me-2"></i>Analytics Dashboard</span>
                </div>
              </motion.div>
            </div>

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
                  <span className="fw-bold">DSA</span>
                </div>

                <div className="d-flex justify-content-between align-items-center py-2 border-bottom border-secondary">
                  <span className="text-muted2">Trending Company</span>
                  <span className="fw-bold">Amazon</span>
                </div>

                <div className="d-flex justify-content-between align-items-center py-2 border-bottom border-secondary">
                  <span className="text-muted2">Most Saved</span>
                  <span className="fw-bold">OS + DBMS</span>
                </div>

                <div className="mt-3 small text-muted2">
                  *This dashboard will be dynamic once we connect backend analytics.
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="row g-3 mt-4"
        >
          <div className="col-md-4">
            <div className="glass rounded-4 p-4 h-100">
              <div className="fs-3 mb-2">📌</div>
              <h5 className="fw-semibold">Company-wise Patterns</h5>
              <p className="text-muted2 mb-0">
                Filter by company/role and identify repeated question trends.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="glass rounded-4 p-4 h-100">
              <div className="fs-3 mb-2">🔥</div>
              <h5 className="fw-semibold">Trending Experiences</h5>
              <p className="text-muted2 mb-0">
                Upvote and save the best interview posts from the community.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="glass rounded-4 p-4 h-100">
              <div className="fs-3 mb-2">📊</div>
              <h5 className="fw-semibold">Analytics Dashboard</h5>
              <p className="text-muted2 mb-0">
                Most asked topics, top companies, and difficulty distribution.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
