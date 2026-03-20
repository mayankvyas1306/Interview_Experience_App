// ✅ MUST be first
require("dotenv").config();

const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");

// ─── SAFETY: Build test URI ───────────────────────────────────────────────────
const getTestURI = () => {
    const productionURI = process.env.MONGO_URI;
    if (!productionURI) {
        return "mongodb://localhost:27017/interview_experience_test";
    }

    const testURI = productionURI.replace(
        /(mongodb(?:\+srv)?:\/\/[^/]+\/)([^/?]+)(.*)/,
        "$1interview_experience_test$3"
    );

    // SAFETY: If regex failed and URI didn't change, abort immediately
    if (testURI === productionURI) {
        throw new Error(
            "SAFETY: Could not derive a test database URI. " +
            "Check that MONGO_URI contains a database name in the path."
        );
    }

    return testURI;
};

const TEST_MONGO_URI = getTestURI();

// Show which database is being used (hide password)
console.log(
    "Test database:",
    TEST_MONGO_URI.replace(/:([^@]+)@/, ":***@")
);

beforeAll(async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    await mongoose.connect(TEST_MONGO_URI);
});

afterAll(async () => {
    // SAFETY: Refuse to delete if not on a test database
    const currentDB = mongoose.connection.db?.databaseName ?? "";

    if (!currentDB.includes("test")) {
        console.error(
            `SAFETY ABORT: Refusing to delete from "${currentDB}". ` +
            `Name must contain "test".`
        );
        await mongoose.connection.close();
        return;
    }

    const collections = mongoose.connection.collections;
    await Promise.all(
        Object.values(collections).map((col) => col.deleteMany({}))
    );
    await mongoose.connection.close();
});

// ─── Register ─────────────────────────────────────────────────────────────────
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

// ─── Login ────────────────────────────────────────────────────────────────────
describe("POST /api/auth/login", () => {
    const credentials = {
        fullName: "Login Test User",
        email: `login_${Date.now()}@example.com`,
        password: "securepass123",
    };

    beforeAll(async () => {
        const res = await request(app).post("/api/auth/register").send(credentials);
        if (res.status !== 201) {
            console.error("Login beforeAll failed:", res.status, JSON.stringify(res.body));
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

// ─── Me ───────────────────────────────────────────────────────────────────────
describe("GET /api/auth/me", () => {
    let token = "";

    beforeAll(async () => {
        const res = await request(app).post("/api/auth/register").send({
            fullName: "Me Test User",
            email: `me_${Date.now()}@example.com`,
            password: "password123",
        });
        if (res.status !== 201) {
            console.error("Me beforeAll failed:", res.status, JSON.stringify(res.body));
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