const express = require("express");
const { getOverviewAnalytics, getCompanyTopicsAnalytics, getTrendingPosts } = require("../controllers/analytics.controller");
const router = express.Router();


//overview dashboard
router.get("/overview",getOverviewAnalytics);

//company  wise topic analytics 
router.get("/company-topics",getCompanyTopicsAnalytics);

//trending posts
router.get("/trending",getTrendingPosts);

module.exports = router;