const Post = require("../models/Post");
const User = require("../models/User");

// save unsave post functionality
const toggleSavePost = async(req,res,next)=>{
    try{
        const postId = req.params.id;

        //check post exists
        const postExists = await Post.findById(postId);

        if(!postExists){
            res.status(404);
            throw new Error("Post not Found");
        }

        const user = await User.findById(req.user._id);

        const alreadySaved = user.savedPosts
            .map((id)=> id.toString())
            .includes(postId);

        if(alreadySaved){
            //remove from saved
            user.savedPosts = user.savedPosts.filter(
                (id)=>id.toString() !==postId
            );

            await user.save();

            return res.json({message: "Post removed from saved"});
        }
        else{
            //add to saved
            user.savedPosts.push(postId);

            await user.save();
            return res.json({message: "Post saved Successfully"});
        }
    }catch(err){
        next(err);
    }
};

const getSavedPosts = async (req,res,next)=>{
    try{
        const user = await User.findById(req.user._id).populate("savedPosts");

        res.json({
            totalSaved: user.savedPosts.length,
            savedPosts: user.savedPosts,
        });
    }catch(err){
        next(err);
    }
};


module.exports = { getSavedPosts,toggleSavePost}