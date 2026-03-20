"use client";

import { KeyboardEvent, useState } from "react";
import { TAGS } from "@/constants/tags";

interface TagInputProps {
    tags: string[];
    onChange: (tags: string[]) => void;
    /** Whether to show the AI suggest button */
    showAISuggest?: boolean;
    onAISuggest?: () => Promise<void>;
    aiSuggestLoading?: boolean;
}

/**
 * TagInput — reusable chip-based tag management.
 *
 * Used in both /create and /edit/[id] pages.
 * Supports:
 * - Adding tags by typing + Enter
 * - Clicking predefined tag buttons
 * - Removing individual tags with ✕
 * - AI tag suggestion (optional)
 */
export default function TagInput({
    tags,
    onChange,
    showAISuggest = false,
    onAISuggest,
    aiSuggestLoading = false,
}: TagInputProps) {
    const [inputValue, setInputValue] = useState("");

    const addTag = (tag: string) => {
        const clean = tag.trim();
        if (!clean || tags.includes(clean)) return;
        onChange([...tags, clean]);
        setInputValue("");
    };

    const removeTag = (tag: string) => {
        onChange(tags.filter((t) => t !== tag));
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addTag(inputValue);
        }
    };

    return (
        <div>
            {/* Selected tags — chip display */}
            {tags.length > 0 && (
                <div className="d-flex flex-wrap gap-2 mb-2">
                    {tags.map((tag) => (
                        <span
                            key={tag}
                            className="badge rounded-pill bg-primary d-flex align-items-center gap-1"
                            style={{ fontSize: "0.8rem", padding: "6px 10px" }}
                        >
                            #{tag}
                            <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="btn btn-sm text-light p-0 ms-1 lh-1"
                                style={{ background: "none", border: "none", lineHeight: 1 }}
                                aria-label={`Remove ${tag} tag`}
                            >
                                ✕
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Text input */}
            <input
                className="form-control bg-transparent text-light border-secondary mb-2"
                placeholder="Type a tag and press Enter..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
            />

            {/* Predefined tag suggestions */}
            <div className="d-flex flex-wrap gap-1 mb-2">
                {TAGS.filter((t) => !tags.includes(t)).map((tag) => (
                    <button
                        key={tag}
                        type="button"
                        onClick={() => addTag(tag)}
                        className="btn btn-sm rounded-pill"
                        style={{
                            background: "rgba(109,94,249,0.12)",
                            border: "1px solid rgba(109,94,249,0.3)",
                            color: "rgba(255,255,255,0.75)",
                            fontSize: "0.75rem",
                            padding: "3px 10px",
                        }}
                    >
                        + {tag}
                    </button>
                ))}
            </div>

            {/* AI suggest button — optional */}
            {showAISuggest && onAISuggest && (
                <button
                    type="button"
                    onClick={onAISuggest}
                    disabled={aiSuggestLoading}
                    className="btn btn-sm btn-outline-secondary rounded-3 mt-1"
                >
                    {aiSuggestLoading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-1" />
                            Suggesting...
                        </>
                    ) : (
                        "✨ Suggest Tags with AI"
                    )}
                </button>
            )}
        </div>
    );
}