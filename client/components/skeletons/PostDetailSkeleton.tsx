/**
 * PostDetailSkeleton — shown while the post detail page loads.
 */
export default function PostDetailSkeleton() {
    return (
        <div className="container py-5">
            {/* Back button */}
            <div className="skeleton skeleton-btn mb-4" style={{ width: 80 }} />

            <div className="row g-4">
                {/* Left column */}
                <div className="col-lg-7">
                    <div className="glass rounded-4 p-4 mb-4">
                        {/* Title area */}
                        <div className="d-flex justify-content-between mb-3">
                            <div className="flex-grow-1 pe-4">
                                <div className="skeleton skeleton-text xl mb-2" style={{ width: "60%" }} />
                                <div className="skeleton skeleton-text sm" style={{ width: "35%" }} />
                            </div>
                            <div className="d-flex flex-column gap-2">
                                <div className="skeleton skeleton-badge" />
                                <div className="skeleton skeleton-badge" />
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="d-flex gap-2 mb-3">
                            {[64, 48, 72, 56].map((w, i) => (
                                <div key={i} className="skeleton skeleton-badge" style={{ width: w }} />
                            ))}
                        </div>

                        {/* Author/date */}
                        <div className="skeleton skeleton-text sm mb-4" style={{ width: "50%" }} />

                        {/* Action buttons */}
                        <div className="d-flex gap-2">
                            <div className="skeleton skeleton-btn" style={{ width: 120 }} />
                            <div className="skeleton skeleton-btn" style={{ width: 80 }} />
                        </div>
                    </div>

                    {/* Rounds */}
                    {[1, 2].map((i) => (
                        <div key={i} className="glass rounded-4 p-4 mb-3">
                            <div className="skeleton skeleton-text lg mb-3" style={{ width: "40%" }} />
                            <div className="skeleton skeleton-text sm mb-2" style={{ width: "90%" }} />
                            <div className="skeleton skeleton-text sm mb-2" style={{ width: "75%" }} />
                            <div className="skeleton skeleton-text sm" style={{ width: "60%" }} />
                        </div>
                    ))}
                </div>

                {/* Right column — comments */}
                <div className="col-lg-5">
                    <div className="glass rounded-4 p-4">
                        <div className="skeleton skeleton-text lg mb-4" style={{ width: "50%" }} />
                        <div className="skeleton rounded-3 mb-3" style={{ height: 80 }} />
                        <div className="skeleton skeleton-btn w-100 mb-4" style={{ height: 38 }} />

                        {[1, 2, 3].map((i) => (
                            <div key={i} className="glass rounded-3 p-3 mb-2">
                                <div className="skeleton skeleton-text sm mb-2" style={{ width: "40%" }} />
                                <div className="skeleton skeleton-text sm mb-1" style={{ width: "90%" }} />
                                <div className="skeleton skeleton-text sm" style={{ width: "65%" }} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}