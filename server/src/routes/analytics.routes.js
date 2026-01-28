const express = require("express");
const { getOverviewAnalytics, getCompanyTopicsAnalytics, getTrendingPosts, getCompaniesList } = require("../controllers/analytics.controller");
const router = express.Router();


//overview dashboard
router.get("/overview",getOverviewAnalytics);

//company  wise topic analytics 
router.get("/company-topics",getCompanyTopicsAnalytics);

//trending posts
router.get("/trending",getTrendingPosts);

//company list
router.get("/companies",getCompaniesList);

module.exports = router;