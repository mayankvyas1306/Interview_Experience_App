const Comment = require("../models/Comment");
const Post = require("../models/Post");

//add comment to a post
const addComment = async (req,res,next)=>{
    try{
        const {text} = req.body;
        const postId = req.params.postId;

        if(!text){
            res.status(400);
            throw new Error("Comment text is required");
        }

        //check post exists 
        const post = await Post.findById(postId);
        if(!post){
            res.status(404);
            throw new Error("Post not found");
        }

        const comment = await Comment.create({
            postId,
            userId: req.user._id,
            text,
        });
        res.status(201).json({
      message: "Comment added successfully",
      comment,
    });
    }catch(err){
        next(err);
    }
};

//get all comments of a post
const getPostComments = async (req,res,next)=>{
    try{
        const postId = req.params.postId;
        const comments = await Comment.find({postId})
            .populate("userId","fullName email college year")
            .sort({createdAt:-1});

        res.json({
            totalComments: comments.length,
            comments,
        });
    }catch(err){
        next(err);
    }
};

//delete comment (only owner can delete)

const deleteComment = async (req,res,next)=>{
    try{
        const commentId = req.params.commentId;

        const comment = await Comment.findById(commentId);

        if(!comment){
            res.status(404);
            throw new Error("Comment not found");
        }

        //ownership check
        if(comment.userId.toString() !== req.user._id.toString()){
            res.status(403);
            throw new Error("You are not allowed to delete this comment");
        }

        await comment.deleteOne({_id:comment._id});

        res.json({message: "comment deleted seccessfully"});
    }catch(err){
        next(err);
    }
};

module.exports = { addComment, getPostComments, deleteComment}