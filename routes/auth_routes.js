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
.post(async (req, res) => {
    try {
        req.body.email = help.checkEmail(req.body.email);
        req.body.password = help.checkPassword(req.body.password);
    } catch (e) {
        return res.status(400).render('login', {
            title:"Login",
            auth: req.session.user != undefined,
            error: e, 
            themePreference: 'light'
        });
    }
    try {
        // TODO: add database logic once user db functions are done
        const login_result = {
            firstName: 'test',
            lastName: 'test',
            username: 'test',
            email: 'test@gmail.com',
            themepreference: 'light',
        }
        req.session.user = {
            firstName: login_result.firstName, lastName: login_result.lastName,
            username: login_result.username, email: login_result.email,
            themePreference: login_result.themePreference
        };
        return res.redirect('/');
    } catch(e) {
        return res.status(400).render('login', {
            title:"Login",
            auth: req.session.user != undefined,
            error: e, 
            themePreference: 'light'
        })
    }
})

router.route('/register')
.get(async (req, res) => {
    return res.render('register', {
        title: 'Register',
        auth: req.session.user != undefined
    })
})
.post(async (req, res) => {
    try {
        req.body.firstName = help.checkName(req.body.firstName);
        req.body.lastName = help.checkName(req.body.lastName);
        req.body.email = help.checkEmail(req.body.email);
        req.body.username = help.checkUsername(req.body.username);
        req.body.password = help.checkPassword(req.body.password);
        req.body.confirmPassword = help.checkString(req.body.confirmPassword);
        if (password !== confirmPassword) {
            throw 'Error: passwords do not match.'
        }
        req.body.themePreference = help.checkTheme(req.body.themePreference)
    } catch (e) {
        return res.status(400).render('register', {
            title:"Register",
            auth: req.session.user != undefined,
            error: e, 
            themePreference: 'light'
        });
    }

    try {
        // TODO: add database implementation once done.
        res.redirect('/login');
    } catch(e) {
        return res.status(500).render('register', {
            title:"Register",
            auth: req.session.user != undefined,
            error: e, 
            themePreference: 'light'
        });
    }
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