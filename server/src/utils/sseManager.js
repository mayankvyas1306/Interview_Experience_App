/**
 * SSE Manager
 * 
 * Manages Server-Sent Events connections.
 * Each user can have one active SSE connection.
 * When an event occurs(upvote,comment), we look up
 * the recipient's connection push the event.
 */

// Map of userId(string) -> Set of Express response objects
const connections = new Map();

/**
 * Register a new SSE connection for user
 * @param {string} userId
 * @param {object} res -Express response object
 */
const addConnection = (userId, res) => {
    if (!connections.has(userId)) {
        connections.set(userId, new Set());
    }
    connections.get(userId).add(res);
    console.log(`[SSE-MGR] addConnection: userId=${userId}, total connections for user=${connections.get(userId).size}`);
    
    // Auto cleanup when the connection closes
    res.on("close", () => {
        console.log(`[SSE-MGR] res.close: removing connection for userId=${userId}`);
        removeConnectionRequest(userId, res);
    });
};

/**
 * Remove a specific connection request
 * @param {string} userId
 * @param {object} res
 */
const removeConnectionRequest = (userId, res) => {
    const userSet = connections.get(userId);
    if (userSet) {
        userSet.delete(res);
        if (userSet.size === 0) {
            connections.delete(userId);
        }
    }
};

/**
 * Remove all connections for a user
 * @param {string} userId
 */
const removeConnection = (userId) => {
    const userSet = connections.get(userId);
    if (userSet) {
        userSet.forEach(res => {
            try { res.end(); } catch {}
        });
        connections.delete(userId);
    }
};

/**
 * Send event to a specific user if they are connected
 * @param {string} userId
 * @param {string} eventType -e.g. "notification", "upvote_update"
 * @param {object} data
 * @returns {boolean} whether the user was connected and received it on at least one device
 */
const sendToUser = (userId, eventType, data) => {
    const userSet = connections.get(String(userId));
    console.log(`[SSE-MGR] sendToUser: userId=${userId}, connections found=${userSet ? userSet.size : 0}`);
    if (!userSet || userSet.size === 0) return false;

    let sent = false;
    userSet.forEach(res => {
        try {
            //SSE format: "event:<type>\ndata:<json>\n\n"
            res.write(`event: ${eventType}\n`);
            res.write(`data: ${JSON.stringify(data)}\n\n`);
            sent = true;
        } catch {
            removeConnectionRequest(String(userId), res);
        }
    });
    return sent;
};

/**
 * Get count of active connections (for monitoring)
 */
const getConnectionCount = () => {
    let count = 0;
    connections.forEach(set => { count += set.size; });
    return count;
};

module.exports = { addConnection, removeConnection, sendToUser, getConnectionCount };