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
    if (trade.thisUserStatus == "accepted" && trade.otherUserStatus == "pending"){
        trade.status = "wating for other user to accept";
    } else if (trade.thisUserStatus == "pending" && trade.otherUserStatus == "accepted"){
        trade.status = "waiting for you to accept";
    } else if (trade.thisUserStatus == "completed" && trade.otherUserStatus != "completed"){
        trade.status = "waiting for other user to verify trade has taken place";
    } else if (trade.thisUserStatus != "completed" && trade.otherUserStatus == "completed"){
        trade.status = "other user marked this as complete. Please verify that the trade has taken place";
    } else if (trade.thisUserStatus == "accepted" && trade.otherUserStatus == "accepted"){
        trade.status = "waiting for both users to verify that the trade has completed";
    }  else  if (trade.thisUserStatus == "completed" && trade.otherUserStatus == "completed"){
        trade.status = "you have both completed the trade. It should've deleted itself by now";
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
                errors
            });
        }
        try{
            const usersTrades = await tradeData.getAll(req.session.user._id);
            let foundTrade = usersTrades.find((el)=>{return el._id == req.params.tradeId});
            if (!foundTrade) return res.status(404).render("error", {
                errors: ["trade not found!"]
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
            });
        }

    })
    .patch(async (req, res) => {
        //updates existing trade, resends the trade to the database and swaps requester/requestee
        //validate url parameter
        console.log(req.body);
        let foundTrade = undefined;
        const errors = [];
        let tradeId = help.tryCatchHelper(errors, () => {
            return help.checkIdString(req.params.tradeId);
        });
        //tradeId not valid
        if (errors.length !== 0){  
            return res.status(400).render('error', {
                errors,
            });
        }
        //check if the trade exists
        try{ 
            const usersTrades = await tradeData.getAll(req.session.user._id);
            foundTrade = usersTrades.find((el)=>{return el._id == req.params.tradeId});
            if (!foundTrade) return res.status(404).render("error", {
                errors: ["trade not found!"],
            });
            foundTrade = await tradeDisplay(foundTrade, req);
            foundTrade.otherUser.items = await itemData.getAllByUserId(foundTrade.otherUser._id);
            foundTrade.thisUser.items = await itemData.getAllByUserId(foundTrade.thisUser._id);
        } catch (e) { //server error
            return res.status(500).render('error', {
                title: "error",
                errors: [e]
            })
        }

        //validate inputs
        if (!req.body.accepted && !req.body.completed){
            if(typeof req.body.thisUserItems == 'string'){
                req.body.thisUserItems = [req.body.thisUserItems];
            }
            if(typeof req.body.otherUserItems == 'string'){
                req.body.otherUserItems = [req.body.otherUserItems];
            }
            req.body.thisUserItems = help.tryCatchHelper(errors, () =>{
                return help.checkIdArray(req.body.thisUserItems, "Your items")
            });
            req.body.otherUserItems = help.tryCatchHelper(errors, () =>{
                return help.checkIdArray(req.body.otherUserItems, "Other User's items")
            });
        }

        if (errors.length !== 0){
            return res.status(400).render('trade', {
                title: "trade",
                ...foundTrade,
                errors: errors,
            });
        }

        //do the updating
        try {
            //they clicked the accept button. 
            //Just update the statuses and return to the same trade
            let newTrade = {}
            if (req.body.accepted) {
                newTrade = {
                    senderId: foundTrade.thisUser._id,
                    senderStatus: "accepted",
                    senderItems: foundTrade.thisUserItems.map((el)=>el._id),
                    receiverId: foundTrade.otherUser._id,
                    receiverStatus: foundTrade.otherUserStatus,
                    receiverItems: foundTrade.otherUserItems.map((el)=>el._id)
                };
            } else if (req.body.completed){
                newTrade = {
                    //keep everything the same, just set your status to completed
                    senderId: foundTrade.thisUser._id,
                    senderStatus: "completed",
                    senderItems: foundTrade.thisUserItems.map((el)=>el._id),
                    receiverId: foundTrade.otherUser._id,
                    receiverStatus: foundTrade.otherUserStatus,
                    receiverItems: foundTrade.otherUserItems.map((el)=>el._id)
                }
            } else {
                newTrade = {
                    senderId: foundTrade.thisUser._id,
                    senderItems: req.body.thisUserItems,
                    senderStatus: "accepted",
                    receiverId: foundTrade.otherUser._id,
                    receiverItems: req.body.otherUserItems,
                    receiverStatus: "pending"
                };
            }
            await tradeData.update(tradeId, newTrade);
            req.session._message = ['successfully updated trade'];
            if (newTrade.senderStatus == "completed" && newTrade.receiverStatus == "completed"){
                //delete the trade and all it's items
                //when all the items are removed the trade should automatically delete itself

                const deleteItems = newTrade.senderItems
                for (const itemId of newTrade.senderItems){
                    await itemData.remove(itemId.toString(), newTrade.senderId.toString());
                }
                for (const itemId of newTrade.receiverItems){
                    await itemData.remove(itemId.toString(), newTrade.receiverId.toString());
                }
                req.session._message == ['successfully marked trade as completed. Items have been automatically removed from inventory'];
                return res.redirect('/trades');
            }
            return res.redirect(`/trades/${tradeId}`);
        } catch (e) {
            return res.status(500).render('error', {
                title: "server error",
                errors: [e]
            })
        }
    })
    .delete(async (req, res) => {
        const errors = [];
        req.params.tradeId = help.tryCatchHelper(errors,
            ()=>help.checkIdString(req.params.tradeId))
        if (errors.length !== 0){
            return res.status(400).render('error', {
                errors,
            });
        }
        try {
            await tradeData.remove(req.params.tradeId);
            req.session._message = ['successfully removed a trade']
            return res.redirect('/trades');
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