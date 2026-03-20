"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import Image from "next/image";
import Link from "next/link";
import SkeletonCard from "@/components/SkeletonCard";
import { useAuth } from "@/context/AuthContext";

// ─── Constants ────────────────────────────────────────────────────────────────
const COLORS = ["#00D4FF", "#6D5EF9", "#00FFB2", "#FF0055", "#FFBB00"];
const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "#00FFB2",
  Medium: "#FFBB00",
  Hard: "#FF0055",
};

const TAB_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const StatCard = ({
  label,
  value,
  icon,
  color = "text-light",
}: {
  label: string;
  value: string | number;
  icon: string;
  color?: string;
}) => (
  <div className="glass p-4 rounded-4 h-100 position-relative overflow-hidden">
    <div className="d-flex justify-content-between align-items-start">
      <div>
        <p className="text-muted2 small text-uppercase fw-bold mb-1">{label}</p>
        <h3 className={`fw-bold mb-0 ${color}`}>{value}</h3>
      </div>
      <div className="glass p-2 rounded-circle bg-white bg-opacity-10">
        <span className="fs-4">{icon}</span>
      </div>
    </div>
  </div>
);

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass p-3 rounded-3 border border-secondary shadow-lg">
        <p className="fw-bold mb-1 text-light">{label}</p>
        <p className="text-muted2 mb-0">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const { user } = useAuth();
  const fetchedRef = useRef(false);

  // ✅ Fixed: removed unused `loading` state
  const [activeTab, setActiveTab] = useState("insights");

  const [companies, setCompanies] = useState<string[]>([]);
  const [companyQuery, setCompanyQuery] = useState("");
  const [selectedCompanyData, setSelectedCompanyData] = useState<Record<string, unknown> | null>(null);
  const [topicStats, setTopicStats] = useState<Record<string, unknown> | null>(null);
  const [trendingStats, setTrendingStats] = useState<Record<string, unknown> | null>(null);
  const [userStats, setUserStats] = useState<Record<string, unknown> | null>(null);

  // ── Fetchers ─────────────────────────────────────────────────────────────

  const fetchCompanyStats = useCallback(async (company: string) => {
    if (!company) return;
    try {
      const res = await api.get(
        `/analytics/company-stats?company=${encodeURIComponent(company)}`
      );
      setSelectedCompanyData(res.data);
    } catch {
      toast.error("Failed to load company stats");
    }
  }, []);

  // ✅ Fixed: wrapped in useCallback so it can be listed in useEffect deps
  const fetchCompanies = useCallback(async () => {
    try {
      const res = await api.get("/analytics/companies");
      setCompanies(res.data.companies);
      if (res.data.companies.length > 0) {
        setCompanyQuery(res.data.companies[0]);
        fetchCompanyStats(res.data.companies[0]);
      }
    } catch (err) {
      console.error(err);
    }
  }, [fetchCompanyStats]);

  const fetchTopicStats = useCallback(async () => {
    const res = await api.get("/analytics/topic-analytics");
    setTopicStats(res.data);
  }, []);

  const fetchTrendingStats = useCallback(async () => {
    const res = await api.get("/analytics/trending-stats");
    setTrendingStats(res.data);
  }, []);

  // ✅ Fixed: wrapped in useCallback so it can be listed in useEffect deps
  const fetchUserStats = useCallback(async () => {
    if (!user) return;
    const res = await api.get("/analytics/user-stats");
    setUserStats(res.data);
  }, [user]);

  // ✅ Fixed: fetchedRef prevents double-fetch in StrictMode
  // All fetchers are now stable via useCallback — no eslint-disable needed
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchCompanies();
    fetchTopicStats();
    fetchTrendingStats();
  }, [fetchCompanies, fetchTopicStats, fetchTrendingStats]);

  // ✅ Fixed: userStats and fetchUserStats are now listed properly
  useEffect(() => {
    if (activeTab === "me" && !userStats) {
      fetchUserStats();
    }
  }, [activeTab, userStats, fetchUserStats]);

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVal = e.target.value;
    setCompanyQuery(newVal);
    fetchCompanyStats(newVal);
  };

  // ── Renderers ─────────────────────────────────────────────────────────────

  const renderInsights = () => {
    if (!selectedCompanyData) return <SkeletonCard />;

    type DifficultyItem = { _id: string; count: number };
    type TopicItem = { _id: string; count: number };
    type RoleItem = { _id: string; count: number };

    const difficultyData = (selectedCompanyData.difficultySplit as DifficultyItem[]).map(
      (d) => ({ name: d._id, value: d.count })
    );

    return (
      <motion.div variants={TAB_VARIANTS} initial="hidden" animate="visible" exit="exit">
        <div className="d-flex align-items-center gap-3 mb-4">
          <label className="text-muted2 fw-bold">Analyze Company:</label>
          <select
            className="form-select bg-dark text-light border-secondary p-3 rounded-3 fw-bold"
            value={companyQuery}
            onChange={handleCompanyChange}
            style={{ maxWidth: 300 }}
          >
            {companies.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <StatCard
              label="Avg Rounds"
              value={selectedCompanyData.avgRounds as number}
              icon="🔄"
              color="text-info"
            />
          </div>
          <div className="col-md-4">
            <StatCard
              label="Dominant Role"
              value={
                ((selectedCompanyData.commonRoles as RoleItem[])[0]?._id) || "N/A"
              }
              icon="👨‍💻"
              color="text-warning"
            />
          </div>
          <div className="col-md-4">
            <StatCard
              label="Interview Posts"
              value={difficultyData.reduce((acc, curr) => acc + curr.value, 0)}
              icon="📝"
              color="text-success"
            />
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-5">
            <div className="glass p-4 rounded-4 h-100 chart-glow">
              <h5 className="fw-bold mb-4">Difficulty Split 🤯</h5>
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={difficultyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {difficultyData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={DIFFICULTY_COLORS[entry.name] || COLORS[index]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="d-flex justify-content-center gap-3 mt-3">
                {difficultyData.map((d) => (
                  <div key={d.name} className="d-flex align-items-center gap-2 small">
                    <span
                      className="d-inline-block rounded-circle"
                      style={{
                        width: 10,
                        height: 10,
                        backgroundColor: DIFFICULTY_COLORS[d.name] || "#ccc",
                      }}
                    />
                    <span className="text-muted2">{d.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="glass p-4 rounded-4 h-100 chart-glow">
              <h5 className="fw-bold mb-4">Most Asked Topics 📚</h5>
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={selectedCompanyData.topTopics as TopicItem[]}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      opacity={0.1}
                      horizontal
                      vertical={false}
                    />
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="_id"
                      width={100}
                      tick={{ fill: "#aaa", fontSize: 13 }}
                      interval={0}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: "rgba(255,255,255,0.05)" }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#00D4FF"
                      radius={[0, 4, 4, 0]}
                      barSize={20}
                    >
                      {(selectedCompanyData.topTopics as TopicItem[]).map(
                        (_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        )
                      )}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderTopics = () => {
    if (!topicStats) return <SkeletonCard />;

    type GlobalTopic = { name: string; count: number };

    return (
      <motion.div variants={TAB_VARIANTS} initial="hidden" animate="visible" exit="exit">
        <div className="glass p-5 rounded-4 mb-4">
          <h3 className="fw-bold mb-2">Global Topic Heatmap 🔥</h3>
          <p className="text-muted2">
            Most frequently asked topics across all interviews.
          </p>
          <div style={{ width: "100%", height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={(topicStats as { globalTopics: GlobalTopic[] }).globalTopics}
                margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  opacity={0.1}
                  vertical={false}
                />
                <XAxis dataKey="name" tick={{ fill: "#aaa" }} />
                <YAxis tick={{ fill: "#aaa" }} />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                />
                <Bar dataKey="count" fill="#6D5EF9" radius={[8, 8, 0, 0]}>
                  {(topicStats as { globalTopics: GlobalTopic[] }).globalTopics.map(
                    (_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    )
                  )}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderTrending = () => {
    if (!trendingStats) return <SkeletonCard />;

    type TrendingPost = {
      _id: string;
      companyName: string;
      role: string;
      difficulty: string;
      rounds: unknown[];
      upvotesCount: number;
      tags: string[];
    };

    return (
      <motion.div variants={TAB_VARIANTS} initial="hidden" animate="visible" exit="exit">
        <div>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4 className="fw-bold mb-1">🔥 Trending Interviews</h4>
              <p className="text-muted2 mb-0">Community favorites this week</p>
            </div>
            <Link
              href="/explore?sort=top"
              className="btn btn-outline-light rounded-pill px-4"
            >
              View All
            </Link>
          </div>

          <div className="row g-4">
            {(trendingStats as { trendingPosts: TrendingPost[] }).trendingPosts.map(
              (post, idx) => (
                <div key={post._id} className="col-md-6 col-lg-4">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="glass p-4 rounded-4 h-100 card-hover border border-secondary border-opacity-25 position-relative"
                  >
                    <div className="position-absolute top-0 end-0 m-3">
                      <div
                        className={`badge rounded-pill ${idx < 3
                            ? "bg-warning text-dark"
                            : "bg-dark border border-secondary text-light"
                          }`}
                      >
                        #{idx + 1} Trending
                      </div>
                    </div>

                    <div className="mb-3 mt-2">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <div
                          className="px-2 py-1 bg-white bg-opacity-10 rounded text-uppercase fw-bold text-light"
                          style={{ fontSize: "0.75rem" }}
                        >
                          {post.companyName.substring(0, 2)}
                        </div>
                        <h5 className="fw-bold mb-0 text-truncate text-light">
                          {post.companyName}
                        </h5>
                      </div>
                      <div className="badge bg-secondary bg-opacity-25 text-light mb-2">
                        {post.role}
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-3 text-muted2 small mb-4">
                      <span>{post.difficulty}</span>
                      <span>•</span>
                      <span>{post.rounds.length} Rounds</span>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top border-secondary border-opacity-25">
                      <div className="d-flex align-items-center gap-1 text-light">
                        <i className="bi bi-arrow-up-circle-fill text-primary" />
                        <span className="fw-bold">{post.upvotesCount}</span>
                      </div>
                      <Link
                        href={`/post/${post._id}`}
                        className="btn btn-sm btn-primary rounded-pill px-3"
                      >
                        Read Experience
                      </Link>
                    </div>
                  </motion.div>
                </div>
              )
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderUserStats = () => {
    if (!user) {
      return (
        <div className="text-center py-5 glass rounded-4">
          <h3>Please Login</h3>
          <p className="text-muted2">
            You need to be logged in to view your contribution stats.
          </p>
          <Link href="/auth/login" className="btn btn-primary rounded-pill mt-2">
            Login Now
          </Link>
        </div>
      );
    }

    if (!userStats) return <SkeletonCard />;

    type UserStatsData = {
      totalPosts: number;
      totalUpvotes: number;
      rank: string;
      recentActivity: {
        _id: string;
        companyName: string;
        role: string;
        createdAt: string;
        result: string;
      }[];
    };

    const stats = userStats as UserStatsData;

    return (
      <motion.div variants={TAB_VARIANTS} initial="hidden" animate="visible" exit="exit">
        <div className="glass p-5 rounded-4 mb-4 text-center position-relative overflow-hidden">
          <div className="position-relative" style={{ zIndex: 1 }}>
            <Image
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
              alt="avatar"
              width={80}
              height={80}
              className="rounded-circle mb-3 border border-4 border-dark shadow-lg"
              unoptimized
            />
            <h2 className="fw-bold mb-1">
              Hello, {user.fullName.split(" ")[0]}! 👋
            </h2>
            <p className="text-muted2">Here is your impact on the community.</p>
            <div className="d-inline-flex gap-2 align-items-center badge bg-warning text-dark px-3 py-2 rounded-pill mt-2">
              <span>🏆 Rank:</span>
              <span className="fw-bold">{stats.rank}</span>
            </div>
          </div>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <StatCard
              label="Total Contributions"
              value={stats.totalPosts}
              icon="✍️"
            />
          </div>
          <div className="col-md-6">
            <StatCard
              label="Total Upvotes Earned"
              value={stats.totalUpvotes}
              icon="❤️"
              color="text-danger"
            />
          </div>
        </div>

        <h5 className="fw-bold mb-3">Recent Activity</h5>
        {stats.recentActivity.length === 0 ? (
          <p className="text-muted2">
            No recent activity. Share your first interview experience!
          </p>
        ) : (
          <div className="d-flex flex-column gap-3">
            {stats.recentActivity.map((p) => (
              <div
                key={p._id}
                className="glass p-3 rounded-3 d-flex justify-content-between align-items-center"
              >
                <div>
                  <div className="fw-bold">{p.companyName}</div>
                  <div className="small text-muted2">
                    {p.role} •{" "}
                    {new Date(p.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-end">
                  <div className="text-success small fw-bold">{p.result}</div>
                  <Link
                    href={`/post/${p._id}`}
                    className="text-primary small text-decoration-none"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="container py-5">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 text-center"
      >
        <h1 className="fw-bold display-5 mb-2 text-gradient">
          Analytics & Insights
        </h1>
        <p className="text-muted2 lead">
          Data-driven insights to help you crack your next interview.
        </p>
      </motion.div>

      {/* Tab navigation */}
      <div className="d-flex justify-content-center flex-wrap gap-2 mb-5">
        {[
          { id: "insights", label: "🏢 Company Insights" },
          { id: "topics", label: "📈 Topic Trends" },
          { id: "trending", label: "🔥 Trending Posts" },
          { id: "me", label: "👤 My Stats" },
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

      <div style={{ minHeight: 500 }}>
        <AnimatePresence mode="wait">
          {activeTab === "insights" && renderInsights()}
          {activeTab === "topics" && renderTopics()}
          {activeTab === "trending" && renderTrending()}
          {activeTab === "me" && renderUserStats()}
        </AnimatePresence>
      </div>
    </div>
  );
}