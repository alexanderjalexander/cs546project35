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
        trade.thisUserStatus = trade.senderStatus;
        trade.otherUser = receiver;
        trade.otherUserItems = trade.receiverItems;
        trade.otherUserStatus = trade.receiverStatus;
    } else {
        trade.otherUser = sender;
        trade.otherUserItems = trade.senderItems;
        trade.otherUserStatus = trade.senderStatus;
        trade.thisUser = receiver;
        trade.thisUserItems = trade.receiverItems;
        trade.thisUserStatus = trade.receiverStatus;
    }
    //only statuses are pending accepted and completed
    if (trade.thisUserStatus !== 'pending' && trade.otherUserStatus !== 'pending'){
        trade.status = "waiting to complete trade";
    } else if (trade.thisUserStatus == "accepted" && trade.otherUserStatus == "pending"){
        trade.status = "wating for other user to accept";
    } else if (trade.thisUserStatus == "pending" && trade.otherUserStatus == "accepted"){
        trade.status = "waiting for you to accept";
    } else {

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
        req.body.otherUserId = help.tryCatchHelper(errors, ()=>{
            return help.checkIdString(req.body.otherUserId, "Other user id");
        });
        if (!req.body.thisUserItems){
            errors.push("Must choose at least one item to give");
        }
        if (!req.body.otherUserItems){
            errors.push("Must choose at least one item to receive");
        }
        if (errors.length !== 0){
            return res.status(400).render('trades', {
                title: "Trades",
                trades: allTrades,
                errors: errors,
            });
        }
        
        if(typeof req.body.thisUserItems == 'string'){
            req.body.thisUserItems = [req.body.thisUserItems];
        }
        if(typeof req.body.otherUserItems == 'string'){
            req.body.otherUserItems = [req.body.otherUserItems];
        }
        for (let id of req.body.thisUserItems){
            id = help.tryCatchAsync(errors, (el) => {
                return help.checkIdString(id, "item id");
            });
        }
        for (let id of req.body.otherUserItems){
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
                req.body.otherUserId,
                req.body.thisUserItems,
                req.body.otherUserItems
            );
            return res.redirect(`/trades`)
        } catch (e) {
            return res.status(500).render('trades', {
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
            return res.status(400).render('error', {
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
            foundTrade.otherUser.items = await itemData.getAllByUserId(foundTrade.otherUser._id);
            foundTrade.thisUser.items = await itemData.getAllByUserId(foundTrade.thisUser._id);
            return res.status(200).render('trade', {
                title: 'Trade',
                ...foundTrade,
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
    })
    .delete(async (req, res) => {
        const errors = [];
        req.params.tradeId = help.tryCatchHelper(errors,
            ()=>help.checkIdString(req.params.tradeId))
        if (errors.length !== 0){
            return res.status(400).render('error', {
                errors,
                auth: req.session.user !== undefined
            });
        }
        try {
            await tradeData.remove(req.params.tradeId);
            const allTrades = await tradeData.getAll(req.session.user._id);
            await Promise.all(allTrades.map(async (trade) => {
                trade = await tradeDisplay(trade, req);
            }));
            req.session._message = ['successfully removed an item']
            return res.redirect('/trades');
            return res.status(200).render('trades', {
                title: "Trades",
                trades: allTrades,
            });
        } catch (e) {
            const allTrades = await tradeData.getAll(req.session.user._id);
            await Promise.all(allTrades.map(async (trade) => {
                trade = await tradeDisplay(trade, req);
            }));
            return res.status(500).render('trades', {
                trades: allTrades, 
                title: "Trades",
                errors: [e]
            });
        }
    });


export default router;