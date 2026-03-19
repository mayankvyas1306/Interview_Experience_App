const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { env } = require("../config/env");
const { parseCookies } = require("../utils/authCookies");

const extractToken = (req) => {
  // 1. Bearer token in Authorization header
  if (req.headers.authorization?.startsWith("Bearer")) {
    return req.headers.authorization.split(" ")[1];
  }
  // 2. httpOnly cookie
  if (req.headers.cookie) {
    const cookies = parseCookies(req.headers.cookie);
    const cookieToken = cookies[env.JWT_COOKIE_NAME];
    if (cookieToken) return cookieToken;
  }
  // 3. Query param — ONLY for SSE (EventSource can't send headers)
  if (req.query.token) {
    return req.query.token;
  }
  return null;
};

const protect = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      res.status(401);
      throw new Error("Not authorized, token missing");
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized, user not found");
    }

    if (req.user.isBanned) {
      res.status(403);
      throw new Error("Your account has been banned");
    }

    next();
  } catch (err) {
    if (!res.statusCode || res.statusCode === 200) res.status(401);
    next(err);
  }
};

const optionalProtect = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      req.user = null;
      return next();
    }
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    req.user = user && !user.isBanned ? user : null;
    next();
  } catch {
    req.user = null;
    next();
  }
};

module.exports = { protect, optionalProtect };