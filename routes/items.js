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
        let items;
        const filter = req.query.filter;
        switch (filter) {
            case 'value':
                items = await itemData.getAll();
                items.sort((a, b) => a.price - b.price); 
                break;
            case 'name':
                items = await itemData.getAll();
                items.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'followedUsers':
                if (req.session.user) {
                    items = await itemData.getAllFollowedByUser(req.session.user._id);
                } else {
                    items = await itemData.getAll();
                }
                break;
            default:
                items = await itemData.getAll();
        }
        if (req.session.user !== undefined) {
            items = await itemData.getAllExceptUserId(req.session.user._id)
        } else {
            items = await itemData.getAll();
        }
        return res.render('items', {
            title: "All Community Items",
            items: items
        });
    } 
    catch (error) {
        res.status(500).render('items', {
            title: "All Community Items",
            items: items
        });
    }
});

router.get('/filter', async (req, res) => {
    let filter = req.query.filter;
    try {
        let items = await itemData.getAllFiltered(filter); 
        res.json(items.map(item => ({
            _id: item._id,
            name: item.name,
            desc: item.desc,
            price: item.price,
            image: item.image
        })));
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve items.' });
    }
});


router.get('/:itemid', async (req, res) => {
    try {
        req.params.itemid = helper.checkIdString(req.params.itemid);
    } 
    catch (error) {
        return res.status(400).send({error: error.toString()});
    }
    try {
        const item = await itemData.getById(req.params.itemid);
        if (req.session.user !== undefined && req.session.user._id === item.userId) {
            return res.redirect(`/profile/items/${req.params.itemid}`); 
        }
        return res.render('item', {
            title: "View Item",
            item: item
        });
    } catch (error) {
        return res.status(404).send({error: error.toString()});
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