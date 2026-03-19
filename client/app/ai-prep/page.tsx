"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import type { AIPrepGuide, AIComparison, AIPracticeSet } from "@/types/api";
import Link from "next/link";

type Tab = "prep" | "compare" | "practice";

const IMPORTANCE_COLOR = {
    High: "#FF6B6B",
    Medium: "#FFD166",
    Low: "#00FFB2",
};

const DIFFICULTY_COLOR = {
    Easy: "#00FFB2",
    Medium: "#FFD166",
    Hard: "#FF6B6B",
};

export default function AIPrepPage() {
    const [activeTab, setActiveTab] = useState<Tab>("prep");

    // Prep Guide state
    const [prepCompany, setPrepCompany] = useState("");
    const [prepRole, setPrepRole] = useState("");
    const [prepGuide, setPrepGuide] = useState<AIPrepGuide | null>(null);
    const [prepLoading, setPrepLoading] = useState(false);
    const [prepError, setPrepError] = useState<string | null>(null);

    // Compare state
    const [company1, setCompany1] = useState("");
    const [company2, setCompany2] = useState("");
    const [compareRole, setCompareRole] = useState("");
    const [comparison, setComparison] = useState<AIComparison | null>(null);
    const [compareLoading, setCompareLoading] = useState(false);
    const [compareError, setCompareError] = useState<string | null>(null);

    // Practice state
    const [practiceCompany, setPracticeCompany] = useState("");
    const [practiceRole, setPracticeRole] = useState("");
    const [practiceTopic, setPracticeTopic] = useState("");
    const [practiceSet, setPracticeSet] = useState<AIPracticeSet | null>(null);
    const [practiceLoading, setPracticeLoading] = useState(false);
    const [practiceError, setPracticeError] = useState<string | null>(null);
    const [revealedHints, setRevealedHints] = useState<Set<number>>(new Set());

    const fetchPrepGuide = async () => {
        if (!prepCompany.trim()) return;
        setPrepLoading(true);
        setPrepError(null);
        try {
            const params = new URLSearchParams({ company: prepCompany });
            if (prepRole.trim()) params.set("role", prepRole);
            const res = await api.get(`/ai/company-prep?${params}`);
            setPrepGuide(res.data);
        } catch (err: any) {
            setPrepError(err?.response?.data?.message || "Failed to generate guide");
        } finally {
            setPrepLoading(false);
        }
    };

    const fetchComparison = async () => {
        if (!company1.trim() || !company2.trim()) return;
        setCompareLoading(true);
        setCompareError(null);
        try {
            const params = new URLSearchParams({ company1, company2 });
            if (compareRole.trim()) params.set("role", compareRole);
            const res = await api.get(`/ai/compare?${params}`);
            setComparison(res.data);
        } catch (err: any) {
            setCompareError(err?.response?.data?.message || "Failed to compare");
        } finally {
            setCompareLoading(false);
        }
    };

    const fetchPracticeQuestions = async () => {
        if (!practiceCompany.trim() && !practiceTopic.trim()) return;
        setPracticeLoading(true);
        setPracticeError(null);
        setRevealedHints(new Set());
        try {
            const params = new URLSearchParams();
            if (practiceCompany.trim()) params.set("company", practiceCompany);
            if (practiceRole.trim()) params.set("role", practiceRole);
            if (practiceTopic.trim()) params.set("topic", practiceTopic);
            const res = await api.get(`/ai/practice-questions?${params}`);
            setPracticeSet(res.data);
        } catch (err: any) {
            setPracticeError(err?.response?.data?.message || "Failed to generate questions");
        } finally {
            setPracticeLoading(false);
        }
    };

    const toggleHint = (index: number) => {
        setRevealedHints((prev) => {
            const next = new Set(prev);
            next.has(index) ? next.delete(index) : next.add(index);
            return next;
        });
    };

    return (
        <div className="container py-5">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass glow-border p-4 p-md-5 rounded-4 mb-5 text-center"
            >
                <h1 className="fw-bold display-5 mb-2">
                    ✨ AI Interview Prep
                </h1>
                <p className="text-muted2 lead mb-0">
                    Powered by Gemini AI — personalized prep guides, company comparisons,
                    and practice questions based on real interview data.
                </p>
            </motion.div>

            {/* Tabs */}
            <div className="d-flex justify-content-center flex-wrap gap-2 mb-5">
                {[
                    { id: "prep" as Tab, label: "📋 Prep Guide", desc: "Get company-specific guide" },
                    { id: "compare" as Tab, label: "⚖️ Compare", desc: "Compare two companies" },
                    { id: "practice" as Tab, label: "💡 Practice", desc: "Generate questions" },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`btn rounded-pill px-4 py-2 fw-bold ${activeTab === tab.id
                                ? "btn-light shadow-lg"
                                : "btn-outline-secondary border-0 text-muted2"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {/* ── PREP GUIDE TAB ── */}
                {activeTab === "prep" && (
                    <motion.div
                        key="prep"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <div className="glass rounded-4 p-4 mb-4">
                            <h4 className="fw-bold mb-4">Company Prep Guide</h4>
                            <div className="row g-3">
                                <div className="col-md-5">
                                    <label className="form-label text-muted2">Company Name *</label>
                                    <input
                                        className="form-control bg-transparent text-light border-secondary"
                                        placeholder="Google, Amazon, Microsoft..."
                                        value={prepCompany}
                                        onChange={(e) => setPrepCompany(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && fetchPrepGuide()}
                                    />
                                </div>
                                <div className="col-md-5">
                                    <label className="form-label text-muted2">Role (optional)</label>
                                    <input
                                        className="form-control bg-transparent text-light border-secondary"
                                        placeholder="SDE, Frontend Engineer..."
                                        value={prepRole}
                                        onChange={(e) => setPrepRole(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && fetchPrepGuide()}
                                    />
                                </div>
                                <div className="col-md-2 d-flex align-items-end">
                                    <button
                                        onClick={fetchPrepGuide}
                                        disabled={prepLoading || !prepCompany.trim()}
                                        className="btn btn-accent w-100"
                                    >
                                        {prepLoading ? (
                                            <span className="spinner-border spinner-border-sm"></span>
                                        ) : (
                                            "Generate ✨"
                                        )}
                                    </button>
                                </div>
                            </div>
                            {prepError && (
                                <p className="text-warning small mt-2 mb-0">
                                    <i className="bi bi-exclamation-circle me-1"></i>{prepError}
                                </p>
                            )}
                        </div>

                        {prepGuide && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="d-flex flex-column gap-4"
                            >
                                {/* Overview */}
                                <div className="glass rounded-4 p-4">
                                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
                                        <div>
                                            <h4 className="fw-bold mb-1">{prepGuide.company}</h4>
                                            {prepGuide.role && (
                                                <div className="text-muted2">{prepGuide.role}</div>
                                            )}
                                        </div>
                                        <div className="d-flex gap-2 flex-wrap align-items-center">
                                            <span
                                                className="badge"
                                                style={{
                                                    background: `${DIFFICULTY_COLOR[prepGuide.guide.difficulty as keyof typeof DIFFICULTY_COLOR]}22`,
                                                    color: DIFFICULTY_COLOR[prepGuide.guide.difficulty as keyof typeof DIFFICULTY_COLOR],
                                                    border: `1px solid ${DIFFICULTY_COLOR[prepGuide.guide.difficulty as keyof typeof DIFFICULTY_COLOR]}44`,
                                                }}
                                            >
                                                {prepGuide.guide.difficulty}
                                            </span>
                                            <span className="text-muted2 small">
                                                Based on {prepGuide.basedOnPosts} real interviews
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-muted2 mb-0">{prepGuide.guide.overview}</p>
                                </div>

                                {/* Typical Rounds */}
                                <div className="glass rounded-4 p-4">
                                    <h5 className="fw-bold mb-4">📋 Typical Interview Rounds</h5>
                                    <div className="row g-3">
                                        {prepGuide.guide.typical_rounds.map((round, i) => (
                                            <div key={i} className="col-md-6">
                                                <div className="glass rounded-3 p-3 h-100">
                                                    <div className="d-flex justify-content-between align-items-start mb-1">
                                                        <span className="fw-semibold">{round.name}</span>
                                                        <span className="badge bg-secondary bg-opacity-50 small">
                                                            {round.duration}
                                                        </span>
                                                    </div>
                                                    <p className="text-muted2 small mb-0">{round.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Key Topics */}
                                <div className="glass rounded-4 p-4">
                                    <h5 className="fw-bold mb-4">🎯 Key Topics to Study</h5>
                                    <div className="d-flex flex-column gap-2">
                                        {prepGuide.guide.key_topics.map((item, i) => (
                                            <div key={i} className="glass rounded-3 p-3 d-flex gap-3 align-items-start">
                                                <span
                                                    className="badge rounded-pill mt-1"
                                                    style={{
                                                        background: `${IMPORTANCE_COLOR[item.importance as keyof typeof IMPORTANCE_COLOR]}22`,
                                                        color: IMPORTANCE_COLOR[item.importance as keyof typeof IMPORTANCE_COLOR],
                                                        border: `1px solid ${IMPORTANCE_COLOR[item.importance as keyof typeof IMPORTANCE_COLOR]}44`,
                                                        minWidth: 60,
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    {item.importance}
                                                </span>
                                                <div>
                                                    <div className="fw-semibold">{item.topic}</div>
                                                    <div className="text-muted2 small">{item.description}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Prep Timeline */}
                                <div className="glass rounded-4 p-4">
                                    <h5 className="fw-bold mb-4">📅 Preparation Timeline</h5>
                                    <div className="d-flex flex-column gap-3">
                                        {prepGuide.guide.preparation_timeline.map((week, i) => (
                                            <div key={i} className="d-flex gap-3">
                                                <div
                                                    className="badge bg-primary bg-opacity-25 text-primary d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                                                    style={{ width: 80, height: 40, fontSize: "0.7rem" }}
                                                >
                                                    {week.week}
                                                </div>
                                                <div>
                                                    <div className="fw-semibold">{week.focus}</div>
                                                    <div className="text-muted2 small">
                                                        {week.resources.join(" • ")}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Tips + Red Flags */}
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <div className="glass rounded-4 p-4 h-100">
                                            <h5 className="fw-bold mb-3">💡 Pro Tips</h5>
                                            <ul className="mb-0 ps-3">
                                                {prepGuide.guide.tips.map((tip, i) => (
                                                    <li key={i} className="text-light small mb-2">{tip}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="glass rounded-4 p-4 h-100">
                                            <h5 className="fw-bold mb-3">🚩 Red Flags</h5>
                                            <ul className="mb-0 ps-3">
                                                {prepGuide.guide.red_flags.map((flag, i) => (
                                                    <li key={i} className="text-warning small mb-2">{flag}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Salary */}
                                <div className="glass rounded-4 p-4">
                                    <h5 className="fw-bold mb-2">💰 Salary Negotiation</h5>
                                    <p className="text-muted2 mb-0">{prepGuide.guide.salary_negotiation}</p>
                                </div>

                                <p className="text-muted2 small text-center">
                                    ✨ Generated by Gemini AI • {new Date(prepGuide.generatedAt).toLocaleDateString()}
                                </p>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {/* ── COMPARE TAB ── */}
                {activeTab === "compare" && (
                    <motion.div
                        key="compare"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <div className="glass rounded-4 p-4 mb-4">
                            <h4 className="fw-bold mb-4">Compare Two Companies</h4>
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label className="form-label text-muted2">Company 1 *</label>
                                    <input
                                        className="form-control bg-transparent text-light border-secondary"
                                        placeholder="Google"
                                        value={company1}
                                        onChange={(e) => setCompany1(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label text-muted2">Company 2 *</label>
                                    <input
                                        className="form-control bg-transparent text-light border-secondary"
                                        placeholder="Amazon"
                                        value={company2}
                                        onChange={(e) => setCompany2(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label text-muted2">Role (optional)</label>
                                    <input
                                        className="form-control bg-transparent text-light border-secondary"
                                        placeholder="SDE"
                                        value={compareRole}
                                        onChange={(e) => setCompareRole(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-2 d-flex align-items-end">
                                    <button
                                        onClick={fetchComparison}
                                        disabled={compareLoading || !company1.trim() || !company2.trim()}
                                        className="btn btn-accent w-100"
                                    >
                                        {compareLoading ? (
                                            <span className="spinner-border spinner-border-sm"></span>
                                        ) : (
                                            "Compare ✨"
                                        )}
                                    </button>
                                </div>
                            </div>
                            {compareError && (
                                <p className="text-warning small mt-2 mb-0">
                                    <i className="bi bi-exclamation-circle me-1"></i>{compareError}
                                </p>
                            )}
                        </div>

                        {comparison && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="d-flex flex-column gap-4"
                            >
                                {/* Summary */}
                                <div className="glass rounded-4 p-4">
                                    <p className="text-muted2 mb-3">{comparison.comparison.summary}</p>
                                    <div className="row g-3">
                                        {[comparison.company1, comparison.company2].map((co) => {
                                            const diff = comparison.comparison.difficulty_comparison[co];
                                            return (
                                                <div key={co} className="col-md-6">
                                                    <div className="glass rounded-3 p-3">
                                                        <div className="fw-bold mb-1">{co}</div>
                                                        <span
                                                            className="badge me-2"
                                                            style={{
                                                                background: `${DIFFICULTY_COLOR[diff?.rating as keyof typeof DIFFICULTY_COLOR]}22`,
                                                                color: DIFFICULTY_COLOR[diff?.rating as keyof typeof DIFFICULTY_COLOR],
                                                            }}
                                                        >
                                                            {diff?.rating}
                                                        </span>
                                                        <span className="text-muted2 small">{diff?.reason}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Process Comparison Table */}
                                <div className="glass rounded-4 p-4">
                                    <h5 className="fw-bold mb-4">Process Comparison</h5>
                                    <div className="table-responsive">
                                        <table className="table table-dark table-bordered align-middle">
                                            <thead>
                                                <tr>
                                                    <th>Aspect</th>
                                                    <th>{comparison.company1}</th>
                                                    <th>{comparison.company2}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {comparison.comparison.process_comparison.map((row, i) => (
                                                    <tr key={i}>
                                                        <td className="fw-semibold text-muted2">{row.aspect}</td>
                                                        <td className="small">{row[comparison.company1]}</td>
                                                        <td className="small">{row[comparison.company2]}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Recommendation */}
                                <div className="glass rounded-4 p-4">
                                    <h5 className="fw-bold mb-2">🎯 Recommendation</h5>
                                    <p className="text-muted2 mb-3">{comparison.comparison.recommendation}</p>
                                    <div className="d-flex gap-3 flex-wrap">
                                        <div className="glass rounded-3 p-3 flex-grow-1">
                                            <div className="text-muted2 small mb-1">Better for beginners</div>
                                            <div className="fw-bold">{comparison.comparison.better_for_beginners}</div>
                                        </div>
                                        <div className="glass rounded-3 p-3 flex-grow-1">
                                            <div className="text-muted2 small mb-1">Better for experienced</div>
                                            <div className="fw-bold">{comparison.comparison.better_for_experienced}</div>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-muted2 small text-center">
                                    ✨ Generated by Gemini AI •{" "}
                                    Data from {comparison.dataPoints[comparison.company1]} + {comparison.dataPoints[comparison.company2]} real interviews •{" "}
                                    {new Date(comparison.generatedAt).toLocaleDateString()}
                                </p>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {/* ── PRACTICE TAB ── */}
                {activeTab === "practice" && (
                    <motion.div
                        key="practice"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <div className="glass rounded-4 p-4 mb-4">
                            <h4 className="fw-bold mb-4">Practice Questions</h4>
                            <div className="row g-3">
                                <div className="col-md-3">
                                    <label className="form-label text-muted2">Company</label>
                                    <input
                                        className="form-control bg-transparent text-light border-secondary"
                                        placeholder="Google"
                                        value={practiceCompany}
                                        onChange={(e) => setPracticeCompany(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label text-muted2">Role</label>
                                    <input
                                        className="form-control bg-transparent text-light border-secondary"
                                        placeholder="SDE Intern"
                                        value={practiceRole}
                                        onChange={(e) => setPracticeRole(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label text-muted2">Topic</label>
                                    <select
                                        className="form-select bg-transparent text-light border-secondary"
                                        value={practiceTopic}
                                        onChange={(e) => setPracticeTopic(e.target.value)}
                                    >
                                        <option value="">Any topic</option>
                                        {["DSA", "System Design", "OS", "DBMS", "OOP", "CN", "Behavioral"].map(
                                            (t) => <option key={t} value={t}>{t}</option>
                                        )}
                                    </select>
                                </div>
                                <div className="col-md-3 d-flex align-items-end">
                                    <button
                                        onClick={fetchPracticeQuestions}
                                        disabled={
                                            practiceLoading ||
                                            (!practiceCompany.trim() && !practiceTopic)
                                        }
                                        className="btn btn-accent w-100"
                                    >
                                        {practiceLoading ? (
                                            <span className="spinner-border spinner-border-sm"></span>
                                        ) : (
                                            "Generate ✨"
                                        )}
                                    </button>
                                </div>
                            </div>
                            {practiceError && (
                                <p className="text-warning small mt-2 mb-0">
                                    <i className="bi bi-exclamation-circle me-1"></i>{practiceError}
                                </p>
                            )}
                        </div>

                        {practiceSet && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {practiceSet.basedOnRealData && (
                                    <div className="glass rounded-3 p-3 mb-4 d-flex align-items-center gap-2">
                                        <i className="bi bi-check-circle text-success"></i>
                                        <span className="text-muted2 small">
                                            Generated using real interview questions from the community
                                        </span>
                                    </div>
                                )}

                                <div className="d-flex flex-column gap-3">
                                    {practiceSet.questions.map((q, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="glass rounded-4 p-4"
                                        >
                                            <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
                                                <span className="fw-bold text-muted2">Q{i + 1}</span>
                                                <div className="d-flex gap-2 flex-wrap">
                                                    <span
                                                        className="badge rounded-pill"
                                                        style={{
                                                            background: `${DIFFICULTY_COLOR[q.difficulty]}22`,
                                                            color: DIFFICULTY_COLOR[q.difficulty],
                                                            border: `1px solid ${DIFFICULTY_COLOR[q.difficulty]}44`,
                                                        }}
                                                    >
                                                        {q.difficulty}
                                                    </span>
                                                    <span className="badge bg-secondary bg-opacity-25">
                                                        {q.type}
                                                    </span>
                                                    <span className="badge bg-primary bg-opacity-25">
                                                        {q.topic}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="text-light mb-3">{q.question}</p>

                                            <div className="text-muted2 small mb-3">
                                                <i className="bi bi-lightbulb me-1"></i>
                                                <strong>Tests:</strong> {q.what_they_test}
                                            </div>

                                            <button
                                                onClick={() => toggleHint(i)}
                                                className="btn btn-sm btn-outline-secondary rounded-3"
                                            >
                                                {revealedHints.has(i) ? "Hide" : "Show"} Hint
                                            </button>

                                            <AnimatePresence>
                                                {revealedHints.has(i) && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="glass rounded-3 p-3 mt-2">
                                                            <i className="bi bi-lightbulb-fill text-warning me-2"></i>
                                                            <span className="text-muted2 small">{q.hint}</span>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    ))}
                                </div>

                                <p className="text-muted2 small text-center mt-4">
                                    ✨ Generated by Gemini AI • {new Date(practiceSet.generatedAt).toLocaleDateString()}
                                </p>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}