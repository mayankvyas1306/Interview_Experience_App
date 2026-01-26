const isAdmin = (req,res,next)=>{
    if(req.user && req.user.role==="admin"){
        return next();
    }

    res.status(403);
    throw new Error("Admin access only");
};

module.exports = { isAdmin };