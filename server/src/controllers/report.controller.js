const Report = require("../models/Report");
const Post = require("../models/Post");
const AppError = require("../utils/AppError");

const submitReport = async (req, res, next) => {
    try {
        const { reason, details } = req.body;
        const postId = req.params.postId;
        const reporterId = req.user._id;

        const post = await Post.findById(postId).lean();
        if (!post) {
            throw new AppError("Post not found", 404);
        }

        // Can't report your own post
        if (String(post.authorId) === String(reporterId)) {
            throw new AppError("You cannot report your own post", 400);
        }

        const report = await Report.create({
            reporterId,
            postId,
            reason,
            details: details || "",
        });

        res.status(201).json({ message: "Report submitted. Our team will review it.", report });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: "You have already reported this post" });
        }
        next(err);
    }
};

//GET REPORTS — admin only, paginated

const getReports = async (req, res, next) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(Number(req.query.limit) || 20, 100);
        const skip = (page - 1) * limit;
        const status = req.query.status || "pending";

        const [reports, total] = await Promise.all([
            Report.find({ status })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("reporterId", "fullName email")
                .populate("postId", "companyName role authorId")
                .lean(),
            Report.countDocuments({ status }),
        ]);

        res.json({ reports, total, page, totalPages: Math.ceil(total / limit) });
    } catch (err) {
        next(err);
    }
};


// UPDATE REPORT STATUS — admin only
const updateReportStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const validStatuses = ["reviewed", "dismissed", "actioned"];

        if (!validStatuses.includes(status)) {
            throw new AppError(`Status must be one of: ${validStatuses.join(", ")}`, 400);
        }

        const report = await Report.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!report) {
            throw new AppError("Report not found", 404);
        }

        res.json({ message: "Report status updated", report });
    } catch (err) {
        next(err);
    }
};

module.exports = { submitReport, getReports, updateReportStatus };