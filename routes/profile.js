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
            title: "My Inventory",
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
            if (req.file === undefined) {
                errors.push('Error: You must supply an image! Either in PNG')
            }

            if (err instanceof multer.MulterError) {
                // Multer Error occurred while uploading
                errors.push(err);
                return res.status(500).render('profile_items', {
                    title: "My Inventory",
                    errors: errors,
                    auth: req.session.user !== undefined,
                    themePreference: req.session.user.themePreference,
                    items: await itemData.getAllByUserId(req.session.user._id)
                });
            } else if (err instanceof TypeError) {
                // TypeError due to invalid file format
                errors.push(err);
                return res.status(400).render('profile_items', {
                    title: "My Inventory",
                    errors: errors,
                    auth: req.session.user !== undefined,
                    themePreference: req.session.user.themePreference,
                    items: await itemData.getAllByUserId(req.session.user._id)
                });
            } else if (err) {
                // Unknown error occurred
                errors.push(err);
                return res.status(500).render('profile_items', {
                    title: "My Inventory",
                    errors: errors,
                    auth: req.session.user !== undefined,
                    themePreference: req.session.user.themePreference,
                    items: await itemData.getAllByUserId(req.session.user._id)
                });
            } else if (errors.length !== 0) {
                // No multer error, but validation errors
                return res.status(400).render('profile_items', {
                    title: "My Inventory",
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
                    title: "My Inventory",
                    errors: [e],
                    auth: req.session.user !== undefined,
                    themePreference: req.session.user.themePreference,
                    items: await itemData.getAllByUserId(req.session.user._id)
                });
            }
            res.redirect('/profile/items');
        })
    })

router.route('/items/:itemId')
    .patch(async (req, res) => {
        // TODO: not implemented yet
        res.redirect('/profile/items');
    })
    .delete(async (req, res) => {
        // Bad Request Checking
        try {
            req.params.itemId = help.checkIdString(req.params.itemId);
        } catch (e) {
            res.status(400).render('profile_items', {
                title: "My Inventory",
                errors: [e],
                auth: req.session.user !== undefined,
                themePreference: req.session.user.themePreference,
                items: await itemData.getAllByUserId(req.session.user._id)
            });
        }

        // Checking if item even exists
        let item;
        try {
            item = await itemData.getById(req.params.itemId);
        } catch (e) {
            res.status(404).render('profile_items', {
                title: "My Inventory",
                errors: [e],
                auth: req.session.user !== undefined,
                themePreference: req.session.user.themePreference,
                items: await itemData.getAllByUserId(req.session.user._id)
            });
        }

        // Checking if item belongs to user
        if (item.userId !== req.session.user._id) {
            res.status(403).render('profile_items', {
                title: "My Inventory",
                errors: ['Error: you are not authorized to delete that item. It is not yours.'],
                auth: req.session.user !== undefined,
                themePreference: req.session.user.themePreference,
                items: await itemData.getAllByUserId(req.session.user._id)
            });
        }

        // All is ok. Proceed to remove the item and update the user's collection.
        // If an error is thrown, then it must be a server-side error.
        try {
            await itemData.remove(req.params.itemId, req.session.user._id);
        } catch (e) {
            res.status(500).render('profile_items', {
                title: "My Inventory",
                errors: [`Error: something wrong happened on the serverside: (${e.message}).`],
                auth: req.session.user !== undefined,
                themePreference: req.session.user.themePreference,
                items: await itemData.getAllByUserId(req.session.user._id)
            });
        }

        res.redirect('/profile/items');
    })

export default router;