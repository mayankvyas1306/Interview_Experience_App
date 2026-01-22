const jwt  = require("jsonwebtoken");
const User = require("../models/User");


const protect = async (req,res,next)=>{
    try{
        let token;

        if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
            token = req.headers.authorization.split(" ")[1];
        }

        if(!token){
            res.status(401);
            throw new Error("Not authorized, token missing");
        }

        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        console.log(decoded);
        
        req.user = await User.findById(decoded.id).select("-password");

        if(!req.user){
            res.status(401);
            throw new Error("Not authorized, user not Found");
        }

        next();
    }catch(err){
        res.status(401);
            throw new Error("Not authorized, invalid Token");
    }
};

module.exports = {protect};