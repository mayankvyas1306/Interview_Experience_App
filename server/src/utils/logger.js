/**
 * Logger utility using Winston.
 *
 * Why Winston over console.log?
 * - Structured JSON logs (machines can parse them)
 * - Log levels (debug, info, warn, error) — filter noise in production
 * - Multiple transports (console, file, external service)
 * - Timestamps on every log
 * - In production, logs go to log aggregation services (Datadog, Logtail, etc.)
 *
 * Log levels (from least to most severe):
 * debug → info → warn → error
 *
 * In development: show everything (debug+)
 * In production: show only info+ (less noise, lower cost)
 */

const winston = require("winston");
const { env } = require("../config/env");

const { combine, timestamp, json, colorize, simple, printf } = winston.format;

// Custom format for development — human-readable with colors
const devFormat = combine(
    colorize(),
    timestamp({ format: "HH:mm:ss" }),
    printf(({ level, message, timestamp, requestId, ...meta }) => {
        const reqId = requestId ? ` [${requestId}]` : "";
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
        return `${timestamp}${reqId} ${level}: ${message}${metaStr}`;
    })
);

// JSON format for production — structured, parseable by log aggregators
const prodFormat = combine(
    timestamp(),
    json()
);

const logger = winston.createLogger({
    level: env.NODE_ENV === "development" ? "debug" : "info",
    format: env.NODE_ENV === "development" ? devFormat : prodFormat,
    transports: [
        new winston.transports.Console(),
    ],
    // Don't crash the app if logger fails
    exitOnError: false,
});

// Morgan stream integration
logger.stream = {
    write: (message) => {
        logger.info(message.trim());
    },
};

module.exports = logger;