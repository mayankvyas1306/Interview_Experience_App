/**
 * Request ID Middleware
 *
 * What it does:
 * Attaches a unique ID to every incoming request and outgoing response.
 *
 * Why this matters:
 * When something goes wrong in production, you need to trace a specific
 * request through your logs. Without a request ID, finding the logs for
 * "that error John reported at 3pm" is nearly impossible.
 *
 * With request IDs, you can:
 * - Grep logs by ID to see the full lifecycle of one request
 * - Correlate frontend errors with backend logs
 * - Track slow requests across services
 *
 * Industry usage:
 * Every production system (AWS, Google Cloud, Stripe, etc.) uses request IDs.
 * AWS calls them "X-Amzn-RequestId", Stripe calls them "Request-Id".
 */

const { randomUUID } = require("crypto");

const requestId = (req, res, next) => {
    // Check if the client sent a request ID (useful for frontend-to-backend tracing)
    // Otherwise generate a new one
    const id = req.headers["x-request-id"] || randomUUID();

    // Attach to request so controllers/middleware can log it
    req.id = id;

    // Send back in response headers so client can reference it
    // e.g., "Your request ID is abc-123, send this to support"
    res.setHeader("X-Request-Id", id);

    next();
};

module.exports = requestId;