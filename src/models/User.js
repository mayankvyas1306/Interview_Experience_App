const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName:{
        type:String,
        required: true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true,
        minlength:6
    },
    college:{
        type:String,
        default:""
    },
    year:{
        type:Number,
        default:3
    },
    savedPosts:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Post"
        }
    ],
    role:{
        type:String,
        enum:["user","admin"],
        default:"user"
    },
},{timestamps:true});


//compare password method
userSchema.methods.matchPassword = async function(enteredPassword){
    return bcrypt.compare(enteredPassword,this.password);
};

const User= mongoose.model("User",userSchema);
module.exports = User;