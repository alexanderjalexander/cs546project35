//this will have the /login /register etc. routes
import {Router} from 'express';
const router = Router();
import * as help from '../helpers.js';

router.route('/').get(async (req, res) => {
    console.log("received get request to /");
    if (req.session.user){ //user logged in
        return res.render('home', {
            title: 'Home',
            nav: [
                {text: 'login', link: '/login'},
                {text: 'register', link: '/register'}
            ]
        });
    }
    //user not logged in
    return res.render('home', {
        title: 'Home',
        nav: [
            {text: 'login', link: '/login'},
            {text: 'register', link: '/register'}
        ]
    });
});

export default router;