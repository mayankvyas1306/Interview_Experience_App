const { GoogleGenerativeAI } = require("@google/generative-ai");
const { env } = require("../config/env");

let genAI = null; // FIX: was `const genAI = null` which caused assignment error
let flashModel = null;

/**
 * Lazy-initialize the Gemini client.
 * We do this lazily so the server starts even without a valid API key.
 * AI features just return errors gracefully.
 */
const getGeminiClient = () => {
    if (!genAI) {
        if (!env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not configured");
        }
        genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    }
    return genAI;
};

/**
 * Get the Flash model — fast and free tier, good for most tasks
 */
const getFlashModel = () => {
    if (!flashModel) {
        const client = getGeminiClient();
        flashModel = client.getGenerativeModel({
            model: "gemma-3-27b-it",
            generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 4096,
            },
        });
    }
    return flashModel;
};

/**
 * Safe JSON parse — Gemini sometimes wraps JSON in markdown code blocks
 */
const safeParseJSON = (text) => {
    try {
        // Extract JSON from messy response
        const match = text.match(/\{[\s\S]*\}/);
        if (!match) return null;

        return JSON.parse(match[0]);
    } catch (err) {
        console.error("JSON PARSE ERROR:", err.message);
        console.error("RAW AI RESPONSE:", text);
        return null;
    }
};

/**
 * Generate content with error handling and timeout
 */
const generateContent = async (prompt, timeoutMs = 30000) => {
    try {
        const model = getFlashModel();

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Gemini API timeout")), timeoutMs)
        );

        const apiPromise = model.generateContent(prompt);

        const result = await Promise.race([apiPromise, timeoutPromise]);
        const response = await result.response;

        const text = response.text();

        console.log("=== GEMINI RAW RESPONSE ===");
        console.log(text);
        console.log("===========================");

        return text;
    } catch (err) {
        console.error("GEMINI ERROR:", err.message);
        throw err;
    }
};

module.exports = { generateContent, safeParseJSON, getFlashModel };