const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
    {
        reporterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            required: true,
        },
        reason: {
            type: String,
            enum: ["spam", "inappropriate", "fake", "harassment", "other"],
            required: true,
        },
        details: {
            type: String,
            maxlength: 500,
            default: "",
        },
        status: {
            type: String,
            enum: ["pending", "reviewed", "dismissed", "actioned"],
            default: "pending",
        },
    },
    { timestamps: true }
);

//prevent duplicate report from same user on same post
reportSchema.index({ reporterId: 1, postId: 1 }, { unique: true });

//admin queue: pending report sorted by newest
reportSchema.index({ status: 1, createdAt: -1 });

const Report = mongoose.model("Report", reportSchema);
module.exports = Report;