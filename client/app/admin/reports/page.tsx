"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";

type Report = {
    _id: string;
    reason: string;
    status: string;
    details: string;
    createdAt: string;
    reporterId?: { fullName: string; email: string } | null;
    postId?: { companyName: string; role: string } | null;
};

export default function AdminReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState("pending");

    // ✅ Fixed: wrap in useCallback so useEffect can list it as a dependency
    const fetchReports = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get(`/admin/reports?status=${statusFilter}`);
            setReports(res.data.reports);
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Failed to load reports";
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [statusFilter]); // statusFilter is the real dependency

    // ✅ Fixed: fetchReports is now stable via useCallback, safe to include
    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const updateStatus = async (id: string, status: string) => {
        try {
            await api.patch(`/admin/reports/${id}`, { status });
            toast.success(`Report marked as ${status}`);
            fetchReports();
        } catch {
            toast.error("Failed to update report");
        }
    };

    return (
        <div className="container py-5">
            <div className="d-flex gap-3 align-items-center mb-4 flex-wrap">
                <h2 className="fw-bold mb-0">Reports</h2>
                <Link
                    href="/admin/users"
                    className="btn btn-outline-secondary rounded-3 btn-sm"
                >
                    Users
                </Link>
                <Link
                    href="/admin/posts"
                    className="btn btn-outline-secondary rounded-3 btn-sm"
                >
                    Posts
                </Link>
            </div>

            {/* Status filter tabs */}
            <div className="d-flex gap-2 mb-4">
                {["pending", "reviewed", "dismissed", "actioned"].map((s) => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`btn btn-sm rounded-3 ${statusFilter === s ? "btn-accent" : "btn-outline-secondary"
                            }`}
                    >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-light" />
                </div>
            ) : error ? (
                <div className="glass rounded-4 p-4 text-center">
                    <p className="text-warning">{error}</p>
                    <button onClick={fetchReports} className="btn btn-accent">
                        Retry
                    </button>
                </div>
            ) : reports.length === 0 ? (
                <div className="glass rounded-4 p-5 text-center">
                    <p className="text-muted2">No {statusFilter} reports.</p>
                </div>
            ) : (
                <div className="d-flex flex-column gap-3">
                    {reports.map((r) => (
                        <div key={r._id} className="glass p-4 rounded-4">
                            <div className="d-flex justify-content-between flex-wrap gap-3">
                                <div>
                                    <div className="fw-bold mb-1">
                                        {r.postId?.companyName || "Deleted Post"} —{" "}
                                        {r.postId?.role || ""}
                                    </div>
                                    <div className="text-muted2 small mb-1">
                                        Reported by: {r.reporterId?.fullName || "Unknown"} (
                                        {r.reporterId?.email})
                                    </div>
                                    <div className="d-flex gap-2 flex-wrap">
                                        <span className="badge bg-warning text-dark">
                                            {r.reason}
                                        </span>
                                        <span className="text-muted2 small">
                                            {new Date(r.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {r.details && (
                                        <p className="text-muted2 small mt-2 mb-0">
                                            <i className="bi bi-chat-left-text me-1" />
                                            {r.details}
                                        </p>
                                    )}
                                </div>

                                {r.status === "pending" && (
                                    <div className="d-flex gap-2 flex-wrap align-items-start">
                                        <button
                                            onClick={() => updateStatus(r._id, "dismissed")}
                                            className="btn btn-sm btn-outline-secondary rounded-3"
                                        >
                                            Dismiss
                                        </button>
                                        <button
                                            onClick={() => updateStatus(r._id, "actioned")}
                                            className="btn btn-sm btn-outline-danger rounded-3"
                                        >
                                            Action
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}