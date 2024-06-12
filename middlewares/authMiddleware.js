import jwt from 'jsonwebtoken';
import userModel from '../models/user.js';

const checkUserAuthMiddleware = async (req, res, next) => {
    let token;
    const { authorization } = req.headers;
    if (authorization && authorization.startsWith('Bearer')) {
        try {
            //Get Token from Header
            token = authorization.split(' ')[1];

            //verify Token
            const { userId } = jwt.verify(token, process.env.JWT_SECRET_KEY);
            req.user = await userModel.findById(userId);
            // req.user = await userModel.findById(userId).select('-password')
            next();
        } catch (error) {
            console.log(error);
            res.status(401).send({ "status": "failed", "message": "Unauthorized User" });
        }
    } else {
        if (!token) {
            res.status(401).send({ "status": "failed", "message": "Unauthorized User, No Token" });
        }
    }
}

// function authenticateToken(req, res, next) {
//     const token = req.header('Authorization');
//     if (!token) return res.status(401).json({ message: 'Unauthorized' });

//     jwt.verify(token, secretKey, (err, user) => {
//         if (err) return res.status(403).json({ message: 'Forbidden' });
//         req.user = user;
//         next();
//     });
// }

export default checkUserAuthMiddleware;