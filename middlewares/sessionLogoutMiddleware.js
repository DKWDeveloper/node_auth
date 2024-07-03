const activeSessions = new Map();

const sessionLogoutMiddleware = async (req, res, next) => {

    const { userId } = req.body;

    if (userId) {
        if (activeSessions.has(userId)) {
            // Destroy previous session
            const previousSession = activeSessions.get(userId);
            previousSession.destroy(err => {
                if (err) {
                    console.error('Failed to destroy session:', err);
                }
            });
        }

        // Store the new session
        activeSessions.set(userId, req.session);
    }

    next();

    // if (!req.session.userId) {
    //     return next();
    // }

    // const currentSessionId = req.sessionID;
    // const userId = req.session.userId;

    // redisClient.get(`user:${userId}`, (err, sessionId) => {
    //     if (err) {
    //         return next(err);
    //     }

    //     if (sessionId && sessionId !== currentSessionId) {
    //         req.session.destroy(err => {
    //             if (err) {
    //                 return next(err);
    //             }
    //             res.redirect('/login');
    //         });
    //     } else {
    //         redisClient.set(`user:${userId}`, currentSessionId, next);
    //     }
    // });
};

export default sessionLogoutMiddleware;


