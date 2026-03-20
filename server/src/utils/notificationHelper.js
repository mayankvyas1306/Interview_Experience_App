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

    console.log(`[NOTIFY] createNotification called: type=${type}, recipient=${recipientId}, sender=${senderId}`);
    //Don't notify user about their own actions
    if (senderId && String(senderId) === String(recipientId)) {
        console.log(`[NOTIFY] ⚠️ Skipping self-notification`);
        return null;
    }

    try {
        // Anti-spam cooldown removed for easier testing in portfolio mode.

        const notification = await Notification.create({
            recipientId,
            senderId,
            type,
            postId: postId || null,
            message,
        });

        //push to recipient if they have active SSE connections
        const delivered = sendToUser(String(recipientId), "notification", {
            _id: String(notification._id),
            type: notification.type,
            message: notification.message,
            postId: notification.postId,
            createdAt: notification.createdAt,
            read: false,
        });
        console.log(`[NOTIFY] SSE dispatch for recipient=${recipientId}: delivered=${delivered}`);

        return notification;
    } catch (err) {
        //Notification failure should never crash the main request
        console.error("Notification creation failed:", err.message);
        return null;
    }
}

module.exports = { createNotification };