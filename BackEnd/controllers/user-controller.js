import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import HttpError from "../models/http-error.js";
import { validationResult } from 'express-validator';
import User from '../models/user.js';

async function AlreadyExist(email) {
    let hasUser;
    try {
        hasUser = await User.findOne({ email: email });
    } catch (err) {
        throw new HttpError('Find unique email faild', 500)
    }
    if (hasUser) {
        throw new HttpError('User exists already, Please login insted', 422);
    }
}

async function fetchAllUsers(req, res, next) {
    let DUMMY_USER;
    try {
        DUMMY_USER = await User.find({}, '-password');
    } catch (err) {
        return next(new HttpError(
            'Something went wrong at the time of fetch user.', 500
        ));
    }
    if (!DUMMY_USER || DUMMY_USER.length === 0) {
        return next(new HttpError('Could not found any users.', 404));
    }
    res.status(200).json({ users: DUMMY_USER.map((item) => item.toObject({ getters: true })) });
}

async function signup(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError(errors.array().map((item) => item.msg).join(' & '), 422));
    }

    const { name, email, password } = req.body;
    let hanshPassword;
    try {
        hanshPassword = await bcrypt.hash(password, 12);
    } catch (err) {
        return next(new HttpError(
            'Could not create user, please try again.',
            500
        ));
    }
    const createdUser = new User({
        name,
        email,
        image: req.file.path.replace(/\\/g, "/"),
        password: hanshPassword,
        places: []
    });
    try {
        await AlreadyExist(email);
        await createdUser.save();
    } catch (err) {
        return next(new HttpError(
            err.message || 'Sign up failed, Please try again.', err.code || 500
        ));
    }

    let token;
    try {
        token = jwt.sign({ userId: createdUser.id, email: createdUser.email },
            process.env.JWT_KEY,
            { expiresIn: '1h' }
        )
    } catch (err) {
        return next(new HttpError(
            err.message || 'Sign up failed, Please try again.', err.code || 500
        ));
    }

    res
        .status(201)
        .json({ userId: createdUser.id, email: createdUser.email, token: token });
}

async function login(req, res, next) {
    const { email, password } = req.body;
    let identifiedUser;
    try {
        identifiedUser = await User.findOne({ email: email });
    } catch (err) {
        return next(new HttpError(
            'Logging in failed, please try again.', 500
        ));
    }
    if (!identifiedUser) {
        return next(new HttpError('Invalid credentials, could not log you in.', 401));
    }
    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, identifiedUser.password);
    } catch (err) {
        return next(new HttpError(
            'Could not log you in, please check your credentials and try again.',
            500
        ));
    }
    if (!isValidPassword) {
        return next(new HttpError('Invalid credentials, could not log you in.', 401));
    }

    let token;
    try {
        token = jwt.sign({ userId: identifiedUser.id, email: identifiedUser.email },
           process.env.JWT_KEY,
            { expiresIn: '1h' }
        )
    } catch (err) {
        return next(new HttpError(
            err.message || 'Login failed, Please try again.', err.code || 500
        ));
    }
    res.status(200).json({ userId: identifiedUser.id, email: identifiedUser.email, token: token });
}

export default {
    fetchAllUsers,
    signup,
    login
};