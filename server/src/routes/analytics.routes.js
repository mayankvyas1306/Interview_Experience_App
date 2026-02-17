const express = require("express");
const { protect } = require("../middlewares/auth.middleware");
const {
    getOverviewAnalytics,
    getCompanyStats,
    getTopicAnalytics,
    getTrendingStats,
    getUserAnalytics,
    getCompaniesList
} = require("../controllers/analytics.controller");

const router = express.Router();


// 1. Overview Dashboard
router.get("/overview", getOverviewAnalytics);

// 2. Company Insights (Advanced)
router.get("/company-stats", getCompanyStats);

// 3. Topic Frequency Analytics
router.get("/topic-analytics", getTopicAnalytics);

// 4. Trending Stats
router.get("/trending-stats", getTrendingStats);

// 5. User Stats (Protected)
router.get("/user-stats", protect, getUserAnalytics);

// 6. Company List for Dropdown
router.get("/companies", getCompaniesList);

module.exports = router;