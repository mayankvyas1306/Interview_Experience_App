const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { env } = require("../config/env");
const { parseCookies } = require("../utils/authCookies");

const extractToken = (req) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    return req.headers.authorization.split(" ")[1];
  }

  if (req.headers.cookie) {
    const cookies = parseCookies(req.headers.cookie);
    return cookies[env.JWT_COOKIE_NAME] || null;
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

// ─────────────────────────────────────────────
// OPTIONAL PROTECT — attaches user if token present, continues either way
// Use for endpoints that behave differently for logged-in vs guest users
// ─────────────────────────────────────────────
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
    // Invalid token — treat as unauthenticated, don't fail
    req.user = null;
    next();
  }
};

module.exports = { protect, optionalProtect };
