/**
 * Shared constants used across the server.
 * Single source of truth — change here, reflected everywhere.
 */

const ROLES = Object.freeze({
    USER: "user",
    ADMIN: "admin",
});

const DIFFICULTY = Object.freeze({
    EASY: "Easy",
    MEDIUM: "Medium",
    HARD: "Hard",
});

const RESULT = Object.freeze({
    SELECTED: "Selected",
    REJECTED: "Rejected",
    WAITING: "Waiting",
});

const NOTIFICATION_TYPES = Object.freeze({
    UPVOTE: "upvote",
    COMMENT: "comment",
    SYSTEM: "system",
});

const REPORT_REASONS = Object.freeze({
    SPAM: "spam",
    INAPPROPRIATE: "inappropriate",
    FAKE: "fake",
    HARASSMENT: "harassment",
    OTHER: "other",
});

const REPORT_STATUS = Object.freeze({
    PENDING: "pending",
    REVIEWED: "reviewed",
    DISMISSED: "dismissed",
    ACTIONED: "actioned",
});

const VALID_TAGS = Object.freeze([
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
]);

const PAGINATION = Object.freeze({
    DEFAULT_LIMIT: 6,
    MAX_LIMIT: 50,
    DEFAULT_ADMIN_LIMIT: 20,
    MAX_ADMIN_LIMIT: 100,
});

const CACHE_TTL = Object.freeze({
    OVERVIEW: 5 * 60 * 1000,        // 5 minutes
    COMPANY_STATS: 5 * 60 * 1000,   // 5 minutes
    TRENDING: 5 * 60 * 1000,        // 5 minutes
    TOPICS: 10 * 60 * 1000,         // 10 minutes
    COMPANIES_LIST: 10 * 60 * 1000, // 10 minutes
    AI_POST_ANALYSIS: 24 * 60 * 60 * 1000, // 24 hours
    AI_COMPANY_PREP: 6 * 60 * 60 * 1000,   // 6 hours
    AI_COMPARE: 6 * 60 * 60 * 1000,        // 6 hours
    AI_PRACTICE: 60 * 60 * 1000,           // 1 hour
});

module.exports = {
    ROLES,
    DIFFICULTY,
    RESULT,
    NOTIFICATION_TYPES,
    REPORT_REASONS,
    REPORT_STATUS,
    VALID_TAGS,
    PAGINATION,
    CACHE_TTL,
};