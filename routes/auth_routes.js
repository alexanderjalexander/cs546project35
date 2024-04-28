//this will have the /login /register etc. routes
import {Router} from 'express';
const router = Router();
import * as help from '../helpers.js';
import * as userData from '../data/users.js';

router.route('/')
.get(async (req, res) => {
    return res.render('home', {
        title: 'Home',
        auth: req.session.user !== undefined
    });
});

router.route('/login')
.get(async (req, res) => {
    //code here for GET
    return res.render('login', {
        title:"Login",
        auth: req.session.user !== undefined
    });
})
.post(async (req, res) => {
    const errors = [];
    const email = help.tryCatchHelper(errors, () => 
        help.checkEmail(req.body.email));
    const password = help.tryCatchHelper(errors, () => 
        help.checkPassword(req.body.password));
    
    if (errors.length !== 0) {
        return res.status(400).render('login', {
            title:"Login",
            auth: req.session.user !== undefined,
            errors: errors, 
            themePreference: 'light'
        });
    }
    
    try {
        const login_result = await userData.loginUser(email, password);
        req.session.user = login_result;
        res.redirect('/');
    } catch (e) {
        return res.status(400).render('login', {
            ...req.body,
            title:"Login",
            auth: req.session.user !== undefined,
            errors: [e],
            themePreference: 'light'
        });
    }
})

router.route('/register')
.get(async (req, res) => {
    return res.render('register', {
        title: 'Register',
        auth: req.session.user !== undefined
    })
})
.post(async (req, res) => {
    const errors = [];
    const firstName = help.tryCatchHelper(errors, () => 
        help.checkName(req.body.firstName, 'First Name'));
    const lastName = help.tryCatchHelper(errors, () => 
        help.checkName(req.body.lastName, 'Last Name'));
    const email = help.tryCatchHelper(errors, () => 
        help.checkEmail(req.body.email));
    const username = help.tryCatchHelper(errors, () => 
        help.checkUsername(req.body.username));
    const password = help.tryCatchHelper(errors, () => 
        help.checkPassword(req.body.password));
    const confirmPassword = help.tryCatchHelper(errors, () => 
        help.checkString(req.body.confirmPassword, 'confirmPassword'));
    const themePreference = help.tryCatchHelper(errors, () => 
        help.checkTheme(req.body.themePreference));
    if (password !== confirmPassword) {
        errors.push('Error: passwords do not match.');
    }

    if (errors.length !== 0) {
        return res.status(400).render('register', {
            ...req.body,
            title:"Register",
            auth: req.session.user !== undefined,
            errors: errors, 
            themePreference: 'light'
        });
    }

    try {
        await userData.createUser(
            firstName,
            lastName,
            email,
            username,
            password,
            themePreference
        );
        res.redirect('/login');
    } catch(e) {
        return res.status(500).render('register', {
            title:"Register",
            auth: req.session.user !== undefined,
            errors: errors, 
            themePreference: 'light'
        });
    }
})

router.route('/logout')
.get(async (req, res) => {
    //code here for GET
    req.session.user = undefined;
    return res.render('logout', {
        title: 'Logged Out',
        auth: false
    });
});

export default router;