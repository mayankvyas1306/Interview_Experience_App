"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import type { AIPostAnalysis } from "@/types/api";
import { motion, AnimatePresence } from "framer-motion";

const DIFFICULTY_COLOR = {
    Easy: "#00FFB2",
    Medium: "#FFD166",
    Hard: "#FF6B6B",
};

const RESOURCE_ICON = {
    Book: "📚",
    Course: "🎓",
    Website: "🌐",
    Practice: "💻",
};

export default function AIInsights({ postId }: { postId: string }) {
    const [data, setData] = useState<AIPostAnalysis | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);

    const fetchAnalysis = async () => {
        if (data) {
            setOpen((prev) => !prev);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await api.get(`/ai/analyze-post/${postId}`);
            setData(res.data);
            setOpen(true);
        } catch (err: any) {
            const msg =
                err?.response?.status === 503
                    ? "AI features are not available right now"
                    : err?.response?.data?.message || "Failed to generate analysis";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-4">
            <button
                onClick={fetchAnalysis}
                disabled={loading}
                className="btn btn-outline-light rounded-3 w-100 d-flex align-items-center justify-content-center gap-2"
                style={{
                    background: open
                        ? "rgba(109,94,249,0.15)"
                        : "transparent",
                    borderColor: "rgba(109,94,249,0.5)",
                }}
            >
                {loading ? (
                    <>
                        <span className="spinner-border spinner-border-sm"></span>
                        Analyzing with AI...
                    </>
                ) : (
                    <>
                        <span>✨</span>
                        {open ? "Hide" : "Get"} AI Insights
                    </>
                )}
            </button>

            {error && (
                <div className="text-warning small mt-2 text-center">
                    <i className="bi bi-exclamation-circle me-1"></i>
                    {error}
                </div>
            )}

            <AnimatePresence>
                {open && data && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="glass rounded-4 p-4 mt-3">
                            {/* Header */}
                            <div className="d-flex align-items-center gap-2 mb-4">
                                <span className="fs-5">✨</span>
                                <h5 className="fw-bold mb-0">AI Analysis</h5>
                                <span
                                    className="badge ms-auto"
                                    style={{
                                        background: `${DIFFICULTY_COLOR[data.analysis.difficulty_rating]}22`,
                                        color: DIFFICULTY_COLOR[data.analysis.difficulty_rating],
                                        border: `1px solid ${DIFFICULTY_COLOR[data.analysis.difficulty_rating]}44`,
                                    }}
                                >
                                    {data.analysis.difficulty_rating}
                                </span>
                            </div>

                            {/* Difficulty explanation */}
                            <p className="text-muted2 small mb-4">
                                {data.analysis.difficulty_explanation}
                            </p>

                            {/* Key Topics */}
                            <div className="mb-4">
                                <div className="fw-semibold small text-muted2 mb-2 text-uppercase">
                                    Key Topics
                                </div>
                                <div className="d-flex flex-wrap gap-2">
                                    {data.analysis.key_topics.map((topic) => (
                                        <span
                                            key={topic}
                                            className="badge rounded-pill"
                                            style={{
                                                background: "rgba(0,212,255,0.10)",
                                                border: "1px solid rgba(0,212,255,0.25)",
                                                color: "rgba(255,255,255,0.9)",
                                            }}
                                        >
                                            {topic}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Prep Tips */}
                            <div className="mb-4">
                                <div className="fw-semibold small text-muted2 mb-2 text-uppercase">
                                    Preparation Tips
                                </div>
                                <ul className="mb-0 ps-3">
                                    {data.analysis.preparation_tips.map((tip, i) => (
                                        <li key={i} className="text-light small mb-1">
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Success Factors */}
                            <div className="glass rounded-3 p-3 mb-4">
                                <div className="fw-semibold small mb-1">
                                    ✅ Success Factors
                                </div>
                                <p className="text-muted2 small mb-0">
                                    {data.analysis.success_factors}
                                </p>
                            </div>

                            {/* Common Mistakes */}
                            <div className="glass rounded-3 p-3 mb-4">
                                <div className="fw-semibold small mb-1">
                                    ⚠️ Common Mistakes
                                </div>
                                <p className="text-muted2 small mb-0">
                                    {data.analysis.common_mistakes}
                                </p>
                            </div>

                            {/* Resources */}
                            {data.analysis.resources?.length > 0 && (
                                <div>
                                    <div className="fw-semibold small text-muted2 mb-2 text-uppercase">
                                        Recommended Resources
                                    </div>
                                    <div className="d-flex flex-column gap-2">
                                        {data.analysis.resources.map((res, i) => (
                                            <div key={i} className="glass rounded-3 p-3">
                                                <div className="d-flex align-items-center gap-2">
                                                    <span>
                                                        {RESOURCE_ICON[res.type as keyof typeof RESOURCE_ICON] || "📌"}
                                                    </span>
                                                    <div>
                                                        <div className="fw-semibold small">{res.title}</div>
                                                        <div className="text-muted2" style={{ fontSize: "0.75rem" }}>
                                                            {res.description}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div
                                className="text-muted2 mt-3"
                                style={{ fontSize: "0.7rem" }}
                            >
                                ✨ Generated by Gemini AI •{" "}
                                {new Date(data.generatedAt).toLocaleDateString()}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}