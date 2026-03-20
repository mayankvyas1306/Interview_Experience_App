/**
 * Color maps for difficulty and result badges.
 * Single source of truth — previously duplicated in 5+ files.
 */

export const DIFFICULTY_COLOR: Record<string, string> = {
    Easy: "#00FFB2",
    Medium: "#FFD166",
    Hard: "#FF6B6B",
};

export const RESULT_COLOR: Record<string, string> = {
    Selected: "#00FFB2",
    Rejected: "#FF6B6B",
    Waiting: "#aaa",
};

// For charts (Recharts)
export const CHART_COLORS = [
    "#00D4FF",
    "#6D5EF9",
    "#00FFB2",
    "#FF0055",
    "#FFBB00",
];

export const DIFFICULTY_CHART_COLORS: Record<string, string> = {
    Easy: "#00FFB2",
    Medium: "#FFBB00",
    Hard: "#FF0055",
};