import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

import placesRoutes from './routes/places-routes.js';
import userRoutes from './routes/users-routes.js';
import HttpError from "./models/http-error.js";

dotenv.config();
const app = express();

app.use(bodyParser.json());

app.use('/uploads/images', express.static(path.join('uploads', 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PATCH, DELETE'
    );
    next();
});

app.use('/api/places', placesRoutes);

app.use('/api/users', userRoutes);

app.use((req, res, next) => {
    const error = new HttpError('Could not found this route.', 404);
    throw error;
});

app.use((error, req, res, next) => {
    if (req.file) {
        fs.unlink(req.file.path, (err) => {
            console.log(err);
        });
    }
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500);
    res.json({ message: error.message || 'An unknown error occured!' });
});

mongoose
    .connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@ac-yvndkmp-shard-00-00.tnhpewp.mongodb.net:27017,ac-yvndkmp-shard-00-01.tnhpewp.mongodb.net:27017,ac-yvndkmp-shard-00-02.tnhpewp.mongodb.net:27017/${process.env.DB_NAME}?ssl=true&replicaSet=atlas-11jrzs-shard-0&authSource=admin&appName=Cluster0`)
    .then(() => app.listen(5000, () => console.log("Server running on port 5000.")))
    .catch(err => console.log('Could not connect to database. ' + err))

//20YourPlace26