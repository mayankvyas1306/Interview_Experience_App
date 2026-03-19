const express = require("express");
const { protect } = require("../middlewares/auth.middleware");
const { submitReport } = require("../controllers/report.controller");
const validate = require("../middlewares/validateZod.middleware");
const { z } = require("zod");

const reportSchema = z.object({
    reason: z.enum(["spam", "inappropriate", "fake", "harassment", "other"]),
    details: z.string().max(500).optional().default(""),
});

const router = express.Router();

router.post("/:postId", protect, validate(reportSchema), submitReport);

module.exports = router;