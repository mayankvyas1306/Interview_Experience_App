const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require("helmet");
const { env } = require("./config/env");

const app =express();

const authRoutes = require('./routes/auth.routes');
const postRoutes = require('./routes/post.routes');
const userRoutes = require('./routes/user.routes');
const commentRoutes = require('./routes/comment.routes')
const analyticsRoutes = require("./routes/analytics.routes");
const adminRoutes = require("./routes/admin.routes");

const { errorHandler, notFound } = require('./middlewares/error.middleware');
const { authLimiter, apiLimiter, adminLimiter, globalLimiter } = require('./middlewares/rateLimit.middleware');

const allowedOrigins = env.CLIENT_URL.split(",").map((origin) => origin.trim());
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) {
                return callback(null, true);
            }
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
    }),
);//used to connect frontend or authorize frontend to access the backend
app.use(express.json());// Converts incoming JSON payloads into req.body object

if(env.NODE_ENV === "development"){
app.use(morgan("dev"));//used to log each request used for debugging
}

/**
 * Helmet - Security headers
 * Why: Protects against common web vulnerabilities
 * Sets headers like X-Frame-Options, X-Content-Type-Options, etc.
 */
app.use(helmet());

/**
 * GLOBAL RATE LIMITER
 * Why: Applied to all requests as baseline DoS protection
 * Very lenient in development (1000 req/15min)
 * More strict in production (200 req/15min)
 */
app.use(globalLimiter);


/**
 * ROUTE-SPECIFIC RATE LIMITING
 * Why: Each route type needs different protection levels
 * - Auth routes: Strictest (prevent brute force)
 * - API routes: Moderate (normal traffic)
 * - Analytics: No extra limit (responses are cached)
 * - Admin: Lenient (admins need flexibility for bulk operations)
 */

app.use('/api/auth',authLimiter,authRoutes);
app.use("/api/posts",apiLimiter,postRoutes);
app.use("/api/users",apiLimiter,userRoutes);
app.use("/api/comments",apiLimiter,commentRoutes);
app.use("/api/analytics",analyticsRoutes);
app.use("/api/admin",adminLimiter,adminRoutes);

app.get("/health",(req,res)=>{
    res.json({ status: "ok" });
});

app.get('/',(req,res)=>{
    res.json({message:"Backend is running "});
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
