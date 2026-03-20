/**
 * Interview topic tags.
 * Single source of truth — used in create, edit, explore, and AI tag suggestion.
 * Both frontend and backend must stay in sync with this list.
 */
export const TAGS = [
    "DSA",
    "DBMS",
    "OS",
    "CN",
    "OOP",
    "System Design",
    "Aptitude",
    "Behavioral",
    "ML",
    "Frontend",
    "Backend",
    "DevOps",
] as const;

export type Tag = (typeof TAGS)[number];