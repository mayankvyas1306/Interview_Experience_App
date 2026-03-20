"use client";

import React, { Component, ReactNode } from "react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    /**
     * Optional callback when an error is caught.
     * Use this to send errors to monitoring services like Sentry.
     */
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * ErrorBoundary — catches JavaScript errors in child components.
 *
 * Why React class component?
 * Error boundaries MUST be class components. This is a React limitation —
 * there is no hooks equivalent for componentDidCatch yet (as of React 18).
 *
 * Usage:
 * <ErrorBoundary fallback={<p>Something went wrong</p>}>
 *   <SomeComponent />
 * </ErrorBoundary>
 *
 * Without this: one crashed component = blank page for the user.
 * With this: one crashed component = friendly error message, rest of app works.
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log to console in development
        console.error("ErrorBoundary caught an error:", error, errorInfo);

        // Call optional error reporting callback
        this.props.onError?.(error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <ErrorFallback
                    error={this.state.error}
                    onReset={this.handleReset}
                />
            );
        }

        return this.props.children;
    }
}

// ─── Default fallback UI ──────────────────────────────────────────────────────

interface ErrorFallbackProps {
    error: Error | null;
    onReset?: () => void;
}

export function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
    return (
        <div className="glass rounded-4 p-5 text-center my-4">
            <div className="fs-1 mb-3">⚠️</div>
            <h4 className="fw-bold mb-2">Something went wrong</h4>
            <p className="text-muted2 mb-4">
                {error?.message || "An unexpected error occurred"}
            </p>
            {onReset && (
                <button
                    onClick={onReset}
                    className="btn btn-accent rounded-3 me-2"
                >
                    Try again
                </button>
            )}
            <button
                onClick={() => window.location.reload()}
                className="btn btn-outline-light rounded-3"
            >
                Reload page
            </button>
        </div>
    );
}

export default ErrorBoundary;