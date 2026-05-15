import express from 'express';

import userController from '../controllers/user-controller.js';
import { check } from 'express-validator';
import fileUpload from '../middleware/file-upload.js';

const usersRouter = express.Router();

usersRouter.get('/', userController.fetchAllUsers);

usersRouter.post(
    '/signup',
    fileUpload.single('image'),
    [check('name').not().isEmpty().withMessage("Enter User Name."),
    check('email')
        .normalizeEmail()
        .isEmail().withMessage("Enter valid email."),
    check('password').isLength({ min: 8 }).withMessage("Invalid Password!")],
    userController.signup
);

usersRouter.post('/login', userController.login);

export default usersRouter;