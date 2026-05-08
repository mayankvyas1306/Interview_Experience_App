const logger = require("./logger");

/**
 * Sets up graceful shutdown handlers for SIGTERM and SIGINT signals.
 * SIGTERM is sent by Docker when stopping a container.
 * SIGINT is sent when you press Ctrl+C in terminal.
 *
 * @param {object} server - The HTTP server instance from app.listen()
 * @param {object} mongoose - The mongoose instance for closing DB connection
 */
const setupGracefulShutdown = (server, mongoose) => {

    // This function runs when shutdown signal is received
    const shutdown = async (signal) => {
        logger.info(`${signal} received. Starting graceful shutdown...`);

        // Step 1: Stop accepting new HTTP connections
        server.close(async () => {
            logger.info("HTTP server closed. No new requests will be accepted.");

            try {
                // Step 2: Close MongoDB connection cleanly
                await mongoose.connection.close();
                logger.info("MongoDB connection closed successfully.");

                // Step 3: Exit process with success code
                process.exit(0);

            } catch (err) {
                logger.error("Error during graceful shutdown:", err.message);
                // Exit with error code so Docker/Jenkins knows something went wrong
                process.exit(1);
            }
        });

        // Safety timeout: if shutdown takes more than 10 seconds, force exit
        // This prevents the container from hanging forever
        setTimeout(() => {
            logger.error("Graceful shutdown timed out after 10 seconds. Force exiting.");
            process.exit(1);
        }, 10000);
    };

    // Docker sends SIGTERM when you run: docker stop <container>
    process.on("SIGTERM", () => shutdown("SIGTERM"));

    // Terminal sends SIGINT when you press Ctrl+C
    process.on("SIGINT", () => shutdown("SIGINT"));

    // Catch unhandled promise rejections (async bugs)
    process.on("unhandledRejection", (reason, promise) => {
        logger.error("Unhandled Promise Rejection:", reason);
        // In production, exit so the container restarts fresh
        // Do not exit in development to allow debugging
        if (process.env.NODE_ENV === "production") {
            process.exit(1);
        }
    });

    // Catch uncaught synchronous exceptions
    process.on("uncaughtException", (err) => {
        logger.error("Uncaught Exception:", err.message);
        process.exit(1);
    });
};

module.exports = setupGracefulShutdown;