//this will have all the routes that begin with /items
import { Router } from 'express';
const router = Router();
import * as helper from '../helpers.js';
import itemData from '../data/items.js';
import multer from 'multer';
import { multerConfig } from '../config/multerConfig.js';
import { ObjectId } from 'mongodb';
const upload = multer(multerConfig).single('image');

//GET route to view all items in the community
router.get('/', async (req, res) => {
    try {
        const items = await itemData.getAll();
        res.render('items_all', {
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
        res.render('item_detail', {
            title: "View Item",
            item: item
        });
    } 
    catch (error) {
        res.status(404).send({error: error.toString()});
    }
});

export default router;