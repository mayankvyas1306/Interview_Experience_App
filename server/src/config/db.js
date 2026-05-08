const mongoose = require('mongoose');
const logger = require("../utils/logger");

// How many times to retry connecting
const MAX_RETRIES = 5;

// How many milliseconds to wait between retries
const RETRY_DELAY_MS = 5000; // 5 seconds

/**
 * Waits for a given number of milliseconds.
 * Used between connection retry attempts.
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Connects to MongoDB with automatic retry logic.
 * This is critical for Docker where MongoDB may not be ready
 * when the backend container starts.
 */
const connectDB = async () => {
    let attempt = 1;

    while (attempt <= MAX_RETRIES) {
        try {
            logger.info(`MongoDB connection attempt ${attempt} of ${MAX_RETRIES}...`);

            const conn = await mongoose.connect(process.env.MONGO_URI, {
                // These options prevent deprecation warnings and improve reliability
                serverSelectionTimeoutMS: 5000,  // Give up finding server after 5s
                socketTimeoutMS: 45000,           // Close socket after 45s of inactivity
            });

            logger.info(`MongoDB connected successfully: ${conn.connection.host}`);

            // Set up connection event listeners AFTER successful connection
            mongoose.connection.on("disconnected", () => {
                logger.warn("MongoDB disconnected. Attempting to reconnect...");
            });

            mongoose.connection.on("reconnected", () => {
                logger.info("MongoDB reconnected successfully.");
            });

            // Connection successful — exit the retry loop
            return;

        } catch (err) {
            logger.error(`MongoDB connection attempt ${attempt} failed: ${err.message}`);

            if (attempt === MAX_RETRIES) {
                // All retries exhausted — cannot continue without database
                logger.error(`All ${MAX_RETRIES} connection attempts failed. Exiting.`);
                process.exit(1);
            }

            logger.info(`Waiting ${RETRY_DELAY_MS / 1000} seconds before retry...`);
            await sleep(RETRY_DELAY_MS);
            attempt++;
        }
    }
};

module.exports = connectDB;