const Post = require("../models/Post");
const User = require("../models/User");
const Save = require("../models/Save")
const AppError = require("../utils/AppError");


// save unsave post functionality
const toggleSavePost = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const userId = req.user._id;

    const postExists = await Post.findById(postId).lean();
    if (!postExists) {
      throw new AppError("Post not found", 404);
    }

    const existingSave = await Save.findOne({ userId, postId });

    if (existingSave) {
      await Save.deleteOne({ _id: existingSave._id });
      return res.json({ message: "Post removed from saved", saved: false });
    } else {
      await Save.create({ userId, postId });
      return res.json({ message: "Post saved successfully", saved: true });
    }
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Already saved" });
    }
    next(err);
  }
};

//get saved posts - paginated
const getSavedPosts = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const [saves, totalSaved] = await Promise.all([
      Save.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "postId",
          populate: {
            path: "authorId",
            select: "fullName email college year",
          },
        })
        .lean(),
      Save.countDocuments({ userId }),
    ]);

    // Extract the populated post from each save document
    const savedPosts = saves
      .map((save) => save.postId)
      .filter(Boolean); // Remove nulls (if post was deleted)

    res.json({
      totalSaved,
      page,
      totalPages: Math.ceil(totalSaved / limit),
      savedPosts,
    });
  } catch (err) {
    next(err);
  }
};


//get save status - for a specific post
const getSaveStatus = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.json({ saved: false });
    }

    const save = await Save.findOne({
      userId: req.user._id,
      postId: req.params.postId,
    });

    res.json({ saved: !!save });
  } catch (err) {
    next(err);
  }
};

const getUserProfile = async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized");
    }

    const user = await User.findById(req.user._id).select("-password").lean();
    if (!user) {
      res.status(404);
      throw new AppError("User not found", 404);
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
}

const getMyPosts = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(Math.max(1, Number(req.query.limit) || 6), 50);
    const skip = (page - 1) * limit;

    const filters = { authorId: req.user._id };

    const [posts, totalPosts] = await Promise.all([
      Post.find(filters)
        .populate("authorId", "fullName email college year")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(filters),
    ]);

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

module.exports = { getSaveStatus, getSavedPosts, toggleSavePost, getUserProfile, getMyPosts }