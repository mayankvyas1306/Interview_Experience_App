/**
 * SSE Manager
 * 
 * Manages Server-Sent Events connections.
 * Each user can have one active SSE connection.
 * When an event occurs(upvote,comment), we look up
 * the recipient's connection push the event.
 */

//Map of userId(string) -> Express response object
const connections = new Map();

/**
 * Register a new SSE connection for user
 * @param {string} userId
 * @param {object} res -Express response object
 */

const addConnection = (userId, res) => {
    //If user already has a connection, close it first
    if (connections.has(userId)) {
        try {
            connections.get(userId).end();
        } catch {
            //Already closed
        }
    }
    connections.set(userId, res);
};

/**
 * Remove a connection when client disconnects
 * @param {string} userId
 */

const removeConnection = (userId) => {
    connections.delete(userId);
};

/**
 * Send event to a specific user if they are connected
 * @param {string} userId
 * @param {string} eventType -e.g. "notification", "upvote_update"
 * @param {object} data
 * @returns {boolean} whether the user was connected
 */

const sendToUser = (userId, eventType, data) => {
    const res = connections.get(String(userId));
    if (!res) return false;

    try {
        //SSE format: "event:<type>\ndata:<json>\n\n"
        res.write(`event: ${eventType}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
        return true;
    } catch {
        //connection was closed without cleanup
        removeConnection(String(userId));
        return false;
    }
};
/**
 * Get count of active connections (for monitoring)
 */

const getConnectionCount = () => connections.size;

module.exports = { addConnection, removeConnection, sendToUser, getConnectionCount }