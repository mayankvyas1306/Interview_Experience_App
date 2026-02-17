const Post = require("../models/Post");
const { clearCacheByPrefix } = require("../utils/cache");
const AppError = require("../utils/AppError");

const escapeRegex = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

//create a new interview experience post
const createPost = async (req, res, next) => {
  try {
    const { companyName, role, tags, difficulty, result, rounds } = req.body;

    const post = await Post.create({
      authorId: req.user._id, //coming from protect middleware
      companyName,
      role,
      tags: (tags || []).map((t) => t.toLowerCase().trim()),
      difficulty: difficulty || "Medium",
      result: result || "Waiting",
      rounds: rounds || [],
    });

    clearCacheByPrefix("analytics:");
    res.status(201).json({ message: "Post created Successfully", post });
  } catch (err) {
    next(err);
  }
};

// get all posts (search + filters + pagination)
const getAllPosts = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const requestedLimit = Number(req.query.limit) || 6;
    const limit = Math.min(Math.max(1, requestedLimit), 50);
    const skip = (page - 1) * limit;

    const filters = {};

    if (req.query.company) {
      filters.companyName = { $regex: req.query.company, $options: "i" };
    }

    if (req.query.role) {
      filters.role = { $regex: req.query.role, $options: "i" };
    }

    if (req.query.difficulty) {
      filters.difficulty = req.query.difficulty;
    }

    if (req.query.result) {
      filters.result = req.query.result;
    }

    if (req.query.tag) {
      const rawTag = String(req.query.tag).trim();
      if (rawTag) {
        const tagRegex = new RegExp(escapeRegex(rawTag), "i");
        filters.tags = { $elemMatch: { $regex: tagRegex } };
      }
    }

    let sortOption = { createdAt: -1 };

    if (req.query.sort === "top") {
      sortOption = { upvotesCount: -1, createdAt: -1 };
      filters.upvotesCount = { $gt: 0 };
    }

    const posts = await Post.find(filters)
      .populate("authorId", "fullName email college year")
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPosts = await Post.countDocuments(filters);

    res.json({
      page,
      limit,
      totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
      posts,
    });
  } catch (err) {
    next(err);
  }
};

//get post By Id
const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "authorId",
      "fullName email college year",
    );

    if (!post) {
      throw new AppError("Post not Found", 404);
    }

    res.json({ post });
  } catch (err) {
    next(err);
  }
};

//update Post
const updatePost = async (req, res, next) => {
  try {
    const { companyName, role, tags, difficulty, result, rounds } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
      throw new AppError("Post not found", 404);
    }

    if (post.authorId.toString() !== req.user._id.toString()) {
      throw new AppError("You are not allowed to update this post", 403);
    }

    post.companyName = companyName || post.companyName;
    post.role = role || post.role;
    post.tags = tags ? tags.map((t) => t.toLowerCase().trim()) : post.tags;
    post.difficulty = difficulty || post.difficulty;
    post.result = result || post.result;
    post.rounds = rounds || post.rounds;

    const updatePost = await post.save();

    clearCacheByPrefix("analytics:");
    res.json({
      message: "Post updated successfully",
      post: updatePost,
    });
  } catch (err) {
    next(err);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      throw new AppError("Post not Found", 404);
    }

    if (post.authorId.toString() !== req.user._id.toString()) {
      throw new AppError("You are not allowed to delete this post", 403);
    }

    await Post.deleteOne({ _id: post._id });
    clearCacheByPrefix("analytics:");
    clearCacheByPrefix("analytics:");

    res.json({ message: "Post deleted Successfully " });
  } catch (err) {
    next(err);
  }
};

const toggleUpvote = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError("Not authorized - please login to upvote", 401);
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      throw new AppError("Post not Found", 404);
    }
    const userId = req.user._id.toString();

    const alreadyUpvoted = post.upvotedBy
      .map((id) => id.toString())
      .includes(userId);

    if (alreadyUpvoted) {
      post.upvotedBy = post.upvotedBy.filter((id) => id.toString() !== userId);
      post.upvotesCount = Math.max(0, post.upvotesCount - 1);

      await post.save();
      clearCacheByPrefix("analytics:");
      clearCacheByPrefix("analytics:");

      return res.json({
        message: "Upvote removed",
        upvotesCount: post.upvotesCount,
      });
    } else {
      post.upvotedBy.push(req.user._id);
      post.upvotesCount = post.upvotesCount + 1;

      await post.save();
      clearCacheByPrefix("analytics:");

      return res.json({
        message: "Post upvoted",
        upvotesCount: post.upvotesCount,
      });
    }
  } catch (err) {
    next(err);
  }
};

module.exports = {
  toggleUpvote,
  deletePost,
  updatePost,
  createPost,
  getAllPosts,
  getPostById,
};
