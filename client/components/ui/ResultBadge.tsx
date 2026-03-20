import { RESULT_COLOR } from "@/constants/colors";
import type { Result } from "@/constants/options";

interface ResultBadgeProps {
    result: Result;
    size?: "sm" | "md";
}

export default function ResultBadge({ result, size = "md" }: ResultBadgeProps) {
    const color = RESULT_COLOR[result] ?? "#888";

    return (
        <span
            className="badge rounded-pill"
            style={{
                background: `${color}18`,
                color,
                border: `1px solid ${color}30`,
                fontSize: size === "sm" ? "0.68rem" : "0.75rem",
                padding: "3px 10px",
                fontWeight: 600,
            }}
        >
            {result}
        </span>
    );
}