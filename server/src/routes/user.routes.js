const express = require("express");
const { protect, optionalProtect } = require("../middlewares/auth.middleware");
const { getUserProfile, getSavedPosts, toggleSavePost, getMyPosts, getSaveStatus } = require("../controllers/user.controller");
// const { toggleSavePost, getSavedPosts } = require("../controllers/user.controller");
const router = express.Router();

router.get("/me", protect, getUserProfile);
router.get("/saved", protect, getSavedPosts);
router.get("/save-status/:postId", optionalProtect, getSaveStatus);
router.patch("/save/:postId", protect, toggleSavePost);
router.get("/my-posts", protect, getMyPosts);

module.exports = router;