// server/src/server.js — this should already look like this
require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { env, validateEnv } = require("./config/env");
const logger = require("./utils/logger");
const setupGracefulShutdown = require("./utils/gracefulShutdown"); // ← correct import

validateEnv();
connectDB();

const PORT = env.PORT || 5000;

const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});

setupGracefulShutdown(server, require("mongoose")); // ← now this works