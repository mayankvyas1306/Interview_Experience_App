const express = require("express");
const { protect } = require("../middlewares/auth.middleware");
const { createPost } = require("../controllers/post.controller");
const router = express.Router();


router.post("/",protect,createPost);

module.exports = router;