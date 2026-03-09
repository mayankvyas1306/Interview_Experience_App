const mongoose = require("mongoose");

const upvoteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        res: "User",
        required: true,
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        res: "Post",
        required: true,
    },
}, { timestamps: true });

//compound unique index prevents duplicate upvotes at DB level
upvoteSchema.index({ userId: 1, postId: 1 }, { unique: true });

upvoteSchema.index({ postId: 1 });

upvoteSchema.index({ userId: 1 });

const Upvote = mongoose.model("Upvote", upvoteSchema);

module.exports = Upvote;