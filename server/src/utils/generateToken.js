const jwt = require("jsonwebtoken");
const { env } = require("../config/env");

/**
 * Generates a JWT token for a given user ID.
 * Uses the centralized env config to ensure JWT_SECRET is validated at startup.
 *
 * @param {string} userId - MongoDB ObjectId of the user
 * @returns {string} Signed JWT token
 */
const generateToken = (userId) => {
    if (!env.JWT_SECRET) {
        // This should never happen if validateEnv() runs at startup
        // But this is a safety check
        throw new Error("JWT_SECRET is not configured. Cannot generate token.");
    }

    return jwt.sign(
        { id: userId },
        env.JWT_SECRET,
        { expiresIn: `${env.JWT_COOKIE_EXPIRES_DAYS}d` }
    );
};

module.exports = generateToken;