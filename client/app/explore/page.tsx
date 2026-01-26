"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import PostCard from "@/components/PostCard";
import { api } from "@/lib/api";

const TAGS = ["DSA", "DBMS", "OS", "CN", "OOP", "System Design", "Aptitude"];

export default function ExplorePage() {
  const searchParams = useSearchParams();

  // ✅ Read company from URL query (ex: /explore?company=amazon)
  const companyFromUrl = searchParams.get("company") || "";

  // ✅ Filters state
  const [company, setCompany] = useState(companyFromUrl);
  const [difficulty, setDifficulty] = useState("");
  const [tag, setTag] = useState("");
  const [sort, setSort] = useState("latest"); // latest | top

  // ✅ Pagination
  const [page, setPage] = useState(1);
  const limit = 9;

  // ✅ Data
  const [posts, setPosts] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);

  const [loading, setLoading] = useState(false);

  // ✅ Build query string for backend
  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    params.set("page", String(page));
    params.set("limit", String(limit));

    if (company.trim()) params.set("company", company.trim());
    if (difficulty) params.set("difficulty", difficulty);
    if (tag) params.set("tag", tag);
    if (sort === "top") params.set("sort", "top");

    return params.toString();
  }, [company, difficulty, tag, sort, page]);

  const fetchPosts = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/posts?${queryString}`);

      setPosts(res.data.posts);
      setTotalPages(res.data.totalPages);
      setTotalPosts(res.data.totalPosts);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Load posts when filters change
  useEffect(() => {
    fetchPosts();
  }, [queryString]);

  // ✅ If URL company changes (navbar search), sync it to state
  useEffect(() => {
    setCompany(companyFromUrl);
    setPage(1);
  }, [companyFromUrl]);

  // ✅ When filters change, reset to page 1
  const applyFilters = () => {
    setPage(1);
    fetchPosts();
  };

  const clearFilters = () => {
    setCompany("");
    setDifficulty("");
    setTag("");
    setSort("latest");
    setPage(1);
  };

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
            <h2 className="fw-bold mb-1">Explore Experiences</h2>
            <p className="text-muted2 mb-0">
              Search company-wise interview patterns and discover trending posts.
            </p>
          </div>

          <div className="text-muted2 small">
            Total posts found: <span className="text-light fw-semibold">{totalPosts}</span>
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
            <h5 className="fw-bold mb-3">
              Filters <span className="text-muted2 small">(smart)</span>
            </h5>

            {/* Company */}
            <div className="mb-3">
              <label className="form-label text-muted2">Company</label>
              <input
                className="form-control bg-transparent text-light border-secondary"
                placeholder="Amazon, Google..."
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            {/* Difficulty */}
            <div className="mb-3">
              <label className="form-label text-muted2">Difficulty</label>
              <select
                className="form-select bg-transparent text-light border-secondary"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="">All</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* Tag */}
            <div className="mb-3">
              <label className="form-label text-muted2">Tag</label>
              <select
                className="form-select bg-transparent text-light border-secondary"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
              >
                <option value="">All</option>
                {TAGS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="mb-3">
              <label className="form-label text-muted2">Sort</label>
              <select
                className="form-select bg-transparent text-light border-secondary"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="latest">Latest</option>
                <option value="top">Trending (Top Upvotes)</option>
              </select>
            </div>

            <div className="d-flex gap-2">
              <button onClick={applyFilters} className="btn btn-accent w-100 rounded-3">
                Apply
              </button>
              <button onClick={clearFilters} className="btn btn-outline-light w-100 rounded-3">
                Clear
              </button>
            </div>
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
              <p className="text-muted2 mb-0">
                Try changing filters or search a different company.
              </p>
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

              {/* Pagination */}
              <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap gap-2">
                <div className="text-muted2 small">
                  Page <span className="text-light fw-semibold">{page}</span> of{" "}
                  <span className="text-light fw-semibold">{totalPages}</span>
                </div>

                <div className="d-flex gap-2">
                  <button
                    className="btn btn-outline-light rounded-3"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Prev
                  </button>

                  <button
                    className="btn btn-outline-light rounded-3"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                    <i className="bi bi-arrow-right ms-2"></i>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
