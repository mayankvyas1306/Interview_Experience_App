const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null //null for system notifications
    },
    type: {
        type: String,
        enum: ["upvote", "comment", "system"],
        required: true
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        default: null,
    },
    message: {
        type: String,
        required: true,
        maxlength: 200,
    },
    read: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

//fetch unread notifications for a user - most common query
notificationSchema.index({ recipientId: 1, read: 1, createdAt: -1 });

// Feed query: all notifications for a user, newest first
notificationSchema.index({ recipientId: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;