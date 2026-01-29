const express = require("express");


const { protect } = require("../middlewares/auth.middleware");
const { createPost, getAllPosts, deletePost, updatePost, getPostById, toggleUpvote } = require("../controllers/post.controller");

const router = express.Router();

//get all posts (public)
router.get("/",getAllPosts);

//create post (protected)
router.post("/",protect,createPost);

//single post routes
router.get("/:id",getPostById);
router.put("/:id",protect,updatePost);
router.delete("/:id",protect,deletePost);

//upvote route
router.patch("/:id/upvote",protect,toggleUpvote);


module.exports = router;