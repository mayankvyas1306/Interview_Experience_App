const Post = require("../models/Post");
const { getCache, setCache } = require("../utils/cache");
const { generateContent, safeParseJSON } = require("../utils/geminiClient");
const AppError = require("../utils/AppError");

// ─────────────────────────────────────────────
// 1. ANALYZE A SINGLE POST
// Returns: difficulty assessment, key topics, what went well/wrong,
//          preparation tips for similar interviews
// GET /api/ai/analyze-post/:postId
// ─────────────────────────────────────────────
const analyzePost = async (req, res, next) => {
    try {
        const { postId } = req.params;

        // Cache key includes postId
        const cacheKey = `ai:post_analysis:${postId}`;
        const cached = getCache(cacheKey);
        if (cached) return res.json(cached);

        const post = await Post.findById(postId).lean();
        if (!post) throw new AppError("Post not found", 404);

        // Build a concise summary of the post for the prompt
        const roundsSummary = post.rounds
            .map((r, i) =>
                `Round ${i + 1} (${r.roundName}): ${r.description || "No description"}. Questions: ${r.questions.slice(0, 3).join("; ") || "None listed"}`
            )
            .join("\n");

        const prompt = `You are an expert software engineering interview coach analyzing a real interview experience.

Interview Details:
- Company: ${post.companyName}
- Role: ${post.role}
- Difficulty: ${post.difficulty}
- Result: ${post.result}
- Tags/Topics: ${post.tags.join(", ") || "None"}
- Number of Rounds: ${post.rounds.length}

Round Details:
${roundsSummary || "No detailed round information provided"}

Analyze this interview experience and respond with ONLY valid JSON (no markdown, no explanation):
{
  "difficulty_rating": "Easy|Medium|Hard",
  "difficulty_explanation": "One sentence explaining the difficulty assessment",
  "key_topics": ["topic1", "topic2", "topic3"],
  "preparation_tips": [
    "Specific actionable tip 1",
    "Specific actionable tip 2", 
    "Specific actionable tip 3"
  ],
  "resources": [
    {"title": "Resource name", "type": "Book|Course|Website|Practice", "description": "Why this helps"}
  ],
  "success_factors": "What typically leads to success in this type of interview",
  "common_mistakes": "Common mistakes candidates make at ${post.companyName} for ${post.role} roles"
}`;

        const rawResponse = await generateContent(prompt);
        const analysis = safeParseJSON(rawResponse);

        if (!analysis) {
            throw new AppError("Failed to parse AI response", 500);
        }

        const payload = { postId, analysis, generatedAt: new Date().toISOString() };

        // Cache for 24 hours — interview analysis doesn't change
        setCache(cacheKey, payload, 24 * 60 * 60 * 1000);

        res.json(payload);
    } catch (err) {
        if (err.message?.includes("GEMINI_API_KEY")) {
            return res.status(503).json({ message: "AI features not configured" });
        }
        next(err);
    }
};

// ─────────────────────────────────────────────
// 2. AUTO-TAG A POST
// Takes post content, suggests relevant tags from a predefined list
// POST /api/ai/suggest-tags
// Body: { companyName, role, rounds }
// ─────────────────────────────────────────────
const suggestTags = async (req, res, next) => {
    try {
        const { companyName, role, rounds } = req.body;

        if (!companyName || !role) {
            throw new AppError("companyName and role are required", 400);
        }

        const VALID_TAGS = ["DSA", "DBMS", "OS", "CN", "OOP", "System Design", "Aptitude", "Behavioral", "ML", "Frontend", "Backend", "DevOps"];

        const questionsText = (rounds || [])
            .flatMap((r) => r.questions || [])
            .slice(0, 10)
            .join(". ");

        const prompt = `You are a technical interview categorization system.

Interview: ${role} at ${companyName}
Questions/Topics discussed: ${questionsText || "No specific questions provided"}

From ONLY this list of valid tags, select the most relevant ones:
${VALID_TAGS.join(", ")}

Rules:
- Select 2-5 tags maximum
- Only use tags from the provided list
- Base selection on the role and questions discussed
- Respond with ONLY valid JSON, no explanation:

{"tags": ["tag1", "tag2"]}`;

        const rawResponse = await generateContent(prompt);
        const result = safeParseJSON(rawResponse);

        if (!result || !Array.isArray(result.tags)) {
            return res.json({ tags: [] });
        }

        // Filter to only valid tags (prevent prompt injection)
        const validTags = result.tags.filter((t) => VALID_TAGS.includes(t));

        res.json({ tags: validTags });
    } catch (err) {
        if (err.message?.includes("GEMINI_API_KEY")) {
            return res.status(503).json({ message: "AI features not configured" });
        }
        next(err);
    }
};

