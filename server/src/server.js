require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { env, validateEnv } = require("./config/env");

validateEnv();
connectDB();

const PORT = env.PORT || 5000;

const logger = require("./utils/logger");

app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);

});
