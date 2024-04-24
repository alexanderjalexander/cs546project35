//this will have all the routes that begin with /trades
//middleware should only allow authenticated users to access these routes, and redirect them to the login page instead
import {Router} from 'express';
const router = Router();
import * as help from '../helpers.js';


router.route('/').get(async (req, res) => {
    //this route will log all the trades of the current user.
    
});


export default router;