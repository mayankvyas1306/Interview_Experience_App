const Post = require("../models/Post");

// OVERVIEW ANALYTICS
const getOverviewAnalytics = async (req, res, next) => {
  try {
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

    res.json({
      totalPosts,
      mostAskedTopics: topicsCount,
      topCompanies,
    });
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

    res.json({
      company,
      topics: companyTopics,
    });
  } catch (err) {
    next(err);
  }
};

// TRENDING POSTS
const getTrendingPosts = async (req, res, next) => {
  try {
    const trending = await Post.find()
      .populate("authorId", "fullName email college year")
      .sort({ upvotesCount: -1, createdAt: -1 })
      .limit(10);

    res.json({ trending });
  } catch (err) {
    next(err);
  }
};

//get companies list
const getCompaniesList = async(req,res,next)=>{
  try{
    const companies = await Post.distinct("companyName");
    res.json({companies});
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
