const Post = require("../models/Post");
const { getCache, setCache } = require("../utils/cache");
const { CACHE_TTL, PAGINATION } = require("../constants");

// ─── 1. OVERVIEW ─────────────────────────────────────────────────────────────
const getOverviewAnalytics = async (req, res, next) => {
  try {
    const cacheKey = "analytics:overview";
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    const totalPosts = await Post.countDocuments();

    const topicsCount = await Post.aggregate([
      { $unwind: "$tags" },
      {
        $group: {
          _id: { $toLower: "$tags" },
          originalName: { $first: "$tags" },
          count: { $sum: 1 },
        },
      },
      { $project: { _id: "$originalName", count: 1 } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const topCompanies = await Post.aggregate([
      {
        $group: {
          _id: { $toLower: "$companyName" },
          originalName: { $first: "$companyName" },
          count: { $sum: 1 },
        },
      },
      { $project: { _id: "$originalName", count: 1 } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const payload = { totalPosts, mostAskedTopics: topicsCount, topCompanies };

    setCache(cacheKey, payload, CACHE_TTL.OVERVIEW);
    res.json(payload);
  } catch (err) {
    next(err);
  }
};

// ─── 2. COMPANY STATS ────────────────────────────────────────────────────────
const getCompanyStats = async (req, res, next) => {
  try {
    const { company } = req.query;
    if (!company) {
      res.status(400);
      throw new Error("Company query is required");
    }

    const cacheKey = `analytics:company_stats:${company.toLowerCase()}`;
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    const matchStage = {
      $match: { companyName: { $regex: new RegExp(`^${company}$`, "i") } },
    };

    const [difficultySplit, avgRoundsResult, commonRoles, topTopics] =
      await Promise.all([
        Post.aggregate([
          matchStage,
          { $group: { _id: "$difficulty", count: { $sum: 1 } } },
        ]),
        Post.aggregate([
          matchStage,
          {
            $project: {
              numberOfRounds: { $size: { $ifNull: ["$rounds", []] } },
            },
          },
          { $group: { _id: null, avg: { $avg: "$numberOfRounds" } } },
        ]),
        Post.aggregate([
          matchStage,
          { $group: { _id: "$role", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 },
        ]),
        Post.aggregate([
          matchStage,
          { $unwind: "$tags" },
          {
            $group: {
              _id: { $toLower: "$tags" },
              originalName: { $first: "$tags" },
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 8 },
          { $project: { _id: "$originalName", count: 1 } },
        ]),
      ]);

    const payload = {
      company,
      difficultySplit,
      avgRounds:
        avgRoundsResult.length > 0
          ? Math.round(avgRoundsResult[0].avg * 10) / 10
          : 0,
      commonRoles,
      topTopics,
    };

    setCache(cacheKey, payload, CACHE_TTL.COMPANY_STATS);
    res.json(payload);
  } catch (err) {
    next(err);
  }
};

// ─── 3. TOPIC ANALYTICS ──────────────────────────────────────────────────────
const getTopicAnalytics = async (req, res, next) => {
  try {
    const cacheKey = "analytics:topics_advanced";
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    const globalTopics = await Post.aggregate([
      { $unwind: "$tags" },
      {
        $group: {
          _id: { $toLower: "$tags" },
          name: { $first: "$tags" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 15 },
    ]);

    const payload = { globalTopics };
    setCache(cacheKey, payload, CACHE_TTL.TOPICS);
    res.json(payload);
  } catch (err) {
    next(err);
  }
};

// ─── 4. TRENDING ─────────────────────────────────────────────────────────────
const getTrendingStats = async (req, res, next) => {
  try {
    const cacheKey = "analytics:trending_stats";
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [trendingCompanies, popularRoles, trendingPosts] = await Promise.all([
      Post.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $toLower: "$companyName" },
            name: { $first: "$companyName" },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      Post.aggregate([
        { $group: { _id: "$role", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      Post.find()
        .populate("authorId", "fullName email college year")
        .sort({ upvotesCount: -1, createdAt: -1 })
        .limit(5),
    ]);

    const payload = { trendingCompanies, popularRoles, trendingPosts };
    setCache(cacheKey, payload, CACHE_TTL.TRENDING);
    res.json(payload);
  } catch (err) {
    next(err);
  }
};

// ─── 5. USER ANALYTICS ───────────────────────────────────────────────────────
const getUserAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const userPosts = await Post.find({ authorId: userId });
    const totalPosts = userPosts.length;
    const totalUpvotes = userPosts.reduce(
      (acc, post) => acc + (post.upvotesCount || 0),
      0
    );

    const rank =
      totalPosts > 5 ? "Top 10%" : totalPosts > 0 ? "Contributor" : "Newcomer";

    res.json({
      totalPosts,
      totalUpvotes,
      rank,
      recentActivity: userPosts.slice(0, 5),
    });
  } catch (err) {
    next(err);
  }
};

// ─── 6. COMPANIES LIST ───────────────────────────────────────────────────────
const getCompaniesList = async (req, res, next) => {
  try {
    const cacheKey = "analytics:companies";
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    const companiesRaw = await Post.aggregate([
      {
        $group: {
          _id: { $toLower: "$companyName" },
          name: { $first: "$companyName" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const companies = companiesRaw.map((c) => c.name);
    const payload = { companies };
    setCache(cacheKey, payload, CACHE_TTL.COMPANIES_LIST);
    res.json(payload);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getOverviewAnalytics,
  getCompanyStats,
  getTopicAnalytics,
  getTrendingStats,
  getUserAnalytics,
  getCompaniesList,
};