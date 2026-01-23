const express = require("express");


const { protect } = require("../middlewares/auth.middleware");
const { createPost, getAllPosts, deletePost, updatePost, getPostById } = require("../controllers/post.controller");
const router = express.Router();

//get all posts (public)
router.get("/",getAllPosts);

//create post (protected)
router.post("/",protect,createPost);

//single post routes
router.get("/:id",getPostById);
router.put("/:id",protect,updatePost);
router.delete("/:id",protect,deletePost);

module.exports = router;