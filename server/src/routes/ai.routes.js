const express = require("express");
const { protect, optionalProtect } = require("../middlewares/auth.middleware");
const rateLimit = require("express-rate-limit");
const {
    analyzePost,
    suggestTags,
    getCompanyPrepGuide,
    compareCompanies,
    getPracticeQuestions,
} = require("../controllers/ai.controller");

//strict rate linit for ai endpoints - they are expensive
const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: process.env.NODE_ENV === "production" ? 20 : 100,
    message: "Too many AI requests. Please wait before trying again.",
    // No custom keyGenerator — uses default IP-based limiting
    // User-based limiting handled by the protect middleware upstream
});

const router = express.Router();

//Public endpoints ( cached, so Gemini not called on every request)
router.get("/analyze-post/:postId", optionalProtect, aiLimiter, analyzePost);
router.get("/company-prep", aiLimiter, getCompanyPrepGuide);
router.get("/compare", aiLimiter, compareCompanies);
router.get("/practice-questions", aiLimiter, getPracticeQuestions);

//Protected endpoints - require login
router.post("/suggest-tags", protect, aiLimiter, suggestTags);

module.exports = router;

