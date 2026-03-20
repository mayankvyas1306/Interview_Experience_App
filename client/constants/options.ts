/**
 * Options for select/dropdown inputs.
 * Keeps form options consistent across create, edit, and filter pages.
 */

export const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard"] as const;
export type Difficulty = (typeof DIFFICULTY_OPTIONS)[number];

export const RESULT_OPTIONS = ["Selected", "Rejected", "Waiting"] as const;
export type Result = (typeof RESULT_OPTIONS)[number];

export const YEAR_OPTIONS = [
    { value: 1, label: "1st Year" },
    { value: 2, label: "2nd Year" },
    { value: 3, label: "3rd Year" },
    { value: 4, label: "4th Year" },
] as const;

export const SORT_OPTIONS = [
    { value: "latest", label: "Latest" },
    { value: "top", label: "Trending (Top Upvotes)" },
] as const;