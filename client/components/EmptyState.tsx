import Link from "next/link";

interface EmptyStateProps {
    icon?: string;
    title: string;
    description: string;
    action?: {
        label: string;
        href?: string;
        onClick?: () => void;
    };
    secondaryAction?: {
        label: string;
        href?: string;
        onClick?: () => void;
    };
}

/**
 * EmptyState — consistent empty state across all pages.
 *
 * Good empty states have 3 parts:
 * 1. A visual (emoji or illustration)
 * 2. Clear explanation of why it's empty
 * 3. A call-to-action to help the user proceed
 */
export default function EmptyState({
    icon = "🔍",
    title,
    description,
    action,
    secondaryAction,
}: EmptyStateProps) {
    return (
        <div className="glass rounded-4 p-5 text-center">
            {/* Icon */}
            <div
                className="mx-auto d-flex align-items-center justify-content-center mb-4"
                style={{
                    width: 72,
                    height: 72,
                    fontSize: "2rem",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "50%",
                    border: "1px solid rgba(255,255,255,0.08)",
                }}
            >
                {icon}
            </div>

            {/* Text */}
            <h5 className="fw-bold mb-2">{title}</h5>
            <p className="text-muted2 mb-4" style={{ maxWidth: 360, margin: "0 auto 1.5rem" }}>
                {description}
            </p>

            {/* Actions */}
            {(action || secondaryAction) && (
                <div className="d-flex gap-3 justify-content-center flex-wrap">
                    {action && (
                        action.href ? (
                            <Link href={action.href} className="btn btn-accent rounded-3 px-4">
                                {action.label}
                            </Link>
                        ) : (
                            <button
                                onClick={action.onClick}
                                className="btn btn-accent rounded-3 px-4"
                            >
                                {action.label}
                            </button>
                        )
                    )}

                    {secondaryAction && (
                        secondaryAction.href ? (
                            <Link
                                href={secondaryAction.href}
                                className="btn btn-outline-light rounded-3 px-4"
                            >
                                {secondaryAction.label}
                            </Link>
                        ) : (
                            <button
                                onClick={secondaryAction.onClick}
                                className="btn btn-outline-light rounded-3 px-4"
                            >
                                {secondaryAction.label}
                            </button>
                        )
                    )}
                </div>
            )}
        </div>
    );
}