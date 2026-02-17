const winston = require("winston");
const { env } = require("../config/env");

const logger = winston.createLogger({
    level: env.NODE_ENV === "development" ? "debug" : "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format:
                env.NODE_ENV === "development"
                    ? winston.format.combine(
                        winston.format.colorize(),
                        winston.format.simple()
                    )
                    : winston.format.json(),
        }),
    ],
});

// Create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
    write: function (message) {
        // Morgan adds a newline usually, remove it for cleaner logs
        logger.info(message.trim());
    },
};

module.exports = logger;
