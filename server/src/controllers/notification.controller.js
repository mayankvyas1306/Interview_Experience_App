const Notification = require("../models/Notification");
const { addConnection, removeConnection, getConnectionCount } = require("../utils/sseManager");

//SSE Stream-client connects here to receive real - time events

const streamNotifications = (req, res) => {
    const userId = String(req.user._id);

    // Set SSE headers FIRST before anything else
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    // Flush headers immediately so the client knows the stream started
    res.flushHeaders();

    addConnection(userId, res);
    console.log(`[SSE] ✅ Connection established for userId=${userId}. Active connections: ${getConnectionCount()}`);

    res.write(`event: connected\ndata: ${JSON.stringify({ message: "Connected" })}\n\n`);

    const heartbeat = setInterval(() => {
        if (res.writableEnded) {
            clearInterval(heartbeat);
            return;
        }
        try {
            res.write(`: heartbeat\n\n`);
        } catch {
            clearInterval(heartbeat);
        }
    }, 30000);

    req.on("close", () => {
        console.log(`[SSE] ❌ Connection closed for userId=${userId}`);
        clearInterval(heartbeat);
        // sseManager handles res.on('close') for the individual connection cleanly.
    });

    req.on("error", () => {
        console.log(`[SSE] ⚠️ Connection error for userId=${userId}`);
        clearInterval(heartbeat);
    });
};

const getNotifications = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(Number(req.query.limit) || 20, 50);
        const skip = (page - 1) * limit;

        const [notifications, total, unreadCount] = await Promise.all([
            Notification.find({ recipientId: userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("senderId", "fullName")
                .populate("postId", "companyName role")
                .lean(),
            Notification.countDocuments({ recipientId: userId }),
            Notification.countDocuments({ recipientId: userId, read: false }),
        ]);

        res.json({ notifications, total, unreadCount, page, totalPages: Math.ceil(total / limit) });
    } catch (err) {
        next(err);
    }
};


const getUnreadCount = async (req, res, next) => {
    try {
        const count = await Notification.countDocuments({
            recipientId: req.user._id,
            read: false,
        });
        res.json({ count });
    } catch (err) {
        next(err);
    }
};


const markAllRead = async (req, res, next) => {
    try {
        await Notification.updateMany(
            { recipientId: req.user._id, read: false },
            { read: true }
        );
        res.json({ message: "All notifications marked as read" });
    } catch (err) {
        next(err);
    }
};

const markOneRead = async (req, res, next) => {
    try {
        await Notification.updateOne(
            { _id: req.params.id, recipientId: req.user._id },
            { read: true }
        );
        res.json({ message: "Notification marked as read" });
    } catch (err) {
        next(err);
    }
};


const clearNotifications = async (req, res, next) => {
    try {
        await Notification.deleteMany({ recipientId: req.user._id });
        res.json({ message: "Notifications cleared" });
    } catch (err) {
        next(err);
    }
};


module.exports = {
    streamNotifications,
    getNotifications,
    getUnreadCount,
    markAllRead,
    markOneRead,
    clearNotifications,
};