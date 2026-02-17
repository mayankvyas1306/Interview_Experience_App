const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");
require("dotenv").config();

// Connect to DB before tests
beforeAll(async () => {
    // Force test database if not already set, or just use the dev one for now 
    // Ideally we use a separate test DB.
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
});

// Disconnect and cleanup after tests
afterAll(async () => {
    await mongoose.connection.close();
});

describe("Auth API", () => {
    let testUser = {
        fullName: "Test User",
        email: `test${Date.now()}@example.com`,
        password: "password123",
        college: "Test College",
        year: 2024
    };

    it("should register a new user", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send(testUser);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty("token");
        expect(res.body.user).toHaveProperty("email", testUser.email);
    });

    it("should login the registered user", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: testUser.email,
                password: testUser.password
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("token");
    });

    it("should fail validation for invalid email", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                ...testUser,
                email: "invalid-email"
            });

        expect(res.statusCode).toEqual(400); // Zod returns 400
    });
});
