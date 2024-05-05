//this will have all the routes that begin with /trades
//middleware should only allow authenticated users to access these routes, and redirect them to the login page instead
import {Router} from 'express';
const router = Router();
import * as help from '../helpers.js';
import {ObjectId} from 'mongodb';
import tradeData from '../data/trades.js'
import userData from '../data/users.js'
import itemData from '../data/items.js'

const tradeDisplay = async (trade, req) => {
    const sender = await userData.getUserById(trade.senderId.toString())
    const receiver = await userData.getUserById(trade.receiverId.toString())
    trade.senderItems = await Promise.all(trade.senderItems.map(async (itemId) => {
        return await itemData.getById(itemId.toString());
    }));
    trade.receiverItems = await Promise.all(trade.receiverItems.map(async (itemId) => {
        return await itemData.getById(itemId.toString());
    }));
    if (sender.username === req.session.user.username){
        trade.thisUser = sender;
        trade.thisUserItems = trade.senderItems;
        trade.otherUser = receiver;
        trade.otherUserItems = trade.receiverItems;
    } else {
        trade.otherUser = sender;
        trade.otherUserItems = trade.senderItems;
        trade.thisUser = receiver;
        trade.thisUserItems = trade.receiverItems;
    }
    return trade
}

router.route('/')
    .get(async (req, res) => {
        try {
            const allTrades = await tradeData.getAll(req.session.user._id);
            await Promise.all(allTrades.map(async (trade) => {
                trade = await tradeDisplay(trade, req);
            }));
            return res.status(200).render('trades', {trades: allTrades, title: "Trades"});
        } catch(e){
            return res.status(500).render('error', {errors: [e]});
        }
    })
    .post(async (req, res) => {
        //this route will initiate a new trade to another person
        const allTrades = await tradeData.getAll(req.session.user._id);
        await Promise.all(allTrades.map(async (trade) => {
            trade = await tradeDisplay(trade, req);
        }));

        const errors = [];
        //check user inputs
        req.params.otherUserId = help.tryCatchHelper(errors, ()=>{
            return help.checkIdString(req.params.otherUserId, "Other user id");
        });
        for (let id of req.params.thisUserItems){
            id = help.tryCatchAsync(errors, (el) => {
                return help.checkIdString(id, "item id");
            });
        }
        for (let id of req.params.otherUserItems){
            id = help.tryCatchAsync(errors, (el) => {
                return help.checkIdString(id, "item id");
            });
        }
        if (errors.length !== 0){
            return res.status(400).render('trades', {
                title: "Trades",
                trades: allTrades,
                errors: errors,
            });
        }
        //now we need to create a new trade object

        try {
            const newTrade = await tradeData.create(
                req.session.user._id,
                req.params.otherUserId,
                req.params.thisUserItems,
                req.params.otherUserItems
            );
            return res.status(200).render('trade', {
                title: "Trade",
                trade: await tradeDisplay(newTrade)
            })
        } catch (e) {
            return res.status(400).render('trades', {
                title: "Trades",
                trades: allTrades,
                errors: [e],
            });
        }
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
            let foundTrade = usersTrades.find((el)=>{return el._id == req.params.tradeId});
            if (!foundTrade) return res.status(404).render("error", {
                errors: ["trade not found!"],
                auth: req.session.user !== undefined
            });
            foundTrade = await tradeDisplay(foundTrade, req);

            return res.status(200).render('trade', {
                title: 'Trade',
                trade: foundTrade
            });
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