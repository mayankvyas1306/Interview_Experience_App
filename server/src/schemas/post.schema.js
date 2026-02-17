const { z } = require("zod");

const createPostSchema = z.object({
    companyName: z.string().min(1, "Company name is required"),
    role: z.string().min(1, "Role is required"),
    type: z.enum(["Internship", "Full Time", "Junk"], {
        errorMap: () => ({ message: "Type must be 'Internship' or 'Full Time'" }),
    }),
    result: z.enum(["Selected", "Rejected", "Pending", "Junk"], {
        errorMap: () => ({ message: "Result must be Selected, Rejected, or Pending" }),
    }),
    difficulty: z.enum(["Easy", "Medium", "Hard"], {
        errorMap: () => ({ message: "Difficulty must be Easy, Medium, or Hard" }),
    }),
    rounds: z.array(
        z.object({
            name: z.string().min(1, "Round name is required"),
            description: z.string().min(1, "Round description is required"),
        })
    ).min(1, "At least one round is required"),
    tags: z.array(z.string()).optional(),
});

const addCommentSchema = z.object({
    text: z.string().min(1, "Comment text cannot be empty"),
});

const updatePostSchema = createPostSchema.partial();

module.exports = { createPostSchema, addCommentSchema, updatePostSchema };
