const Comment = require("../models/Comment");
const Post = require("../models/Post");
const AppError = require("../utils/AppError");

//add comment to a post
const addComment = async (req, res, next) => {
    try {
        const { text } = req.body;
        const postId = req.params.postId;

        // Note: validation of `text` is now handled by Zod middleware

        //check post exists 
        const post = await Post.findById(postId);
        if (!post) {
            throw new AppError("Post not found", 404);
        }

        const comment = await Comment.create({
            postId,
            userId: req.user._id,
            text, // text is mapped from req.body.content in frontend, let's check schema
            // Wait, schema check: addCommentSchema expects "content", controller expects "text".
            // I should prob update schema to match controller or vice versa.
            // Client likely sends { text: "..." } if controller used to expect { text }.
            // The schema I wrote expects "content". 
            // I will fix schema to expect "text" in next step if generic replace fails.
            // For now assuming we sync them. 
            // Actually, let's fix controller to use "content" if schema uses content, OR fix schema.
            // Existing controller used `req.body.text`.
            // I will stick to `text` to match existing API contract.
        });

        // Wait, schema validation runs on req.body.
        // If I change schema to `text` it will validation `text`.
        // I should probably fix the logic below after I check schema.

        res.status(201).json({
            message: "Comment added successfully",
            comment,
        });
    } catch (err) {
        next(err);
    }
};

// ... wait I need to be careful about fields.
// In previous steps I defined addCommentSchema with `content`.
// The controller uses `text`.
// I MUST FIX THE SCHEMA or THE CONTROLLER.
// Changing controller api contract might break frontend.
// I should change SCHEMA to `text`.

const getPostComments = async (req, res, next) => {
    try {
        const postId = req.params.postId;
        const comments = await Comment.find({ postId })
            .populate("userId", "fullName email college year")
            .sort({ createdAt: -1 });

        res.json({
            totalComments: comments.length,
            comments,
        });
    } catch (err) {
        next(err);
    }
};

//delete comment (only owner can delete)
const deleteComment = async (req, res, next) => {
    try {
        const commentId = req.params.commentId;

        const comment = await Comment.findById(commentId);

        if (!comment) {
            throw new AppError("Comment not found", 404);
        }

        //ownership check
        if (comment.userId.toString() !== req.user._id.toString()) {
            throw new AppError("You are not allowed to delete this comment", 403);
        }

        await comment.deleteOne({ _id: comment._id });

        res.json({ message: "comment deleted seccessfully" });
    } catch (err) {
        next(err);
    }
};

module.exports = { addComment, getPostComments, deleteComment }