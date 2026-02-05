const express = require("express");
const { protect } = require("../middlewares/auth.middleware");
const { addComment, getPostComments, deleteComment } = require("../controllers/comment.controller");
const { validateBody } = require("../middlewares/validate.middleware");
const { commentSchema } = require("../validators/comment.schema");
const router = express.Router();


//add comment to a post
router.post("/:postId",protect,validateBody(commentSchema),addComment);

//get comment of a post
router.get("/:postId",getPostComments);

//delete a comment
router.delete("/:commentId",protect,deleteComment);

module.exports = router;