/**
 * AppError — operational errors we expect and handle gracefully.
 *
 * The difference between AppError and a plain Error:
 * - AppError.isOperational = true  → we caused this on purpose (validation, not found, etc.)
 * - Plain Error.isOperational = undefined → unexpected crash, needs investigation
 *
 * This distinction lets our error handler decide:
 * - Operational: send the message to the client
 * - Non-operational: log it, send generic "Internal Server Error"
 */
class AppError extends Error {
    /**
     * @param {string} message - Human-readable error message sent to the client
     * @param {number} statusCode - HTTP status code (400, 401, 403, 404, 409, 422, 500)
     */
    constructor(message, statusCode) {
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.isOperational = true;

        // Captures the stack trace, excluding the constructor call itself
        // This makes stack traces cleaner in logs
        Error.captureStackTrace(this, this.constructor);
    }
}

// ─── Common error factories ────────────────────────────────────────────────
// These make controller code more readable:
// throw AppError.notFound("Post") instead of throw new AppError("Post not found", 404)

AppError.badRequest = (message) => new AppError(message, 400);
AppError.unauthorized = (message = "Not authorized") => new AppError(message, 401);
AppError.forbidden = (message = "Access denied") => new AppError(message, 403);
AppError.notFound = (resource = "Resource") => new AppError(`${resource} not found`, 404);
AppError.conflict = (message) => new AppError(message, 409);
AppError.internal = (message = "Internal server error") => new AppError(message, 500);

module.exports = AppError;