"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

type NotificationItem = {
    _id: string;
    type: "upvote" | "comment" | "system";
    message: string;
    read: boolean;
    createdAt: string;
    postId?: { _id: string; companyName: string } | null;
};

export default function NotificationBell() {
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const eventSourceRef = useRef<EventSource | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // ── Fetch unread count on mount ──
    useEffect(() => {
        if (!user) return;

        const fetchCount = async () => {
            try {
                const res = await api.get("/notifications/unread-count");
                setUnreadCount(res.data.count);
            } catch {
                // Silent
            }
        };

        fetchCount();
    }, [user]);

    // ── SSE connection for real-time notifications ──
    useEffect(() => {
        if (!user) return;

        // Get token for SSE authentication
        const token = localStorage.getItem("token");
        if (!token) return;

        const url = `${process.env.NEXT_PUBLIC_API_URL}/notifications/stream`;
        const es = new EventSource(`${url}?token=${token}`);
        eventSourceRef.current = es;

        es.addEventListener("notification", (e) => {
            const data = JSON.parse(e.data);
            setUnreadCount((prev) => prev + 1);
            toast(data.message, {
                icon: data.type === "upvote" ? "⬆️" : "💬",
                duration: 4000,
            });
        });

        es.addEventListener("connected", () => {
            // Connection established — silent
        });

        es.onerror = () => {
            es.close();
        };

        return () => {
            es.close();
        };
    }, [user]);

    // ── Close dropdown on outside click ──
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleOpen = async () => {
        if (!open) {
            setLoading(true);
            try {
                const res = await api.get("/notifications?limit=10");
                setNotifications(res.data.notifications);

                if (unreadCount > 0) {
                    await api.patch("/notifications/mark-read");
                    setUnreadCount(0);
                }
            } catch {
                toast.error("Failed to load notifications");
            } finally {
                setLoading(false);
            }
        }
        setOpen((prev) => !prev);
    };

    if (!user) return null;

    return (
        <div className="position-relative" ref={dropdownRef}>
            {/* Bell button */}
            <button
                onClick={handleOpen}
                className="btn btn-outline-light rounded-3 position-relative"
                title="Notifications"
            >
                <i className="bi bi-bell"></i>
                {unreadCount > 0 && (
                    <span
                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                        style={{ fontSize: "0.6rem" }}
                    >
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown panel */}
            {open && (
                <div
                    className="glass rounded-4 position-absolute shadow-lg"
                    style={{
                        top: "calc(100% + 8px)",
                        right: 0,
                        width: 340,
                        zIndex: 1050,
                        maxHeight: 420,
                        overflowY: "auto",
                    }}
                >
                    <div className="d-flex justify-content-between align-items-center p-3 border-bottom border-secondary">
                        <span className="fw-bold">Notifications</span>
                        <Link
                            href="/notifications"
                            className="text-muted2 small text-decoration-none"
                            onClick={() => setOpen(false)}
                        >
                            View all
                        </Link>
                    </div>

                    {loading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border spinner-border-sm text-light"></div>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-4 text-muted2">
                            <i className="bi bi-bell-slash fs-3 d-block mb-2"></i>
                            No notifications yet
                        </div>
                    ) : (
                        <div>
                            {notifications.map((n) => (
                                <div
                                    key={n._id}
                                    className={`p-3 border-bottom border-secondary ${!n.read ? "bg-white bg-opacity-5" : ""
                                        }`}
                                >
                                    <div className="d-flex gap-2 align-items-start">
                                        <span className="fs-5">
                                            {n.type === "upvote" ? "⬆️" : n.type === "comment" ? "💬" : "🔔"}
                                        </span>
                                        <div className="flex-grow-1">
                                            <p className="mb-1 small text-light">{n.message}</p>
                                            <div className="text-muted2" style={{ fontSize: "0.72rem" }}>
                                                {new Date(n.createdAt).toLocaleDateString()}
                                            </div>
                                            {n.postId && (
                                                <Link
                                                    href={`/post/${(n.postId as any)._id || n.postId}`}
                                                    className="text-primary small text-decoration-none"
                                                    onClick={() => setOpen(false)}
                                                >
                                                    View post →
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}