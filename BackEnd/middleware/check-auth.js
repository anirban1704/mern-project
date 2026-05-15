import jwt from "jsonwebtoken";

import HttpError from "../models/http-error.js";

export default (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next();
    }
    try {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            throw new Error('Authentication Failed!');
        }
        const decodedToken = jwt.verify(token, process.env.JWT_KEY);
        req.userData = { userId: decodedToken.userId }
        next();
    } catch (err) {
        return next(new HttpError(
            'Authentication Failed!', 401
        ));
    }
};