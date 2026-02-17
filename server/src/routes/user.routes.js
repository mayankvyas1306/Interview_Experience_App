const express = require("express");
const { protect } = require("../middlewares/auth.middleware");
const { getUserProfile, getSavedPosts, toggleSavePost } = require("../controllers/user.controller");
// const { toggleSavePost, getSavedPosts } = require("../controllers/user.controller");
const router = express.Router();

router.get("/me",protect,getUserProfile);
router.get("/saved",protect,getSavedPosts)
router.patch("/save/:postId",protect,toggleSavePost);

module.exports = router;