//this will have all the routes that begin with /trades
//middleware should only allow authenticated users to access these routes, and redirect them to the login page instead
import {Router} from 'express';
const router = Router();
import * as help from '../helpers.js';
import {ObjectId} from 'mongodb';
import tradeData from '../data/trades.js'
import userData from '../data/users.js'


router.route('/')
    .get(async (req, res) => {
        //this route will log all the trades of the current user.
        //this just shows the user they are trading with, along with the status
        let trades = await tradeData.getAll(req.session.user._id)
        //We will build a list of trade logs to render
        //We have a database method that gets all the trades that are either coming from or going to the user
        //we need to parse through all of those trades and then call user database methods to get the username of the other user
        //lets get the usernames from each of those trades now
        return res.json(trades);
    })
    .post(async (req, res) => {
        //this route will initiate a new trade to another person
    })

router.route('/:tradeId')
    .get(async (req, res) => {
        //views one trade with another user. Offers forms to manage the trade
    })
    .patch(async (req, res) => {
        //updates existing trade, resends the trade to the database and swaps requester/requestee
    });


export default router;