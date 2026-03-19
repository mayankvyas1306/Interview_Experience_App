"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type NotificationItem = {
    _id: string;
    type: "upvote" | "comment" | "system";
    message: string;
    read: boolean;
    createdAt: string;
    postId?: { _id: string; companyName: string; role: string } | null;
    senderId?: { fullName: string } | null;
};

const TYPE_ICON: Record<string, string> = {
    upvote: "⬆️",
    comment: "💬",
    system: "🔔",
};

export default function NotificationsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!user) {
            router.push("/auth/login");
            return;
        }

        const fetchNotifications = async () => {
            try {
                const res = await api.get("/notifications?limit=50");
                setNotifications(res.data.notifications);
                setUnreadCount(res.data.unreadCount);

                // Mark all as read after fetching
                if (res.data.unreadCount > 0) {
                    await api.patch("/notifications/mark-read");
                }
            } catch {
                toast.error("Failed to load notifications");
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [user, router]);

    const handleClear = async () => {
        try {
            await api.delete("/notifications");
            setNotifications([]);
            setUnreadCount(0);
            toast.success("Notifications cleared");
        } catch {
            toast.error("Failed to clear notifications");
        }
    };

    return (
        <div className="container py-5">
            <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass glow-border p-4 rounded-4 mb-4"
            >
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div>
                        <h2 className="fw-bold mb-1">
                            Notifications <i className="bi bi-bell ms-2"></i>
                        </h2>
                        <p className="text-muted2 mb-0">
                            {unreadCount > 0
                                ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                                : "All caught up!"}
                        </p>
                    </div>
                    {notifications.length > 0 && (
                        <button
                            onClick={handleClear}
                            className="btn btn-outline-danger rounded-3"
                        >
                            <i className="bi bi-trash me-2"></i>Clear All
                        </button>
                    )}
                </div>
            </motion.div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-light"></div>
                </div>
            ) : notifications.length === 0 ? (
                <div className="glass rounded-4 p-5 text-center">
                    <i className="bi bi-bell-slash fs-1 d-block mb-3 text-muted2"></i>
                    <h4 className="fw-bold">No notifications yet</h4>
                    <p className="text-muted2">
                        When someone upvotes or comments on your posts, you&apos;ll see it here.
                    </p>
                    <Link href="/explore" className="btn btn-accent rounded-3 mt-2">
                        Explore Posts
                    </Link>
                </div>
            ) : (
                <div className="d-flex flex-column gap-2">
                    {notifications.map((n) => (
                        <motion.div
                            key={n._id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`glass rounded-4 p-4 ${!n.read ? "border border-primary border-opacity-25" : ""}`}
                        >
                            <div className="d-flex gap-3 align-items-start">
                                <span className="fs-4">{TYPE_ICON[n.type]}</span>
                                <div className="flex-grow-1">
                                    <p className="mb-1 text-light">{n.message}</p>
                                    <div className="d-flex gap-3 align-items-center flex-wrap">
                                        <span className="text-muted2 small">
                                            <i className="bi bi-clock me-1"></i>
                                            {new Date(n.createdAt).toLocaleString()}
                                        </span>
                                        {n.postId && (
                                            <Link
                                                href={`/post/${(n.postId as any)._id}`}
                                                className="btn btn-sm btn-outline-light rounded-3"
                                            >
                                                View Post →
                                            </Link>
                                        )}
                                    </div>
                                </div>
                                {!n.read && (
                                    <span
                                        className="badge bg-primary rounded-pill"
                                        style={{ fontSize: "0.6rem" }}
                                    >
                                        NEW
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}