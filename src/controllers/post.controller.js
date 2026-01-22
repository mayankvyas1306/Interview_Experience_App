const Post = require("../models/Post");

const createPost = async(req,res,next)=>{
    try{
        const { companyName, role, tags, difficulty, result,rounds }=req.body;

        if(!companyName || !role){
            res.status(400);
            throw new Error("Company name and role are required");
        }

        const post = await Post.create({
            authorId: req.user._id, //coming from protect middleware
            companyName,
            role,
            tags: tags || [],
            difficulty: difficulty || "Medium",
            result: result || "Waiting",
            rounds : rounds || [],
        });
        res.status(201).json({message:"Post created Successfully",post});
    }catch(err){
        next(err);
    }
};

module.exports = {createPost};