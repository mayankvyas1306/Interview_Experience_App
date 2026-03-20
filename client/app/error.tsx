"use client";

import Link from "next/link";
import { useEffect } from "react";

interface ErrorPageProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
    useEffect(() => {
        console.error("Page error:", error);
    }, [error]);

    return (
        <div
            className="d-flex align-items-center justify-content-center"
            style={{ minHeight: "80vh" }}
        >
            <div className="text-center" style={{ maxWidth: 480 }}>
                <div className="fs-1 mb-4">⚠️</div>

                <h2 className="fw-bold mb-3">Something went wrong</h2>
                <p className="text-muted2 mb-5">
                    An unexpected error occurred. This has been logged and we are looking
                    into it.
                </p>

                {process.env.NODE_ENV === "development" && (
                    <div
                        className="glass rounded-3 p-3 mb-4 text-start"
                        style={{ fontSize: "0.78rem" }}
                    >
                        <code className="text-warning">{error.message}</code>
                    </div>
                )}

                <div className="d-flex gap-3 justify-content-center">
                    <button
                        onClick={reset}
                        className="btn btn-accent rounded-3 px-4"
                    >
                        Try again
                    </button>
                    {/* ✅ Fixed: use Link instead of <a> for internal navigation */}
                    <Link href="/" className="btn btn-outline-light rounded-3 px-4">
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
}