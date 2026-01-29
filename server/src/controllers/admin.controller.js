const Post = require("../models/Post");

const adminDeletePost = async(req,res,next)=>{
    try{
        const post = await Post.findById(req,params.id);

        if(!post){
            res.status(404);
            throw new Error("Post not Found");
        }

        await Post.deleteOne({_id:post._id});

        res.json({message:"Post deleted by admin"});
    }catch(err){
        next(err);
    }
};

const getAllPostsAdmin= async(req,res,next)=>{
    try{
        const posts = await Post.find()
            .populate("authorId","fullName email role")
            .sort({createdAt: -1});

            res.json({total: posts.length,posts});
    }catch(err){
        next(err);
    }
};

module.exports = { adminDeletePost,getAllPostsAdmin};