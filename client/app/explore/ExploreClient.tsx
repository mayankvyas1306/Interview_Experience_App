"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import PostCard from "@/components/PostCard";
import { api } from "@/lib/api";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import type { Post } from "@/types/api";
import SkeletonCard from "@/components/SkeletonCard";

const TAGS = ["DSA", "DBMS", "OS", "CN", "OOP", "System Design", "Aptitude"];

const normalizeSort = (raw: string | null): "latest" | "top" => {
  if (raw === "top" || raw === "trending") return "top";
  return "latest";
};

export default function ExploreClient() {
  const searchParams = useSearchParams();

  const companyFromUrl = searchParams.get("company") || "";
  const sortFromUrl = normalizeSort(searchParams.get("sort"));

  // ── Filter state ──
  const [company, setCompany] = useState(companyFromUrl);
  const [difficulty, setDifficulty] = useState("");
  const [tag, setTag] = useState("");
  const [sort, setSort] = useState<"latest" | "top">(sortFromUrl);

  // ── Posts state ──
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [totalPosts, setTotalPosts] = useState(0);

  // Track if this is the first fetch or a load-more fetch
  const isFirstFetch = useRef(true);

  // ── Build query string (without cursor — cursor is added per-fetch) ──
  const baseParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("limit", "6");
    if (company.trim()) params.set("company", company.trim());
    if (difficulty) params.set("difficulty", difficulty);
    if (tag.trim()) params.set("tag", tag.trim());
    if (sort === "top") params.set("sort", "top");
    return params;
  }, [company, difficulty, tag, sort]);

  // ── Fetch posts (first page OR next page) ──
  const fetchPosts = useCallback(
    async (cursor: string | null = null) => {
      if (loading) return;

      try {
        if (cursor === null) {
          setInitialLoading(true);
        } else {
          setLoading(true);
        }

        const params = new URLSearchParams(baseParams);
        if (cursor) {
          params.set("cursor", cursor);
        }

        const res = await api.get(`/posts?${params.toString()}`);

        const newPosts: Post[] = res.data.posts || [];
        const serverHasMore: boolean = res.data.hasMore ?? false;
        const serverNextCursor: string | null = res.data.nextCursor ?? null;

        if (cursor === null) {
          // First fetch — replace posts
          setPosts(newPosts);
          setTotalPosts(res.data.totalPosts || newPosts.length);
        } else {
          // Load more — append posts, deduplicate by _id
          setPosts((prev) => {
            const existingIds = new Set(prev.map((p) => p._id));
            const unique = newPosts.filter((p) => !existingIds.has(p._id));
            return [...prev, ...unique];
          });
        }

        setHasMore(serverHasMore);
        setNextCursor(serverNextCursor);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to load posts");
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    },
    [baseParams, loading]
  );

  // ── Initial fetch when filters change ──
  useEffect(() => {
    isFirstFetch.current = true;
    setNextCursor(null);
    setHasMore(true);
    fetchPosts(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseParams]);

  // ── Sync URL params to state ──
  useEffect(() => {
    setCompany(companyFromUrl);
    setSort(sortFromUrl);
  }, [companyFromUrl, sortFromUrl]);

  // ── Load more callback for infinite scroll ──
  const handleLoadMore = useCallback(() => {
    if (nextCursor && hasMore && !loading) {
      fetchPosts(nextCursor);
    }
  }, [nextCursor, hasMore, loading, fetchPosts]);

  // ── Attach infinite scroll sentinel ──
  const sentinelRef = useInfiniteScroll({
    onLoadMore: handleLoadMore,
    hasMore,
    loading,
  });

  const clearFilters = () => {
    setCompany("");
    setDifficulty("");
    setTag("");
    setSort("latest");
  };

  return (
    <div className="container py-5">
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
            {totalPosts > 0 && (
              <div>
                Total posts:{" "}
                <span className="text-light fw-semibold">{totalPosts}</span>
              </div>
            )}
            <div>Showing {posts.length} posts</div>
          </div>
        </div>
      </motion.div>

      <div className="row g-4">
        {/* Filters Sidebar */}
        <div className="col-lg-3">
          <div className="glass rounded-4 p-4" style={{ position: "sticky", top: "80px" }}>
            <h5 className="fw-bold mb-3">Filters</h5>

            <div className="mb-3">
              <label className="form-label text-muted2">Company</label>
              <input
                className="form-control bg-transparent text-light border-secondary"
                placeholder="Amazon, Google..."
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

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

            <div className="mb-3">
              <label className="form-label text-muted2">Tag</label>
              <input
                list="tag-suggestions"
                className="form-control bg-transparent text-light border-secondary"
                placeholder="Type tag..."
                value={tag}
                onChange={(e) => setTag(e.target.value)}
              />
              <datalist id="tag-suggestions">
                {TAGS.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </div>

            <div className="mb-3">
              <label className="form-label text-muted2">Sort</label>
              <select
                className="form-select bg-transparent text-light border-secondary"
                value={sort}
                onChange={(e) => setSort(e.target.value as "latest" | "top")}
              >
                <option value="latest">Latest</option>
                <option value="top">Trending (Top Upvotes)</option>
              </select>
            </div>

            <button
              onClick={clearFilters}
              className="btn btn-outline-light w-100 rounded-3"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="col-lg-9">
          {initialLoading ? (
            <div className="row g-3">
              {[...Array(6)].map((_, i) => (
                <div className="col-md-6" key={i}>
                  <SkeletonCard height={280} />
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="glass rounded-4 p-5 text-center">
              <div className="fs-1 mb-3">🔍</div>
              <h4 className="fw-bold">No posts found</h4>
              <p className="text-muted2">
                Try adjusting your filters or be the first to share this experience.
              </p>
              <button
                onClick={clearFilters}
                className="btn btn-accent rounded-3 mt-2"
              >
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

              {/* Skeleton cards while loading more */}
              {loading && (
                <div className="row g-3 mt-1">
                  {[...Array(2)].map((_, i) => (
                    <div className="col-md-6" key={i}>
                      <SkeletonCard height={280} />
                    </div>
                  ))}
                </div>
              )}

              {/* Sentinel element — invisible div watched by IntersectionObserver */}
              <div ref={sentinelRef} style={{ height: 1 }} />

              {/* End of results message */}
              {!hasMore && posts.length > 0 && (
                <div className="text-center text-muted2 py-4">
                  <i className="bi bi-check-circle me-2"></i>
                  You have seen all {posts.length} posts
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}