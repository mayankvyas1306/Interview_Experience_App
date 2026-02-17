"use client";

import { useEffect, useRef, useState } from "react";
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
  Sector,
} from "recharts";
import Link from "next/link";
import SkeletonCard from "@/components/SkeletonCard";
import { useAuth } from "@/context/AuthContext";

// --- CONSTANTS & CONFIG ---
const COLORS = ["#00D4FF", "#6D5EF9", "#00FFB2", "#FF0055", "#FFBB00"];
const DIFFICULTY_COLORS = {
  Easy: "#00FFB2",
  Medium: "#FFBB00",
  Hard: "#FF0055",
};

const TAB_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

// --- COMPONENTS ---

const StatCard = ({ label, value, icon, color = "text-light" }: any) => (
  <div className="glass p-4 rounded-4 h-100 position-relative overflow-hidden group">
    <div className="d-flex justify-content-between align-items-start z-1 position-relative">
      <div>
        <p className="text-muted2 small text-uppercase fw-bold tracking-wider mb-1">{label}</p>
        <h3 className={`fw-bold mb-0 ${color}`}>{value}</h3>
      </div>
      <div className="glass-icon p-2 rounded-circle bg-white bg-opacity-10">
        <span className="fs-4">{icon}</span>
      </div>
    </div>
    <div className="position-absolute top-0 end-0 p-5 bg-gradient-primary opacity-10 rounded-circle blur-xl"></div>
  </div>
);

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass p-3 rounded-3 border border-secondary shadow-lg backdrop-blur-md">
        <p className="fw-bold mb-1 text-light">{label}</p>
        <p className="text-secondary mb-0">
          {payload[0].value} {payload[0].name === 'count' || typeof payload[0].value === 'number' ? '' : ''}
        </p>
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const { user } = useAuth();
  const fetchedRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("insights"); // 'insights', 'topics', 'trending', 'me'

  // Data States
  const [companies, setCompanies] = useState<string[]>([]);
  const [companyQuery, setCompanyQuery] = useState("");
  const [selectedCompanyData, setSelectedCompanyData] = useState<any>(null); // For "Insights" tab
  const [topicStats, setTopicStats] = useState<any>(null); // For "Topics" tab
  const [trendingStats, setTrendingStats] = useState<any>(null); // For "Trending" tab
  const [userStats, setUserStats] = useState<any>(null); // For "Me" tab

  // --- FETCHERS ---

  const fetchCompanies = async () => {
    try {
      const res = await api.get("/analytics/companies");
      setCompanies(res.data.companies);
      if (res.data.companies.length > 0) {
        setCompanyQuery(res.data.companies[0]); // Default fetch first company
        fetchCompanyStats(res.data.companies[0]);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCompanyStats = async (company: string) => {
    if (!company) return;
    try {
      setLoading(true);
      const res = await api.get(`/analytics/company-stats?company=${encodeURIComponent(company)}`);
      setSelectedCompanyData(res.data);
    } catch (err) {
      toast.error("Failed to load company stats");
    } finally {
      setLoading(false);
    }
  };

  const fetchTopicStats = async () => {
    const res = await api.get("/analytics/topic-analytics");
    setTopicStats(res.data);
  };

  const fetchTrendingStats = async () => {
    const res = await api.get("/analytics/trending-stats");
    setTrendingStats(res.data);
  };

  const fetchUserStats = async () => {
    if (!user) return;
    const res = await api.get("/analytics/user-stats");
    setUserStats(res.data);
  };

  // --- EFFECTS ---

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchCompanies(); // This triggers initial company load

    // Lazy load other tabs data to speed up initial render
    fetchTopicStats();
    fetchTrendingStats();
  }, []);

  useEffect(() => {
    if (activeTab === "me" && !userStats) {
      fetchUserStats();
    }
  }, [activeTab]);

  // Handle company search/selection
  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVal = e.target.value;
    setCompanyQuery(newVal);
    fetchCompanyStats(newVal);
  };

  // --- RENDERERS ---

  // 1. COMPANY INSIGHTS TAB
  const renderInsights = () => {
    if (!selectedCompanyData) return <SkeletonCard />;

    // Prepare Pie Data
    const difficultyData = selectedCompanyData.difficultySplit.map((d: any) => ({
      name: d._id,
      value: d.count,
    }));

    return (
      <motion.div variants={TAB_VARIANTS} initial="hidden" animate="visible" exit="exit">
        {/* Search Bar */}
        <div className="d-flex align-items-center gap-3 mb-4">
          <label className="text-muted2 fw-bold whitespace-nowrap">Analyze Company:</label>
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

        {/* Quick Stats Row */}
        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <StatCard
              label="Avg Rounds"
              value={selectedCompanyData.avgRounds}
              icon="🔄"
              color="text-info"
            />
          </div>
          <div className="col-md-4">
            {/* Mock acceptance rate or difficulty proxy */}
            <StatCard
              label="Dominant Role"
              value={selectedCompanyData.commonRoles[0]?._id || "N/A"}
              icon="👨‍💻"
              color="text-warning"
            />
          </div>
          <div className="col-md-4">
            <StatCard
              label="Interview Posts"
              value={difficultyData.reduce((acc: any, curr: any) => acc + curr.value, 0)}
              icon="📝"
              color="text-success"
            />
          </div>
        </div>

        {/* Charts Row */}
        <div className="row g-4">
          {/* Difficulty Pie */}
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
                      {difficultyData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={(DIFFICULTY_COLORS as any)[entry.name] || COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="d-flex justify-content-center gap-3 mt-3">
                {difficultyData.map((d: any) => (
                  <div key={d.name} className="d-flex align-items-center gap-2 small">
                    <span className="d-inline-block rounded-circle" style={{ width: 10, height: 10, backgroundColor: (DIFFICULTY_COLORS as any)[d.name] || '#ccc' }}></span>
                    <span className="text-muted2">{d.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Topics Bar */}
          <div className="col-lg-7">
            <div className="glass p-4 rounded-4 h-100 chart-glow">
              <h5 className="fw-bold mb-4">Most Asked Topics 📚</h5>
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={selectedCompanyData.topTopics} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={true} vertical={false} />
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="_id" width={100} tick={{ fill: '#aaa', fontSize: 13 }} interval={0} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Bar dataKey="count" fill="#00D4FF" radius={[0, 4, 4, 0]} barSize={20}>
                      {selectedCompanyData.topTopics.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
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

  // 2. TOPIC FREQUENCY TAB
  const renderTopics = () => {
    if (!topicStats) return <SkeletonCard />;

    return (
      <motion.div variants={TAB_VARIANTS} initial="hidden" animate="visible" exit="exit">
        <div className="glass p-5 rounded-4 mb-4">
          <h3 className="fw-bold mb-2">Global Topic Heatmap 🔥</h3>
          <p className="text-muted2">Most frequently asked topics across all interviews.</p>

          <div style={{ width: "100%", height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicStats.globalTopics} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#aaa' }} />
                <YAxis tick={{ fill: '#aaa' }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="count" fill="#6D5EF9" radius={[8, 8, 0, 0]}>
                  {topicStats.globalTopics.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
    )
  };

  // 3. TRENDING TAB
  const renderTrending = () => {
    if (!trendingStats) return <SkeletonCard />;
    return (
      <motion.div variants={TAB_VARIANTS} initial="hidden" animate="visible" exit="exit">
        {/* Trending Posts */}
        <div>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4 className="fw-bold mb-1">� Trending Interviews</h4>
              <p className="text-muted2 mb-0">Community favorites this week</p>
            </div>
            <Link href="/explore?sort=top" className="btn btn-outline-light rounded-pill px-4">View All</Link>
          </div>

          <div className="row g-4">
            {trendingStats.trendingPosts.map((post: any, idx: number) => (
              <div key={post._id} className="col-md-6 col-lg-4">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass p-4 rounded-4 h-100 card-hover border border-secondary border-opacity-25 position-relative group"
                >
                  {/* Rank Badge */}
                  <div className="position-absolute top-0 end-0 m-3">
                    <div className={`badge rounded-pill ${idx < 3 ? 'bg-warning text-dark shadow-warning-glow' : 'bg-dark border border-secondary text-light'}`}>
                      #{idx + 1} Trending
                    </div>
                  </div>

                  <div className="mb-3 mt-2">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <div className="avatar px-2 py-1 bg-white bg-opacity-10 rounded text-uppercase fw-bold text-xs text-light">
                        {post.companyName.substring(0, 2)}
                      </div>
                      <h5 className="fw-bold mb-0 text-truncate text-light">{post.companyName}</h5>
                    </div>
                    <div className="badge bg-secondary bg-opacity-25 text-light mb-2">{post.role}</div>
                  </div>

                  <div className="d-flex align-items-center gap-3 text-muted2 small mb-4">
                    <span className={`badge ${post.difficulty === 'Easy' ? 'bg-success' : post.difficulty === 'Medium' ? 'bg-warning text-dark' : 'bg-danger'} bg-opacity-25 ${post.difficulty !== 'Medium' ? 'text-' + (post.difficulty === 'Easy' ? 'success' : 'danger') : ''}`}>
                      {post.difficulty}
                    </span>
                    <span>•</span>
                    <span>{post.rounds.length} Rounds</span>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top border-secondary border-opacity-25">
                    <div className="d-flex align-items-center gap-1 text-light">
                      <i className="bi bi-arrow-up-circle-fill text-primary"></i>
                      <span className="fw-bold">{post.upvotesCount}</span>
                    </div>
                    <Link href={`/post/${post._id}`} className="btn btn-sm btn-primary rounded-pill px-3 shadow-primary-glow">Read Experience</Link>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  };

  // 4. MY STATS TAB
  const renderUserStats = () => {
    if (!user) return (
      <div className="text-center py-5 glass rounded-4">
        <h3>Please Login</h3>
        <p className="text-muted2">You need to be logged in to view your contribution stats.</p>
        <Link href="/login" className="btn btn-primary rounded-pill mt-2">Login Now</Link>
      </div>
    );

    if (!userStats) return <SkeletonCard />;

    return (
      <motion.div variants={TAB_VARIANTS} initial="hidden" animate="visible" exit="exit">
        <div className="glass p-5 rounded-4 mb-4 text-center position-relative overflow-hidden">
          <div className="position-relative z-1">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
              alt="avatar"
              className="rounded-circle mb-3 border border-4 border-dark shadow-lg"
              style={{ width: 80, height: 80 }}
            />
            <h2 className="fw-bold mb-1">Hello, {user.fullName.split(" ")[0]}! 👋</h2>
            <p className="text-muted2">Here is your impact on the community.</p>

            <div className="d-inline-flex gap-2 align-items-center badge bg-warning text-dark px-3 py-2 rounded-pill mt-2">
              <span>🏆 Rank:</span>
              <span className="fw-bold">{userStats.rank}</span>
            </div>
          </div>
          <div className="position-absolute top-0 start-0 w-100 h-100 bg-gradient-primary opacity-20 blur-xl"></div>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <StatCard label="Total Contributions" value={userStats.totalPosts} icon="✍️" color="text-light" />
          </div>
          <div className="col-md-6">
            <StatCard label="Total Upvotes Earned" value={userStats.totalUpvotes} icon="❤️" color="text-danger" />
          </div>
        </div>

        <h5 className="fw-bold mb-3">Recent Activity</h5>
        {userStats.recentActivity.length === 0 ? (
          <p className="text-muted2">No recent activity. Share your first interview experience!</p>
        ) : (
          <div className="d-flex flex-column gap-3">
            {userStats.recentActivity.map((p: any) => (
              <div key={p._id} className="glass p-3 rounded-3 d-flex justify-content-between align-items-center">
                <div>
                  <div className="fw-bold">{p.companyName}</div>
                  <div className="small text-muted2">{p.role} • {new Date(p.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="text-end">
                  <div className="text-success small fw-bold">{p.result}</div>
                  <Link href={`/post/${p._id}`} className="text-primary small text-decoration-none">View</Link>
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
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 text-center"
      >
        <h1 className="fw-bold display-5 mb-2 text-gradient">Analytics & Insights</h1>
        <p className="text-muted2 lead">
          Data-driven insights to help you crack your next interview.
        </p>
      </motion.div>

      {/* TABS Navigation */}
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
            className={`btn rounded-pill px-4 py-2 fw-bold transition-all ${activeTab === tab.id
              ? "btn-light shadow-lg scale-105"
              : "btn-outline-secondary border-0 text-muted2 hover-text-light"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENT AREA */}
      <div className="min-h-500">
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