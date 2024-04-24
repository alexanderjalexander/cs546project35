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

router
  .route('/login')
  .get(async (req, res) => {
    //code here for GET
    console.log('GET request to /login');
    return res.status(200).render('login', {
        title:"Login",
        nav: [
            {link: '/register', text: 'already have an account? Register'}
        ]
    });
  })

export default router;