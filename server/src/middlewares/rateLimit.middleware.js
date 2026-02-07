const rateLimit = require("express-rate-limit");
const { env } =require("../config/env");

/**
 * Global Rate Limiter
 * Aplied to All requests as a baseline protection
 * Much more lenient in development to avoid blocking during testing
 * 
 * why we do this:
 * -In development: High Limit (1000) to not interfere with hot reload
 * -In production: Moderate Limit (200) to prevent basic DoS attacks
 * -Skip health checks to avoid counting monitoring pings
 */

const globalLimiter=rateLimit({
    windowMs:15*60*1000, //15 minutes
    max: env.NODE_ENV==="production"?200:1000,
    message:"Too many request from this IP, please try again Later",
    standardHeaders:true, // return rate limit info in `Rt-ateLimit-*` headers
    legacyHeaders:false,//Disable old `X-RateLimit-*` headers
    skip:(req)=>req.path==="/health", //Dont rate limit health checks
});

/**
 * AUTH RATE LIMITER
 * Stricter limits on login/register to prevent brute force attacks
 * 
 * Why we do this:
 * - Login/register endpoints are vulnerable to brute force
 * - Even in dev, we keep it somewhat strict to test the behavior
 * - skipSuccessfulRequests means only failed attempts count
 */

const authLimiter = rateLimit({
    windowMs: 15*60*1000, //15 minutes
    max: env.NODE_ENV === "production"?5:20,
    message:"Too many authentication attempts, please try again later",
    skipSuccessfulRequests: true, //Dont count successful logins
});

/**
 * API RATE LIMITER
 * Applied to data-intensive API routes
 * 
 * Why we do this:
 * - Regular API routes need moderate protection
 * - More generous in development for testing
 *
 * 
 */

const apiLimiter = rateLimit({
    windowMs: 15*60*1000, //15 minutes
    max: env.NODE_ENV === "production"?100:500,
    message:"Too many API requests, please slow down",
});

/**
 * ADMIN RATE LIMITER
 * More lenient for admin operations
 * 
 * Why we do this:
 * - Admins need to perform bulk operations
 * - Still need some protection against compromised admin accounts
 */

const adminLimiter = rateLimit({
    windowMs: 15*60*1000, // 15 minutes
    max: env.NODE_ENV === "production"? 50:200, 
    message: "Too many admin requests, please try again later",
});


module.exports = {
    globalLimiter,
    authLimiter,
    apiLimiter,
    adminLimiter,
};