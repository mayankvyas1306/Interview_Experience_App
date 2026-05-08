/**
 * Environment variable configuration and validation.
 *
 * IMPORTANT FOR DOCKER/JENKINS:
 * All required variables must be set in:
 * - docker-compose.yml environment section
 * - Jenkins pipeline environment block
 * - .env file (for local development only)
 */

// Variables that MUST exist for the app to function
const requiredEnv = [
  "MONGO_URI",
  "JWT_SECRET",
  "CLIENT_URL",
];

// Variables that are optional but should be warned about if missing
const optionalEnvWithDefaults = [
  "PORT",
  "NODE_ENV",
  "JWT_COOKIE_NAME",
  "JWT_COOKIE_EXPIRES_DAYS",
  "GEMINI_API_KEY",  // Optional - AI features degrade gracefully without it
];

const getEnv = (key, fallback) => {
  const value = process.env[key];
  if (value !== undefined && value !== "") {
    return value;
  }
  return fallback;
};

const validateEnv = () => {
  // Check required variables
  const missing = requiredEnv.filter((key) => !getEnv(key));

  if (missing.length) {
    // Print each missing variable separately for clarity
    console.error("=".repeat(50));
    console.error("FATAL: Missing required environment variables:");
    missing.forEach(key => console.error(`  - ${key}`));
    console.error("=".repeat(50));
    console.error("For Docker: Check your docker-compose.yml environment section");
    console.error("For local: Check your .env file");
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  // Warn about missing optional variables
  const missingOptional = optionalEnvWithDefaults.filter(
    key => !getEnv(key) && key !== "GEMINI_API_KEY"
  );

  if (missingOptional.length) {
    console.warn("WARNING: These optional variables are not set (using defaults):");
    missingOptional.forEach(key => console.warn(`  - ${key}`));
  }

  if (!getEnv("GEMINI_API_KEY")) {
    console.warn("WARNING: GEMINI_API_KEY not set. AI features will be disabled.");
  }
};

const env = {
  NODE_ENV: getEnv("NODE_ENV", "development"),
  PORT: Number(getEnv("PORT", "5000")),
  CLIENT_URL: getEnv("CLIENT_URL", "http://localhost:3000"),
  JWT_COOKIE_NAME: getEnv("JWT_COOKIE_NAME", "token"),
  JWT_COOKIE_EXPIRES_DAYS: Number(getEnv("JWT_COOKIE_EXPIRES_DAYS", "7")),
  MONGO_URI: getEnv("MONGO_URI"),
  JWT_SECRET: getEnv("JWT_SECRET"),
  GEMINI_API_KEY: getEnv("GEMINI_API_KEY"),  // Can be undefined — AI handles this
};

module.exports = { env, validateEnv };