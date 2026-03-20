/**
 * AnalyticsSkeleton — shown while analytics data loads.
 */
export default function AnalyticsSkeleton() {
    return (
        <div>
            {/* Stat cards row */}
            <div className="row g-4 mb-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="col-md-4">
                        <div className="glass p-4 rounded-4">
                            <div className="skeleton skeleton-text sm mb-2" style={{ width: "55%" }} />
                            <div className="skeleton skeleton-text xl" style={{ width: "35%" }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts row */}
            <div className="row g-4">
                <div className="col-lg-5">
                    <div className="glass p-4 rounded-4">
                        <div className="skeleton skeleton-text lg mb-4" style={{ width: "50%" }} />
                        <div
                            className="skeleton rounded-circle mx-auto"
                            style={{ width: 180, height: 180 }}
                        />
                    </div>
                </div>
                <div className="col-lg-7">
                    <div className="glass p-4 rounded-4">
                        <div className="skeleton skeleton-text lg mb-4" style={{ width: "55%" }} />
                        {[90, 75, 60, 80, 50, 70, 40].map((w, i) => (
                            <div key={i} className="d-flex align-items-center gap-3 mb-3">
                                <div
                                    className="skeleton"
                                    style={{ width: 80, height: 12, borderRadius: 99 }}
                                />
                                <div
                                    className="skeleton"
                                    style={{ width: `${w}%`, height: 20, borderRadius: 4 }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}