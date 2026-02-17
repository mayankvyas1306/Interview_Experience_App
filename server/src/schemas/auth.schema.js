const { z } = require("zod");

const registerSchema = z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    college: z.string().optional(),
    year: z.number().or(z.string()).optional(),
});

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

module.exports = { registerSchema, loginSchema };