// ─────────────────────────────────────────────
// 3. COMPANY PREP GUIDE
// Generates a comprehensive preparation guide for a specific company
// GET /api/ai/company-prep?company=Google&role=SDE
// ─────────────────────────────────────────────
const getCompanyPrepGuide = async (req, res, next) => {
    try {
        const { company, role } = req.query;

        if (!company) throw new AppError("company query param is required", 400);

        const cacheKey = `ai:company_prep:${company.toLowerCase()}:${(role || "").toLowerCase()}`;
        const cached = getCache(cacheKey);
        if (cached) return res.json(cached);

        // Fetch real posts from DB to ground the AI in actual data
        const recentPosts = await Post.find({
            companyName: { $regex: new RegExp(`^${company}$`, "i") },
            ...(role ? { role: { $regex: new RegExp(role, "i") } } : {}),
        })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        const postsContext =
            recentPosts.length > 0
                ? recentPosts
                    .map(
                        (p) =>
                            `- ${p.role} (${p.difficulty}, ${p.result}): ${p.rounds.length} rounds, topics: ${p.tags.join(", ")}`
                    )
                    .join("\n")
                : "No recent interview data available for this company";

        const prompt = `You are an expert interview preparation coach helping a candidate prepare for ${company}${role ? ` (${role} role)` : ""}.

Recent interview experiences from the community:
${postsContext}

Create a comprehensive preparation guide. Respond with ONLY valid JSON:
{
  "overview": "2-3 sentence overview of ${company}'s interview process",
  "difficulty": "Easy|Medium|Hard",
  "typical_rounds": [
    {"name": "Round name", "description": "What to expect", "duration": "Approximate time"}
  ],
  "key_topics": [
    {"topic": "Topic name", "importance": "High|Medium|Low", "description": "What to focus on"}
  ],
  "preparation_timeline": [
    {"week": "Week 1-2", "focus": "What to study", "resources": ["resource1"]}
  ],
  "tips": [
    "Specific tip for ${company} interviews"
  ],
  "red_flags": ["Common mistakes that lead to rejection"],
  "salary_negotiation": "Brief advice on salary discussion at ${company}"
}`;

        const rawResponse = await generateContent(prompt, 20000);
        const guide = safeParseJSON(rawResponse);

        if (!guide) {
            throw new AppError("Failed to generate prep guide", 500);
        }

        const payload = {
            company,
            role: role || null,
            guide,
            basedOnPosts: recentPosts.length,
            generatedAt: new Date().toISOString(),
        };

        // Cache for 6 hours
        setCache(cacheKey, payload, 6 * 60 * 60 * 1000);

        res.json(payload);
    } catch (err) {
        if (err.message?.includes("GEMINI_API_KEY")) {
            return res.status(503).json({ message: "AI features not configured" });
        }
        next(err);
    }
};

