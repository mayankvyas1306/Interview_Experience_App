const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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


//Hash password before saving 
userSchema.pre("save",async function (next){
    if(!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();

});


//compare password method
userSchema.methods.matchPassword = async function(enteredPassword){
    return bcrypt.compare(enteredPassword,this.password);
};

const User= mongoose.model("User",userSchema);
module.exports = User;