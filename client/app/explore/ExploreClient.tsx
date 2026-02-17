"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import PostCard from "@/components/PostCard";
import { api } from "@/lib/api";

const TAGS = ["DSA", "DBMS", "OS", "CN", "OOP", "System Design", "Aptitude"];

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const companyFromUrl = searchParams.get("company") || "";

  const [company, setCompany] = useState(companyFromUrl);
  const [difficulty, setDifficulty] = useState("");
  const [tag, setTag] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);

  // Fixed page size for Explore
  const limit = 6;

  const [posts, setPosts] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loading, setLoading] = useState(false);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (company.trim()) params.set("company", company.trim());
    if (difficulty) params.set("difficulty", difficulty);
    if (tag.trim()) params.set("tag", tag.trim());
    if (sort === "top") params.set("sort", "top");
    return params.toString();
  }, [company, difficulty, tag, sort, page]);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/posts?${queryString}`);
      setPosts(res.data.posts || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalPosts(res.data.totalPosts || 0);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

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
        <div className="col-lg-3">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="glass rounded-4 p-4"
          >
            <h5 className="fw-bold mb-3">Filters</h5>

            <div className="mb-3">
              <label className="form-label text-muted2">Company</label>
              <input
                className="form-control bg-transparent text-light border-secondary"
                placeholder="Amazon, Google..."
                value={company}
                onChange={(e) => {
                  setCompany(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-muted2">Difficulty</label>
              <select
                className="form-select bg-transparent text-light border-secondary"
                value={difficulty}
                onChange={(e) => {
                  setDifficulty(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* Improved tag filter: always editable + suggestions */}
            <div className="mb-3">
              <label className="form-label text-muted2">
                Tag <span className="ms-1 small">(type partial/full)</span>
              </label>
              <input
                list="tag-suggestions"
                className="form-control bg-transparent text-light border-secondary"
                placeholder="e.g. DSA or System"
                value={tag}
                onChange={(e) => {
                  setTag(e.target.value);
                  setPage(1);
                }}
              />
              <datalist id="tag-suggestions">
                {TAGS.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>

              <div className="d-flex flex-wrap gap-1 mt-2">
                {TAGS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className="btn btn-sm btn-outline-light rounded-pill"
                    onClick={() => {
                      setTag(t);
                      setPage(1);
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label text-muted2">Sort</label>
              <select
                className="form-select bg-transparent text-light border-secondary"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
              >
                <option value="latest">Latest</option>
                <option value="top">Trending (Top Upvotes)</option>
              </select>
            </div>

            <button onClick={clearFilters} className="btn btn-outline-light w-100 rounded-3">
              Clear Filters
            </button>
          </motion.div>
        </div>

        <div className="col-lg-9">
          {loading ? (
            <div className="text-center text-muted2 py-5">
              <div className="spinner-border text-light" role="status"></div>
              <div className="mt-3">Loading experiences...</div>
            </div>
          ) : posts.length === 0 ? (
            <div className="glass rounded-4 p-5 text-center">
              <h4 className="fw-bold">No posts found</h4>
              <p className="text-muted2 mb-3">Try changing filters.</p>
              <button onClick={clearFilters} className="btn btn-accent rounded-3">
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="row g-3">
                {posts.map((post) => (
                  <div className="col-md-6" key={post._id}>
                    <PostCard post={post} />
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="glass rounded-4 p-4 mt-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
                  <div className="text-muted2">
                    Page <span className="text-light fw-semibold">{page}</span> of{" "}
                    <span className="text-light fw-semibold">{totalPages}</span>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-light rounded-3"
                      disabled={page <= 1 || loading}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Prev
                    </button>
                    <button
                      className="btn btn-outline-light rounded-3"
                      disabled={page >= totalPages || loading}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Next
                    </button>
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
