import { useEffect, useRef, useCallback } from "react";

interface UseInfiniteScrollOptions {
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  rootMargin?: string;
}

/**
 * useInfiniteScroll
 * 
 * Returns a ref to attach to a sentinel element at the bottom of your list.
 * When that element enters the viewport, onLoadMore is called.
 * 
 * Usage:
 *   const sentinelRef = useInfiniteScroll({ onLoadMore, hasMore, loading });
 *   <div ref={sentinelRef} />  ← place at bottom of list
 */
export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  loading,
  rootMargin = "200px", // Start loading 200px before the sentinel is visible
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const first = entries[0];
      if (first.isIntersecting && hasMore && !loading) {
        onLoadMore();
      }
    },
    [onLoadMore, hasMore, loading]
  );

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin,
    });

    observer.observe(node);

    return () => observer.disconnect();
  }, [handleIntersection, rootMargin]);

  return sentinelRef;
}