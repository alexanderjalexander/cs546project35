//this will have all the routes that deal with viewing your own profile and items.
import {Router} from 'express';
const router = Router();
import * as help from '../helpers.js';
import itemData from '../data/items.js'
import {upload} from "../config/multerConfig.js";



router.route('/items')
    .get(async (req, res) => {
        let items = await itemData.getAllByUserId(req.session.user._id);
        console.log(items);
        res.render('myprofileitems', {
            title: "My Profile - Items",
            auth: req.session.user !== undefined,
            themePreference: req.session.user.themePreference,
            items: items
        });
    })
    .post(upload.single('image'), (req, res) => {
        const errors = [];
        const name = help.tryCatchHelper(errors,
            () => help.checkString(req.body.name, 'Item Name'));
        const desc = help.tryCatchHelper(errors,
            () => help.checkString(req.body.desc, 'Item Description'));
        const price = help.tryCatchHelper(errors,
            () => help.checkPrice(req.body.price, 'Item Price'));

        // TODO: Handle other logic for item image upload

        res.status(404).json({error: 'not implemented'})
    })

export default router;