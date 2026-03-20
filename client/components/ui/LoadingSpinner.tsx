interface LoadingSpinnerProps {
    text?: string;
    size?: "sm" | "md" | "lg";
    fullPage?: boolean;
}

/**
 * LoadingSpinner — consistent loading state across all pages.
 * Replaces the duplicated spinner+text pattern in 10+ components.
 */
export default function LoadingSpinner({
    text = "Loading...",
    size = "md",
    fullPage = false,
}: LoadingSpinnerProps) {
    const sizeClass = size === "sm" ? "spinner-border-sm" : "";

    const content = (
        <div className="text-center">
            <div
                className={`spinner-border text-light ${sizeClass}`}
                role="status"
                style={size === "lg" ? { width: "3rem", height: "3rem" } : undefined}
            >
                <span className="visually-hidden">{text}</span>
            </div>
            {text && <p className="text-muted2 mt-3 mb-0">{text}</p>}
        </div>
    );

    if (fullPage) {
        return (
            <div
                className="d-flex align-items-center justify-content-center"
                style={{ minHeight: "60vh" }}
            >
                {content}
            </div>
        );
    }

    return <div className="py-5">{content}</div>;
}