const Post = require("../models/Post");
const User = require("../models/User");

// save unsave post functionality
const toggleSavePost = async(req,res,next)=>{
    try{

        if(!req.user){
            res.status(401);
            throw new Error("Not authorized - please login to save posts");
        }

        const postId = req.params.postId;

        //check post exists
        const postExists = await Post.findById(postId);

        if(!postExists){
            res.status(404);
            throw new Error("Post not Found");
        }

        const user = await User.findById(req.user._id);

        if(!user){
            res.status(404);
            throw new Error("User not found");
        }

        const alreadySaved = user.savedPosts
            .some(
                (id)=>id.toString()===postId.toString()
            );

        if(alreadySaved){
            //remove from saved
            user.savedPosts = user.savedPosts.filter(
                (id)=>id.toString() !==postId
            );

            await user.save();

            return res.json({message: "Post removed from saved",saved:false});
        }
        else{
            //add to saved
            user.savedPosts.push(postId);

            await user.save();
            return res.json({message: "Post saved Successfully",saved:true});
        }
    }catch(err){
        next(err);
    }
};

const getSavedPosts = async (req,res,next)=>{
    try{
        if(!req.user){
            res.status(401);
            throw new Error("Not authorized - please login");
        }
        const user = await User.findById(req.user._id).populate({
            path:"savedPosts",
            populate:{
                path:"authorId",
                select:"fullName email college year",
            },       
        });

        if(!user){
            res.status(404);
            throw new Error("User not found");
        }

        res.json({
            totalSaved: user.savedPosts?.length || 0,
            savedPosts: user.savedPosts || [],
        });
    }catch(err){
        next(err);
    }
};


const getUserProfile = async(req,res,next)=>{
    try{
        if(!req.user){
            res.status(401);
            throw new Error("Not authorized");
        }

        const user = await User.findById(req.user._id).select("-password");
        if(!user){
            res.status(404);
            throw new Error("User not found");
        }

        res.json({user});
    }catch(err){
        next(err);
    }
}

const getMyPosts = async(req,res,next)=>{
    try{
        if(!req.user){
            res.status(401);
            throw new Error("Not authorized - please login");
        }
        const page = Math.max(1,Number(req.query.page) ||1 );
        const requestedLimit = Number(req.query.limit) || 6;
        const limit = Math.min(Math.max(1,requestedLimit),50);
        const skip = (page - 1)*limit;

        const filters = { authorId: req.user._id};

        const [posts, totalPosts] = await Promise.all([
            Post.find(filters)
                .populate("authorId","fullName email college year")
                .sort({createdAt:-1})
                .skip(skip)
                .limit(limit)
                .lean(),
            Post.countDocuments(filters),
        ]);

        res.json({
            page,limit,totalPosts,totalPages:Math.ceil(totalPosts/limit),posts,
        });

    }catch(err){
        next(err);
    }
};

module.exports = { getSavedPosts, toggleSavePost, getUserProfile, getMyPosts}