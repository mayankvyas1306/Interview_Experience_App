// ✅ MUST be first — loads .env for local dev
// In CI, env vars are set directly by the workflow runner
require("dotenv").config();

const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");

// ─── Build a safe test database URI ──────────────────────────────────────────
//
// Strategy: never manipulate the URI if it already points to a test database.
// Otherwise derive a test URI by inserting "interview_experience_test"
// as the database name — handling all Atlas and local URI formats.
//
// Formats handled:
//   mongodb+srv://host/?opts        (Atlas, trailing slash before ?)
//   mongodb+srv://host?opts         (Atlas, no slash before ?)
//   mongodb+srv://host/mydb?opts    (Atlas with db name)
//   mongodb://localhost:27017/mydb  (local with db name)
//   mongodb://localhost:27017       (local no db name)
//   ""  or  undefined               (fallback to localhost)
//
const buildTestURI = () => {
    const uri = process.env.MONGO_URI;

    // No URI — use local fallback
    if (!uri) {
        return "mongodb://localhost:27017/interview_experience_test";
    }

    // Already pointing at the test database — use as-is (covers CI case)
    if (uri.includes("interview_experience_test")) {
        return uri;
    }

    // Normalize: remove trailing slash immediately before ? or at end of string
    // "mongodb+srv://host/?opts"  →  "mongodb+srv://host?opts"
    // "mongodb+srv://host/"       →  "mongodb+srv://host"
    const normalized = uri.replace(/\/\?/, "?").replace(/\/$/, "");

    // Case A: URI already has a database name segment in the path
    // Matches: everything-up-to-last-slash / db-name ? optional-query
    const pathMatch = normalized.match(
        /^(mongodb(?:\+srv)?:\/\/[^/]+\/)([^/?]+)(\?.*)?$/
    );
    if (pathMatch) {
        const [, prefix, , query] = pathMatch;
        return `${prefix}interview_experience_test${query || ""}`;
    }

    // Case B: No database name in path — insert before query string
    if (normalized.includes("?")) {
        return normalized.replace("?", "/interview_experience_test?");
    }

    // Case C: No database name, no query string
    return `${normalized}/interview_experience_test`;
};

const TEST_MONGO_URI = buildTestURI();

// Always visible in test output — confirms we're not on production
console.log(
    "🧪 Test database URI:",
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

    // Safety guard: only clean up if we're definitely on a test database
    const isSafe =
        currentDB.toLowerCase().includes("test") ||
        currentDB.toLowerCase().includes("jest");

    if (isSafe) {
        const collections = mongoose.connection.collections;
        await Promise.all(
            Object.values(collections).map((col) => col.deleteMany({}))
        );
        console.log(`✅ Cleaned up test database: "${currentDB}"`);
    } else {
        console.error(
            `⛔ SAFETY: Skipping cleanup — "${currentDB}" does not look like a test database`
        );
    }

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
        const res = await request(app)
            .post("/api/auth/register")
            .send(credentials);
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