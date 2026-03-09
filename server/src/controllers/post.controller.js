const Post = require("../models/Post");
const { clearCacheByPrefix } = require("../utils/cache");
const AppError = require("../utils/AppError");
const Upvote = require("../models/Upvote")
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

// get all posts 
//Supports Cursor based pagination
//Query Params:
// cursor = last post _id(for infinite scroll)
// limit = number of posts (default 6, max 50)
// company , role, difficulty, tag, sort = filters
// page = still supported for admin/backward compat
const getAllPosts = async (req, res, next) => {
  try {

    const limit = Math.min(Math.max(1, Number(req.query.limit) || 6), 50);
    const filters = {};

    // Filters
    if (req.query.company) {
      filters.companyName = { $regex: escapeRegex(String(req.query.company)), $options: "i" };
    }

    if (req.query.role) {
      filters.role = { $regex: escapeRegex(String(req.query.role)), $options: "i" };
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
        filters.tags = { $elemMatch: { $regex: new RegExp(escapeRegex(rawTag), "i") } };
      }
    }

    //sort
    let sortOption = { createdAt: -1 };
    if (req.query.sort === "top") {
      sortOption = { upvotesCount: -1, createdAt: -1 };
      filters.upvotesCount = { $gt: 0 };
    }

    //cursor based pagination(for infinite scroll)
    if (req.query.cursor) {
      try {
        const cursorId = req.query.cursor;
        if (req.query.sort === "top") {
          //for "top" sort , cursor is more complex
          // we use the last post's upvoteCount + _id for stable cursor
          const cursorPost = await Post.findById(cursorId).select("upvoteCount").lean();
          if (cursorPost) {
            filters.$or = [
              { upvotesCount: { $lt: cursorPost.upvotesCount } },
              {
                upvotesCount: cursorPost.upvotesCount,
                _id: { $lt: cursorId },
              },
            ];
            //remove simple upvotesCount filter since $or handels it
            delete filters.upvotesCount;

          }
        }
        else {
          //for "latest" sort , cursor is just the _id(ObjectId has timestamp)
          filters._id = { $lt: cursorId };
        }
      } catch (err) {
        //Invalid cursor - ignore and return from begining

      }
    }

    //ofset based pagination
    let skip = 0;
    if (!req.query.cursor && req.query.page) {
      const page = Math.max(1, Number(req.query.page) || 1);
      skip = (page - 1) * limit;
    }

    const posts = await Post.find(filters)
      .populate("authorId", "fullName email college year")
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();

    //Total count only needed for offset pagination
    //for cursor pagination, we just check if there are more posts
    const hasMore = posts.length === limit;
    const nextCursor = hasMore ? posts[posts.length - 1]._id : null;


    //for backward compat, still provide totalPosts when using offset
    let totalPosts;
    let totalPages;
    if (req.query.page && !req.query.cursor) {
      totalPosts = await Post.countDocuments(filters);
      totalPages = Math.ceil(totalPosts / limit);
    }




    res.json({
      page,
      hasMore,
      nextCursor,
      //offset pagination fields(present when using page= query)
      ...AppError(totalPosts !== undefined && { totalPosts, totalPages, pages: Number(req.query.page) }),
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
    post.rounds = rounds !== undefined ? rounds : post.rounds;

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

    //also delete associated upvotes and saves for this post  
    const Upvote = require("../models/Upvote");
    const Save = require("../models/Save");

    await Promise.all([
      Post.deleteOne({ _id: post._id }),
      Upvote.deleteMany({ postId: post._id }),
      Save.deleteMany({ postId: post._id }),
    ]);

    clearCacheByPrefix("analytics:");


    res.json({ message: "Post deleted Successfully " });
  } catch (err) {
    next(err);
  }
};

const toggleUpvote = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      throw new AppError("Post not found", 404);
    }

    const userId = req.user._id;
    const postId = post._id;

    // Check if upvote exists using the new Upvote collection
    const existingUpvote = await Upvote.findOne({ userId, postId });

    if (existingUpvote) {
      // Remove upvote
      await Upvote.deleteOne({ _id: existingUpvote._id });

      // Decrement counter (min 0)
      const updatedPost = await Post.findByIdAndUpdate(
        postId,
        { $inc: { upvotesCount: -1 } },
        { new: true, runValidators: true }
      );

      // Ensure never goes below 0
      if (updatedPost.upvotesCount < 0) {
        await Post.findByIdAndUpdate(postId, { upvotesCount: 0 });
      }

      clearCacheByPrefix("analytics:");
      return res.json({
        message: "Upvote removed",
        upvotesCount: Math.max(0, updatedPost.upvotesCount),
        upvoted: false,
      });
    } else {
      // Add upvote
      await Upvote.create({ userId, postId });

      const updatedPost = await Post.findByIdAndUpdate(
        postId,
        { $inc: { upvotesCount: 1 } },
        { new: true }
      );

      clearCacheByPrefix("analytics:");
      return res.json({
        message: "Post upvoted",
        upvotesCount: updatedPost.upvotesCount,
        upvoted: true,
      });
    }
  } catch (err) {
    // Handle race condition: two simultaneous upvotes
    if (err.code === 11000) {
      return res.status(409).json({ message: "Already upvoted" });
    }
    next(err);
  }
};

// ─────────────────────────────────────────────
// CHECK UPVOTE STATUS — used on post detail page load
// ─────────────────────────────────────────────
const getUpvoteStatus = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.json({ upvoted: false });
    }

    const upvote = await Upvote.findOne({
      userId: req.user._id,
      postId: req.params.id,
    });

    res.json({ upvoted: !!upvote });
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
  getUpvoteStatus
};
