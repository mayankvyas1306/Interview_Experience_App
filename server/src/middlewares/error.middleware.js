/**
 * 404 Handler
 * Why: Catches requests to non-existent routes
 * Must come AFTER all route definitions
 */

const notFound = (req, res, next) => {
    res.status(404);
    next(new Error(`Not Found - ${req.originalUrl}`));
};

/**
 * Global Error Handler
 * Why: Catches all errors from async route handlers
 * Provides consistent error response format
 * Hides stack traces in production for security
 */
const errorHandler = (err, req, res, next) => {
    //If header alredy sent, delegate to Express default handler
    if (res.headerSent) {
        return next(err);
    }

    // Explicitly handle AppError (operational errors)
    if (err.isOperational) {
        res.status(err.statusCode).json({
            message: err.message,
            stack: process.env.NODE_ENV === "production" ? null : err.stack,
        });
        return;
    }

    //Determine status code
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    //MongoDB duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        res.status(400).json({
            message: `${field} already exists`,
            stack: process.env.NODE_ENV === "production" ? null : err.stack,
        });
        return;
    }

    //MongoDB validation error
    if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map((e) => e.message);
        res.status(400).json({
            message: messages.join(", "),
            stack: process.env.NODE_ENV === "production" ? null : err.stack,
        });
        return;
    }

    //JWT errors
    if (err.name === "JsonWebTokenError") {
        res.status(401).json({
            message: "Invalid token, please login again",
            stack: process.env.NODE_ENV === "production" ? null : err.stack,
        });
        return;
    }
    if (err.name === "TokenExpiredError") {
        res.status(401).json({
            message: "Token expired, please login again",
            stack: process.env.NODE_ENV === "production" ? null : err.stack,
        });
        return;
    }

    //Default error response
    res.status(statusCode).json({
        message: err.message || "Internal server error",
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });

};

module.exports = { notFound, errorHandler };
