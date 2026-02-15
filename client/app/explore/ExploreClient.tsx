"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast"; // ✅ FIX: No Toaster import
import PostCard from "@/components/PostCard";
import { api } from "@/lib/api";

// ✅ FIX: Tags list stored in lowercase for consistent comparison
// Display versions are capitalized for UI, but we send lowercase to backend
const TAGS = ["DSA", "DBMS", "OS", "CN", "OOP", "System Design", "Aptitude"];

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const companyFromUrl = searchParams.get("company") || "";

  const [company, setCompany] = useState(companyFromUrl);
  const [difficulty, setDifficulty] = useState("");
  const [tag, setTag] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const limit = 9;

  const [posts, setPosts] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loading, setLoading] = useState(false);

  // ✅ FIX: Build query string - send tag as-is, backend handles case-insensitivity
  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (company.trim()) params.set("company", company.trim());
    if (difficulty) params.set("difficulty", difficulty);
    if (tag) params.set("tag", tag);  // Backend now does case-insensitive regex match
    if (sort === "top") params.set("sort", "top");
    return params.toString();
  }, [company, difficulty, tag, sort, page]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      console.log("[EXPLORE] Fetching with query:", queryString);
      const res = await api.get(`/posts?${queryString}`);

      console.log("[EXPLORE] Response:", {
        totalPosts: res.data.totalPosts,
        totalPages: res.data.totalPages,
        currentPage: res.data.page,
        postsReceived: res.data.posts.length,
      });

      setPosts(res.data.posts);
      setTotalPages(res.data.totalPages);
      setTotalPosts(res.data.totalPosts);
    } catch (err: any) {
      console.error("[EXPLORE] Error:", err);
      toast.error(err?.response?.data?.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, [queryString]);

  useEffect(() => {
    setCompany(companyFromUrl);
    setPage(1);
  }, [companyFromUrl]);

  const clearFilters = () => {
    setCompany("");
    setDifficulty("");
    setTag("");
    setSort("latest");
    setPage(1);
  };

  return (
    <div className="container py-5">
      {/* ✅ FIX: NO <Toaster /> here — handled by root layout.tsx */}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="glass glow-border p-4 p-md-5 rounded-4 mb-4"
      >
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <h2 className="fw-bold mb-1">Explore Experiences</h2>
            <p className="text-muted2 mb-0">
              Search company-wise interview patterns and discover trending posts.
            </p>
          </div>
          <div className="text-muted2 small">
            <div>
              Total posts: <span className="text-light fw-semibold">{totalPosts}</span>
            </div>
            <div>
              Page {page} of {totalPages} (showing {posts.length})
            </div>
          </div>
        </div>
      </motion.div>

      <div className="row g-4">
        {/* LEFT: Filters */}
        <div className="col-lg-3">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="glass rounded-4 p-4"
          >
            <h5 className="fw-bold mb-3">Filters</h5>

            {/* Company */}
            <div className="mb-3">
              <label className="form-label text-muted2">Company</label>
              <input
                className="form-control bg-transparent text-light border-secondary"
                placeholder="Amazon, Google..."
                value={company}
                onChange={(e) => { setCompany(e.target.value); setPage(1); }}
              />
            </div>

            {/* Difficulty */}
            <div className="mb-3">
              <label className="form-label text-muted2">Difficulty</label>
              <select
                className="form-select bg-transparent text-light border-secondary"
                value={difficulty}
                onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}
              >
                <option value="">All</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* ✅ FIX: Tag filter - dropdown now sends the tag as-is 
                Backend uses case-insensitive regex so DSA = dsa = Dsa */}
            <div className="mb-3">
              <label className="form-label text-muted2">
                Tag
                <span className="ms-1 text-muted2 small">(case-insensitive)</span>
              </label>
              <select
                className="form-select bg-transparent text-light border-secondary"
                value={tag}
                onChange={(e) => { setTag(e.target.value); setPage(1); }}
              >
                <option value="">All Tags</option>
                {TAGS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              {/* ✅ NEW: Also allow free-text tag search for custom tags */}
              {tag === "" && (
                <input
                  className="form-control bg-transparent text-light border-secondary mt-2"
                  placeholder="Or type a tag (e.g. DSA, dsa)..."
                  onChange={(e) => {
                    if (e.target.value.trim()) {
                      setTag(e.target.value.trim());
                      setPage(1);
                    }
                  }}
                />
              )}
            </div>

            {/* Sort */}
            <div className="mb-3">
              <label className="form-label text-muted2">Sort</label>
              <select
                className="form-select bg-transparent text-light border-secondary"
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
              >
                <option value="latest">Latest</option>
                <option value="top">Trending (Top Upvotes)</option>
              </select>
            </div>

            <button onClick={clearFilters} className="btn btn-outline-light w-100 rounded-3">
              Clear Filters
            </button>

            {/* Show active filters */}
            {(company || difficulty || tag || sort !== "latest") && (
              <div className="mt-3">
                <div className="text-muted2 small mb-2">Active filters:</div>
                <div className="d-flex flex-wrap gap-1">
                  {company && (
                    <span className="badge rounded-pill bg-secondary">
                      🏢 {company}
                    </span>
                  )}
                  {difficulty && (
                    <span className="badge rounded-pill bg-secondary">
                      📊 {difficulty}
                    </span>
                  )}
                  {tag && (
                    <span className="badge rounded-pill bg-secondary">
                      🏷️ {tag}
                    </span>
                  )}
                  {sort === "top" && (
                    <span className="badge rounded-pill bg-secondary">
                      🔥 Trending
                    </span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* RIGHT: Posts */}
        <div className="col-lg-9">
          {loading ? (
            <div className="text-center text-muted2 py-5">
              <div className="spinner-border text-light" role="status"></div>
              <div className="mt-3">Loading experiences...</div>
            </div>
          ) : posts.length === 0 ? (
            <div className="glass rounded-4 p-5 text-center">
              <div className="fs-1 mb-2">😕</div>
              <h4 className="fw-bold">No posts found</h4>
              <p className="text-muted2 mb-3">
                Try changing filters or search a different company.
              </p>
              <button onClick={clearFilters} className="btn btn-accent rounded-3">
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="row g-3">
                {posts.map((post) => (
                  <div className="col-md-6 col-xl-4" key={post._id}>
                    <PostCard post={post} />
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="glass rounded-4 p-4 mt-4">
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div className="text-muted2">
                      Page <span className="text-light fw-semibold">{page}</span> of{" "}
                      <span className="text-light fw-semibold">{totalPages}</span>
                      <span className="ms-2">
                        (showing {posts.length} of {totalPosts})
                      </span>
                    </div>

                    <div className="d-flex gap-2 flex-wrap">
                      <button
                        className="btn btn-outline-light rounded-3"
                        disabled={page <= 1 || loading}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                      >
                        <i className="bi bi-arrow-left me-2"></i>Prev
                      </button>

                      {totalPages <= 7
                        ? Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                              key={p}
                              className={`btn rounded-3 ${p === page ? "btn-accent" : "btn-outline-light"}`}
                              onClick={() => setPage(p)}
                              disabled={loading}
                            >
                              {p}
                            </button>
                          ))
                        : (
                          <>
                            {page > 2 && (
                              <>
                                <button className="btn btn-outline-light rounded-3" onClick={() => setPage(1)} disabled={loading}>1</button>
                                {page > 3 && <span className="text-muted2 align-self-center">...</span>}
                              </>
                            )}
                            {[page - 1, page, page + 1]
                              .filter((p) => p > 0 && p <= totalPages)
                              .map((p) => (
                                <button
                                  key={p}
                                  className={`btn rounded-3 ${p === page ? "btn-accent" : "btn-outline-light"}`}
                                  onClick={() => setPage(p)}
                                  disabled={loading}
                                >
                                  {p}
                                </button>
                              ))}
                            {page < totalPages - 1 && (
                              <>
                                {page < totalPages - 2 && <span className="text-muted2 align-self-center">...</span>}
                                <button className="btn btn-outline-light rounded-3" onClick={() => setPage(totalPages)} disabled={loading}>{totalPages}</button>
                              </>
                            )}
                          </>
                        )}

                      <button
                        className="btn btn-outline-light rounded-3"
                        disabled={page >= totalPages || loading}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      >
                        Next<i className="bi bi-arrow-right ms-2"></i>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}