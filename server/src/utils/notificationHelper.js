const Notification = require("../models/Notification");
const { sendToUser } = require("./sseManager");

/**
 * Create a notification and push it to the recipient via SSE if connected.
 * 
 * @param {object} Options
 * @param {string} options.recipientId - who recieves the notification
 * @param {string} options.senderId - who trigged it (can be null)
 * @param {string} options.type -"upvote"|"comment"|"system"
 * @param {string} options.postid - Related pos (can be null)
 * @param {string} options.message -Human readable message
 */

const createNotification = async ({
    recipientId,
    senderId,
    type,
    postId,
    message,
}) => {

    //Don't notify user about their own actions
    if (senderId && String(senderId) === String(recipientId)) {
        return null;
    }

    try {
        //upvote coooldown: dont send more than one upvote notification
        //per post per hour to avoid spam
        if (type === "upvote") {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            const recentNotification = await Notification.findOne({
                recipientId,
                type: "upvote",
                postId,
                createdAt: { $gte: oneHourAgo },
            });
            if (recentNotification) return null;//skip -notified recently
        }

        const notification = await Notification.create({
            recipientId,
            senderId,
            type,
            postId: postId || null,
            message,
        });

        //push to recipient if they have an active SSE connection
        sendToUser(String(recipientId), "notification", {
            id: notification._id,
            type: notification.type,
            message: notification.message,
            postId: notification.postId,
            createdAt: notification.createdAt,
        });

        return notification;
    } catch (err) {
        //Notification failure should never crash the main request
        console.error("Notification creation failed:", err.message);
        return null;
    }
}

module.exports = { createNotification };