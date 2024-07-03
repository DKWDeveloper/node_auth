import Session from '../models/session.js';

// middleware/checkSession.js
const checkSession = async (req, res, next) => {
    const { userId } = req.session;
    console.log(req.session, )
    console.log(userId)

    if (!userId) {
        return next();
    }

    try {
        // Find the latest session for the user
        const latestSession = await Session.findOne({ userId }).sort({ createdAt: -1 });

        // If the current session is not the latest, destroy the session
        if (latestSession && latestSession.sessionId !== req.sessionID) {
            req.session.destroy();
        }

        return next();
    } catch (err) {
        console.error('Error checking session:', err);
        return next(err);
    }
};

export default checkSession;