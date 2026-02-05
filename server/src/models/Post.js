const mongoose = require("mongoose");


const roundSchema = new mongoose.Schema(
    {
        roundName:{
            type:String,
            required:true
        },
        description:{
            type:String,
            required:true
        },
        question:[{
            type:String
        }],
    },{_id:false}
);


const postSchema = new mongoose.Schema({
    authorId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    companyName:{
        type: String,
        required:true,
        trim:true
    },
    role:{
        type: String,
        required:true,
        trim:true,
    },
    tags:{
        type:[String],
        default:[],
    },
    difficulty:{
        type:String,
        enum:["Easy","Medium","Hard"],
        default:"Medium",
    },
    result:{
        type:String,
        enum:["Selected","Rejected","Waiting"],
        default:"Waiting",
    },
    rounds:{
        type:[roundSchema],
        default:[],
    },
    upvotesCount: { 
        type:Number, 
        default:0
    },
    upvotedBy:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
},{timestamps:true});

postSchema.index({ companyName:1 });
postSchema.index({ tags: 1});
postSchema.index({createdAt: -1});
postSchema.index({ upvotesCount:-1});


const Post = mongoose.model("Post",postSchema);

module.exports = Post;