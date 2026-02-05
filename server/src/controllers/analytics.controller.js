const Post = require("../models/Post");
const { setCache, getCache } = require("../utils/cache");

// OVERVIEW ANALYTICS
const getOverviewAnalytics = async (req, res, next) => {
  try {

    const cacheKey = "analytics:overview";
    const cached = getCache(cacheKey);
    if(cached){
      return res.json(cached);
    }

    const totalPosts = await Post.countDocuments();

    const topicsCount = await Post.aggregate([
      { $unwind: "$tags" },
      {
        $group: {
          _id: "$tags",   // ✅ FIXED
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const topCompanies = await Post.aggregate([
      {
        $group: {
          _id: "$companyName",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const payload = {
      totalPosts,
      mostAskedTopics: topicsCount,
      topCompanies,
    };

    setCache(cacheKey,payload);
    res.json(payload);
  } catch (err) {
    next(err);
  }
};

// COMPANY TOPIC ANALYTICS
const getCompanyTopicsAnalytics = async (req, res, next) => {
  try {
    const company = req.query.company;

    if (!company) {
      res.status(400);
      throw new Error("Company query is required");
    }

    const cacheKey = `analytics:company:${company.toLowerCase()}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const companyTopics = await Post.aggregate([
      {
        $match: {
          companyName: {
            $regex: new RegExp(`^${company}$`, "i"),
          },
        },
      },
      { $unwind: "$tags" },
      {
        $group: {
          _id: "$tags",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const payload={
      company,
      topics: companyTopics,
    };
    setCache(cacheKey,payload);
    res.json(payload);
  } catch (err) {
    next(err);
  }
};

// TRENDING POSTS
const getTrendingPosts = async (req, res, next) => {
  try {

    const cacheKey = "analytics:trending";
    const cached = getCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const trending = await Post.find()
      .populate("authorId", "fullName email college year")
      .sort({ upvotesCount: -1, createdAt: -1 })
      .limit(10);

    const payload = { trending };
    setCache(cacheKey, payload);
    res.json(payload);
  } catch (err) {
    next(err);
  }
};

//get companies list
const getCompaniesList = async(req,res,next)=>{
  try{
    const cacheKey = "analytics:companies";
    const cached = getCache(cacheKey);
    if(cached){
      return res.json(cached);
    }

    const companies = await Post.distinct("companyName");
    
    const payload = { companies };
    setCache(cacheKey,payload);
    res.json(payload);
  }catch(err){
    next(err);
  }
}

module.exports = {
  getOverviewAnalytics,
  getCompanyTopicsAnalytics,
  getTrendingPosts,
  getCompaniesList
};
