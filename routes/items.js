//this will have all the routes that begin with /items
import {Router} from 'express';
const router = Router();
import * as helper from '../helpers.js';
import itemData from '../data/items.js';
import multer from 'multer';
import {multerConfig} from '../config/multerConfig.js';
import {ObjectId} from 'mongodb';
const upload = multer(multerConfig).single('image');

//GET route to view all items in the community
router.get('/', async (req, res) => {
    try {
        const items = await itemData.getAll();
        return res.render('items_all', {
            title: "All Community Items",
            items: items
        });
    } 
    catch (error) {
        return res.status(500).send({error: error.toString()});
    }
});

//GET route to view a specific item
router.get('/:itemid', async (req, res) => {
    try {
        const itemid = helper.checkIdString(req.params.itemid);
        const item = await itemData.getById(itemid);
        return res.render('item_detail', {
            title: "View Item",
            item: item
        });
    } 
    catch (error) {
        return res.status(404).send({error: error.toString()});
    }
});

//POST route to create new item via quick add form
router.post('/', upload, async (req, res) => {
    try {
        const name = helper.checkString(req.body.name, 'Item Name');
        const desc = helper.checkString(req.body.desc, 'Item Description');
        const price = helper.checkPrice(Number(req.body.price), 'Item Price');
        const userId = req.session.user._id;
        const imagePath = req.file ? '/' + req.file.path : '/path/to/default-image.png';
        await itemData.create(userId, name, desc, price, imagePath);
        res.redirect('/items');
    } 
    catch (error) {
        const errors = [error.message || "An error occurred during item creation."];
        res.status(400).render('item_create', {
            title: "Add New Item",
            errors: errors
        });
    }
});

export default router;