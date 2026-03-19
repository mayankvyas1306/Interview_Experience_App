const mongoose = require("mongoose");

const saveSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true,
    },
}, { timestamps: true });

//compound unique index prevents duplicate saves at DB level
saveSchema.index({ userId: 1, postId: 1 }, { unique: true });

saveSchema.index({ userId: 1, createdAt: -1 });

saveSchema.index({ postId: 1 });

const Save = mongoose.model("Save", saveSchema);

module.exports = Save;