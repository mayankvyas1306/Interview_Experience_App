"use client";

import { motion } from "framer-motion";

export default function AnalyticsPage() {
  return (
    <div className="container py-5">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="glass glow-border p-4 rounded-4"
      >
        <h2 className="fw-bold">Analytics Dashboard 📊</h2>
        <p className="text-muted2 mb-0">
          This will show most asked topics, top companies and trending posts using charts.
        </p>
      </motion.div>
    </div>
  );
}
