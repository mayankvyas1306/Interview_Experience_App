require("dotenv").config();

const mongoose = require("mongoose");
const app = require("./app");
const connectDB = require("./config/db");
const { env, validateEnv } = require("./config/env");
const logger = require("./utils/logger");
const setupGracefulShutdown = require("./utils/gracefulShutdown");

// Validate environment before doing anything else
// This fails fast if required env vars are missing
validateEnv();

// Connect to database
connectDB();

const PORT = env.PORT || 5000;

// Start the HTTP server and save the reference
// We need the reference for graceful shutdown
const server = app.listen(PORT, () => {
    logger.info(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
});

// Set up graceful shutdown handlers
// Pass both server and mongoose so we can close them properly
setupGracefulShutdown(server, mongoose);