// ─────────────────────────────────────────────
// 4. COMPARE TWO COMPANIES
// Side-by-side AI analysis of interview processes
// GET /api/ai/compare?company1=Google&company2=Amazon&role=SDE
// ─────────────────────────────────────────────
const compareCompanies = async (req, res, next) => {
    try {
        const { company1, company2, role } = req.query;

        if (!company1 || !company2) {
            throw new AppError("company1 and company2 are required", 400);
        }

        const cacheKey = `ai:compare:${[company1, company2]
            .map((c) => c.toLowerCase())
            .sort()
            .join("_vs_")}:${(role || "").toLowerCase()}`;

        const cached = getCache(cacheKey);
        if (cached) return res.json(cached);

        // Fetch stats for both companies from DB
        const [posts1, posts2] = await Promise.all([
            Post.find({ companyName: { $regex: new RegExp(`^${company1}$`, "i") } })
                .limit(10)
                .lean(),
            Post.find({ companyName: { $regex: new RegExp(`^${company2}$`, "i") } })
                .limit(10)
                .lean(),
        ]);

        const summarize = (posts, name) => {
            if (posts.length === 0) return `No data for ${name}`;
            const avgRounds =
                posts.reduce((s, p) => s + p.rounds.length, 0) / posts.length;
            const tags = [...new Set(posts.flatMap((p) => p.tags))].slice(0, 5);
            const results = posts.reduce((acc, p) => {
                acc[p.result] = (acc[p.result] || 0) + 1;
                return acc;
            }, {});
            return `${posts.length} posts, avg ${avgRounds.toFixed(1)} rounds, topics: ${tags.join(", ")}, results: ${JSON.stringify(results)}`;
        };

        const prompt = `Compare interview processes at ${company1} vs ${company2}${role ? ` for ${role} roles` : ""}.

Community Data:
${company1}: ${summarize(posts1, company1)}
${company2}: ${summarize(posts2, company2)}

Respond with ONLY valid JSON:
{
  "summary": "One paragraph comparing the two companies",
  "difficulty_comparison": {
    "${company1}": {"rating": "Easy|Medium|Hard", "reason": "..."},
    "${company2}": {"rating": "Easy|Medium|Hard", "reason": "..."}
  },
  "process_comparison": [
    {
      "aspect": "Number of Rounds|Focus Areas|Interview Style|Timeline",
      "${company1}": "description",
      "${company2}": "description"
    }
  ],
  "better_for_beginners": "${company1}|${company2}|Equal",
  "better_for_experienced": "${company1}|${company2}|Equal",
  "unique_challenges": {
    "${company1}": ["challenge1"],
    "${company2}": ["challenge1"]
  },
  "recommendation": "Which to target first and why"
}`;

        const rawResponse = await generateContent(prompt, 20000);
        const comparison = safeParseJSON(rawResponse);

        if (!comparison) {
            throw new AppError("Failed to generate comparison", 500);
        }

        const payload = {
            company1,
            company2,
            role: role || null,
            comparison,
            dataPoints: { [company1]: posts1.length, [company2]: posts2.length },
            generatedAt: new Date().toISOString(),
        };

        // Cache for 6 hours
        setCache(cacheKey, payload, 6 * 60 * 60 * 1000);

        res.json(payload);
    } catch (err) {
        if (err.message?.includes("GEMINI_API_KEY")) {
            return res.status(503).json({ message: "AI features not configured" });
        }
        next(err);
    }
};

// ─────────────────────────────────────────────
// 5. QUESTION PRACTICE
// Generate practice questions based on a company/role
// GET /api/ai/practice-questions?company=Google&role=SDE&topic=DSA
// ─────────────────────────────────────────────
const getPracticeQuestions = async (req, res, next) => {
    try {
        const { company, role, topic } = req.query;

        if (!company && !topic) {
            throw new AppError("At least company or topic is required", 400);
        }

        const cacheKey = `ai:practice:${(company || "").toLowerCase()}:${(role || "").toLowerCase()}:${(topic || "").toLowerCase()}`;
        const cached = getCache(cacheKey);
        if (cached) return res.json(cached);

        // Get real questions from existing posts for grounding
        const realPosts = await Post.find({
            ...(company ? { companyName: { $regex: new RegExp(`^${company}$`, "i") } } : {}),
            ...(topic ? { tags: { $elemMatch: { $regex: new RegExp(topic, "i") } } } : {}),
        })
            .limit(5)
            .lean();

        const realQuestions = realPosts
            .flatMap((p) => p.rounds.flatMap((r) => r.questions))
            .filter(Boolean)
            .slice(0, 5);

        const prompt = `You are a technical interview question generator for ${company || "top tech companies"}.
${role ? `Target role: ${role}` : ""}
${topic ? `Focus topic: ${topic}` : ""}

${realQuestions.length > 0 ? `Real questions asked recently:\n${realQuestions.map((q) => `- ${q}`).join("\n")}\n` : ""}

Generate 5 practice questions similar in style to what this company asks.
Include a mix of difficulty levels.

Respond with ONLY valid JSON:
{
  "questions": [
    {
      "question": "Full question text",
      "type": "Coding|System Design|Behavioral|Theory|Math",
      "difficulty": "Easy|Medium|Hard",
      "topic": "DSA|System Design|OS|DBMS|etc",
      "hint": "A subtle hint without giving away the answer",
      "what_they_test": "What skill or concept this question evaluates"
    }
  ]
}`;

        const rawResponse = await generateContent(prompt);
        const result = safeParseJSON(rawResponse);

        if (!result || !Array.isArray(result.questions)) {
            throw new AppError("Failed to generate questions", 500);
        }

        const payload = {
            company: company || null,
            role: role || null,
            topic: topic || null,
            questions: result.questions,
            basedOnRealData: realQuestions.length > 0,
            generatedAt: new Date().toISOString(),
        };

        // Cache for 1 hour — questions can vary
        setCache(cacheKey, payload, 60 * 60 * 1000);

        res.json(payload);
    } catch (err) {
        if (err.message?.includes("GEMINI_API_KEY")) {
            return res.status(503).json({ message: "AI features not configured" });
        }
        next(err);
    }
};

module.exports = {
    analyzePost,
    suggestTags,
    getCompanyPrepGuide,
    compareCompanies,
    getPracticeQuestions,
};