//this will have all the routes that begin with /trades
//middleware should only allow authenticated users to access these routes, and redirect them to the login page instead
import {Router} from 'express';
const router = Router();
import * as help from '../helpers.js';
import {ObjectId} from 'mongodb';
import tradeData from '../data/trades.js'
import userData from '../data/users.js'
import itemData from '../data/items.js'


router.route('/')
    .get(async (req, res) => {
        try {
            const allTrades = await tradeData.getAll(req.session.user._id);
            await Promise.all(allTrades.map(async (trade) => {
                trade.senderId = await userData.getUserById(trade.senderId.toString())
                trade.receiverId = await userData.getUserById(trade.receiverId.toString())

                trade.senderItems = await Promise.all(trade.senderItems.map(async (itemId) => {
                    return await itemData.getById(itemId.toString());
                }));
                trade.receieverItems = await Promise.all(trade.receiverItems.map(async (itemId) => {
                    return await itemData.getById(itemId.toString());
                }));
            }));
            return res.json(allTrades);
        } catch(e){
            return res.status(500).render('error', {errors: [e]});
        }
    })
    .post(async (req, res) => {
        //this route will initiate a new trade to another person

        const other = req.body.userId;
        const self = req.session.user._id;
        
    })

router.route('/:tradeId')
    .get(async (req, res) => {
        //views one trade with another user. Offers forms to manage the trade
        const errors = [];
        req.params.tradeId = help.tryCatchHelper(errors, ()=>help.checkIdString(req.params.tradeId))
        if (errors.length !== 0){
            return res.status(500).render('error', {
                errors,
                auth: req.session.user !== undefined
            });
        }
        try{
            const usersTrades = await tradeData.getAll(req.session.user._id);
            const foundTrade = usersTrades.find((el)=>{return el._id == req.params.tradeId});
            if (!foundTrade) return res.status(404).render("error", {
                errors: ["trade not found!"],
                auth: req.session.user !== undefined
            });
            return res.status(200).json(foundTrade);
        } catch (e){
            return res.status(500).render('error', {
                errors: [e],
                auth: req.session.user !== undefined
            });
        }

    })
    .patch(async (req, res) => {
        //updates existing trade, resends the trade to the database and swaps requester/requestee
    });


export default router;