import mongoose from 'mongoose';
import fs from 'fs';

import HttpError from '../models/http-error.js';
import { validationResult } from 'express-validator';
import getCordsForAddress from '../util/location.js';
import Place from '../models/place.js';
import User from '../models/user.js';

async function getPlaceById(req, res, next) {
    const placeId = req.params.pid;
    let place;

    try {
        place = await findPlaceById(placeId);
    } catch (err) {
        return next(err);
    }

    res.json({ place: place.toObject({ getters: true }) });
}

async function getPlacesByUserId(req, res, next) {
    const userId = req.params.uid;
    let places;
    try {
        places = await Place.find({
            creator: userId
        });
    } catch (err) {
        return next(new HttpError(
            'Something went wrong, could not find places', 500
        ));
    }
    if (!places || places.length === 0) {
        return next(new HttpError(
            'Could not find a place for provided user id.', 404
        ));
    }

    res.json({ places: places.map(item => item.toObject({ getters: true })) });
}

async function createPlace(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid input passed, please check your data.', 422));
    }

    const { title, description, address} = req.body;
    let coordinate;

    try {
        coordinate = await getCordsForAddress(address);
    } catch (err) {
        return next(err);
    }
   
    const createdPlace = new Place({
        title,
        description,
        image: req.file.path.replace(/\\/g, "/"),
        address,
        location: coordinate,
        creator: req.userData.userId,
    });
    let user;
    try {
        user = await User.findById(req.userData.userId);
    } catch (err) {
        return next(new HttpError(
            'Creating place failed, please try again. ' + err, 500
        ));
    }
    if (!user) {
        return next(new HttpError(
            'Could not find a user from provided creator.', 404
        ));
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdPlace.save({ session: sess });
        user.places.push(createdPlace);
        await user.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        return next(new HttpError(
            'Creating place failed, please try again. ' + err, 500
        ));
    }

    res.status(201).json({ place: createdPlace });
}

async function updatePlace(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid input passed, please check your data.', 422));
    }

    const placeId = req.params.pid;
    const { title, description } = req.body;
    let place;

    try {
        place = await findPlaceById(placeId);
    } catch (err) {
        return next(err);
    }
    if (place.creator.toString() !== req.userData.userId) {
        return next(new HttpError(
            'You are not allowed to edit this place.', 401
        ));
    }

    place.title = title;
    place.description = description;

    try {
        await place.save();
    } catch (err) {
        return next(new HttpError(
            'Something went wrong could not update place.', 500
        ));
    }

    res.status(200).json({ place: place.toObject({ getters: true }) });
}

async function deletePlace(req, res, next) {
    const placeId = req.params.pid;
    let place;

    try {
        place = await findPlaceById(placeId);
    } catch (err) {
        return next(err);
    }
    if (place.creator.toString() !== req.userData.userId) {
        return next(new HttpError(
            'You are not allowed to delete this place.', 401
        ));
    }
    const imagePath = place.image;
    try {
        place = await place.populate('creator');
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await place.deleteOne({ session: sess });
        place.creator.places.pull(place);
        await place.creator.save({ session: sess });
        await sess.commitTransaction();

        fs.unlink(imagePath, (err) => {
            console.error(err);
        })
    } catch (err) {
        return next(new HttpError(
            'Something went wrong at the time of delete place. ' + err, 500
        ));
    }
    res.status(200).json({ message: "Deleted Place." });
}

async function findPlaceById(placeId) {
    let place;
    try {
        place = await Place.findById(placeId);
    } catch (err) {
        throw new HttpError(
            'Something went wrong could not find a place.', 500
        );
    }
    if (!place) {
        throw new HttpError(
            'Could not find a place with provided id.', 404
        );
    }

    return place;
}

export default {
    getPlaceById,
    getPlacesByUserId,
    createPlace,
    updatePlace,
    deletePlace
};