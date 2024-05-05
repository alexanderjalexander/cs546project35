//this will have all the routes that begin with /items
import { Router } from 'express';
import * as helper from '../helpers.js';
import itemData from '../data/items.js';
import multer from 'multer';
import { multerConfig } from '../config/multerConfig.js';

const router = Router();
const upload = multer(multerConfig).single('image');

//GET route to view all items in the community
router.get('/', async (req, res) => {
    try {
        const items = await itemData.getAll();
        res.render('items', {
            title: "All Community Items",
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
        res.render('item', {
            title: "View Item",
            item: item
        });
    } 
    catch (error) {
        res.status(404).send({error: error.toString()});
    }
});


//POST route to create new item via quick add form
router.post('/', upload, async (req, res) => {
    try {
        const {name, desc, price} = req.body;
        const userId = req.session.user._id;
        const imagePath = req.file ? '/' + req.file.path : '/path/to/default-image.png';
        await itemData.create(userId, helper.checkString(name, 'Item Name'), helper.checkString(desc, 'Item Description'), helper.checkPrice(Number(price), 'Item Price'), imagePath);
        res.redirect('/items');
    } 
    catch (error) {
        res.status(400).render('item_create', {title: "Add New Item", errors: [error.message || "An error occurred during item creation."]});
    }
});

export default router;