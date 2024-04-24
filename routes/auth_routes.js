//this will have the /login /register etc. routes
import {Router} from 'express';
const router = Router();
import * as help from '../helpers.js';

router.route('/')
.get(async (req, res) => {
    return res.render('home', {
        title: 'Home',
        auth: req.session.user != undefined
    });
});

router.route('/login')
.get(async (req, res) => {
    //code here for GET
    return res.render('login', {
        title:"Login",
        auth: req.session.user != undefined
    });
})

router.route('/register')
.get(async (req, res) => {
    return res.render('register', {
        title: 'Register',
        auth: req.session.user != undefined
    })
})

router.route('/logout')
.get(async (req, res) => {
    //code here for GET
    req.session.destroy();
    return res.render('logout', {
        title: 'Logged Out',
        auth: req.session.user != undefined
    });
});

export default router;