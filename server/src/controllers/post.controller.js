const Post = require("../models/Post");

//create a new interview experience post
const createPost = async(req,res,next)=>{
    try{
        const { companyName, role, tags, difficulty, result,rounds }=req.body;

        if(!companyName || !role){
            res.status(400);
            throw new Error("Company name and role are required");
        }

        //adding extra safety validations
        const allowedDifficulties = ["Easy","Medium","Hard"];
        if(difficulty &&  !allowedDifficulties.includes(difficulty)){
            res.status(400);
            throw new Error("Invalid difficulty value");
        }

        const allowedResults = ["Selected","Rejected","Waiting"];
        if(result && !allowedResults.includes(result)){
            res.status(400);
            throw new Error("Invalid result value");
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

// get all posts (search + filters + pagination)
const getAllPosts = async (req,res,next)=>{
    try{
        /**
         * /api/posts?page=1&limit=5&company=amazon&difficulty=Hard&tag=DSA
         */

        //pagination default
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page-1)*limit;

        //Filters object (MongoDB query)
        const filters = {};

        //Search by Company name (case-insensitive)
        if(req.query.company){
            filters.companyName = { $regex: req.query.company, $options: "i" };
        }

        //filter by role
        if(req.query.role){
            filters.role = { $regex: req.query, $options: "i"};
        }

        //filter by difficulty
        if(req.query.difficulty){
            filters.difficulty = req.query.difficulty;
        }

        //filter by result
        if(req.query.result){
            filters.result = req.query.result;
        }

        //filter by tag(single tag for now)
        if(req.query.tag){
            filters.tags = {$in:[req.query.tag]};
        }

        //sort options
        //latest = newest first
        //top = most upvotes first
        let sortOption = { createdAt : -1};

        if(req.query.sort === "top"){
            sortOption = { upvotesCount: -1, createdAt: -1};
        }

        //fetch posts from DB
        const posts = await Post.find(filters)
            .populate("authorId", "fullName email college year") //show author details
            .sort(sortOption)
            .skip(skip)
            .limit(limit);

        //Total count for frontend pagination UI
        const totalPosts = await Post.countDocuments(filters);

        res.json({
            page,
            limit,
            totalPosts,
            totalPages: Math.ceil(totalPosts / limit),
            posts,
        });
    }catch(err){
        next(err);
    }
}

//get post By Id
const getPostById = async (req,res,next) => {
    try{
        const post = await Post.findById(req.params.id).populate(
            "authorId",
            "fullName email college year"
        );

        if(!post){
            res.status(404);
            throw new Error("Post not Found");
        }

        res.json({post});
    }catch(err){
        next(err);
    }
}

//update Post
const updatePost = async (req,res,next) => {
    try{
        const { companyName, role, tags, difficulty, result, rounds } =req.body;

        const post =await Post.findById(req.params.id);

        if(!post){
            res.status(404);
            throw new Error("Post not found");
        }

        //ownership check (only author can edit)
        if(post.authorId.toString() !== req.user._id.toString()){
            res.status(403);
            throw new Error("You are not allowed to update this post");
        }

        //company only if values are sent
        post.companyName = companyName || post.companyName;
        post.role = role || post.role;
        post.tags = tags || post.tags;
        post.difficulty = difficulty || post.difficulty;
        post.result = result || post.result;
        post.rounds = rounds || post.rounds;

        const updatePost = await post.save();

        res.json({
            message : "Post updated successfully",
            post: updatePost,
        });
      }catch(err){
        next(err);
      }
};

const deletePost = async (req,res,next)=>{
    try{
        const post = await Post.findById(req.params.id);

        if(!post){
            res.status(404);
            throw new Error("Post not Found");
        }

        //ownership check
        if(post.authorId.toString() !==req.user._id.toString()){
            res.status(403);
            throw new Error("You are not allowed to delete this post");
        }

        await Post.deleteOne({_id: post._id});

        res.json({message: "Post deleted Successfully "});
    }catch(err){
        next(err);
    }
};


//adding upvote functionality
const toggleUpvote = async (req,res,next)=>{
    try{
        const post = await Post.findById(req.params.id);

        if(!post){
            res.status(404);
            throw new Error("Post not Found");
        }
        const userId = req.user._id.toString();

        //check if user already upvoted
        const alreadyUpvoted = post.upvotedBy
            .map((id) => id.toString())
            .includes(userId);

        if(alreadyUpvoted){
            //remove upvote
            post.upvotedBy = post.upvotedBy.filter(
                (id)=>id.toString()!==userId
            );
            post.upvotesCount = post.upvotesCount -1;

            await post.save();

            return res.json({
                message:"Upvote removed",
                upvotesCount: post.upvotesCount,
            });
        }
        else{
            //add upvote
            post.upvotedBy.push(req.user._id);
            post.upvotesCount = post.upvotesCount + 1;

            await post.save();

            return res.json({
                message:"Post upvoted",
                upvotesCount: post.upvotesCount,
            });
        }
    }catch(err){
        next(err);
    }
};

module.exports = {toggleUpvote,deletePost,updatePost,createPost, getAllPosts,getPostById};