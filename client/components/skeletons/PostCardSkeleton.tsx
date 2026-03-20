/**
 * PostCardSkeleton — mimics the exact shape of a PostCard.
 * Users see the layout before content loads — feels faster.
 */
export default function PostCardSkeleton() {
    return (
        <div className="glass rounded-4 p-4 h-100">
            {/* Header row */}
            <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="flex-grow-1 pe-3">
                    <div className="skeleton skeleton-title mb-2" />
                    <div className="skeleton skeleton-text sm" style={{ width: "45%" }} />
                </div>
                <div className="d-flex flex-column gap-1 align-items-end">
                    <div className="skeleton skeleton-badge" />
                    <div className="skeleton skeleton-badge" style={{ width: 56 }} />
                </div>
            </div>

            {/* Tag row */}
            <div className="d-flex gap-2 mb-3">
                <div className="skeleton skeleton-badge" style={{ width: 48 }} />
                <div className="skeleton skeleton-badge" style={{ width: 56 }} />
                <div className="skeleton skeleton-badge" style={{ width: 40 }} />
            </div>

            {/* Author */}
            <div className="skeleton skeleton-text sm mb-1" style={{ width: "55%" }} />
            <div className="skeleton skeleton-text sm" style={{ width: "40%" }} />

            {/* Footer */}
            <div className="d-flex justify-content-between align-items-center mt-4">
                <div className="d-flex gap-2">
                    <div className="skeleton skeleton-btn" />
                    <div className="skeleton skeleton-btn" style={{ width: 44 }} />
                </div>
                <div className="skeleton skeleton-btn" style={{ width: 72 }} />
            </div>
        </div>
    );
}