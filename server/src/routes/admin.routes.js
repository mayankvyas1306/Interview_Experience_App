const express = require("express");
const { protect } = require("../middlewares/auth.middleware");
const { isAdmin } = require("../middlewares/admin.middleware");

const {
  getAdminStats,
  getAllPostsAdmin,
  adminDeletePost,
  getAllUsersAdmin,
  toggleBanUser,
  toggleAdminRole,
} = require("../controllers/admin.controller");

const { getReports, updateReportStatus, } = require("../controllers/report.controller");

const router = express.Router();

/**
 * Every admin route protected
 */
router.use(protect, isAdmin);

// DASHBOARD
router.get("/stats", getAdminStats);

// POSTS
router.get("/posts", getAllPostsAdmin);
router.delete("/posts/:id", adminDeletePost);

// USERS
router.get("/users", getAllUsersAdmin);
router.patch("/users/:id/ban", toggleBanUser);
router.patch("/users/:id/role", toggleAdminRole);

//REPORTS
router.get("/reports", getReports);
router.patch("/reports/:id", updateReportStatus);

module.exports = router;
