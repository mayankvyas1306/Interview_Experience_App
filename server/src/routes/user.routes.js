const express = require("express");
const { protect } = require("../middlewares/auth.middleware");
const { toggleSavePost, getSavedPosts } = require("../controllers/user.controller");
const router = express.Router();

router.patch("/save/:id",protect,toggleSavePost);

router.get("/saved",protect,getSavedPosts);

module.exports = router;