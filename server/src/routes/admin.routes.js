const { isAdmin } = require("../middlewares/admin.middleware");
const { adminDeletePost, getAllPostsAdmin } = require("../controllers/admin.controller");
const { protect } = require("../middlewares/auth.middleware");
const express = require('express');

const router=express.Router();


//admin route
router.delete("/:id",protect,isAdmin,adminDeletePost);
router.get("/posts",protect,isAdmin,getAllPostsAdmin);