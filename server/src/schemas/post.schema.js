const { z } = require("zod");

const roundSchema = z.object({
    roundName: z.string().min(1, "Round name is required"),
    description: z.string().optional().default(""),
    questions: z.array(z.string()).optional().default([]),
});

const createPostSchema = z.object({
    companyName: z.string().min(1, "Company name is required").max(100),
    role: z.string().min(1, "Role is required").max(100),
    result: z.enum(["Selected", "Rejected", "Waiting"]).default("Waiting"),
    difficulty: z.enum(["Easy", "Medium", "Hard"]).default("Medium"),
    rounds: z.array(roundSchema).optional().default([]),
    tags: z.array(z.string()).optional().default([]),
    isAnonymous: z.boolean().optional().default(false),
});

const updatePostSchema = createPostSchema.partial();

const addCommentSchema = z.object({
    text: z.string().min(1, "Comment text cannot be empty").max(500),
});

module.exports = { createPostSchema, addCommentSchema, updatePostSchema };