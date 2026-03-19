const express = require("express");
const { protect } = require("../middlewares/auth.middleware");
const {
    streamNotifications,
    getNotifications,
    getUnreadCount,
    markAllRead,
    markOneRead,
    clearNotifications,
} = require("../controllers/notification.controller");

const router = express.Router();

// All notification routes require auth
router.use(protect);

router.get("/stream", streamNotifications);
router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.patch("/mark-read", markAllRead);
router.patch("/:id/read", markOneRead);
router.delete("/", clearNotifications);

module.exports = router;