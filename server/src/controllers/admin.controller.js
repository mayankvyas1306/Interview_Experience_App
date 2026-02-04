const Post = require("../models/Post");
const User = require("../models/User");

const getAdminStats = async (req,res,next)=>{
    try{
        const totalUsers = await User.countDocuments();
        const totalPosts = await Post.countDocuments();

        const topCompanies = await Post.aggregate([
            { $group: { _id: "$companyName",count:{$sum:1}}},
            { $sort: {count:-1}},
            { $limit:5},
        ]);
        res.json({
            totalUsers,
            totalPosts,
            topCompanies,
        });
    }catch(err){
        next(err);
    }
};


const getAllPostsAdmin = async(req,res,next)=>{
    try{
        const posts = await Post.find()
            .populate("authorId","fullName email role")
            .sort({createdAt:-1});

        res.json({
            total: posts.length,
            posts,
        });
    }catch(err){
        next(err);
    }
};

const adminDeletePost = async (req,res,next) =>{
    try{
        const post = await Post.findById(req.params.id);

        if(!post){
            res.status(404);
            throw new Error("Post not found");
        }

        await Post.deleteOne({ _id:post._id});

        res.json({message:"Post deleted by admin"});
    }catch(err){
        next(err);
    }
};

// GET ALL USERS
const getAllUsersAdmin = async (req,res,next)=>{
    try{
        const users = await User.find().select("-password");
        res.json({total: users.length, users});
    }catch(err){
        next(err);
    }
};

// TOGGLE BAN USER
const toggleBanUser = async (req,res,next)=>{
    try{
        const user = await User.findById(req.params.id);

        if(!user){
            res.status(404);
            throw new Error("User not found");
        }

        user.isBanned = !user.isBanned;
        await user.save();

        res.json({
            message: user.isBanned 
              ? "User banned" 
              : "User unbanned"
        });
    }catch(err){
        next(err);
    }
};

// PROMOTE / DEMOTE ADMIN
const toggleAdminRole = async (req,res,next)=>{
    try{
        const user = await User.findById(req.params.id);

        if(!user){
            res.status(404);
            throw new Error("User not found");
        }

        user.role = user.role === "admin" ? "user" : "admin";
        await user.save();

        res.json({
            message:`Role changed to ${user.role}`
        });
    }catch(err){
        next(err);
    }
};

module.exports={
    getAdminStats,
    getAllPostsAdmin,
    adminDeletePost,
    toggleAdminRole,
    toggleBanUser,
    getAllUsersAdmin


}