const { GoogleGenerativeAI } = require("@google/generative-ai");
const { env } = require("../config/env");

const genAI = null;

let flashModel = null;

/**
 * Lazy-initialize the Gemini client.
 * We do this lazily so the server starts even without a valid API key.
 * AI features just return errors gracefully.
 */

const getGeminiClient = () => {
    if (!genAI) {
        if (!env.GEMINI_API_KEY) {
            throw new Error("Gemini_API_KEY is not configured");
        }

        genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    }
    return genAI;
}

/**
 * Get the Flash model — fast and free tier, good for most tasks
 * Use this for: tagging, quick analysis, tips
 */

const getFlashModel = () => {
    if (!flashModel) {
        const client = getGeminiClient();
        flashModel = client.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 1024,
            },
        });
    }

    return flashModel;
}

/**
 * Safe JSON parse — Gemini sometimes wraps JSON in markdown code blocks
 * This strips ```json ... ``` wrappers before parsing
 */

const safeParseJSON = (text) => {
    try {
        //Remove markdown code blocks if present
        const cleaned = text
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();
        return JSON.parse(cleaned);
    } catch {
        return null;
    }
};

/**
 * Generate content with error handling and timeout
 */

const generateContent = async (prompt, timeoutMS = 15000) => {
    const model = getFlashModel();

    // Race between the API call and a timeout
    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Gemini API timeout")), timeoutMS)
    );

    const apiPromise = model.generateContent(prompt);

    const result = await Promise.race([apiPromise, timeoutPromise]);
    const response = await result.response;

    return response.text();

};

module.exports = { generateContent, safeParseJSON, getFlashModel }