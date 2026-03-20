const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");

const { env } = require("./config/env");
const logger = require("./utils/logger");
const requestId = require("./middlewares/requestId.middleware");
const { errorHandler, notFound } = require("./middlewares/error.middleware");
const {
    authLimiter,
    apiLimiter,
    adminLimiter,
    globalLimiter,
} = require("./middlewares/rateLimit.middleware");

// Route imports
const authRoutes = require("./routes/auth.routes");
const postRoutes = require("./routes/post.routes");
const userRoutes = require("./routes/user.routes");
const commentRoutes = require("./routes/comment.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const adminRoutes = require("./routes/admin.routes");
const notificationRoutes = require("./routes/notification.routes");
const reportRoutes = require("./routes/report.routes");
const aiRoutes = require("./routes/ai.routes");

const app = express();

// ─── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = env.CLIENT_URL.split(",").map((o) => o.trim());

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (mobile apps, curl, Postman)
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) return callback(null, true);
            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
    })
);

// ─── CORE MIDDLEWARE ──────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── SECURITY ────────────────────────────────────────────────────────────────
app.use(helmet());

// ─── REQUEST TRACKING ────────────────────────────────────────────────────────
// Must come before logging so logs include the request ID
app.use(requestId);

// ─── LOGGING ─────────────────────────────────────────────────────────────────
if (env.NODE_ENV === "development") {
    app.use(morgan("dev", { stream: logger.stream }));
} else {
    app.use(morgan("combined", { stream: logger.stream }));
}

// ─── RATE LIMITING ───────────────────────────────────────────────────────────
app.use(globalLimiter);

// ─── ROUTES ──────────────────────────────────────────────────────────────────
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/posts", apiLimiter, postRoutes);
app.use("/api/users", apiLimiter, userRoutes);
app.use("/api/comments", apiLimiter, commentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/admin", adminLimiter, adminRoutes);
app.use("/api/notifications", apiLimiter, notificationRoutes);
app.use("/api/reports", apiLimiter, reportRoutes);
app.use("/api/ai", aiRoutes);

// ─── HEALTH CHECK ────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        environment: env.NODE_ENV,
        timestamp: new Date().toISOString(),
    });
});

// ─── ERROR HANDLING ───────────────────────────────────────────────────────────
// These MUST come last, after all routes
app.use(notFound);
app.use(errorHandler);

module.exports = app;