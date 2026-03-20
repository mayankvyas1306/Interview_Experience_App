const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");

// Use test database — never run tests against production
const TEST_MONGO_URI =
    process.env.MONGO_URI || "mongodb://localhost:27017/interview_experience_test";

beforeAll(async () => {
    await mongoose.connect(TEST_MONGO_URI);
});

afterAll(async () => {
    // Clean up test data and close connection
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

describe("POST /api/auth/register", () => {
    const testUser = {
        fullName: "Test User",
        email: `test_${Date.now()}@example.com`,
        password: "password123",
        college: "Test College",
        year: 2,
    };

    it("should register a new user and return token", async () => {
        const res = await request(app).post("/api/auth/register").send(testUser);

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("token");
        expect(res.body.user).toMatchObject({
            email: testUser.email,
            fullName: testUser.fullName,
            role: "user",
        });
    });

    it("should reject duplicate email with 400", async () => {
        // Register same user again
        const res = await request(app).post("/api/auth/register").send(testUser);
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/already exist/i);
    });

    it("should reject invalid email with 400", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({ ...testUser, email: "not-an-email" });
        expect(res.status).toBe(400);
    });

    it("should reject short password with 400", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({ ...testUser, email: "other@test.com", password: "123" });
        expect(res.status).toBe(400);
    });
});

describe("POST /api/auth/login", () => {
    const credentials = {
        fullName: "Login Test",
        email: `login_${Date.now()}@example.com`,
        password: "securepass123",
    };

    // Register before testing login
    beforeAll(async () => {
        await request(app).post("/api/auth/register").send(credentials);
    });

    it("should login with correct credentials", async () => {
        const res = await request(app).post("/api/auth/login").send({
            email: credentials.email,
            password: credentials.password,
        });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("token");
        expect(res.body.user.email).toBe(credentials.email);
    });

    it("should reject wrong password with 401", async () => {
        const res = await request(app).post("/api/auth/login").send({
            email: credentials.email,
            password: "wrongpassword",
        });
        expect(res.status).toBe(401);
    });

    it("should reject non-existent email with 401", async () => {
        const res = await request(app).post("/api/auth/login").send({
            email: "nobody@example.com",
            password: "somepass123",
        });
        expect(res.status).toBe(401);
    });
});

describe("GET /api/auth/me", () => {
    let token = "";

    beforeAll(async () => {
        const res = await request(app).post("/api/auth/register").send({
            fullName: "Me Test User",
            email: `me_${Date.now()}@example.com`,
            password: "password123",
        });
        token = res.body.token;
    });

    it("should return current user when authenticated", async () => {
        const res = await request(app)
            .get("/api/auth/me")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.user).toHaveProperty("email");
        expect(res.body.user).not.toHaveProperty("password");
    });

    it("should return 401 when not authenticated", async () => {
        const res = await request(app).get("/api/auth/me");
        expect(res.status).toBe(401);
    });
});