const Post = require("../models/Post");

// overview analytics ( topics + companies + total posts)
const getOverviewAnalytics = async (req,res,next)=>{
    try{
        const totalPosts = await Post.countDocuments();

        //count topics (tags)
        const topicsCount = await Post.aggregate([
            {
                $unwind: "$tags"
            }, // break array into multiple documents
            {
                $group:{
                    _id:"tags",
                    count:{ $sum: 1 },
                },
            },
            {
                $sort:{
                    count: -1
                }
            }
        ]);

        //top companies by post count
        const topCompanies = await Post.aggregate([
            {
                $group:{
                    _id:"$companyName",
                    count:{$sum:1},

                },
            },
            { $sort: {count: -1 }},
            {$limit: 10 },
        ]);

        res.json({
            totalPosts,
            mostAskedTopics:topicsCount,
            topCompanies,
        });

    }catch(err){
        next(err);
    }
};


//company wise topics analythics
const getCompanyTopicsAnalytics = async (req,res,next)=>{
    try{
        const company = req.query.company;

        if(!company){
            res.status(400);
            throw new Error("Company query is required");
        }

        const companyTopics = await Post.aggregate([
            {
                $match:{
                    companyName:{$regex: company,$options:"i"},
                },
            },
            { $unwind:"$tags"},
            {
                $group:{
                    _id:"$tags",
                    count:{ $sum:1},
                },
            },
            {$sort:{count:-1}},
        ]);

        res.json({
            company,
            topics:companyTopics,
        });
    }catch(err){
        next(err);
    }
};

//Trending Posts
const getTrendingPosts = async (req,res,next)=>{
    try{
        const trending = await Post.find()
            .populate("authorId","fullName email college year")
            .sort({upvotesCount: -1,createdAt:-1})
            .limit(10);

        res.json({trending});
    }catch(err){
        next(err);
    }
};


module.exports = {
    getOverviewAnalytics,
    getCompanyTopicsAnalytics,
    getTrendingPosts
}