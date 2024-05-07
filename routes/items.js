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

router.get('/', async (req, res) => {
    try {
        const filter = req.query.filter;
        let items;
        if (req.session.user !== undefined) {
            items = await itemData.getAllExceptUserId(req.session.user._id)
        } else {
            items = await itemData.getAll();
        }
        switch (String(filter)) {
            case 'value':
                items = items.sort((a, b) => a.price - b.price);
                break;
            case 'name':
                items = items.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'followedUsers':
                if (req.session.user) {
                    items = await itemData.getAllByFollowing(req.session.user._id);
                } else {
                    items = await itemData.getAll();
                }
                break;
        }
        return res.render('items', {
            title: "All Community Items",
            items: items
        });
    } 
    catch (error) {
        let items = await itemData.getAll();
        res.status(500).render('items', {
            title: "All Community Items",
            errors: [error],
            items: items
        });
    }
});

router.post('/filterJSON', async (req, res) => {
    let filter = req.body.filter;
    try {
        let items;

        if (req.session.user !== undefined) {
            items = await itemData.getAllExceptUserId(req.session.user._id)
        } else {
            items = await itemData.getAll();
        }
        switch (String(filter)) {
            case 'value':
                items = items.sort((a, b) => a.price - b.price);
                break;
            case 'name':
                items = items.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'followedUsers':
                if (req.session.user) {
                    items = await itemData.getAllByFollowing(req.session.user._id);
                }
                break;
        }

        return res.json(items);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to retrieve items.' });
    }
});


router.get('/:itemid', async (req, res) => {
    try {
        req.params.itemid = helper.checkIdString(req.params.itemid);
    } 
    catch (error) {

        return res.status(400).render('error', {
            title: "error",
            errors: [error]
        })
    }
    try {
        const item = await itemData.getById(req.params.itemid);
        if (req.session.user !== undefined && req.session.user._id === item.userId) {
            return res.redirect(`/profile/items/${req.params.itemid}`); 
        }
        item.popularity = await itemData.num_trades(item._id.toString());
        return res.render('item', {
            title: "View Item",
            item: item
        });
    } catch (error) {
        return res.status(404).render('items', {
            title: "itmes",
            errors: ['item not found']
        });
    }
});


router.route('/')
    .post(async (req, res) => {
        upload(req, res, async function (err) {
            let cleanName = xss(req.body.name);
            let cleanDesc = xss(req.body.desc);
            let cleanPrice = Number(xss(req.body.price));

            const errors = [];
            const name = help.tryCatchHelper(errors,
                () => help.checkItemName(cleanName));
            const desc = help.tryCatchHelper(errors,
                () => help.checkItemDesc(cleanDesc));
            req.body.price = Number(req.body.price);
            const price = help.tryCatchHelper(errors,
                () => help.checkPrice(cleanPrice, 'Item Price'));

            if (err instanceof multer.MulterError || err) {
                errors.push('Error: ' + err.message);
                return res.status(500).json({success: false, errors: errors});
            } else if (err instanceof TypeError) {
                errors.push(err);
                return res.status(400).json({success: false, errors: errors});
            } else if (req.file === undefined) {
                errors.push('Error: You must supply an image, either in .png, .jpeg, or .jpg formats.');
                return res.status(400).json({success: false, errors: errors});
            } else if (errors.length !== 0) {
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