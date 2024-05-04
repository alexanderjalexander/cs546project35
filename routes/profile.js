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
            return res.redirect('/profile/items');
        })
    })

router.route('/items/:itemId')
    .get(async (req, res) => {
        // Check Request Parameter
        try {
            req.params.itemId = help.checkIdString(req.params.itemId)
        } catch (e) {
            return res.status(400).render('profile_items', {
                title: "My Inventory",
                errors: [e],
                auth: req.session.user !== undefined,
                themePreference: req.session.user.themePreference,
                items: await itemData.getAllByUserId(req.session.user._id)
            });
        }

        // Check if item exists in database
        let item;
        try {
            item = await itemData.getById(req.params.itemId);
        } catch (e) {
            return res.status(404).render('profile_items', {
                title: "My Inventory",
                errors: [e],
                auth: req.session.user !== undefined,
                themePreference: req.session.user.themePreference,
                items: await itemData.getAllByUserId(req.session.user._id)
            });
        }

        // Checking if item belongs to user
        if (item.userId !== req.session.user._id) {
            return res.status(403).render('profile_items', {
                title: "My Inventory",
                errors: ['Error: that item does not belong to you.'],
                auth: req.session.user !== undefined,
                themePreference: req.session.user.themePreference,
                items: await itemData.getAllByUserId(req.session.user._id)
            });
        }

        res.render('profile_item', {
            title: `My Inventory - ${item.name}`,
            auth: req.session.user !== undefined,
            themePreference: req.session.user.themePreference,
            item
        })
    })
    .post(async (req, res) => {
        upload(req, res, async function (err) {
            // Check the itemId parameter to see if it's valid.
            try {
                req.params.itemId = help.checkIdString(req.params.itemId)
            } catch (e) {
                return res.status(400).render('profile_items', {
                    title: "My Inventory",
                    errors: [e],
                    auth: req.session.user !== undefined,
                    themePreference: req.session.user.themePreference,
                    items: await itemData.getAllByUserId(req.session.user._id)
                });
            }

            // Check if item exists in database
            let item;
            try {
                item = await itemData.getById(req.params.itemId);
            } catch (e) {
                return res.status(404).render('profile_items', {
                    title: "My Inventory",
                    errors: [e],
                    auth: req.session.user !== undefined,
                    themePreference: req.session.user.themePreference,
                    items: await itemData.getAllByUserId(req.session.user._id)
                });
            }

            // Check if item belongs to user
            if (item.userId !== req.session.user._id) {
                return res.status(403).render('profile_items', {
                    title: "My Inventory",
                    errors: ['Error: that item does not belong to you.'],
                    auth: req.session.user !== undefined,
                    themePreference: req.session.user.themePreference,
                    items: await itemData.getAllByUserId(req.session.user._id)
                });
            }

            // Check to see if some or all of the parameters exist.
            // One or the following must be present: name, desc, price, req.file
            if (req.body.name === '' &&
                req.body.desc === '' &&
                req.body.price === '' &&
                req.file === undefined) {
                return res.status(400).render('profile_item', {
                    title: `My Inventory - ${item.name}`,
                    errors: ['Error: You must at least one of the following: name, description, price, image.'],
                    auth: req.session.user !== undefined,
                    themePreference: req.session.user.themePreference,
                    item
                });
            }

            // Otherwise, check any supplied parameters and make sure they're valid.
            const errors = [];
            // let updatedItem = {
            //     name: req.body.name !== ''
            //         ? help.tryCatchHelper(errors, () => help.checkString(req.body.name, 'name'))
            //         : undefined,
            //     desc: req.body.desc !== ''
            //         ? help.tryCatchHelper(errors, () => help.checkString(req.body.desc, 'description'))
            //         : undefined,
            //     price: req.body.price !== ''
            //         ? help.tryCatchHelper(errors, () => help.checkPrice(Number(req.body.price), 'price'))
            //         : undefined,
            //     image: req.file !== undefined
            //         ? ('/' + req.file.path)
            //         : undefined,
            // };
            let updatedItem = {}
            if (req.body.name !== '') {
                updatedItem.name = help.tryCatchHelper(errors,
                    () => help.checkString(req.body.name, 'name'))
            }
            if (req.body.desc !== '') {
                updatedItem.desc = help.tryCatchHelper(errors,
                    () => help.checkString(req.body.desc, 'description'));
            }
            if (req.body.price !== '') {
                updatedItem.price = help.tryCatchHelper(errors,
                    () => help.checkPrice(Number(req.body.price), 'price'));
            }
            if (req.file !== undefined) {
                updatedItem.image = '/' + req.file.path;
            }

            if (errors.length !== 0) {
                return res.status(400).render('profile_item', {
                    title: `My Inventory - ${item.name}`,
                    errors,
                    auth: req.session.user !== undefined,
                    themePreference: req.session.user.themePreference,
                    item: item
                });
            }

            // We should be good! Try to update the item now.
            try {
                await itemData.update(req.params.itemId, req.session.user._id, updatedItem);
            } catch (e) {
                return res.status(500).render('profile_item', {
                    title: `My Inventory - ${item.name}`,
                    errors: [e],
                    auth: req.session.user !== undefined,
                    themePreference: req.session.user.themePreference,
                    item: item
                });
            }

            // If all successful, redirect
            return res.redirect(`/profile/items/${req.params.itemId}`);
        })
    })
    .delete(async (req, res) => {
        // Bad Request Checking
        try {
            req.params.itemId = help.checkIdString(req.params.itemId);
        } catch (e) {
            return res.status(400).render('profile_items', {
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
            return res.status(404).render('profile_items', {
                title: "My Inventory",
                errors: [e],
                auth: req.session.user !== undefined,
                themePreference: req.session.user.themePreference,
                items: await itemData.getAllByUserId(req.session.user._id)
            });
        }

        // Checking if item belongs to user
        if (item.userId !== req.session.user._id) {
            return res.status(403).render('profile_items', {
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
            return res.status(500).render('profile_items', {
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