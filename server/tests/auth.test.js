// ✅ MUST be first
require("dotenv").config();

const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");

// ─── Get the test database URI ────────────────────────────────────────────────
// Priority order:
// 1. TEST_MONGO_URI env var (explicit, safest — set this in .env)
// 2. MONGO_URI from CI (GitHub Actions sets this to a local test URI)
// 3. Local fallback
const TEST_MONGO_URI =
    process.env.TEST_MONGO_URI ||
    process.env.MONGO_URI ||
    "mongodb://localhost:27017/interview_experience_test";

// Verify the URI contains "test" — refuse to run against production
if (!TEST_MONGO_URI.toLowerCase().includes("test")) {
    throw new Error(
        `SAFETY: TEST_MONGO_URI "${TEST_MONGO_URI}" does not contain "test".\n` +
        `Add TEST_MONGO_URI to your .env file pointing to a test database.`
    );
}

console.log(
    "🧪 Test database:",
    TEST_MONGO_URI.replace(/:([^:@]+)@/, ":***@")
);

// ─── Setup & Teardown ─────────────────────────────────────────────────────────
beforeAll(async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    await mongoose.connect(TEST_MONGO_URI);
});

afterAll(async () => {
    const currentDB = mongoose.connection.db?.databaseName ?? "";

    if (!currentDB.toLowerCase().includes("test")) {
        console.error(`⛔ SAFETY: Not cleaning up "${currentDB}" — not a test database`);
        await mongoose.connection.close();
        return;
    }

    const collections = mongoose.connection.collections;
    await Promise.all(
        Object.values(collections).map((col) => col.deleteMany({}))
    );
    console.log(`✅ Cleaned up: "${currentDB}"`);
    await mongoose.connection.close();
});

// ─── POST /api/auth/register ──────────────────────────────────────────────────
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

        if (res.status !== 201) {
            console.error("Register failed:", res.status, JSON.stringify(res.body));
        }

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("token");
        expect(res.body.user).toMatchObject({
            email: testUser.email,
            fullName: testUser.fullName,
            role: "user",
        });
        expect(res.body.user).not.toHaveProperty("password");
    });

    it("should reject duplicate email with 400", async () => {
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
            .send({ ...testUser, email: "short@test.com", password: "123" });
        expect(res.status).toBe(400);
    });
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
describe("POST /api/auth/login", () => {
    const credentials = {
        fullName: "Login Test User",
        email: `login_${Date.now()}@example.com`,
        password: "securepass123",
    };

    beforeAll(async () => {
        const res = await request(app).post("/api/auth/register").send(credentials);
        if (res.status !== 201) {
            console.error("Login setup failed:", res.status, JSON.stringify(res.body));
        }
    });

    it("should login with correct credentials and return token", async () => {
        const res = await request(app).post("/api/auth/login").send({
            email: credentials.email,
            password: credentials.password,
        });

        if (res.status !== 200) {
            console.error("Login failed:", res.status, JSON.stringify(res.body));
        }

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("token");
        expect(res.body.user.email).toBe(credentials.email);
        expect(res.body.user).not.toHaveProperty("password");
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

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
describe("GET /api/auth/me", () => {
    let token = "";

    beforeAll(async () => {
        const res = await request(app).post("/api/auth/register").send({
            fullName: "Me Test User",
            email: `me_${Date.now()}@example.com`,
            password: "password123",
        });

        if (res.status !== 201) {
            console.error("Me setup failed:", res.status, JSON.stringify(res.body));
        }

        token = res.body.token || "";
    });

    it("should return current user when authenticated", async () => {
        expect(token).toBeTruthy();

        const res = await request(app)
            .get("/api/auth/me")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.user).toHaveProperty("email");
        expect(res.body.user).toHaveProperty("fullName");
        expect(res.body.user).not.toHaveProperty("password");
    });

    it("should return 401 when not authenticated", async () => {
        const res = await request(app).get("/api/auth/me");
        expect(res.status).toBe(401);
    });
});