const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { env } = require("../config/env");
const { parseCookies } =require("../utils/authCookies")

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if(!token && req.headers.cookie){
      const cookies = parseCookies(req.headers.cookie);
      token = cookies[env.JWT_COOKIE_NAME];
    }

    if (!token) {
      res.status(401);
      throw new Error("Not authorized, token missing");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);

    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized, user not Found");
    }

    if (req.user.isBanned) {
      res.status(403);
      throw new Error("Your account has been banned");
    }

    next();
  } catch (err) {
    res.status(401);
    throw new Error("Not authorized, invalid Token");
  }
};

module.exports = { protect };
