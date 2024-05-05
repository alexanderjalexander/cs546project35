//this will have all the routes that begin with /items
import { Router } from 'express';
import * as helper from '../helpers.js';
import itemData from '../data/items.js';
import multer from 'multer';
import { multerConfig } from '../config/multerConfig.js';
import xss from "xss";
import * as help from "../helpers.js";

const router = Router();
const upload = multer(multerConfig).single('image');

//GET route to view all items in the community
router.get('/', async (req, res) => {
    try {
        let items;
        if (req.session.user !== undefined) {
            items = await itemData.getAllExceptUserId(req.session.user._id)
        } else {
            items = await itemData.getAll();
        }
        return res.render('items', {
            title: "All Community Items",
            auth: req.session.user !== undefined,
            themePreference: req.session.user !== undefined ? req.session.user.themePreference : 'light',
            items: items
        });
    } 
    catch (error) {
        res.status(500).send({error: error.toString()});
    }
});

//GET route to view a specific item
router.get('/:itemid', async (req, res) => {
    try {
        const itemid = helper.checkIdString(req.params.itemid);
        const item = await itemData.getById(itemid);
        return res.render('item', {
            title: "View Item",
            auth: req.session.user !== undefined,
            themePreference: req.session.user !== undefined ? req.session.user.themePreference : 'light',
            item: item
        });
    } 
    catch (error) {
        return res.status(404).send({error: error.toString()});
    }
});


//POST route to create new item via quick add form
router.route('/')
    .post(async (req, res) => {
        upload(req, res, async function (err) {
            // Input cleaning
            let cleanName = xss(req.body.name);
            let cleanDesc = xss(req.body.desc);
            let cleanPrice = Number(xss(req.body.price));

            // Input checking
            const errors = [];
            const name = help.tryCatchHelper(errors,
                () => help.checkString(cleanName, 'Item Name'));
            const desc = help.tryCatchHelper(errors,
                () => help.checkString(cleanDesc, 'Item Description'));
            req.body.price = Number(req.body.price);
            const price = help.tryCatchHelper(errors,
                () => help.checkPrice(cleanPrice, 'Item Price'));

            // If errors occurred, propagate them back to the user
            if (err instanceof multer.MulterError || err) {
                // Multer Error occurred while uploading
                errors.push('Error: ' + err.message);
                return res.status(500).json({success: false, errors: errors});
            } else if (err instanceof TypeError) {
                // TypeError due to invalid file format
                errors.push(err);
                return res.status(400).json({success: false, errors: errors});
            } else if (req.file === undefined) {
                errors.push('Error: You must supply an image, either in .png, .jpeg, or .jpg formats.');
                return res.status(400).json({success: false, errors: errors});
            } else if (errors.length !== 0) {
                // No multer error, but validation errors
                return res.status(400).json({success: false, errors: errors});
            }

            let item;
            try {
                item = await itemData.create(req.session.user._id, name, desc, price, '/' + req.file.path)
            } catch (e) {
                return res.status(500).json({success: false, errors: ['']});
            }

            return res.json({success: true, item: item})
        })
    })


export default router;