const Post = require("../models/Post");
const { getCache, setCache } = require("../utils/cache");

// Explanation: We use MongoDB aggregation pipelines to process data efficiently on the server side.
// We also use caching (Redis or in-memory) to prevent hitting the database on every request.

// 1. GET OVERVIEW ANALYTICS
// Fetches total posts, most asked topics, and top companies.
const getOverviewAnalytics = async (req, res, next) => {
  try {
    const cacheKey = "analytics:overview";
    const cached = getCache(cacheKey);
    if (cached) {
      return res.json(cached); // Return cached data if available
    }

    // A. Get Total Posts Count
    const totalPosts = await Post.countDocuments();

    // B. Get Most Asked Topics (Tags)
    // We analyze the 'tags' array in posts.
    // 'dsa', 'DSA', 'Dsa' should all be counted as 'DSA'.
    const topicsCount = await Post.aggregate([
      { $unwind: "$tags" }, // Deconstruct the tags array so each tag is a separate document
      {
        $group: {
          // Group by lowercase version of tag to merge duplicates like 'dsa' and 'DSA'
          _id: { $toLower: "$tags" },
          originalName: { $first: "$tags" }, // Keep one original name for display
          count: { $sum: 1 }, // Count occurrences
        },
      },
      {
        $project: {
          _id: "$originalName", // Use the original name as the ID for the frontend
          count: 1,
        }
      },
      { $sort: { count: -1 } }, // Sort by most frequent
      { $limit: 10 } // Top 10 topics only
    ]);

    // C. Get Top Companies
    // We analyze the 'companyName' field.
    // 'Amazon', 'amazon' should be counted together.
    const topCompanies = await Post.aggregate([
      {
        $group: {
          // Group by lowercase company name to handle case variations
          _id: { $toLower: "$companyName" },
          originalName: { $first: "$companyName" }, // Keep the first encountered format
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: "$originalName", // Send back the display name
          count: 1
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const payload = {
      totalPosts,
      mostAskedTopics: topicsCount,
      topCompanies,
    };

    setCache(cacheKey, payload); // Save to cache
    res.json(payload);
  } catch (err) {
    next(err);
  }
};

// 2. GET COMPANY SPECIFIC STATS (ADVANCED)
// Returns detailed stats for a company: Difficulty, Rounds, Roles, Topics
const getCompanyStats = async (req, res, next) => {
  try {
    const company = req.query.company;
    if (!company) {
      res.status(400);
      throw new Error("Company query is required");
    }

    const cacheKey = `analytics:company_stats:${company.toLowerCase()}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    // Match stage to filter by company (case-insensitive)
    const matchStage = {
      $match: {
        companyName: { $regex: new RegExp(`^${company}$`, "i") },
      },
    };

    // Parallel Aggregations for different metrics

    // A. Difficulty Split (Easy, Medium, Hard)
    const difficultySplit = await Post.aggregate([
      matchStage,
      {
        $group: {
          _id: "$difficulty",
          count: { $sum: 1 },
        },
      },
    ]);

    // B. Average Rounds
    const avgRounds = await Post.aggregate([
      matchStage,
      {
        $project: {
          numberOfRounds: { $size: "$rounds" }, // Calculate size of rounds array
        },
      },
      {
        $group: {
          _id: null,
          avg: { $avg: "$numberOfRounds" },
        },
      },
    ]);

    // C. Most Common Roles
    const commonRoles = await Post.aggregate([
      matchStage,
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // D. Most Asked Topics
    const topTopics = await Post.aggregate([
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
      {
        $project: {
          _id: "$originalName",
          count: 1,
        },
      },
    ]);

    const payload = {
      company,
      difficultySplit,
      avgRounds: avgRounds.length > 0 ? Math.round(avgRounds[0].avg * 10) / 10 : 0,
      commonRoles,
      topTopics,
    };

    setCache(cacheKey, payload);
    res.json(payload);
  } catch (err) {
    next(err);
  }
};

// 3. GET TOPIC FREQUENCY ANALYTICS
// Returns topic distribution by role (e.g. Backend vs Frontend)
const getTopicAnalytics = async (req, res, next) => {
  try {
    // This is a heavy query, so we cache it well
    const cacheKey = "analytics:topics_advanced";
    const cached = getCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    // We want to see what topics are popular for different roles
    // We'll limit to top 3 roles for clarity: SDE, Frontend, Backend (simplified logic)

    // For now, let's just get the global top topics with a count
    const globalTopics = await Post.aggregate([
      { $unwind: "$tags" },
      {
        $group: {
          _id: { $toLower: "$tags" },
          name: { $first: "$tags" },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 15 }
    ]);

    const payload = { globalTopics };
    setCache(cacheKey, payload);
    res.json(payload);
  } catch (err) {
    next(err);
  }
};

// 4. GET TRENDING (Companies & Roles)
// Fastest growing companies in last 7 days
const getTrendingStats = async (req, res, next) => {
  try {
    const cacheKey = "analytics:trending_stats";
    const cached = getCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    // Last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trendingCompanies = await Post.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $toLower: "$companyName" },
          name: { $first: "$companyName" },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const popularRoles = await Post.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Also get top posts like before
    const trendingPosts = await Post.find()
      .populate("authorId", "fullName email college year")
      .sort({ upvotesCount: -1, createdAt: -1 })
      .limit(5);

    const payload = {
      trendingCompanies,
      popularRoles,
      trendingPosts
    };

    setCache(cacheKey, payload);
    res.json(payload);

  } catch (err) {
    next(err);
  }
};

// 5. GET USER ANALYTICS
// Stats for the logged-in user
const getUserAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id; // From auth middleware

    const userPosts = await Post.find({ authorId: userId });

    const totalPosts = userPosts.length;
    const totalUpvotes = userPosts.reduce((acc, post) => acc + (post.upvotesCount || 0), 0);

    // Calculate rank (percentile) - simplified
    // In a real app, this would be a separate count query
    const totalUsers = await Post.distinct("authorId").then(ids => ids.length);
    // Simple mock rank logic
    const topPercent = totalPosts > 5 ? "Top 10%" : totalPosts > 0 ? "Contributor" : "Newcomer";

    const payload = {
      totalPosts,
      totalUpvotes,
      rank: topPercent,
      recentActivity: userPosts.slice(0, 5) // Last 5 posts
    };

    res.json(payload); // Don't cache user specific stats for long, or key by userId
  } catch (err) {
    next(err);
  }
};


// 6. GET COMPANIES LIST (For Dropdown)
const getCompaniesList = async (req, res, next) => {
  try {
    const cacheKey = "analytics:companies";
    const cached = getCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const companiesRaw = await Post.aggregate([
      {
        $group: {
          _id: { $toLower: "$companyName" },
          name: { $first: "$companyName" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const companies = companiesRaw.map(c => c.name);

    const payload = { companies };
    setCache(cacheKey, payload);
    res.json(payload);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getOverviewAnalytics,
  getCompanyStats,
  getTopicAnalytics,
  getTrendingStats,
  getUserAnalytics,
  getCompaniesList
};
