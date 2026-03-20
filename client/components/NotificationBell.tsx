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

function timeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

const renderMessage = (msg: string) => {
    const upvoteMatch = msg.match(/^(.*?) upvoted your post at (.*?)$/);
    const commentMatch = msg.match(/^(.*?) commented on your post at (.*?)$/);

    if (upvoteMatch) {
        return (
            <>
                <span className="fw-bold text-light">{upvoteMatch[1]}</span>
                <span className="text-muted2 mx-1">upvoted your post at</span>
                <span className="fw-bold" style={{ color: "rgba(0,212,255,0.9)" }}>{upvoteMatch[2]}</span>
            </>
        );
    } else if (commentMatch) {
        return (
            <>
                <span className="fw-bold text-light">{commentMatch[1]}</span>
                <span className="text-muted2 mx-1">commented on your post at</span>
                <span className="fw-bold" style={{ color: "rgba(109,94,249,0.9)" }}>{commentMatch[2]}</span>
            </>
        );
    }
    return <span className="text-light">{msg}</span>;
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
            setNotifications((prev) => [data, ...prev]);
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
                        <div className="d-flex flex-column">
                            {notifications.map((n) => {
                                const isUnread = !n.read;
                                const postUrl = n.postId ? `/post/${(n.postId as any)._id || n.postId}` : "#";

                                return (
                                    <Link
                                        key={n._id}
                                        href={postUrl}
                                        onClick={() => setOpen(false)}
                                        className="text-decoration-none"
                                        style={{ display: "block" }}
                                    >
                                        <div
                                            className={`p-3 border-bottom border-secondary d-flex gap-3 align-items-start ${
                                                isUnread ? "bg-primary bg-opacity-10" : ""
                                            }`}
                                            style={{
                                                borderLeft: isUnread ? "4px solid #6d5ef9" : "4px solid transparent",
                                                transition: "background-color 0.2s ease"
                                            }}
                                        >
                                            {/* Premium Icon Badge */}
                                            <div
                                                className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                                style={{
                                                    width: "36px",
                                                    height: "36px",
                                                    background: n.type === "upvote" 
                                                        ? "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,212,255,0.05))"
                                                        : n.type === "comment"
                                                        ? "linear-gradient(135deg, rgba(109,94,249,0.2), rgba(109,94,249,0.05))"
                                                        : "rgba(255,255,255,0.05)",
                                                    border: n.type === "upvote"
                                                        ? "1px solid rgba(0,212,255,0.3)"
                                                        : n.type === "comment"
                                                        ? "1px solid rgba(109,94,249,0.3)"
                                                        : "1px solid rgba(255,255,255,0.1)",
                                                }}
                                            >
                                                {n.type === "upvote" ? (
                                                    <i className="bi bi-arrow-up text-info fs-5"></i>
                                                ) : n.type === "comment" ? (
                                                    <i className="bi bi-chat-fill text-accent fs-6"></i>
                                                ) : (
                                                    <i className="bi bi-bell-fill text-light fs-6"></i>
                                                )}
                                            </div>

                                            {/* Content Block */}
                                            <div className="flex-grow-1">
                                                <div className="mb-1 small text-light" style={{ lineHeight: "1.4" }}>
                                                    {renderMessage(n.message)}
                                                </div>
                                                <div className="d-flex align-items-center justify-content-between mt-2">
                                                    <span className="text-muted2" style={{ fontSize: "0.75rem", fontWeight: "500" }}>
                                                        {timeAgo(n.createdAt)}
                                                    </span>
                                                    {isUnread && (
                                                        <span 
                                                            className="rounded-circle bg-primary shadow-sm" 
                                                            style={{ width: "8px", height: "8px", display: "inline-block" }}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}