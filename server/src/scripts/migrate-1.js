/**
 * Phase 1 Migration Script
 * 
 * What this does:
 * 1. Reads upvotedBy arrays from Post documents
 * 2. Creates Upvote documents for each entry
 * 3. Reads savedPosts arrays from User documents  
 * 4. Creates Save documents for each entry
 * 5. Removes the old arrays from Post and User
 * 
 * HOW TO RUN:
 *   cd server
 *   node src/scripts/migrate-phase1.js
 * 
 * IMPORTANT: Run this ONCE on your existing database before deploying.
 * It is idempotent — running it twice will not create duplicates
 * because the unique index on Upvote/Save will reject duplicates.
 */

require("dotenv").config();
const mongoose = require("mongoose");

// We need the OLD models temporarily to read the old fields
// So we define inline schemas here that include the old arrays
const OldPostSchema = new mongoose.Schema({
  upvotedBy: [{ type: mongoose.Schema.Types.ObjectId }],
  upvotesCount: Number,
}, { strict: false });

const OldUserSchema = new mongoose.Schema({
  savedPosts: [{ type: mongoose.Schema.Types.ObjectId }],
}, { strict: false });

const OldPost = mongoose.model("OldPost", OldPostSchema, "posts");
const OldUser = mongoose.model("OldUser", OldUserSchema, "users");

// New models
const UpvoteSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  postId: mongoose.Schema.Types.ObjectId,
}, { timestamps: true });
UpvoteSchema.index({ userId: 1, postId: 1 }, { unique: true });
const Upvote = mongoose.model("Upvote", UpvoteSchema);

const SaveSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  postId: mongoose.Schema.Types.ObjectId,
}, { timestamps: true });
SaveSchema.index({ userId: 1, postId: 1 }, { unique: true });
const Save = mongoose.model("Save", SaveSchema);

async function migrate() {
  console.log("Connecting to database...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected.\n");

  // ── STEP 1: Migrate upvotes ──
  console.log("Step 1: Migrating upvotes...");
  const posts = await OldPost.find({ upvotedBy: { $exists: true, $ne: [] } });
  console.log(`Found ${posts.length} posts with upvotes to migrate.`);

  let upvotesMigrated = 0;
  let upvotesSkipped = 0;

  for (const post of posts) {
    for (const userId of post.upvotedBy) {
      try {
        await Upvote.create({ userId, postId: post._id });
        upvotesMigrated++;
      } catch (err) {
        if (err.code === 11000) {
          upvotesSkipped++; // Already exists, safe to skip
        } else {
          console.error(`Error migrating upvote: userId=${userId} postId=${post._id}`, err.message);
        }
      }
    }
  }

  console.log(`Upvotes migrated: ${upvotesMigrated}, skipped (already existed): ${upvotesSkipped}`);

  // ── STEP 2: Migrate saves ──
  console.log("\nStep 2: Migrating saved posts...");
  const users = await OldUser.find({ savedPosts: { $exists: true, $ne: [] } });
  console.log(`Found ${users.length} users with saved posts to migrate.`);

  let savesMigrated = 0;
  let savesSkipped = 0;

  for (const user of users) {
    for (const postId of user.savedPosts) {
      try {
        await Save.create({ userId: user._id, postId });
        savesMigrated++;
      } catch (err) {
        if (err.code === 11000) {
          savesSkipped++;
        } else {
          console.error(`Error migrating save: userId=${user._id} postId=${postId}`, err.message);
        }
      }
    }
  }

  console.log(`Saves migrated: ${savesMigrated}, skipped (already existed): ${savesSkipped}`);

  // ── STEP 3: Verify upvotesCount is accurate ──
  console.log("\nStep 3: Verifying upvotesCount accuracy...");
  const allPosts = await OldPost.find({});
  let countFixed = 0;

  for (const post of allPosts) {
    const actualCount = await Upvote.countDocuments({ postId: post._id });
    if (post.upvotesCount !== actualCount) {
      await OldPost.updateOne({ _id: post._id }, { upvotesCount: actualCount });
      countFixed++;
    }
  }

  console.log(`Fixed upvotesCount on ${countFixed} posts.`);

  // ── STEP 4: Remove old arrays from documents ──
  console.log("\nStep 4: Removing old upvotedBy and savedPosts arrays...");

  const postUpdateResult = await OldPost.updateMany(
    { upvotedBy: { $exists: true } },
    { $unset: { upvotedBy: "" } }
  );
  console.log(`Removed upvotedBy from ${postUpdateResult.modifiedCount} posts.`);

  const userUpdateResult = await OldUser.updateMany(
    { savedPosts: { $exists: true } },
    { $unset: { savedPosts: "" } }
  );
  console.log(`Removed savedPosts from ${userUpdateResult.modifiedCount} users.`);

  console.log("\n Migration complete!");
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});