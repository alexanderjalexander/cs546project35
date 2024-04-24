//this will have all the routes that begin with /trades
//middleware should only allow authenticated users to access these routes, and redirect them to the login page instead
import {Router} from 'express';
const router = Router();
import * as help from '../helpers.js';


router.route('/')
    .get(async (req, res) => {
        //this route will log all the trades of the current user.
    
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