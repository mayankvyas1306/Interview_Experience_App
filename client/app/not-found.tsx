import Link from "next/link";

/**
 * Next.js special file — automatically shown for 404 errors.
 * Must be in the app/ directory root.
 */
export default function NotFound() {
    return (
        <div
            className="d-flex align-items-center justify-content-center"
            style={{ minHeight: "80vh" }}
        >
            <div className="text-center" style={{ maxWidth: 480 }}>
                {/* Big 404 */}
                <div
                    className="fw-bold mb-0"
                    style={{
                        fontSize: "8rem",
                        lineHeight: 1,
                        background: "linear-gradient(120deg, #6D5EF9, #00D4FF)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                    }}
                >
                    404
                </div>

                <h2 className="fw-bold mb-3">Page not found</h2>
                <p className="text-muted2 mb-5">
                    The page you are looking for does not exist or has been moved.
                </p>

                <div className="d-flex gap-3 justify-content-center">
                    <Link href="/" className="btn btn-accent rounded-3 px-4">
                        Go Home
                    </Link>
                    <Link href="/explore" className="btn btn-outline-light rounded-3 px-4">
                        Explore Posts
                    </Link>
                </div>
            </div>
        </div>
    );
}