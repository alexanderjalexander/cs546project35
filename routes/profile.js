//this will have all the routes that deal with viewing your own profile and items.
import {Router} from 'express';
const router = Router();
import * as help from '../helpers.js';
import itemData from '../data/items.js'

import {multerConfig} from "../config/multerConfig.js";
import multer from "multer";
import {ObjectId} from "mongodb";
const upload = multerConfig.single('image');

router.route('/items')
    .get(async (req, res) => {
        return res.render('profile_items', {
            title: "My Profile - Items",
            auth: req.session.user !== undefined,
            themePreference: req.session.user.themePreference,
            items: await itemData.getAllByUserId(req.session.user._id)
        });
    })
    .post(async (req, res) => {
        upload(req, res, async function (err) {
            // Input checking
            const errors = [];
            const name = help.tryCatchHelper(errors,
                () => help.checkString(req.body.name, 'Item Name'));
            const desc = help.tryCatchHelper(errors,
                () => help.checkString(req.body.desc, 'Item Description'));
            req.body.price = Number(req.body.price);
            const price = help.tryCatchHelper(errors,
                () => help.checkPrice(req.body.price, 'Item Price'));

            if (err instanceof multer.MulterError) {
                // Multer Error occurred while uploading
                errors.push(err);
                return res.status(500).render('profile_items', {
                    title: "My Profile - Items",
                    errors: errors,
                    auth: req.session.user !== undefined,
                    themePreference: req.session.user.themePreference,
                    items: await itemData.getAllByUserId(req.session.user._id)
                });
            } else if (err instanceof TypeError) {
                // TypeError due to invalid file format
                errors.push(err);
                return res.status(400).render('profile_items', {
                    title: "My Profile - Items",
                    errors: errors,
                    auth: req.session.user !== undefined,
                    themePreference: req.session.user.themePreference,
                    items: await itemData.getAllByUserId(req.session.user._id)
                });
            } else if (err) {
                // Unknown error occurred
                errors.push(err);
                return res.status(500).render('profile_items', {
                    title: "My Profile - Items",
                    errors: errors,
                    auth: req.session.user !== undefined,
                    themePreference: req.session.user.themePreference,
                    items: await itemData.getAllByUserId(req.session.user._id)
                });
            } else if (errors.length !== 0) {
                // No multer error, but validation errors
                return res.status(400).render('profile_items', {
                    title: "My Profile - Items",
                    errors: errors,
                    auth: req.session.user !== undefined,
                    themePreference: req.session.user.themePreference,
                    items: await itemData.getAllByUserId(req.session.user._id)
                });
            }

            try {
                await itemData.create(req.session.user._id, name, desc, price, '/' + req.file.path)
            } catch (e) {
                return res.status(500).render('profile_items', {
                    title: "My Profile - Items",
                    errors: [e],
                    auth: req.session.user !== undefined,
                    themePreference: req.session.user.themePreference,
                    items: await itemData.getAllByUserId(req.session.user._id)
                });
            }
            res.redirect('/profile/items');
        })
    })

    .post('/profiles/:profileId/follow', async (req, res) => {
        if (!req.session.user) {
            return res.status(403).send("Unauthorized");
        }
        try {
            await profileData.followUser(req.session.user._id, req.params.profileId);
            res.redirect('/profiles/' + req.params.profileId);
        } catch (error) {
            res.status(500).send(error.message);
        }
    })
    

    .delete((req, res) => {
        res.redirect('/profile/items');
    })
    // .post(upload, (req, res, cb) => {
    //     // Input checking
    //     const errors = [];
    //     const name = help.tryCatchHelper(errors,
    //         () => help.checkString(req.body.name, 'Item Name'));
    //     const desc = help.tryCatchHelper(errors,
    //         () => help.checkString(req.body.desc, 'Item Description'));
    //     req.body.price = Number(req.body.price);
    //     const price = help.tryCatchHelper(errors,
    //         () => help.checkPrice(req.body.price, 'Item Price'));
    //
    //     // TODO: Handle other logic for item image upload
    //     res.redirect('/profile/items');
    // })



// the follow route for profiles
router.post('/profiles/:profileId/follow', async (req, res) => {
    if (!req.session.user) {
        return res.status(403).send("Unauthorized");
    }
    try {
        await profileData.followUser(req.session.user._id, req.params.profileId);
        res.redirect('/profiles/' + req.params.profileId);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// the review route for profiles
router.post('/profiles/:profileId/review', async (req, res) => {
    if (!req.session.user) {
        return res.status(403).send("Unauthorized");
    }

    const reviewContent = req.body.review;
    if (!reviewContent) {
        return res.status(400).send("Review content cannot be empty");
    }

    try {
        await profileData.addReviewToProfile(req.params.profileId, req.session.user._id, reviewContent);
        res.redirect('/profiles/' + req.params.profileId);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

export default router;