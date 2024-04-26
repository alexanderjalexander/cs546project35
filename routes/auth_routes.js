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
    let errors = [];
    const email = help.tryCatchHelper(() => help.checkEmail(req.body.email), errors);
    const password = help.tryCatchHelper(() => help.checkPassword(req.body.password), errors);
    
    if (errors.length !== 0) {
        return res.status(400).render('login', {
            title:"Login",
            auth: req.session.user != undefined,
            errors: errors, 
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
        req.session.user = login_result;
        return res.redirect('/');
    } catch(e) {
        return res.status(400).render('login', {
            title:"Login",
            auth: req.session.user != undefined,
            errors: [e], 
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
    const errors = [];
    const firstName = help.tryCatchHelper(() => 
        help.checkName(req.body.firstName, 'First Name'), errors);
    const lastName = help.tryCatchHelper(() => 
        help.checkName(req.body.lastName, 'Last Name'), errors);
    const email = help.tryCatchHelper(() => 
        help.checkEmail(req.body.email), errors);
    const username = help.tryCatchHelper(() => 
        help.checkUsername(req.body.username), errors);
    const password = help.tryCatchHelper(() => 
        help.checkPassword(req.body.password), errors);
    const confirmPassword = help.tryCatchHelper(() => 
        help.checkString(req.body.confirmPassword), errors);
    const themePreference = help.tryCatchHelper(() => 
        help.checkTheme(req.body.themePreference), errors);
    if (password !== confirmPassword) {
        errors.push('Error: passwords do not match.');
    }

    if (errors.length !== 0) {
        return res.status(400).render('register', {
            ...req.body,
            title:"Register",
            auth: req.session.user != undefined,
            errors: errors, 
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
            errors: [e], 
            themePreference: 'light'
        });
    }
})

router.route('/logout')
.get(async (req, res) => {
    //code here for GET
    req.session.user = null;
    return res.render('logout', {
        title: 'Logged Out',
        auth: req.session.user != undefined
    });
});

export default router;