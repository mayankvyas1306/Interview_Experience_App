import type { Difficulty } from "@/constants/options";

interface DifficultyBadgeProps {
    difficulty: Difficulty;
    size?: "sm" | "md";
}

const CLASS_MAP: Record<Difficulty, string> = {
    Easy: "easy",
    Medium: "medium",
    Hard: "hard",
};

/**
 * DifficultyBadge — consistent difficulty indicator across all pages.
 * Replaces the inline style pattern used in 6+ components previously.
 *
 * Before: <span style={{ background: `${DIFFICULTY_COLOR[d]}22`, color: ... }}>
 * After:  <DifficultyBadge difficulty="Easy" />
 */
export default function DifficultyBadge({
    difficulty,
    size = "md",
}: DifficultyBadgeProps) {
    return (
        <span
            className={`badge-difficulty ${CLASS_MAP[difficulty]}`}
            style={{ fontSize: size === "sm" ? "0.68rem" : undefined }}
        >
            {difficulty}
        </span>
    );
}